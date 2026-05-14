export default function Loading() {
  return (
    <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-16 sm:px-6 lg:px-8">
      <img
        src="/mascots/mascot-loading-coffee.png"
        alt=""
        className="h-24 w-24 shrink-0 object-contain"
        aria-hidden="true"
      />
      <p className="text-base font-semibold leading-7 text-neutral-700">Getting the collector shelf ready...</p>
    </div>
  );
}
