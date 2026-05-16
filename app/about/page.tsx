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
          Welcome to Baby Monkey Collects. We’re a small family business built around our love for Pokémon and the memories it has helped us create together. What started as a fun hobby with our son and daughter slowly grew into something much more meaningful for our family.
        </p>
        <p>
          Our daughter was diagnosed with autism at age 2, and she has inspired so much of this journey. Pokémon became a special way for us to connect, spend time together, and celebrate what makes every person unique. Because of her, autism awareness and inclusion will always be an important part of who we are and what we hope to build within this community.
        </p>
        <p>
          We want collecting to feel exciting, welcoming, and accessible to everyone. We do our best to keep prices affordable, often lower than TCG when we can, while still providing authentic products and honest customer service. Whether you’ve been collecting for years or are opening your very first pack, we’re happy you’re here.
        </p>
        <p>
          Thank you for supporting our family and being part of Baby Monkey Collects. Every order truly means a lot to us.
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
