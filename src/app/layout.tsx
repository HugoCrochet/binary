import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
