import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
const PASSWORD_PREFIX = "scrypt";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  return `${PASSWORD_PREFIX}:${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [prefix, salt, hash] = storedHash.split(":");

  if (prefix !== PASSWORD_PREFIX || !salt || !hash) {
    return false;
  }

  try {
    const stored = Buffer.from(hash, "hex");
    const candidate = (await scryptAsync(password, salt, stored.length)) as Buffer;

    return stored.length === candidate.length && timingSafeEqual(stored, candidate);
  } catch {
    return false;
  }
}
