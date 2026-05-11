export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">About Us</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Built for sealed collectors.</h1>
      <div className="mt-6 space-y-5 text-base leading-8 text-neutral-700">
        <p>
          Monkey Collects is a small collector-first storefront focused on sealed Pokemon TCG products and merch.
        </p>
        <p>
          This early version keeps things simple: browse available products, check stock, and preview the store structure
          before database-backed inventory and checkout are added.
        </p>
      </div>
    </div>
  );
}
