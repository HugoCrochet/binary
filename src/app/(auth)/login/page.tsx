import { redirect } from "next/navigation";

import { loginAction } from "@/lib/server/actions/auth";
import { getCurrentProfile } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Pseudo ou mot de passe incorrect.",
  missing: "Renseigne le pseudo et le mot de passe.",
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const profile = await getCurrentProfile();

  if (profile?.mustChangePassword) {
    redirect("/first-login");
  }

  if (profile) {
    redirect("/dashboard");
  }

  const error = getParam(await searchParams, "error");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Binary</h1>
          <p className="text-sm text-gray-500">Connexion locale à votre espace financier</p>
        </div>

        <form action={loginAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {error ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {ERROR_MESSAGES[error] ?? "Connexion impossible."}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Pseudo
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <button
            type="submit"
            className="flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Se connecter
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
