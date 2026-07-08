import { createUserAction } from "@/lib/server/actions/auth";
import { requireAdmin } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  duplicate: "Ce pseudo existe déjà.",
  invalid_username: "Le pseudo doit contenir 2 à 32 caractères : lettres, chiffres, point, tiret ou underscore.",
  short_password: "Le mot de passe initial doit contenir au moins 4 caractères.",
};

type AdminUsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdmin();

  const [users, params] = await Promise.all([
    prisma.profile.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    searchParams,
  ]);

  const error = getParam(params, "error");
  const created = getParam(params, "created");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Utilisateurs</h1>
        <p className="mt-1 text-gray-500">Créer un accès local et suivre l’état des profils.</p>
      </div>

      <form action={createUserAction} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Ajouter un utilisateur</h2>
            <p className="text-sm text-gray-500">Le mot de passe devra être changé à la première connexion.</p>
          </div>
          {created ? (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Utilisateur créé.
            </p>
          ) : null}
          {error ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {ERROR_MESSAGES[error] ?? "Création impossible."}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Pseudo
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="off"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="displayName" className="text-sm font-medium text-gray-700">
              Nom affiché
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="off"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="temporaryPassword" className="text-sm font-medium text-gray-700">
              Mot de passe initial
            </label>
            <input
              id="temporaryPassword"
              name="temporaryPassword"
              type="password"
              autoComplete="new-password"
              minLength={4}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 md:w-auto"
            >
              Ajouter
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Créé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Dernière connexion
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {user.displayName || user.username}
                  </div>
                  <div className="text-sm text-gray-500">{user.username}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {user.role === "admin" ? "Admin" : "Utilisateur"}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={user.mustChangePassword ? "inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700" : "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"}>
                    {user.mustChangePassword ? "À finaliser" : "Actif"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Jamais"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getParam(params: Record<string, string | string[] | undefined> | undefined, key: string) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
