import crypto from "crypto";

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Encodes a buffer to Base32 string (RFC 4648)
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes a Base32 string to buffer
 */
export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_CHARS.indexOf(clean[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a random 20-byte base32 secret for 2FA setup
 */
export function generateTotpSecret(): { secret: string; base32: string } {
  const buffer = crypto.randomBytes(20);
  const base32 = base32Encode(buffer);
  return { secret: buffer.toString("hex"), base32 };
}

/**
 * Generates a 6-digit TOTP code for a given secret at a given counter step
 */
export function generateTotpCode(base32Secret: string, counter?: number): string {
  const secretBytes = base32Decode(base32Secret);
  const timeStep = counter !== undefined ? counter : Math.floor(Date.now() / 1000 / 30);

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac("sha1", secretBytes);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const strCode = (code % 1000000).toString();
  return strCode.padStart(6, "0");
}

/**
 * Verifies a 6-digit TOTP code allowing +/- 1 window (30 seconds drift)
 */
export function verifyTotpCode(token: string, base32Secret: string): boolean {
  if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
    return false;
  }

  const currentCounter = Math.floor(Date.now() / 1000 / 30);

  // Check current, previous, and next 30-sec windows
  for (let offset = -1; offset <= 1; offset++) {
    const generated = generateTotpCode(base32Secret, currentCounter + offset);
    if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(generated))) {
      return true;
    }
  }

  return false;
}

/**
 * Generates standard OTPAuth URI for QR Code generation
 */
export function generateOtpAuthUrl(
  accountName: string,
  base32Secret: string,
  issuer: string = "ModularHome Admin"
): string {
  const encodedAccount = encodeURIComponent(accountName);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${base32Secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generates 8 random 8-character backup recovery codes
 */
export function generateRecoveryCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}
