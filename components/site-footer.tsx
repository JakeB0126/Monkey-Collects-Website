import Link from "next/link";
import { FooterEmailSignup } from "@/components/footer-email-signup";
import { socialLinks } from "@/lib/social-links";

const footerNavLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-emerald-950 bg-store-green text-emerald-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <section aria-label="Footer branding">
            <p className="font-display text-2xl font-black tracking-normal text-white">Baby Monkey Collects</p>
            <p className="mt-3 max-w-md text-sm font-semibold leading-7 text-emerald-50/85">
              Cozy sealed Pokemon products, collector merch, and warm shelf energy for the next favorite pull.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Social links">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex min-h-10 items-center gap-2 rounded-full border border-emerald-100/30 bg-emerald-950/20 px-3 py-2 text-emerald-50 transition hover:border-store-gold hover:bg-emerald-900 hover:text-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
                >
                  <span className="flex h-5 w-5 items-center justify-center">{link.icon}</span>
                  <span className="text-xs font-black">{link.label}</span>
                </a>
              ))}
            </div>
          </section>

          <nav aria-label="Footer navigation">
            <p className="text-sm font-black uppercase tracking-normal text-store-gold">Shop Info</p>
            <div className="mt-4 grid gap-3 text-sm font-bold">
              {footerNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit rounded-md text-emerald-50/90 transition hover:text-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <section className="md:col-span-2" aria-labelledby="footer-signup-heading">
            <p id="footer-signup-heading" className="text-sm font-black uppercase tracking-normal text-store-gold">
              Collector Updates
            </p>
            <p className="mt-2 max-w-xl text-sm font-semibold leading-7 text-emerald-50/85">
              Get first looks at sealed drops, restocks, and cozy collector updates when email marketing is connected.
            </p>
            <FooterEmailSignup />
          </section>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-xs rounded-lg border border-emerald-100/25 bg-emerald-950/20 p-3 shadow-lg shadow-emerald-950/20">
            <img
              src="/baby-monkey-footer-logo.svg"
              alt="Baby Monkey Collects logo"
              className="aspect-[5/6] w-full rounded-md bg-amber-100 object-contain"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-emerald-100/15 px-4 py-4 text-center text-xs font-bold text-emerald-50/70">
        Baby Monkey Collects. Sealed products, collector care, and checkout-ready inventory.
      </div>
    </footer>
  );
}
