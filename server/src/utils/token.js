import crypto from 'crypto';

// Generate a cryptographically random token
export const generateRawToken = () => crypto.randomBytes(32).toString('hex');

// Hash the token before storing in the DB
export const hashToken = (raw) =>
  crypto.createHash('sha256').update(raw).digest('hex');

// Compare a raw token against a stored hash (constant-time)
export const compareToken = (raw, storedHash) => {
  const incoming = hashToken(raw);
  if (incoming.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(incoming),
    Buffer.from(storedHash)
  );
};