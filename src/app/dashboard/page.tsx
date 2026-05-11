'use client';

import { TrendCard } from '@/components/ui/trend-card';
import { AllocationChart } from '@/components/ui/allocation-chart';
import { StackedAreaChart } from '@/components/ui/stacked-area-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityIcon, WalletIcon, TrendingUpIcon, PiggyBankIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Mock data for initial display - à remplacer par les données réelles
const mockBalanceHistory = [
  { date: '2025-01', total: 105000, cash: 35000, savings: 15000, pea: 30000, cto: 15000, other: 10000 },
  { date: '2025-02', total: 107500, cash: 36000, savings: 15500, pea: 30500, cto: 15500, other: 10000 },
  { date: '2025-03', total: 110200, cash: 34000, savings: 16000, pea: 32000, cto: 16000, other: 12000 },
  { date: '2025-04', total: 115500, cash: 32000, savings: 17000, pea: 35000, cto: 16500, other: 15000 },
  { date: '2025-05', total: 125432, cash: 30000, savings: 18000, pea: 38000, cto: 17432, other: 20000 },
  { date: '2025-06', total: 128000, cash: 28000, savings: 19000, pea: 40000, cto: 18500, other: 22500 },
  { date: '2025-07', total: 132500, cash: 26000, savings: 20000, pea: 42000, cto: 19500, other: 25000 },
];

const mockAllocation = [
  { name: 'cash', label: 'Liquidités', value: 30000, color: '#6366f1' },
  { name: 'savings', label: 'Épargne réglementée', value: 19000, color: '#10b981' },
  { name: 'pea', label: 'PEA', value: 40000, color: '#3b82f6' },
  { name: 'cto', label: 'CTO', value: 18500, color: '#f59e0b' },
  { name: 'other', label: 'Autres', value: 22500, color: '#8b5cf6' },
];

const mockMonthlyBudget = {
  totalBudget: 3500,
  totalSpent: 2850,
  remaining: 650,
  savingsRate: 18.6,
  savingsGoal: 20,
};

const mockCashflow = {
  totalIncome: 4200,
  totalExpense: 2850,
  netCashflow: 1350,
  byCategory: [
    { name: 'income', label: 'Revenus', color: '#10b981' },
    { name: 'housing', label: 'Logement', color: '#ef4444' },
    { name: 'food', label: 'Alimentation', color: '#f97316' },
    { name: 'transport', label: 'Transport', color: '#3b82f6' },
    { name: 'leisure', label: 'Loisirs', color: '#8b5cf6' },
    { name: 'other', label: 'Autres', color: '#6b7280' },
  ],
};

export default function DashboardPage() {
  // Calculer les tendances
  const currentTotal = mockBalanceHistory[mockBalanceHistory.length - 1].total;
  const previousTotal = mockBalanceHistory[mockBalanceHistory.length - 2].total;
  const totalChange = ((currentTotal - previousTotal) / previousTotal) * 100;

  const currentCash = mockBalanceHistory[mockBalanceHistory.length - 1].cash;
  const previousCash = mockBalanceHistory[mockBalanceHistory.length - 2].cash;
  const cashChange = ((currentCash - previousCash) / previousCash) * 100;

  const monthlySavings = mockMonthlyBudget.totalBudget - mockMonthlyBudget.totalSpent;
  const lastMonthSavings = 400; // Mock
  const savingsChange = ((monthlySavings - lastMonthSavings) / lastMonthSavings) * 100;

  const sparklineData = mockBalanceHistory.map((d) => d.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cockpit</h1>
          <p className="text-gray-500 mt-1">Votre patrimoine en temps réel</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            Sync à jour
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TrendCard
          title="Patrimoine Brut"
          value={formatCurrency(currentTotal)}
          changePercent={totalChange}
          trend={totalChange > 0 ? 'up' : 'down'}
          subtitle={`${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)}% ce mois`}
          icon={<WalletIcon className="h-5 w-5 text-gray-400" />}
          sparklineData={sparklineData}
          sparklineColor="#6366f1"
        />
        <TrendCard
          title="Liquidités"
          value={formatCurrency(currentCash)}
          changePercent={cashChange}
          trend={cashChange > 0 ? 'up' : 'down'}
          subtitle="Comptes courants & livrets"
          icon={<PiggyBankIcon className="h-5 w-5 text-gray-400" />}
          sparklineData={mockBalanceHistory.map((d) => d.cash)}
          sparklineColor="#10b981"
        />
        <TrendCard
          title="Reste à vivre (mois)"
          value={formatCurrency(monthlySavings)}
          changePercent={savingsChange}
          trend={savingsChange > 0 ? 'up' : 'down'}
          subtitle={`${mockMonthlyBudget.savingsRate}% de votre revenu`}
          icon={<ActivityIcon className="h-5 w-5 text-gray-400" />}
          sparklineData={[1200, 1350, 1100, 1450, 1350]}
          sparklineColor="#3b82f6"
        />
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StackedAreaChart
            data={mockBalanceHistory}
            dataKeys={[
              { name: 'cash', color: '#10b981', label: 'Liquidités' },
              { name: 'savings', color: '#34d399', label: 'Épargne régl.' },
              { name: 'pea', color: '#60a5fa', label: 'PEA' },
              { name: 'cto', color: '#fbbf24', label: 'CTO' },
              { name: 'other', color: '#a78bfa', label: 'Autres' },
            ]}
            height={350}
          />
        </div>

        {/* Allocation Chart */}
        <div className="lg:col-span-1">
          <AllocationChart
            data={mockAllocation}
            size="medium"
          />
        </div>
      </div>

      {/* Budget & Cashflow Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Budget & Cashflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total revenus</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(mockCashflow.totalIncome)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Total dépenses</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(mockCashflow.totalExpense)}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">Taux d'épargne</p>
                  <p className="text-2xl font-semibold text-emerald-600">{mockMonthlyBudget.savingsRate}%</p>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Objectif: {mockMonthlyBudget.savingsGoal}%</span>
                    <span>Reste: {mockMonthlyBudget.remaining} €</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(mockMonthlyBudget.savingsRate / mockMonthlyBudget.savingsGoal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Dépenses par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCashflow.byCategory.slice(1).map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm font-medium text-gray-700 flex-1">{cat.label}</span>
                  <span className="text-sm text-gray-500">
                    {Math.random() * 100 + 50 | 0} €
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
