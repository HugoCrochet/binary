import Link from 'next/link';

const mockPortfolios = [
  {
    id: '1',
    name: 'PEA Principal',
    type: 'PEA',
    currentValue: 35000.00,
    cashBalance: 5000.00,
    holdings: [
      { name: 'ASR1F', quantity: 50, price: 234.56, value: 11728, gain: 1234, gainPercent: 12.3 },
      { name: 'VUAG', quantity: 25, price: 312.34, value: 7808.5, gain: 892, gainPercent: 13.8 },
      { name: 'LCFD', quantity: 100, price: 98.23, value: 9823, gain: -432, gainPercent: -4.2 },
    ],
  },
  {
    id: '2',
    name: 'CTO', type: 'CTO',
    currentValue: 25432.56,
    cashBalance: 0,
    holdings: [
      { name: 'SBAM', quantity: 30, price: 145.67, value: 4370.1, gain: 567, gainPercent: 18.4 },
      { name: 'AC F', quantity: 200, price: 45.12, value: 9024, gain: 123, gainPercent: 1.4 },
    ],
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

export default function InvestmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Mes Investissements
        </h1>
        <Link
          href="/investments/connect"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          + Connecter un portefeuille
        </Link>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <dt className="text-sm font-medium text-gray-500">Total portefeuilles</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {mockPortfolios.length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <dt className="text-sm font-medium text-gray-500">Valeur totale</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {formatCurrency(
              mockPortfolios.reduce((sum, p) => sum + p.currentValue, 0)
            )}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <dt className="text-sm font-medium text-gray-500">Liquidités</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {formatCurrency(
              mockPortfolios.reduce((sum, p) => sum + p.cashBalance, 0)
            )}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <dt className="text-sm font-medium text-gray-500">Performance</dt>
          <dd className="mt-1 text-3xl font-semibold text-emerald-600">
            +3.8%
          </dd>
        </div>
      </div>

      {/* Portfolios List */}
      <div className="space-y-6">
        {mockPortfolios.map((portfolio) => (
          <div key={portfolio.id} className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {portfolio.name}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {portfolio.type} - {formatCurrency(portfolio.currentValue)}
                  </p>
                </div>
                <Link
                  href={`/investments/${portfolio.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Détails
                </Link>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Positions</h4>
                <div className="space-y-3">
                  {portfolio.holdings.map((holding) => (
                    <div key={holding.name} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="font-medium text-gray-900">{holding.name}</div>
                        <div className="text-xs text-gray-500">
                          {holding.quantity} @ {formatCurrency(holding.price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(holding.value)}</div>
                        <div className={`text-sm ${holding.gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {holding.gain >= 0 ? '+' : ''}{formatCurrency(holding.gain)} ({holding.gainPercent}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Allocation Par Classe */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Allocation par classe d'actif
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Répartition de vos investissements
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {[
              { label: 'Actions', value: 65, color: 'bg-indigo-600' },
              { label: 'Obligations', value: 20, color: 'bg-emerald-600' },
              { label: 'Liquidités', value: 10, color: 'bg-blue-500' },
              { label: 'Autre', value: 5, color: 'bg-gray-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="text-gray-500">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
