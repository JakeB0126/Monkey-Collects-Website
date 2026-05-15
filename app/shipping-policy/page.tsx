export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Shipping Policy</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Shipping Policy</h1>
      <div className="mt-6 space-y-5 rounded-lg border border-amber-200 bg-store-card p-6 text-base leading-8 text-neutral-700 shadow-sm">
        <p>
          This placeholder policy is ready for the final shipping details once fulfillment rules are confirmed. Please
          update it before accepting live customer orders.
        </p>
        <p>
          Orders are expected to be packed with collector care, using protective materials appropriate for sealed Pokemon
          products and merch. Processing times, carrier options, tracking details, and delivery estimates should be added
          here.
        </p>
        <p>
          Any local pickup, damaged shipment, lost package, preorder, or international shipping terms should be clearly
          documented before launch.
        </p>
      </div>
    </div>
  );
}
