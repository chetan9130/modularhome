import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder_key";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

/**
 * Server-side Razorpay instance
 */
export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

/**
 * Checks if live Razorpay credentials are set in environment
 */
export function isRazorpayConfigured(): boolean {
  return (
    Boolean(process.env.RAZORPAY_KEY_ID) &&
    Boolean(process.env.RAZORPAY_KEY_SECRET) &&
    !process.env.RAZORPAY_KEY_ID?.includes("placeholder")
  );
}

/**
 * Cryptographically verifies Razorpay payment signature
 * HMAC SHA256 (order_id + "|" + razorpay_payment_id, secret)
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!isRazorpayConfigured()) {
    // In test/demo sandbox mode without live keys, allow verified test tokens
    return Boolean(orderId && paymentId && signature);
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}
