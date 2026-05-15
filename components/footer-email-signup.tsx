"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export function FooterEmailSignup() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setMessage("Thanks for the interest. This signup is a placeholder for now, so no email has been stored yet.");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-md">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="footer-email">
          Email address
        </label>
        <input
          id="footer-email"
          name="email"
          type="email"
          required
          placeholder="collector@example.com"
          className="min-h-12 flex-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-semibold text-ink outline-none transition placeholder:text-neutral-500 focus:border-store-gold focus:ring-2 focus:ring-store-gold/30"
        />
        <button
          type="submit"
          className="min-h-12 rounded-md bg-store-red px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
        >
          Subscribe
        </button>
      </div>
      {message ? <p className="mt-3 text-sm font-semibold leading-6 text-amber-100">{message}</p> : null}
    </form>
  );
}
