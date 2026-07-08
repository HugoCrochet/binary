import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/nav";

export const metadata: Metadata = {
  title: "Binary",
  description: "Dashboard financier personnel local",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="h-full bg-slate-50 font-sans antialiased">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
