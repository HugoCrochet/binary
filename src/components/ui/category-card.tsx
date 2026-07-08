'use client';

import { useState } from 'react';
import { XIcon, PlusIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Transaction {
  id: string;
  name: string;
  amount: number;
}

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    amount: number;
    type: string;
    icon?: string;
  };
  transactions: Transaction[];
  onAddTransaction: (name: string, amount: number) => void;
  onRemoveTransaction: (transactionId: string) => void;
  onUpdateTransaction: (transactionId: string, name: string, amount: number) => void;
  onRemoveCategory: () => void;
  colorClass?: string;
}

export function CategoryCard({
  category,
  transactions,
  onAddTransaction,
  onRemoveTransaction,
  onUpdateTransaction,
  onRemoveCategory,
  colorClass = 'bg-slate-50 border-slate-200',
}: CategoryCardProps) {
  const [newTransaction, setNewTransaction] = useState({ name: '', amount: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: '', amount: '' });

  const handleAddTransaction = () => {
    if (newTransaction.name.trim() && newTransaction.amount) {
      onAddTransaction(newTransaction.name, Number(newTransaction.amount));
      setNewTransaction({ name: '', amount: '' });
    }
  };

  const handleStartEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditValues({ name: transaction.name, amount: transaction.amount.toString() });
  };

  const handleSaveEdit = () => {
    if (editingId && editValues.name.trim() && editValues.amount) {
      onUpdateTransaction(editingId, editValues.name, Number(editValues.amount));
      setEditingId(null);
      setEditValues({ name: '', amount: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', amount: '' });
  };

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card className={`border ${colorClass} shadow-sm hover:shadow-md transition-all`}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-semibold text-gray-900">{category.name}</CardTitle>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
            {transactions.length} lignes
          </span>
        </div>
        <button
          onClick={onRemoveCategory}
          className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-gray-100"
          title="Supprimer la catégorie"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">Total catégorie</span>
          <span className="text-xl font-bold text-gray-900">{total.toLocaleString('fr-FR')} €</span>
        </div>

        {/* Add new transaction */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Nom"
              value={newTransaction.name}
              onChange={(e) => setNewTransaction({ ...newTransaction, name: e.target.value })}
              className="border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTransaction();
              }}
            />
            <Input
              placeholder="Montant (€)"
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              className="border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 w-28"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTransaction();
              }}
            />
            <Button
              onClick={handleAddTransaction}
              className="bg-indigo-600 text-white hover:bg-indigo-500"
              size="sm"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Transactions list */}
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-4 w-4 text-gray-400 cursor-grab hover:text-gray-600">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                {editingId === transaction.id ? (
                  <>
                    <Input
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="border-gray-300 text-gray-900 w-full"
                      size={10}
                    />
                    <Input
                      type="number"
                      value={editValues.amount}
                      onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
                      className="border-gray-300 text-gray-900 w-24"
                      size={6}
                    />
                    <Button
                      onClick={handleSaveEdit}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3"
                      size="sm"
                    >
                      OK
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3"
                      size="sm"
                    >
                      Annuler
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-900 flex-1 truncate">
                      {transaction.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {transaction.amount.toLocaleString('fr-FR')} €
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(transaction)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200"
                        title="Éditer"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onRemoveTransaction(transaction.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
              Aucune transaction pour cette catégorie
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
