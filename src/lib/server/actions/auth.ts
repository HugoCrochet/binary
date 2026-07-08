"use server";

import { redirect } from "next/navigation";

import {
  createSession,
  deleteCurrentSession,
  ensureInitialAdmin,
  isValidUsername,
  normalizeUsername,
  requireAdmin,
  requireAuth,
} from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { hashPassword, verifyPassword } from "@/lib/server/password";

export async function loginAction(formData: FormData) {
  await ensureInitialAdmin();

  const username = normalizeUsername(readFormString(formData, "username"));
  const password = readFormString(formData, "password");

  if (!username || !password) {
    redirect("/login?error=missing");
  }

  const profile = await prisma.profile.findUnique({
    where: { username },
  });

  if (!profile || !(await verifyPassword(password, profile.passwordHash))) {
    redirect("/login?error=invalid");
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession(profile.id);

  if (profile.mustChangePassword) {
    redirect("/first-login");
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteCurrentSession();
  redirect("/login");
}

export async function completeFirstLoginAction(formData: FormData) {
  const profile = await requireAuth({ allowPasswordChange: true });
  const displayName = readFormString(formData, "displayName");
  const password = readFormString(formData, "password");
  const confirmPassword = readFormString(formData, "confirmPassword");

  if (password.length < 8) {
    redirect("/first-login?error=short_password");
  }

  if (password !== confirmPassword) {
    redirect("/first-login?error=password_mismatch");
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      displayName: displayName || profile.username,
      name: displayName || profile.username,
      passwordHash: await hashPassword(password),
      mustChangePassword: false,
    },
  });

  redirect("/dashboard");
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const username = normalizeUsername(readFormString(formData, "username"));
  const displayName = readFormString(formData, "displayName");
  const temporaryPassword = readFormString(formData, "temporaryPassword");

  if (!isValidUsername(username)) {
    redirect("/admin/users?error=invalid_username");
  }

  if (temporaryPassword.length < 4) {
    redirect("/admin/users?error=short_password");
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { username },
    select: { id: true },
  });

  if (existingProfile) {
    redirect("/admin/users?error=duplicate");
  }

  await prisma.profile.create({
    data: {
      username,
      name: displayName || username,
      displayName: displayName || username,
      passwordHash: await hashPassword(temporaryPassword),
      role: "user",
      mustChangePassword: true,
    },
  });

  redirect("/admin/users?created=1");
}

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
