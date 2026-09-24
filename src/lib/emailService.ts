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
  const verifyUrl = `${SITE_URL}/account/verify?token=${params.token}`;
  const subject = "Verify your ModularHome.com customer account";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: #101114; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Modular<span style="color: #fcb907;">Home</span></h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #101114; margin-top: 0;">Welcome, ${params.name}!</h2>
        <p style="color: #4b5563; line-height: 1.6;">Thank you for creating an account with ModularHome.com. Please confirm your email address to access your customer dashboard, view purchased architectural blueprints, and manage your orders.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="background: #fcb907; color: #101114; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #6b7280; font-size: 13px;">If the button above does not work, copy and paste this link into your browser:<br/><a href="${verifyUrl}" style="color: #d97706;">${verifyUrl}</a></p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">Questions? Call our housing advisors at +1 (812) 595-4033 or reply to support@modularhome.com.</p>
      </div>
    </div>
  `;

  await logEmail({
    recipient: params.email,
    template_type: "EMAIL_VERIFICATION",
    subject,
    customer_id: params.customerId,
    status: "SENT",
    metadata: { verifyUrl, name: params.name },
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
    metadata: { resetUrl, name: params.name },
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
