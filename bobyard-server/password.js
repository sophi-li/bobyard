import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, KEY_LEN);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password, storedHash) {
  const [salt, hashHex] = storedHash.split(':');
  const derivedKey = await scryptAsync(password, salt, KEY_LEN);
  const storedBuf = Buffer.from(hashHex, 'hex');

  // timingSafeEqual throws on mismatched lengths instead of returning false.
  if (derivedKey.length !== storedBuf.length) return false;
  return timingSafeEqual(derivedKey, storedBuf);
}
