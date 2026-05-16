"use client";

import { useActionState } from "react";
import {
  submitContactForm,
  type ContactFormState
} from "@/app/contact/actions";

const initialContactFormState: ContactFormState = {
  values: {
    name: "",
    email: "",
    message: ""
  },
  fieldErrors: {}
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm font-semibold text-store-red">{message}</p>;
}

export function ContactForm() {
  const [state, formAction] = useActionState<ContactFormState, FormData>(submitContactForm, initialContactFormState);
  const values = state.values;

  return (
    <div className="rounded-lg border border-amber-200 bg-store-card p-5 shadow-sm sm:p-6">
      {state.success ? (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm font-semibold leading-6 text-green-700">
          Thanks for messaging us. We&apos;ll get back to you shortly.
        </div>
      ) : null}

      {state.formError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
          {state.formError}
        </div>
      ) : null}

      <form action={formAction} className="mt-5 space-y-5">
        <label className="block">
          <span className="text-sm font-bold text-neutral-700">Name</span>
          <input
            name="name"
            required
            defaultValue={values.name}
            className="mt-2 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-ink focus:border-store-green focus:outline-none"
          />
          <FieldError message={state.fieldErrors.name} />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-neutral-700">Email</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={values.email}
            className="mt-2 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-ink focus:border-store-green focus:outline-none"
          />
          <FieldError message={state.fieldErrors.email} />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-neutral-700">Message</span>
          <textarea
            name="message"
            required
            rows={6}
            defaultValue={values.message}
            className="mt-2 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-ink focus:border-store-green focus:outline-none"
          />
          <FieldError message={state.fieldErrors.message} />
        </label>

        <button
          type="submit"
          className="rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-store-red"
        >
          Send message
        </button>
      </form>
    </div>
  );
}
