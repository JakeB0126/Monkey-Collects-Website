"use client";

export default function Error({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <img
        src="/mascots/mascot-loading-coffee.png"
        alt=""
        className="h-36 w-36 object-contain"
        aria-hidden="true"
      />
      <h1 className="mt-5 font-display text-3xl font-black text-ink">Something needs a quick refresh.</h1>
      <p className="mt-3 max-w-lg text-base leading-7 text-neutral-700">
        The storefront hit an unexpected issue. Try again, and we will reload this view.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-store-green"
      >
        Try again
      </button>
    </div>
  );
}
