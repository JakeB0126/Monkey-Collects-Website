"use server";

import { sendContactEmail } from "@/lib/email";

const CONTACT_RECIPIENT = "info@babymonkeycollects.com";

export type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

export type ContactFormState = {
  values: ContactFormValues;
  fieldErrors: Partial<Record<keyof ContactFormValues, string>>;
  formError?: string;
  success?: boolean;
};

export const emptyContactFormState: ContactFormState = {
  values: {
    name: "",
    email: "",
    message: ""
  },
  fieldErrors: {}
};

function getSubmittedValues(formData: FormData): ContactFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? "")
  };
}

function getRequiredString(
  values: ContactFormValues,
  field: keyof ContactFormValues,
  fieldErrors: ContactFormState["fieldErrors"]
) {
  const value = values[field].trim();

  if (!value) {
    fieldErrors[field] = "This field is required.";
  }

  return value;
}

export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const values = getSubmittedValues(formData);
  const fieldErrors: ContactFormState["fieldErrors"] = {};
  const name = getRequiredString(values, "name", fieldErrors);
  const email = getRequiredString(values, "email", fieldErrors);
  const message = getRequiredString(values, "message", fieldErrors);

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      values,
      fieldErrors
    };
  }

  try {
    await sendContactEmail(CONTACT_RECIPIENT, {
      name,
      email,
      message
    });
  } catch {
    return {
      values,
      fieldErrors: {},
      formError:
        "Contact email is not fully configured yet. Please email info@babymonkeycollects.com directly while we finish wiring this up."
    };
  }

  return {
    values: emptyContactFormState.values,
    fieldErrors: {},
    success: true
  };
}
