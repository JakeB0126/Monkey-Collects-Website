import { socialLinks } from "@/lib/social-links";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">About Us</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">
        A cozy home for collectors, pack openings, and community.
      </h1>
      <div className="mt-6 space-y-5 text-base leading-8 text-neutral-700">
        <p>
          Baby Monkey Collects is a small collector-first storefront focused on Pokemon TCG products, merch, and the
          shared fun of finding the next favorite piece for your shelf or next opening.
        </p>
      </div>
      <div className="mt-9 grid gap-4 sm:grid-cols-3">
        {socialLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-lg border border-amber-200 bg-store-card p-6 text-store-green shadow-sm transition hover:-translate-y-0.5 hover:border-store-gold hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-store-green [&>span:first-child>span]:!text-2xl [&>span:first-child>svg]:h-11 [&>span:first-child>svg]:w-11"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-store-green text-amber-50 shadow-sm">
              {link.icon}
            </span>
            <span className="text-sm font-bold text-ink">{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
