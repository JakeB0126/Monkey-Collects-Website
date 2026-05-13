import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pokemon-tcg", label: "Pokémon TCG" },
  { href: "/merch", label: "Merch" },
  { href: "/about", label: "About Us" },
  { href: "/cart", label: "Cart" }
];

const accountLink = { href: "/auth", label: "Sign In" };

export const metadata: Metadata = {
  title: "Monkey Collects",
  description: "Sealed Pokemon products and collector merch."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-emerald-950 bg-store-green text-white shadow-sm">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="header-link rounded-md px-1 py-2 font-display text-2xl font-black tracking-normal text-white transition hover:text-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
              >
                Monkey Collects
              </Link>
              <Link
                href={accountLink.href}
                className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-950 transition hover:bg-store-gold hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
              >
                {accountLink.label}
              </Link>
            </div>
            <nav aria-label="Main navigation" className="flex flex-wrap gap-2 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="header-link rounded-md px-3 py-2 text-emerald-50 transition hover:bg-emerald-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
