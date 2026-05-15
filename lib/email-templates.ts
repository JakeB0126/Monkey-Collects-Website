import { formatPrice } from "@/lib/products";

type EmailLineItem = {
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type OrderConfirmationEmailInput = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotalCents: number;
  totalCents: number;
  items: EmailLineItem[];
};

export type PasswordResetEmailInput = {
  resetUrl: string;
};

export type ShippingConfirmationEmailInput = {
  orderNumber: string;
  trackingNumber?: string | null;
  shippingCarrier?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function baseEmail({
  preview,
  title,
  children
}: {
  preview: string;
  title: string;
  children: string;
}) {
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#edd2a3;color:#2b170e;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edd2a3;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff7e6;border:1px solid #e7c986;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#164f35;padding:24px;color:#ffffff;">
                <p style="margin:0;color:#f4c45f;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.02em;">Baby Monkey Collects</p>
                <h1 style="margin:8px 0 0;font-size:26px;line-height:1.2;color:#ffffff;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                ${children}
                <p style="margin:28px 0 0;color:#6b5a4d;font-size:14px;line-height:1.7;">
                  Questions? Reply to this email or contact Baby Monkey Collects support. Thanks for collecting with us.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function itemRows(items: EmailLineItem[]) {
  return items
    .map(
      (item) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #ead7ad;">
          <p style="margin:0;font-size:15px;font-weight:700;color:#2b170e;">${escapeHtml(item.productName)}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b5a4d;">Qty ${item.quantity} at ${formatPrice(item.unitPriceCents)}</p>
        </td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #ead7ad;font-size:15px;font-weight:700;color:#9f2f24;">
          ${formatPrice(item.lineTotalCents)}
        </td>
      </tr>`
    )
    .join("");
}

export function orderConfirmationEmail(input: OrderConfirmationEmailInput) {
  const html = baseEmail({
    preview: `Order ${input.orderNumber} is confirmed.`,
    title: "Order confirmed",
    children: `
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#3c2a1d;">
        Your payment is confirmed and your sealed products are reserved.
      </p>
      <div style="background:#fff;border:1px solid #ead7ad;border-radius:10px;padding:16px;margin-bottom:18px;">
        <p style="margin:0;font-size:13px;color:#6b5a4d;">Order number</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#164f35;">${escapeHtml(input.orderNumber)}</p>
        <p style="margin:12px 0 0;font-size:13px;color:#6b5a4d;">Status: ${escapeHtml(formatStatus(input.status))} / ${escapeHtml(formatStatus(input.paymentStatus))}</p>
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${itemRows(input.items)}</table>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
        <tr><td style="padding:4px 0;color:#6b5a4d;">Subtotal</td><td align="right" style="font-weight:700;">${formatPrice(input.subtotalCents)}</td></tr>
        <tr><td style="padding:4px 0;color:#2b170e;font-weight:800;">Total</td><td align="right" style="color:#9f2f24;font-weight:800;">${formatPrice(input.totalCents)}</td></tr>
      </table>
    `
  });
  const text = [
    `Order confirmed: ${input.orderNumber}`,
    `Status: ${formatStatus(input.status)} / ${formatStatus(input.paymentStatus)}`,
    "",
    ...input.items.map((item) => `${item.quantity}x ${item.productName} - ${formatPrice(item.lineTotalCents)}`),
    "",
    `Subtotal: ${formatPrice(input.subtotalCents)}`,
    `Total: ${formatPrice(input.totalCents)}`
  ].join("\n");

  return { subject: `Order confirmed: ${input.orderNumber}`, html, text };
}

export function passwordResetEmail(input: PasswordResetEmailInput) {
  const html = baseEmail({
    preview: "Reset your Baby Monkey Collects password.",
    title: "Reset your password",
    children: `
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#3c2a1d;">
        We received a request to reset your Baby Monkey Collects password. This link is time-limited.
      </p>
      <p style="margin:24px 0;">
        <a href="${escapeHtml(input.resetUrl)}" style="display:inline-block;background:#9f2f24;color:#ffffff;text-decoration:none;border-radius:8px;padding:13px 18px;font-size:14px;font-weight:800;">Reset password</a>
      </p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#6b5a4d;">
        If you did not request this, you can ignore this email.
      </p>
    `
  });
  const text = `Reset your Baby Monkey Collects password:\n${input.resetUrl}\n\nIf you did not request this, you can ignore this email.`;

  return { subject: "Reset your Baby Monkey Collects password", html, text };
}

export function shippingConfirmationEmail(input: ShippingConfirmationEmailInput) {
  const trackingLine = input.trackingNumber
    ? `Tracking: ${input.shippingCarrier ? `${input.shippingCarrier} ` : ""}${input.trackingNumber}`
    : "Tracking details will be shared when available.";
  const html = baseEmail({
    preview: `Shipping update for order ${input.orderNumber}.`,
    title: "Your order is on the way",
    children: `
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#3c2a1d;">
        Your Baby Monkey Collects order has been marked shipped.
      </p>
      <div style="background:#fff;border:1px solid #ead7ad;border-radius:10px;padding:16px;">
        <p style="margin:0;font-size:13px;color:#6b5a4d;">Order number</p>
        <p style="margin:4px 0 12px;font-size:20px;font-weight:800;color:#164f35;">${escapeHtml(input.orderNumber)}</p>
        <p style="margin:0;font-size:15px;color:#2b170e;">${escapeHtml(trackingLine)}</p>
      </div>
    `
  });
  const text = [`Your order is on the way: ${input.orderNumber}`, trackingLine].join("\n");

  return { subject: `Shipping update: ${input.orderNumber}`, html, text };
}
