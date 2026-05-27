import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac, createHash } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getPrismaClient } from "@/lib/prisma";

export const CUSTOMER_SESSION_COOKIE = "monkey-collects-customer-session";

const scrypt = promisify(scryptCallback);
const PASSWORD_HASH_PREFIX = "scrypt";
const PASSWORD_KEY_LENGTH = 64;
const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_RESET_TOKEN_MAX_AGE_MINUTES = 60;

export type CustomerSession = {
  id: string;
  email: string;
  name: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isKnownPrismaError(error: unknown, code: string) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === code;
}

function getSessionSecret() {
  return process.env.CUSTOMER_SESSION_SECRET || process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || null;
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

function signSessionUserId(userId: string) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("CUSTOMER_SESSION_SECRET or AUTH_SECRET is required before creating customer sessions.");
  }

  return createHmac("sha256", secret).update(userId).digest("base64url");
}

function isValidSessionValue(value: string) {
  const [userId, signature] = value.split(".");

  if (!userId || !signature) {
    return null;
  }

  const expectedSignature = signSessionUserId(userId);
  const left = Buffer.from(signature);
  const right = Buffer.from(expectedSignature);

  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  return userId;
}

export async function hashPassword(password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const salt = randomBytes(16).toString("base64url");
  const key = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;

  return `${PASSWORD_HASH_PREFIX}$${salt}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [prefix, salt, storedKey] = passwordHash.split("$");

  if (prefix !== PASSWORD_HASH_PREFIX || !salt || !storedKey) {
    return false;
  }

  const key = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  const stored = Buffer.from(storedKey, "base64url");

  return key.length === stored.length && timingSafeEqual(key, stored);
}

export async function createCustomerAccount({
  email,
  name,
  password
}: {
  email: string;
  name?: string | null;
  password: string;
}) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }

  const passwordHash = await hashPassword(password);
  const prisma = getPrismaClient();

  try {
    return await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        passwordHash
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
  } catch (error) {
    if (isKnownPrismaError(error, "P2002")) {
      throw new Error("An account already exists for that email.");
    }

    throw error;
  }
}

export async function verifyCustomerLoginCredentials(email: string, password: string) {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      email: normalizeEmail(email)
    },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true
    }
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name
  };
}

export async function createPasswordResetRequest(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail
    },
    select: {
      id: true,
      email: true
    }
  });
  const token = randomBytes(32).toString("base64url");

  if (!user) {
    return {
      email: null,
      resetUrl: `${getSiteUrl()}/auth/reset-password?token=${token}`
    };
  }

  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null
    },
    data: {
      usedAt: new Date()
    }
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashResetToken(token),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_MAX_AGE_MINUTES * 60 * 1000)
    }
  });

  return {
    email: user.email,
    resetUrl: `${getSiteUrl()}/auth/reset-password?token=${token}`
  };
}

export async function resetCustomerPasswordWithToken(token: string, password: string) {
  const prisma = getPrismaClient();
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash: hashResetToken(token)
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true
    }
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt.getTime() <= Date.now()) {
    throw new Error("This reset link is invalid or expired.");
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: resetToken.userId
      },
      data: {
        passwordHash
      }
    }),
    prisma.passwordResetToken.update({
      where: {
        id: resetToken.id
      },
      data: {
        usedAt: new Date()
      }
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
        id: {
          not: resetToken.id
        }
      },
      data: {
        usedAt: new Date()
      }
    })
  ]);
}

export async function setCustomerSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(CUSTOMER_SESSION_COOKIE, `${userId}.${signSessionUserId(userId)}`, {
    httpOnly: true,
    maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function getCurrentCustomerSession(): Promise<CustomerSession | null> {
  if (!getSessionSecret()) {
    return null;
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  const userId = isValidSessionValue(value);

  if (!userId) {
    return null;
  }

  const prisma = getPrismaClient();

  return prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      email: true,
      name: true
    }
  });
}

export async function logoutCustomer() {
  const cookieStore = await cookies();

  cookieStore.set(CUSTOMER_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}
