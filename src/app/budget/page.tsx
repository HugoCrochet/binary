'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SankeyChart } from '@/components/ui/sankey-chart';
import { CategoryCard } from '@/components/ui/category-card';
import { CashflowCalendar } from '@/components/ui/cashflow-calendar';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useBudgetStore } from '@/lib/store/budgetStore';
import { formatCurrency } from '@/lib/utils';

// Palette de couleurs pour les catégories (comme sur les screenshots Sheets)
const CATEGORY_COLORS = {
  abonnements: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  banque: 'bg-sky-100 text-sky-800 border-sky-200',
  besoins: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  loyer: 'bg-rose-100 text-rose-800 border-rose-200',
  sorties: 'bg-violet-100 text-violet-800 border-violet-200',
};

export default function BudgetPage() {
  const store = useBudgetStore();

  const [activeTab, setActiveTab] = useState('expenses');

  // Sankey data
  const sankeyNodes = [
    { id: 'Income', name: 'Revenus' },
    { id: 'Budget', name: 'Budget Total' },
    { id: 'Investments', name: 'Investissements' },
    { id: 'Expenses', name: 'Dépenses' },
    ...store.incomeCategories.map((c) => ({ id: c.id, name: c.name })),
    ...store.expenseCategories.map((c) => ({ id: c.id, name: c.name })),
    ...store.investmentCategories.map((c) => ({ id: c.id, name: c.name })),
  ];

  const sankeyLinks = [
    // Income to Budget
    ...store.incomeCategories.map((c) => ({
      source: 'Income',
      target: 'Budget',
      value: c.amount,
    })),
    // Budget to categories
    ...store.investmentCategories.map((c) => ({
      source: 'Budget',
      target: c.id,
      value: c.amount,
    })),
    ...store.expenseCategories.map((c) => ({
      source: 'Budget',
      target: c.id,
      value: c.amount,
    })),
    // Budget to Investments summary
    {
      source: 'Budget',
      target: 'Investments',
      value: store.totalInvestments,
    },
    // Budget to Expenses summary
    {
      source: 'Budget',
      target: 'Expenses',
      value: store.totalExpenses,
    },
  ];

  const handleAddCategory = (type: 'INCOME' | 'EXPENSE' | 'INVESTMENT') => {
    const name = prompt(`Nom de la nouvelle catégorie ${type === 'INCOME' ? 'de revenu' : type === 'EXPENSE' ? 'de dépense' : 'd\'investissement'} :`);
    if (name) {
      if (type === 'INCOME') store.addIncomeCategory(name);
      else if (type === 'EXPENSE') store.addExpenseCategory(name);
      else store.addInvestmentCategory(name);
    }
  };

  // Helper pour obtenir la couleur de catégorie basée sur le nom
  const getCategoryColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('abonnement')) return CATEGORY_COLORS.abonnements;
    if (lowerName.includes('banque')) return CATEGORY_COLORS.banque;
    if (lowerName.includes('besoin')) return CATEGORY_COLORS.besoins;
    if (lowerName.includes('loyer')) return CATEGORY_COLORS.loyer;
    if (lowerName.includes('sortie')) return CATEGORY_COLORS.sorties;
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Préparer les événements pour le calendrier (à partir des catégories Abonnements et Loyer)
  const getCalendarEvents = () => {
    const events: { id: string; name: string; amount: number; date: string; category: string; isRecurring: boolean }[] = [];

    // Ajouter les abonnements et loyers avec leur date de prélèvement simulée
    store.expenseCategories.forEach((category) => {
      if (category.name.toLowerCase().includes('abonnement') || category.name.toLowerCase().includes('loyer')) {
        category.items.forEach((item) => {
          events.push({
            id: item.id,
            name: item.name,
            amount: item.amount,
            date: item.date,
            category: category.name,
            isRecurring: true,
          });
        });
      }
    });

    return events;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Budget & Cashflow</h1>
          <p className="text-gray-600 mt-1">Suivi de vos flux financiers et gestion du budget</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Taux d'épargne</p>
            <p className="text-xl font-bold text-emerald-600">{store.savingsRate.toFixed(1)}%</p>
          </div>
          <div className="text-right border-l border-gray-200 pl-4">
            <p className="text-xs text-gray-500">Taux possible</p>
            <p className="text-xl font-bold text-gray-700">{store.possibleSavingsRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Summary Banner - Fond très clair */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total des revenus</p>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(store.totalIncome)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total des dépenses</p>
            <p className="text-3xl font-bold text-rose-600">{formatCurrency(store.totalExpenses)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total investi</p>
            <p className="text-3xl font-bold text-indigo-600">{formatCurrency(store.totalInvestments)}</p>
          </div>
        </div>
      </div>

      {/* Sankey Chart */}
      <SankeyChart nodes={sankeyNodes} links={sankeyLinks} />

      {/* Main Content: Categories + Sidebar Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Manager - Takes 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Gestionnaire de catégories</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleAddCategory('INCOME')}
                className="border-slate-300 text-gray-700 hover:bg-gray-50"
                size="sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouveau revenu
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddCategory('EXPENSE')}
                className="border-slate-300 text-gray-700 hover:bg-gray-50"
                size="sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouvelle dépense
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddCategory('INVESTMENT')}
                className="border-slate-300 text-gray-700 hover:bg-gray-50"
                size="sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouvel investissement
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200 shadow-sm">
              <TabsTrigger value="income" className="data-[state=active]:bg-slate-50 data-[state=active]:text-gray-900">
                Revenus
              </TabsTrigger>
              <TabsTrigger value="investment" className="data-[state=active]:bg-slate-50 data-[state=active]:text-gray-900">
                Investissements
              </TabsTrigger>
              <TabsTrigger value="expenses" className="data-[state=active]:bg-slate-50 data-[state=active]:text-gray-900">
                Dépenses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {store.incomeCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    transactions={category.items}
                    onAddTransaction={(name, amount) => store.addTransaction(category.id, name, amount, 'INCOME')}
                    onRemoveTransaction={(transactionId) => store.removeTransaction(category.id, transactionId)}
                    onUpdateTransaction={(transactionId, name, amount) =>
                      store.updateTransaction(category.id, transactionId, name, amount)
                    }
                    onRemoveCategory={() => store.removeCategory(category.id, 'INCOME')}
                    colorClass="bg-emerald-50 border-emerald-100"
                  />
                ))}
              </div>
              {store.incomeCategories.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  Aucun revenu configuré. Cliquez sur "Nouveau revenu" pour ajouter.
                </div>
              )}
            </TabsContent>

            <TabsContent value="investment" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {store.investmentCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    transactions={category.items}
                    onAddTransaction={(name, amount) => store.addTransaction(category.id, name, amount, 'INVESTMENT')}
                    onRemoveTransaction={(transactionId) => store.removeTransaction(category.id, transactionId)}
                    onUpdateTransaction={(transactionId, name, amount) =>
                      store.updateTransaction(category.id, transactionId, name, amount)
                    }
                    onRemoveCategory={() => store.removeCategory(category.id, 'INVESTMENT')}
                    colorClass="bg-indigo-50 border-indigo-100"
                  />
                ))}
              </div>
              {store.investmentCategories.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  Aucun investissement configuré. Cliquez sur "Nouvel investissement" pour ajouter.
                </div>
              )}
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {store.expenseCategories.map((category) => {
                  const colorClass = getCategoryColor(category.name);
                  return (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      transactions={category.items}
                      onAddTransaction={(name, amount) => store.addTransaction(category.id, name, amount, 'EXPENSE')}
                      onRemoveTransaction={(transactionId) => store.removeTransaction(category.id, transactionId)}
                      onUpdateTransaction={(transactionId, name, amount) =>
                        store.updateTransaction(category.id, transactionId, name, amount)
                      }
                      onRemoveCategory={() => store.removeCategory(category.id, 'EXPENSE')}
                      colorClass={colorClass}
                    />
                  );
                })}
              </div>
              {store.expenseCategories.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  Aucune dépense configurée. Cliquez sur "Nouvelle dépense" pour ajouter.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Calendar - Takes 1/3 width */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <CashflowCalendar events={getCalendarEvents()} />
          </div>
        </div>
      </div>
    </div>
  );
}
