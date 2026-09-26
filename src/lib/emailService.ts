import fs from "fs";
import path from "path";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase";
import { EmailLog } from "./customerStore";

const EMAILS_FILE = path.join(process.cwd(), "src", "data", "custom_emails.json");

function ensureEmailFile() {
  if (!fs.existsSync(EMAILS_FILE)) {
    const dir = path.dirname(EMAILS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(EMAILS_FILE, "[]", "utf-8");
  }
}

export async function logEmail(log: Omit<EmailLog, "id" | "created_at">): Promise<EmailLog> {
  const newLog: EmailLog = {
    id: `eml-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...log,
    created_at: new Date().toISOString(),
  };

  ensureEmailFile();
  try {
    const raw = fs.readFileSync(EMAILS_FILE, "utf-8");
    const list: EmailLog[] = JSON.parse(raw) || [];
    list.unshift(newLog);
    fs.writeFileSync(EMAILS_FILE, JSON.stringify(list.slice(0, 3000), null, 2), "utf-8");
  } catch {}

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from("email_logs").insert(newLog);
    } catch (e) {
      console.warn("Supabase logEmail note:", e);
    }
  }

  return newLog;
}

export async function getEmailLogs(params?: { recipient?: string; templateType?: string }): Promise<EmailLog[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabaseAdmin.from("email_logs").select("*").order("created_at", { ascending: false });
      if (params?.recipient) query = query.eq("recipient", params.recipient);
      if (params?.templateType) query = query.eq("template_type", params.templateType);
      const { data, error } = await query;
      if (!error && data) return data as EmailLog[];
    } catch {}
  }

  ensureEmailFile();
  try {
    const raw = fs.readFileSync(EMAILS_FILE, "utf-8");
    let list: EmailLog[] = JSON.parse(raw) || [];
    if (params?.recipient) list = list.filter((l) => l.recipient.toLowerCase() === params.recipient!.toLowerCase());
    if (params?.templateType) list = list.filter((l) => l.template_type === params.templateType);
    return list;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Transactional Email Dispatchers
// ---------------------------------------------------------------------------

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://modularhome.com";

/**
 * Sends Email Verification Link
 */
export async function sendVerificationEmail(params: {
  email: string;
  name: string;
  token: string;
  customerId?: string;
}): Promise<boolean> {
  const callbackUrl = `${SITE_URL}/auth/callback?token=${params.token}`;
  const directVerifyUrl = `${SITE_URL}/verify-email?token=${params.token}`;
  const subject = "Verify your ModularHome.com customer account";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background: #101114; padding: 28px 24px; text-align: center; border-bottom: 3px solid #fcb907;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">
          Modular<span style="color: #fcb907;">Home</span>
        </h1>
        <p style="color: #9ca3af; margin: 6px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
          Premium Steel Modular Residences
        </p>
      </div>

      <!-- Body Content -->
      <div style="padding: 36px 32px;">
        <h2 style="color: #101114; margin-top: 0; font-size: 20px; font-weight: 800;">
          Welcome, ${params.name}!
        </h2>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Thank you for creating your customer account with ModularHome.com. Please confirm your email address to activate your customer portal, unlock instant CAD/PDF blueprint downloads, and track your architectural orders.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${callbackUrl}" style="background: #fcb907; color: #101114; font-size: 15px; font-weight: 800; padding: 16px 36px; text-decoration: none; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(252, 185, 7, 0.35);">
            Verify Email Address →
          </a>
        </div>

        <!-- Expiration Notice -->
        <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 10px; padding: 14px 18px; margin: 24px 0;">
          <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">
            ⏰ <strong>Security Notice:</strong> This verification link will expire in <strong>24 hours</strong>. If you did not create this account, no further action is required.
          </p>
        </div>

        <p style="color: #6b7280; font-size: 12px; line-height: 1.5;">
          If the button above does not work, copy and paste this link into your browser:<br/>
          <a href="${directVerifyUrl}" style="color: #d97706; word-break: break-all;">${directVerifyUrl}</a>
        </p>

        <!-- Support Footer -->
        <div style="color: #9ca3af; font-size: 12px; margin-top: 36px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="margin: 0 0 4px 0;">Need assistance? Our housing specialists are ready to help:</p>
          <p style="margin: 0;">📞 +1 (812) 595-4033 &nbsp;|&nbsp; ✉️ <a href="mailto:support@modularhome.com" style="color: #6b7280; text-decoration: underline;">support@modularhome.com</a></p>
        </div>
      </div>
    </div>
  `;

  await logEmail({
    recipient: params.email,
    template_type: "EMAIL_VERIFICATION",
    subject,
    customer_id: params.customerId,
    status: "SENT",
    metadata: { callbackUrl, directVerifyUrl, name: params.name, html_preview: html.substring(0, 500) },
  });

  return true;
}

/**
 * Sends Password Reset Email
 */
export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  token: string;
  customerId?: string;
}): Promise<boolean> {
  const resetUrl = `${SITE_URL}/account/reset-password?token=${params.token}`;
  const subject = "Reset your ModularHome.com account password";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: #101114; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Modular<span style="color: #fcb907;">Home</span></h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #101114; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #4b5563; line-height: 1.6;">Hello ${params.name}, we received a request to reset your password. Click the button below to choose a new secure password. This link is valid for 1 hour.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: #fcb907; color: #101114; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #6b7280; font-size: 13px;">If you did not request a password reset, you can safely ignore this email.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">Need assistance? Contact support@modularhome.com or call +1 (812) 595-4033.</p>
      </div>
    </div>
  `;

  await logEmail({
    recipient: params.email,
    template_type: "PASSWORD_RESET",
    subject,
    customer_id: params.customerId,
    status: "SENT",
    metadata: { resetUrl, name: params.name, html_preview: html.substring(0, 500) },
  });

  return true;
}

/**
 * Sends Order Confirmation & Download Access
 */
export async function sendOrderConfirmationEmail(params: {
  email: string;
  name: string;
  orderNumber: string;
  orderId?: string;
  customerId?: string;
  amount: number;
  items: Array<{ title: string; price: number; quantity: number }>;
  downloadToken?: string;
}): Promise<boolean> {
  const downloadUrl = params.downloadToken ? `${SITE_URL}/api/downloads/${params.downloadToken}` : `${SITE_URL}/account`;
  const invoiceUrl = params.orderId ? `${SITE_URL}/account/invoices/${params.orderId}` : `${SITE_URL}/account`;
  const subject = `Order Confirmed: ${params.orderNumber} - ModularHome Blueprints`;

  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #101114;">${item.title}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #101114;">$${item.price.toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  await logEmail({
    recipient: params.email,
    template_type: "ORDER_CONFIRMATION",
    subject,
    customer_id: params.customerId,
    order_id: params.orderId,
    status: "SENT",
    metadata: {
      orderNumber: params.orderNumber,
      amount: params.amount,
      downloadUrl,
      invoiceUrl,
      items_preview: itemsHtml.substring(0, 500),
    },
  });

  return true;
}

/**
 * Sends Refund Confirmation Email
 */
export async function sendRefundConfirmationEmail(params: {
  email: string;
  name: string;
  orderNumber: string;
  refundAmount: number;
  reason?: string;
  orderId?: string;
  customerId?: string;
}): Promise<boolean> {
  const subject = `Refund Processed: Order ${params.orderNumber}`;

  await logEmail({
    recipient: params.email,
    template_type: "REFUND_CONFIRMATION",
    subject,
    customer_id: params.customerId,
    order_id: params.orderId,
    status: "SENT",
    metadata: {
      orderNumber: params.orderNumber,
      refundAmount: params.refundAmount,
      reason: params.reason,
    },
  });

  return true;
}
