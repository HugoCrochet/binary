import { redirect } from "next/navigation";

import { completeFirstLoginAction } from "@/lib/server/actions/auth";
import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  password_mismatch: "Les deux mots de passe ne correspondent pas.",
  short_password: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
};

type FirstLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FirstLoginPage({ searchParams }: FirstLoginPageProps) {
  const profile = await requireAuth({ allowPasswordChange: true });

  if (!profile.mustChangePassword) {
    redirect("/dashboard");
  }

  const error = getParam(await searchParams, "error");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Finaliser le profil</h1>
          <p className="text-sm text-gray-500">
            Connecté avec le pseudo <span className="font-medium text-gray-700">{profile.username}</span>
          </p>
        </div>

        <form action={completeFirstLoginAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {error ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {ERROR_MESSAGES[error] ?? "Impossible de finaliser le profil."}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="displayName" className="text-sm font-medium text-gray-700">
              Nom affiché
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              defaultValue={profile.displayName ?? profile.username}
              autoComplete="name"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <button
            type="submit"
            className="flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </main>
  );
}

function getParam(params: Record<string, string | string[] | undefined> | undefined, key: string) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
}
