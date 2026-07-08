import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Binary</h1>
      <p className="text-gray-600">
        Le tableau de bord est disponible sur la page cockpit.
      </p>
      <Link className="text-indigo-600 hover:text-indigo-700" href="/dashboard">
        Ouvrir le cockpit
      </Link>
    </div>
  );
}
