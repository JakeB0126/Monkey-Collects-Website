import { Resend } from "resend";
import {
  contactEmail,
  orderConfirmationEmail,
  passwordResetEmail,
  shippingConfirmationEmail,
  type ContactEmailInput,
  type OrderConfirmationEmailInput,
  type PasswordResetEmailInput,
  type ShippingConfirmationEmailInput
} from "@/lib/email-templates";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required before sending transactional email.");
  }

  resendClient ??= new Resend(process.env.RESEND_API_KEY);

  return resendClient;
}

function getFromEmail() {
  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is required before sending transactional email.");
  }

  return process.env.RESEND_FROM_EMAIL;
}

async function sendTransactionalEmail({
  html,
  subject,
  text,
  to
}: {
  html: string;
  subject: string;
  text: string;
  to: string;
}) {
  const { data, error } = await getResendClient().emails.send({
    from: getFromEmail(),
    to,
    subject,
    html,
    text
  });

  if (error) {
    throw new Error(`Resend could not send "${subject}": ${error.message}`);
  }

  return data;
}

export async function sendOrderConfirmationEmail(to: string, input: OrderConfirmationEmailInput) {
  return sendTransactionalEmail({
    to,
    ...orderConfirmationEmail(input)
  });
}

export async function sendPasswordResetEmail(to: string, input: PasswordResetEmailInput) {
  return sendTransactionalEmail({
    to,
    ...passwordResetEmail(input)
  });
}

export async function sendContactEmail(to: string, input: ContactEmailInput) {
  return sendTransactionalEmail({
    to,
    ...contactEmail(input)
  });
}

export async function sendShippingConfirmationEmail(to: string, input: ShippingConfirmationEmailInput) {
  return sendTransactionalEmail({
    to,
    ...shippingConfirmationEmail(input)
  });
}
