import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/password";

export const SESSION_COOKIE_NAME = "binary_session";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const INITIAL_ADMIN_USERNAME = "mlg";
const INITIAL_ADMIN_PASSWORD = "1234";

const currentProfileSelect = {
  id: true,
  username: true,
  name: true,
  displayName: true,
  role: true,
  mustChangePassword: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export type CurrentProfile = {
  id: string;
  username: string;
  name: string;
  displayName: string | null;
  role: string;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function isValidUsername(username: string) {
  return /^[a-z0-9._-]{2,32}$/.test(username);
}

export function getProfileLabel(profile: Pick<CurrentProfile, "displayName" | "username">) {
  return profile.displayName?.trim() || profile.username;
}

export async function ensureInitialAdmin() {
  const existingProfile = await prisma.profile.findUnique({
    where: { username: INITIAL_ADMIN_USERNAME },
    select: { id: true },
  });

  if (existingProfile) {
    return;
  }

  const initialPasswordHash = await hashPassword(INITIAL_ADMIN_PASSWORD);
  const legacyProfile = await prisma.profile.findFirst({
    where: { passwordHash: "" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (legacyProfile) {
    await prisma.profile.update({
      where: { id: legacyProfile.id },
      data: {
        username: INITIAL_ADMIN_USERNAME,
        name: INITIAL_ADMIN_USERNAME,
        displayName: INITIAL_ADMIN_USERNAME,
        passwordHash: initialPasswordHash,
        role: "admin",
        mustChangePassword: true,
      },
    });
    return;
  }

  await prisma.profile.create({
    data: {
      username: INITIAL_ADMIN_USERNAME,
      name: INITIAL_ADMIN_USERNAME,
      displayName: INITIAL_ADMIN_USERNAME,
      passwordHash: initialPasswordHash,
      role: "admin",
      mustChangePassword: true,
    },
  });
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: {
      profile: {
        select: currentProfileSelect,
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return session.profile;
}

export async function requireAuth(options: { allowPasswordChange?: boolean } = {}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.mustChangePassword && !options.allowPasswordChange) {
    redirect("/first-login");
  }

  return profile;
}

export async function requireAdmin() {
  const profile = await requireAuth();

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return profile;
}

export async function createSession(profileId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  await prisma.session.create({
    data: {
      profileId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
