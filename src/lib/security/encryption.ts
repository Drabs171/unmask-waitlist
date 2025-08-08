import crypto from 'crypto';
// crypto-js has no bundled types in some environments; import as any
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CryptoJS: any = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('ENCRYPTION_KEY environment variable is required in production');
}

// Fallback key for development (never use in production)
const DEV_KEY = 'dev-key-32-chars-for-testing-only';

/**
 * Encrypt sensitive data (like emails for storage)
 */
export function encryptData(text: string): string {
  try {
    const key = ENCRYPTION_KEY || DEV_KEY;
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedText: string): string {
  try {
    const key = ENCRYPTION_KEY || DEV_KEY;
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Failed to decrypt data - invalid key or corrupted data');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash email for duplicate detection (irreversible)
 */
export function hashEmail(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalizedEmail).digest('hex');
}

/**
 * Generate secure random token for verification/unsubscribe
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate verification token with timestamp
 */
export function generateVerificationToken(): string {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${timestamp}.${randomBytes}`;
}

/**
 * Validate verification token (check if not expired)
 */
export function validateVerificationToken(token: string, maxAgeHours: number = 24): boolean {
  try {
    const [timestampStr] = token.split('.');
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds
    
    return (now - timestamp) <= maxAge;
  } catch (error) {
    return false;
  }
}

/**
 * Hash password (for admin authentication if needed)
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}

/**
 * Verify password (for admin authentication if needed)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}

/**
 * Sanitize sensitive data for logging
 */
export function sanitizeForLogs(data: any): any {
  if (typeof data === 'string' && data.includes('@')) {
    // Mask email addresses
    return data.replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+)/g, '$1***@$2');
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = typeof value === 'string' ? 
          value.replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+)/g, '$1***@$2') : 
          value;
      } else if (key.toLowerCase().includes('token') || 
                 key.toLowerCase().includes('password') ||
                 key.toLowerCase().includes('secret')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return data;
}