import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerByVerificationToken,
  getCustomerByEmail,
  saveCustomer,
  logCustomerEvent,
} from "@/lib/customerStore";
import { createCustomerSession } from "@/lib/customerAuth";
import { supabase, supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token = searchParams.get("token");
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

  // Handle explicit Supabase callback errors
  if (errorParam) {
    console.warn("Auth callback error parameter:", errorParam, errorDescription);
    return NextResponse.redirect(
      new URL(`/verify-email?error=${encodeURIComponent(errorDescription || errorParam)}`, baseUrl)
    );
  }

  // 1. Process ModularHome / Custom Verification Token
  if (token && typeof token === "string") {
    try {
      const cleanToken = token.trim();
      const customer = await getCustomerByVerificationToken(cleanToken);

      if (!customer) {
        return NextResponse.redirect(new URL("/verify-email?error=invalid_token", baseUrl));
      }

      if (
        customer.verification_token_expires_at &&
        new Date(customer.verification_token_expires_at) < new Date()
      ) {
        return NextResponse.redirect(
          new URL(
            `/verify-email?error=expired_token&email=${encodeURIComponent(customer.email)}`,
            baseUrl
          )
        );
      }

      // Mark verified
      const updated = await saveCustomer({
        ...customer,
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
        updated_at: new Date().toISOString(),
      });

      // Confirm in Supabase Auth if linked
      if (customer.auth_user_id && isSupabaseConfigured()) {
        try {
          await supabaseAdmin.auth.admin.updateUserById(customer.auth_user_id, {
            email_confirm: true,
          });
        } catch (authErr) {
          console.warn("Supabase auth user confirmation sync note in callback:", authErr);
        }
      }

      // Log event
      await logCustomerEvent({
        customer_id: updated.id,
        event_type: "EMAIL_VERIFIED",
        actor_type: "CUSTOMER",
        actor_name: updated.name,
        details: { email: updated.email, source: "EMAIL_CALLBACK" },
      });

      // Create session cookie
      await createCustomerSession(updated);

      // Redirect to customer portal with verified flag
      return NextResponse.redirect(new URL("/account?verified=true", baseUrl));
    } catch (err) {
      console.error("Error processing token verification in callback:", err);
      return NextResponse.redirect(new URL("/verify-email?error=server_error", baseUrl));
    }
  }

  // 2. Process Supabase Auth PKCE Code Exchange (if triggered via Supabase email links)
  if (code && typeof code === "string") {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data?.user?.email) {
          const userEmail = data.user.email.toLowerCase().trim();
          const customer = await getCustomerByEmail(userEmail);

          if (customer) {
            const updated = await saveCustomer({
              ...customer,
              auth_user_id: data.user.id || customer.auth_user_id,
              email_verified: true,
              verification_token: null,
              verification_token_expires_at: null,
              updated_at: new Date().toISOString(),
            });

            await logCustomerEvent({
              customer_id: updated.id,
              event_type: "EMAIL_VERIFIED",
              actor_type: "CUSTOMER",
              actor_name: updated.name,
              details: { email: updated.email, source: "SUPABASE_PKCE" },
            });

            await createCustomerSession(updated);
            return NextResponse.redirect(new URL("/account?verified=true", baseUrl));
          }
        }
      }
    } catch (supabaseErr) {
      console.warn("Supabase PKCE code exchange error in callback:", supabaseErr);
    }
  }

  // Fallback: If no recognized token or code
  return NextResponse.redirect(new URL("/verify-email?error=missing_token", baseUrl));
}
