// ============================================
// Seed Initial Data
// ============================================
// Run this script to seed initial data for development

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create single user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: await hash('password123', 10),
      firstName: 'Utilisateur',
      lastName: 'Principal',
    },
  });
  console.log('User created:', user.email);

  // Create sample institutions
  const institutions = [
    {
      name: 'Banque Populaire',
      slug: 'banque-populaire',
      type: 'BANK' as const,
      enabled: true,
      config: {} as any,
    },
    {
      name: 'Revolut',
      slug: 'revolut',
      type: 'PAYMENT' as const,
      enabled: true,
      config: {} as any,
    },
    {
      name: 'Bourse Direct',
      slug: 'bourse-direct',
      type: 'BROKERAGE' as const,
      enabled: true,
      config: {} as any,
    },
  ];

  for (const inst of institutions) {
    await prisma.institution.upsert({
      where: { slug: inst.slug },
      update: {},
      create: {
        ...inst,
        config: inst.config,
      },
    });
    console.log('Institution created:', inst.name);
  }

  // Create sample connection
  const connection = await prisma.connection.upsert({
    where: { id: 'conn-1' },
    update: {
      status: 'CONNECTED',
    },
    create: {
      id: 'conn-1',
      userId: user.id,
      institutionId: 'banque-populaire',
      status: 'CONNECTED',
      accessToken: 'demo-access-token',
      lastSyncAt: new Date(),
    },
  });
  console.log('Connection created:', connection.id);

  // Create sample accounts
  const accounts = [
    {
      id: 'acc-1',
      connectionId: 'conn-1',
      institutionId: 'banque-populaire',
      userId: user.id,
      externalId: 'external-acc-1',
      name: 'Compte Courant Principal',
      type: 'CHECKING' as const,
      currency: 'EUR',
      balance: 15234.56,
      availableBalance: 15234.56,
      IBAN: 'FR7612345678901234567890121',
      maskedNumber: '****1234',
    },
    {
      id: 'acc-2',
      connectionId: 'conn-1',
      institutionId: 'banque-populaire',
      userId: user.id,
      externalId: 'external-acc-2',
      name: 'Compte Épargne',
      type: 'SAVINGS' as const,
      currency: 'EUR',
      balance: 29765.44,
      availableBalance: 29765.44,
      maskedNumber: '****5678',
    },
  ];

  for (const acc of accounts) {
    await prisma.account.upsert({
      where: { id: acc.id },
      update: acc,
      create: acc,
    });
    console.log('Account created:', acc.name);
  }

  // Create sample portfolio
  const portfolio = await prisma.portfolio.upsert({
    where: { id: 'port-1' },
    update: {
      currentValue: 35000,
    },
    create: {
      id: 'port-1',
      userId: user.id,
      institutionId: 'bourse-direct',
      name: 'PEA Principal',
      type: 'PEA',
      currency: 'EUR',
      currentValue: 35000,
      cashBalance: 5000,
      startValue: 30000,
      totalGain: 5000,
    },
  });
  console.log('Portfolio created:', portfolio.name);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
