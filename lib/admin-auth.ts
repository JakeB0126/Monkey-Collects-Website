export const ADMIN_SESSION_COOKIE = "monkey-collects-admin-session";

const ADMIN_SESSION_MESSAGE = "monkey-collects-admin";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

function toBase64Url(bytes: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export function isAdminPasswordConfigured() {
  return Boolean(getAdminPassword());
}

export function isCorrectAdminPassword(password: string) {
  const adminPassword = getAdminPassword();

  return Boolean(adminPassword) && password === adminPassword;
}

export async function getAdminSessionValue() {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return null;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(adminPassword),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(ADMIN_SESSION_MESSAGE));

  return toBase64Url(signature);
}

export async function isValidAdminSession(value?: string) {
  if (!value) {
    return false;
  }

  const expectedValue = await getAdminSessionValue();

  if (!expectedValue) {
    return false;
  }

  return timingSafeEqual(value, expectedValue);
}
