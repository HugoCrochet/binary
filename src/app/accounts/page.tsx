const mockAccounts = [
  {
    id: '1',
    name: 'Compte Courant Principal',
    institution: 'Banque Populaire',
    type: 'CHECKING',
    balance: 15234.56,
    available: 15234.56,
    maskedNumber: '****1234',
  },
  {
    id: '2',
    name: 'Compte Épargne',
    institution: 'Banque Populaire',
    type: 'SAVINGS',
    balance: 29765.44,
    available: 29765.44,
    maskedNumber: '****5678',
  },
  {
    id: '3',
    name: 'Compte Courant',
    institution: 'Revolut',
    type: 'CHECKING',
    balance: 2500.00,
    available: 2500.00,
    maskedNumber: '****9012',
  },
  {
    id: '4',
    name: 'PEA', institution: 'Bourse Direct',
    type: 'PEA',
    balance: 35000.00,
    available: 35000.00,
    maskedNumber: '****PEA1',
  },
];

const mockTransactions = [
  {
    id: '1',
    date: '2026-05-08',
    description: 'SALAIRE MENSUEL',
    amount: 3200.00,
    type: 'CREDIT',
    merchant: ' employer',
  },
  {
    id: '2',
    date: '2026-05-07',
    description: 'CARREFOUR SUPERMARCHE',
    amount: -85.42,
    type: 'DEBIT',
    merchant: 'Carrefour',
  },
  {
    id: '3',
    date: '2026-05-05',
    description: 'VIREMENT VERS COMPTE EPARGNE',
    amount: -500.00,
    type: 'TRANSFER',
    merchant: 'Virement interne',
  },
];

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Mes Comptes
        </h1>
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          + Ajouter un compte
        </button>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <dt className="text-sm font-medium text-gray-500">Total comptes</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {mockAccounts.length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <dt className="text-sm font-medium text-gray-500">Total liquidités</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
              mockAccounts.reduce((sum, a) => sum + a.balance, 0)
            )}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <dt className="text-sm font-medium text-gray-500">Comptes actifs</dt>
          <dd className="mt-1 text-3xl font-semibold text-emerald-600">
            {mockAccounts.length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <dt className="text-sm font-medium text-gray-500">Dernier import</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">À configurer</dd>
        </div>
      </div>

      {/* Accounts List */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Institution
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Solde
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {mockAccounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {account.maskedNumber.slice(-4)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {account.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {account.maskedNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{account.institution}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {account.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                    account.balance
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Transactions */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Transactions récentes
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Dernières opérations importées manuellement
          </p>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {mockTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <span className={transaction.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                        transaction.amount
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
