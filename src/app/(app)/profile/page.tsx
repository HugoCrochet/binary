import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profil</h1>
        <p className="mt-1 text-gray-500">Informations du profil connecté.</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Pseudo</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.username}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Nom affiché</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.displayName || profile.username}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rôle</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {profile.role === "admin" ? "Admin" : "Utilisateur"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Dernière connexion</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {profile.lastLoginAt ? formatDate(profile.lastLoginAt) : "Non renseignée"}
            </dd>
          </div>
        </dl>

        <p className="mt-6 rounded-md bg-slate-50 px-3 py-2 text-sm text-gray-600">
          La modification du profil sera définie dans un prochain chantier.
        </p>
      </div>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
