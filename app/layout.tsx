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

const socialLinks = [
  {
    href: "https://www.instagram.com/babymonkeycollects?igsh=em42Ymtpc3B2MWxo",
    label: "Instagram",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </svg>
    )
  },
  {
    href: "https://www.whatnot.com/user/babymonkeycollectsllc?sender_id=32338188&sharing_channel=copyLink",
    label: "Whatnot",
    icon: <span aria-hidden="true" className="text-[0.7rem] font-black leading-none">W</span>
  },
  {
    href: "https://www.tiktok.com/@babymonkeycollects?_r=1&_t=ZT-96KOuJ6KYwQ",
    label: "TikTok",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 4v10.5a4.5 4.5 0 1 1-4.5-4.5" />
        <path d="M14 4c1 3 3 5 6 5" />
      </svg>
    )
  }
];

export const metadata: Metadata = {
  title: "Baby Monkey Collects",
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
                  <Link
                    key={link.href}
                    href={link.href}
                    className="header-link rounded-md px-3.5 py-2.5 text-emerald-50 transition hover:bg-emerald-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200 sm:px-4"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
