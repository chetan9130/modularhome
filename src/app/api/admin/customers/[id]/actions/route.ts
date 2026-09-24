import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import {
  getCustomerById,
  saveCustomer,
  revokeAllCustomerSessions,
  logCustomerEvent,
} from "@/lib/customerStore";
import { generateSecureToken } from "@/lib/customerAuth";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/emailService";
import { logActivity } from "@/lib/activityLog";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminRole(["SUPER_ADMIN", "SALES"]);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const customer = await getCustomerById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: { message: "Customer not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action, reason } = body;

    switch (action) {
      case "resend-verification": {
        const token = generateSecureToken();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        await saveCustomer({
          ...customer,
          verification_token: token,
          verification_token_expires_at: expires,
          updated_at: new Date().toISOString(),
        });

        await sendVerificationEmail({
          email: customer.email,
          name: customer.name,
          token,
          customerId: customer.id,
        });

        await logActivity({
          user_id: authResult.id,
          user_name: authResult.name,
          user_role: authResult.role,
          action: "RESEND_VERIFICATION_EMAIL",
          entity_type: "customers",
          entity_id: customer.id,
          description: `Admin sent verification email to ${customer.email}`,
        });

        return NextResponse.json({
          success: true,
          message: `Verification link dispatched to ${customer.email}.`,
        });
      }

      case "send-reset-password": {
        const resetToken = generateSecureToken();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        await saveCustomer({
          ...customer,
          reset_token: resetToken,
          reset_token_expires_at: resetExpires,
          updated_at: new Date().toISOString(),
        });

        await sendPasswordResetEmail({
          email: customer.email,
          name: customer.name,
          token: resetToken,
          customerId: customer.id,
        });

        await logActivity({
          user_id: authResult.id,
          user_name: authResult.name,
          user_role: authResult.role,
          action: "SEND_PASSWORD_RESET",
          entity_type: "customers",
          entity_id: customer.id,
          description: `Admin triggered password reset email for ${customer.email}`,
        });

        return NextResponse.json({
          success: true,
          message: `Password reset link dispatched to ${customer.email}.`,
        });
      }

      case "toggle-status": {
        const newStatus = customer.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

        await saveCustomer({
          ...customer,
          status: newStatus,
          updated_at: new Date().toISOString(),
        });

        if (newStatus === "DISABLED") {
          await revokeAllCustomerSessions(customer.id);
        }

        await logCustomerEvent({
          customer_id: customer.id,
          event_type: "STATUS_CHANGED",
          actor_type: "ADMIN",
          actor_name: authResult.name,
          details: { previousStatus: customer.status, newStatus, reason },
        });

        await logActivity({
          user_id: authResult.id,
          user_name: authResult.name,
          user_role: authResult.role,
          action: "TOGGLE_CUSTOMER_STATUS",
          entity_type: "customers",
          entity_id: customer.id,
          description: `Admin changed customer status to ${newStatus} for ${customer.email}`,
          details: { newStatus, reason },
        });

        return NextResponse.json({
          success: true,
          status: newStatus,
          message: `Customer account is now ${newStatus}.`,
        });
      }

      case "revoke-sessions": {
        await revokeAllCustomerSessions(customer.id);

        await logActivity({
          user_id: authResult.id,
          user_name: authResult.name,
          user_role: authResult.role,
          action: "REVOKE_CUSTOMER_SESSIONS",
          entity_type: "customers",
          entity_id: customer.id,
          description: `Admin revoked all active login sessions for ${customer.email}`,
        });

        return NextResponse.json({
          success: true,
          message: `All active sessions revoked for ${customer.email}.`,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: { message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to execute action." } },
      { status: 500 }
    );
  }
}
