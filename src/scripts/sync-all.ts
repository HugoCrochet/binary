// ============================================
// Sync and Scheduler Scripts
// ============================================
// Background jobs for data synchronization

import { prisma } from '@/lib/db/client';
import { BourseDirectScraper } from '@/lib/integrations/bourse-direct/scraper';
import { decrypt, encrypt } from '@/lib/encryption';

// ============================================
// Sync All Function
// ============================================
export async function syncAll(userId: string) {
  console.log(`Starting sync for user: ${userId}`);

  // Create sync job
  const syncJob = await prisma.syncJob.create({
    data: {
      userId,
      type: 'ALL',
      status: 'RUNNING',
    },
  });

  try {
    // Find all active connections
    const connections = await prisma.connection.findMany({
      where: {
        userId,
        status: 'CONNECTED',
      },
      include: {
        institution: true,
      },
    });

    let accountsSynced = 0;
    let transactionsSynced = 0;
    let holdingsSynced = 0;

    // Sync each connection (Enable Banking integration placeholder)
    // TODO: Implement Enable Banking OAuth flow when API is ready
    for (const connection of connections) {
      console.log(`Syncing connection: ${connection.id} (Enable Banking placeholder)`);

      // Update connection last sync
      await prisma.connection.update({
        where: { id: connection.id },
        data: {
          lastSyncAt: new Date(),
        },
      });
    }

    // Sync Bourse Direct (if configured)
    if (process.env.BOURSE_DIRECT_USERNAME && process.env.BOURSE_DIRECT_PASSWORD) {
      try {
        console.log('Syncing Bourse Direct...');
        const scraper = new BourseDirectScraper();
        try {
          const result = await scraper.scrapeAll(
            process.env.BOURSE_DIRECT_USERNAME!,
            process.env.BOURSE_DIRECT_PASSWORD!
          );

          if (result.success) {
            // Process portfolios
            for (const portfolio of result.portfolios) {
              const port = await prisma.portfolio.upsert({
                where: {
                  id: portfolio.id, // Use id directly for Bourse Direct
                },
                update: {
                  currentValue: portfolio.totalValue,
                  cashBalance: portfolio.cashBalance,
                },
                create: {
                  id: portfolio.id,
                  userId,
                  institutionId: 'bourse-direct',
                  name: portfolio.name,
                  type: portfolio.type,
                  currency: portfolio.currency,
                  currentValue: portfolio.totalValue,
                  cashBalance: portfolio.cashBalance,
                },
              });

              // Process holdings
              for (const holding of result.portfolios.flatMap(p => p.holdings || [])) {
                const marketValue = holding.marketValue;
                const totalGain = holding.gain || 0;

                await prisma.holding.upsert({
                  where: {
                    id: holding.id, // Use id directly for Bourse Direct
                  },
                  update: {
                    marketValue,
                    currentPrice: holding.currentPrice,
                    totalGain,
                    lastUpdated: new Date(),
                  },
                  create: {
                    id: holding.id,
                    externalId: holding.id,
                    portfolioId: port.id,
                    userId,
                    isin: holding.isin || undefined,
                    symbol: holding.symbol || undefined,
                    quantity: Number(holding.quantity),
                    averageCost: Number(holding.averageCost),
                    currentPrice: Number(holding.currentPrice),
                    currency: holding.currency,
                    marketValue,
                    totalGain,
                  },
                });
                holdingsSynced++;
              }
            }
          }
        } catch (error) {
          console.error('Error syncing Bourse Direct:', error);
        } finally {
          await scraper.close();
        }
      } catch (error) {
        console.error('Error syncing Bourse Direct:', error);
      }
    }

    // Update sync job
    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: {
        status: 'COMPLETED',
        accountsSynced,
        transactionsSynced,
        holdingsSynced,
        completedAt: new Date(),
      },
    });

    // Create daily snapshot
    await createDailySnapshot(userId);

    console.log(`Sync completed: ${accountsSynced} accounts, ${transactionsSynced} transactions, ${holdingsSynced} holdings`);
    return { success: true, accountsSynced, transactionsSynced, holdingsSynced };

  } catch (error) {
    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    });
    console.error('Sync failed:', error);
    throw error;
  }
}

// ============================================
// Create Daily Snapshot
// ============================================
export async function createDailySnapshot(userId: string) {
  console.log(`Creating daily snapshot for user: ${userId}`);

  // Calculate totals
  const accounts = await prisma.account.findMany({
    where: { userId, closedAt: null },
    select: { balance: true, type: true },
  });

  const portfolios = await prisma.portfolio.findMany({
    where: { userId, closedAt: null },
    select: { currentValue: true, type: true },
  });

  const totalCash = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const totalInvestments = portfolios.reduce((sum, p) => sum + Number(p.currentValue), 0);

  // Calculate by type
  const pea = portfolios
    .filter((p) => p.type === 'PEA')
    .reduce((sum, p) => sum + Number(p.currentValue), 0);
  const cto = portfolios
    .filter((p) => p.type === 'CTO')
    .reduce((sum, p) => sum + Number(p.currentValue), 0);
  const lifeInsurance = portfolios
    .filter((p) => p.type === 'LIFE_INSURANCE')
    .reduce((sum, p) => sum + Number(p.currentValue), 0);

  // Create snapshot
  await prisma.dailySnapshot.create({
    data: {
      userId,
      snapshotDate: new Date(),
      totalAssets: totalCash + totalInvestments,
      totalLiabilities: 0,
      netWorth: totalCash + totalInvestments,
      cash: totalCash,
      investments: totalInvestments,
      bankAccounts: totalCash,
      pea: pea,
      cto: cto,
      lifeInsurance: lifeInsurance,
      otherInvestments: totalInvestments - pea - cto - lifeInsurance,
      cashAllocation: (totalCash / (totalCash + totalInvestments)) * 100,
      equityAllocation: 65, // Default, calculate from holdings if needed
      bondAllocation: 20, // Default
      otherAllocation: 15, // Default
      dayGain: 0,
      dayGainPercent: 0,
      monthStartValue: 0,
      monthGain: 0,
      monthGainPercent: 0,
      yearStartValue: 0,
      yearGain: 0,
      yearGainPercent: 0,
    },
  });

  console.log('Daily snapshot created');
}

// ============================================
// Cron Scheduler
// ============================================
// Run sync every 6 hours
export async function runScheduler() {
  const users = await prisma.user.findMany({ select: { id: true } });

  for (const user of users) {
    try {
      await syncAll(user.id);
    } catch (error) {
      console.error(`Failed to sync for user ${user.id}:`, error);
    }
  }
}

// Run if called directly
if (require.main === module) {
  runScheduler()
    .then(() => {
      console.log('Scheduler completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Scheduler failed:', error);
      process.exit(1);
    });
}
