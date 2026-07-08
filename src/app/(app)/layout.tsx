import { Navbar } from "@/components/nav";
import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAuth();

  return (
    <>
      <Navbar
        profile={{
          username: profile.username,
          displayName: profile.displayName,
          role: profile.role,
        }}
      />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  );
}
