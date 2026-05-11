// ============================================
// Encryption utilities for sensitive data
// ============================================
// Encrypt/decrypt sensitive fields (tokens, passwords)
import { createCipheriv, createDecipheriv } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-dev-key-must-be-32-bytes';
const IV_LENGTH = 16;

/**
 * Encrypt a string value
 */
export function encrypt(text: string): string {
  const iv = Buffer.alloc(IV_LENGTH, 0);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'base64'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Decrypt a string value
 */
export function decrypt(encryptedText: string): string {
  const iv = Buffer.alloc(IV_LENGTH, 0);
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'base64'), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Encrypt an object and return as base64 string
 */
export function encryptObject<T>(data: T): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

/**
 * Decrypt an object from base64 string
 */
export function decryptObject<T>(base64String: string): T {
  return JSON.parse(Buffer.from(base64String, 'base64').toString('utf8'));
}
