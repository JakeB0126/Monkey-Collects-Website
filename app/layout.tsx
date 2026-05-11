import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/pokemon-tcg", label: "Pokemon TCG" },
  { href: "/merch", label: "Merch" },
  { href: "/cart", label: "Cart" },
  { href: "/auth", label: "Sign In" }
];

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
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-xl font-bold tracking-normal text-ink">
              Monkey Collects
            </Link>
            <nav aria-label="Main navigation" className="flex flex-wrap gap-2 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-neutral-700 transition hover:bg-neutral-100 hover:text-ink"
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
