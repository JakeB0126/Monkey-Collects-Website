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
          This V1 keeps things simple: browse available products, review current stock, and check out through Stripe.
          Orders are confirmed on the server after Stripe reports payment, so inventory stays tied to completed payments.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-ink">Clear stock</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Products only show publicly when active.</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-ink">Hosted checkout</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Payments run through Stripe Checkout.</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-ink">Order records</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Order items keep product snapshots.</p>
        </div>
      </div>
    </div>
  );
}
