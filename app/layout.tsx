import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCartLink } from "@/components/header-cart-link";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentCustomerSession } from "@/lib/customer-auth";
import { getSavedCartForUser } from "@/lib/saved-cart";
import { socialLinks } from "@/lib/social-links";
import "./globals.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pokemon-tcg", label: "Pokémon TCG" },
  { href: "/merch", label: "Merch" },
  { href: "/about", label: "About Us" },
  { href: "/cart", label: "Cart" }
];

export const metadata: Metadata = {
  title: "Baby Monkey Collects",
  description: "Sealed Pokemon products and collector merch."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const customer = await getCurrentCustomerSession();
  const accountLink = customer ? { href: "/account", label: "Account" } : { href: "/auth", label: "Sign In" };
  const savedCart = customer ? await getSavedCartForUser(customer.id) : null;
  const cartCount = savedCart?.items.reduce((count: number, item: { quantity: number }) => count + item.quantity, 0) ?? 0;
  const navLinkClassName =
    "header-link rounded-md px-3.5 py-2.5 text-emerald-50 transition hover:bg-emerald-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200 sm:px-4";

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <header className="border-b border-emerald-950 bg-store-green text-white shadow-sm">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <div className="flex items-center justify-end gap-3">
              <div className="flex items-center gap-1.5" aria-label="Social links">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100/30 text-emerald-50 transition hover:border-amber-200 hover:bg-emerald-900 hover:text-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
              <Link
                href={accountLink.href}
                className="rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-950 transition hover:bg-store-gold hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
              >
                {accountLink.label}
              </Link>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <Link
                href="/"
                className="header-link w-fit rounded-md px-1 py-2 font-display text-xl font-black tracking-normal text-white transition hover:text-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200 sm:text-3xl"
              >
                Baby Monkey Collects
              </Link>
              <nav aria-label="Main navigation" className="flex flex-wrap gap-2 text-base font-semibold sm:justify-end">
                {navLinks.map((link) => (
                  link.href === "/cart" ? (
                    <HeaderCartLink key={link.href} initialCount={cartCount} className={navLinkClassName} />
                  ) : (
                    <Link key={link.href} href={link.href} className={navLinkClassName}>
                      {link.label}
                    </Link>
                  )
                ))}
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
