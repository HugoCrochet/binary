// ============================================
// Bourse Direct Scraper
// ============================================
// Playwright-based scraper for Bourse Direct
// Handles login, MFA, and data extraction

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { encrypt } from '../../encryption';
import {
  BourseDirectAccount,
  BourseDirectPortfolio,
  BourseDirectPosition,
  BourseDirectTransaction,
  ScrapeResult,
  AccountType,
  PortfolioType,
  TransactionType,
  DEFAULT_SELECTORS,
  BourseDirectSelectors,
} from './types';

// ============================================
// Scraper Class
// ============================================
export class BourseDirectScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private selectors: BourseDirectSelectors;

  constructor(selectors?: BourseDirectSelectors) {
    this.selectors = selectors || DEFAULT_SELECTORS;
  }

  /**
   * Initialize browser session
   */
  private async initializeBrowser(headless: boolean = true): Promise<Page> {
    if (this.browser) {
      this.page = await this.browser.newPage();
      return this.page;
    }

    this.browser = await chromium.launch({
      headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--deterministic-fetch',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
      ],
    });

    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    this.page = await context.newPage();
    return this.page;
  }

  /**
   * Login to Bourse Direct
   */
  async login(username: string, password: string): Promise<Page> {
    if (!this.page) {
      await this.initializeBrowser();
    }

    // Assert page is not null after initialization
    const page = this.page!;
    this.page = page;

    // Navigate to login page
    await page.goto('https://www.boursedirect.fr/login', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Fill login form
    await page.fill(this.selectors.login.username, username);
    await page.fill(this.selectors.login.password, password);

    // Submit form
    await page.click(this.selectors.login.submit);
    await page.waitForTimeout(1000);

    // Check for MFA (optional)
    if (this.selectors.login.mfaCode) {
      try {
        const mfaElement = page.locator(this.selectors.login.mfaCode);
        if (await mfaElement.isVisible().catch(() => false)) {
          console.log('MFA detected - manual entry required');
          throw new Error('MFA code input detected');
        }
      } catch {
        // MFA not present, continue
      }
    }

    return page;
  }

  /**
   * Scrape accounts from Bourse Direct
   */
  async scrapeAccounts(): Promise<BourseDirectAccount[]> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call login() first.');
    }

    const accounts: BourseDirectAccount[] = [];

    try {
      // Navigate to accounts page
      await this.page.goto('https://www.boursedirect.fr/comptes', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for accounts list to load
      await this.page.waitForSelector(this.selectors.accounts.list, {
        timeout: 10000,
      });

      const accountElements = await this.page!.locator(this.selectors.accounts.list).all();

      for (const element of accountElements) {
        const account: BourseDirectAccount = {
          id: await element.locator(this.selectors.accounts.id!).textContent().then(t => t || ''),
          name: await element.locator(this.selectors.accounts.name).textContent().then(t => t || '') || '',
          balance: parseFloat(
            await element.locator(this.selectors.accounts.balance).textContent().then(t => t || '0')
          ),
          currency: await element.locator(this.selectors.accounts.currency!).textContent().then(t => t || 'EUR'),
          type: this.mapAccountType(
            await element.locator(this.selectors.accounts.type!).textContent().then(t => t || '')
          ),
        };
        accounts.push(account);
      }
    } catch (error) {
      console.error('Error scraping accounts:', error);
      await this.takeScreenshot('accounts-error');
    }

    return accounts;
  }

  /**
   * Scrape portfolios from Bourse Direct
   */
  async scrapePortfolios(): Promise<BourseDirectPortfolio[]> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call login() first.');
    }

    const portfolios: BourseDirectPortfolio[] = [];

    try {
      // Navigate to portfolios page
      await this.page.goto('https://www.boursedirect.fr/portefeuille', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for portfolios list to load
      await this.page.waitForSelector(this.selectors.portfolios.list, {
        timeout: 10000,
      });

      const portfolioElements = await this.page!.locator(this.selectors.portfolios.list).all();

      for (const element of portfolioElements) {
        const portfolio: BourseDirectPortfolio = {
          id: await element.locator(this.selectors.portfolios.id!).textContent().then(t => t || ''),
          name: await element.locator(this.selectors.portfolios.name).textContent().then(t => t || '') || '',
          currency: 'EUR',
          totalValue: parseFloat(
            await element.locator(this.selectors.portfolios.totalValue!).textContent().then(t => t || '0')
          ),
          cashBalance: parseFloat(
            await element.locator(this.selectors.portfolios.cashBalance!).textContent().then(t => t || '0')
          ),
          type: this.mapPortfolioType(
            await element.locator(this.selectors.portfolios.type!).textContent().then(t => t || '')
          ),
        };
        portfolios.push(portfolio);
      }
    } catch (error) {
      console.error('Error scraping portfolios:', error);
      await this.takeScreenshot('portfolios-error');
    }

    return portfolios;
  }

  /**
   * Scrape holdings from a portfolio
   */
  async scrapeHoldings(portfolioId: string): Promise<BourseDirectPosition[]> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call login() first.');
    }

    const holdings: BourseDirectPosition[] = [];

    try {
      // Navigate to portfolio details
      await this.page.goto(`https://www.boursedirect.fr/portefeuille/${portfolioId}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for positions list to load
      await this.page.waitForSelector(this.selectors.positions.list, {
        timeout: 10000,
      });

      const positionElements = await this.page!.locator(this.selectors.positions.list).all();

      for (const element of positionElements) {
        const holding: BourseDirectPosition = {
          id: await element.locator(this.selectors.positions.id!).textContent().then(t => t || ''),
          isin: await element.locator(this.selectors.positions.isin!).textContent().then(t => t || ''),
          symbol: await element.locator(this.selectors.positions.symbol!).textContent().then(t => t || ''),
          name: await element.locator(this.selectors.positions.name).textContent().then(t => t || '') || '',
          quantity: parseFloat(
            await element.locator(this.selectors.positions.quantity).textContent().then(t => t || '0')
          ),
          averageCost: parseFloat(
            await element.locator(this.selectors.positions.averageCost!).textContent().then(t => t || '0')
          ),
          currentPrice: parseFloat(
            await element.locator(this.selectors.positions.currentPrice!).textContent().then(t => t || '0')
          ),
          marketValue: parseFloat(
            await element.locator(this.selectors.positions.marketValue!).textContent().then(t => t || '0')
          ),
          gain: parseFloat(
            await element.locator(this.selectors.positions.gain!).textContent().then(t => t || '0')
          ),
          gainPercent: parseFloat(
            await element.locator(this.selectors.positions.gainPercent!).textContent().then(t => t || '0')
          ),
          currency: await element.locator(this.selectors.positions.currency!).textContent().then(t => t || 'EUR'),
        };
        holdings.push(holding);
      }
    } catch (error) {
      console.error('Error scraping holdings:', error);
      await this.takeScreenshot('holdings-error');
    }

    return holdings;
  }

  /**
   * Scrape transactions from an account
   */
  async scrapeTransactions(accountId: string): Promise<BourseDirectTransaction[]> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call login() first.');
    }

    const transactions: BourseDirectTransaction[] = [];

    try {
      // Navigate to transactions page
      await this.page.goto(`https://www.boursedirect.fr/comptes/${accountId}/mouvements`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for transactions list to load
      await this.page.waitForSelector(this.selectors.transactions.list, {
        timeout: 10000,
      });

      const transactionElements = await this.page!.locator(this.selectors.transactions.list).all();

      for (const element of transactionElements) {
        const transaction: BourseDirectTransaction = {
          id: await element.locator(this.selectors.transactions.id!).textContent().then(t => t || ''),
          date: await element.locator(this.selectors.transactions.date).textContent().then(t => t || '') || '',
          amount: parseFloat(
            await element.locator(this.selectors.transactions.amount).textContent().then(t => t || '0')
          ),
          type: this.mapTransactionType(
            await element.locator(this.selectors.transactions.type!).textContent().then(t => t || '')
          ),
          description: await element.locator(this.selectors.transactions.description).textContent().then(t => t || '') || '',
          merchant: await element.locator(this.selectors.transactions.merchant!).textContent().then(t => t || ''),
          currency: await element.locator(this.selectors.transactions.currency!).textContent().then(t => t || 'EUR'),
        };
        transactions.push(transaction);
      }
    } catch (error) {
      console.error('Error scraping transactions:', error);
      await this.takeScreenshot('transactions-error');
    }

    return transactions;
  }

  /**
   * Scrape all data (accounts, portfolios, holdings)
   */
  async scrapeAll(username: string, password: string): Promise<ScrapeResult> {
    const result: ScrapeResult = {
      success: false,
      timestamp: new Date(),
      accounts: [],
      portfolios: [],
      transactions: [],
    };

    try {
      await this.login(username, password);

      // Scrape accounts
      const accounts = await this.scrapeAccounts();
      result.accounts = accounts;

      // Scrape portfolios
      const portfolios = await this.scrapePortfolios();
      result.portfolios = portfolios;

      // For each portfolio, scrape holdings
      for (const portfolio of portfolios) {
        const holdings = await this.scrapeHoldings(portfolio.id);
        portfolio.holdings = holdings;
      }

      // Scrape transactions for each account
      for (const account of accounts) {
        const transactions = await this.scrapeTransactions(account.id);
        result.transactions.push(...transactions);
      }

      result.success = true;
    } catch (error) {
      console.error('Error in scrapeAll:', error);
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Clean up browser resources
   */
  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Take a screenshot for debugging
   */
  private async takeScreenshot(name: string): Promise<void> {
    if (this.page) {
      try {
        const screenshotPath = path.join(__dirname, '../../../data/screenshots', `${name}-${Date.now()}.png`);
        await fs.promises.mkdir(path.dirname(screenshotPath), { recursive: true });
        await this.page.screenshot({ path: screenshotPath });
        console.log(`Screenshot saved: ${screenshotPath}`);
      } catch (error) {
        console.error('Error taking screenshot:', error);
      }
    }
  }

  // ============================================
  // Helper Functions
  // ============================================

  /**
   * Map Bourse Direct account type to internal type
   */
  private mapAccountType(externalType: string): AccountType {
    const typeMap: Record<string, AccountType> = {
      'compte courant': 'CHECKING',
      'checking': 'CHECKING',
      'compte epargne': 'SAVINGS',
      'savings': 'SAVINGS',
      'livret': 'SAVINGS',
      'cto': 'CTO',
      'pea': 'PEA',
    };

    const lowerType = externalType.toLowerCase();
    for (const key in typeMap) {
      if (lowerType.includes(key)) {
        return typeMap[key];
      }
    }
    return 'OTHER';
  }

  /**
   * Map Bourse Direct portfolio type to internal type
   */
  private mapPortfolioType(externalType: string): PortfolioType {
    const typeMap: Record<string, PortfolioType> = {
      'cto': 'CTO',
      'pea': 'PEA',
      'pea pme': 'PEA_PME',
      'patrimoine': 'OTHER',
    };

    const lowerType = externalType.toLowerCase();
    for (const key in typeMap) {
      if (lowerType.includes(key)) {
        return typeMap[key];
      }
    }
    return 'OTHER';
  }

  /**
   * Map Bourse Direct transaction type to internal type
   */
  private mapTransactionType(externalType: string): TransactionType {
    const typeMap: Record<string, TransactionType> = {
      'virement': 'TRANSFER',
      'virement entrant': 'DEPOSIT',
      'virement sortant': 'WITHDRAWAL',
      'credit': 'CREDIT',
      'debit': 'DEBIT',
      'prelevement': 'WITHDRAWAL',
      'cheque': 'WITHDRAWAL',
      'carte': 'PAYMENT',
      'depot': 'DEPOSIT',
      'retrait': 'WITHDRAWAL',
      'remboursement': 'REFUND',
    };

    const lowerType = externalType.toLowerCase();
    for (const key in typeMap) {
      if (lowerType.includes(key)) {
        return typeMap[key];
      }
    }
    return 'OTHER';
  }
}
