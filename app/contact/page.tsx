import { ContactForm } from "@/components/contact-form";
import { socialLinks } from "@/lib/social-links";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Contact Us</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">We&apos;d love to hear from you.</h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-700">
        Send us a note about an order, a product question, or anything collector-related. Messages go to
        info@babymonkeycollects.com.
      </p>

      <div className="mt-8">
        <ContactForm />
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
