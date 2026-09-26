import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerByVerificationToken,
  getCustomerByEmail,
  getCustomerByAuthUserId,
  saveCustomer,
  saveTermsConsent,
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
  const redirectTarget = searchParams.get("redirect") || searchParams.get("next") || "/account";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

  // Handle explicit Supabase callback errors
  if (errorParam) {
    console.warn("Auth callback error parameter:", errorParam, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || errorParam)}`, baseUrl)
    );
  }

  // 1. Process ModularHome / Custom Verification Token (from Email link)
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

  // 2. Process Google OAuth / Supabase Auth PKCE Code Exchange
  if (code && typeof code === "string") {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Supabase exchangeCodeForSession error:", error);
          return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(error.message)}`, baseUrl)
          );
        }

        if (data?.user?.email) {
          const user = data.user;
          const userEmail: string = user.email!.toLowerCase().trim();
          const metadata = user.user_metadata || {};

          // Look up existing customer by auth_user_id or email
          let customer =
            (await getCustomerByAuthUserId(user.id)) || (await getCustomerByEmail(userEmail));

          if (customer) {
            // Existing customer signing in with Google
            const updated = await saveCustomer({
              ...customer,
              auth_user_id: user.id,
              email_verified: true,
              provider: customer.provider === "EMAIL" ? "GOOGLE+EMAIL" : "GOOGLE",
              last_login_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

            await logCustomerEvent({
              customer_id: updated.id,
              event_type: "LOGGED_IN",
              actor_type: "CUSTOMER",
              actor_name: updated.name,
              details: { email: updated.email, provider: "GOOGLE", source: "OAUTH_CALLBACK" },
            });

            await createCustomerSession(updated);
            const destination = redirectTarget.startsWith("/") ? redirectTarget : "/account";
            return NextResponse.redirect(new URL(destination, baseUrl));
          } else {
            // New Customer auto-created via Google OAuth
            const fullName =
              metadata.full_name ||
              metadata.name ||
              (metadata.given_name && metadata.family_name
                ? `${metadata.given_name} ${metadata.family_name}`
                : userEmail.split("@")[0]);

            const firstName =
              metadata.given_name ||
              metadata.first_name ||
              fullName.split(" ")[0] ||
              "Customer";

            const lastName =
              metadata.family_name ||
              metadata.last_name ||
              fullName.split(" ").slice(1).join(" ") ||
              "";

            const ip =
              request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
              request.headers.get("x-real-ip") ||
              "127.0.0.1";
            const userAgent = request.headers.get("user-agent") || "";

            const newCustomerId = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const newCustomer = await saveCustomer({
              id: newCustomerId,
              auth_user_id: user.id,
              email: userEmail,
              password_hash: "", // OAuth accounts do not have plaintext/local password
              name: fullName,
              first_name: firstName,
              last_name: lastName,
              phone: user.phone || metadata.phone || null,
              status: "ACTIVE",
              email_verified: true,
              provider: "GOOGLE",
              terms_accepted_at: new Date().toISOString(),
              terms_version: "v1.0",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_login_at: new Date().toISOString(),
            });

            // Record Terms Consent
            await saveTermsConsent({
              customer_id: newCustomer.id,
              email: userEmail,
              policy_version: "v1.0",
              ip_address: ip,
              user_agent: userAgent,
            });

            // Log account creation events
            await logCustomerEvent({
              customer_id: newCustomer.id,
              event_type: "ACCOUNT_CREATED",
              actor_type: "CUSTOMER",
              actor_name: newCustomer.name,
              details: { email: userEmail, provider: "GOOGLE", terms_version: "v1.0" },
            });

            await logCustomerEvent({
              customer_id: newCustomer.id,
              event_type: "EMAIL_VERIFIED",
              actor_type: "CUSTOMER",
              actor_name: newCustomer.name,
              details: { email: userEmail, provider: "GOOGLE" },
            });

            await createCustomerSession(newCustomer);
            const destination = redirectTarget.startsWith("/") ? redirectTarget : "/account";
            return NextResponse.redirect(new URL(`${destination}?welcome=google`, baseUrl));
          }
        }
      }
    } catch (supabaseErr: any) {
      console.error("Supabase PKCE code exchange error in callback:", supabaseErr);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(supabaseErr?.message || "Google authentication failed.")}`, baseUrl)
      );
    }
  }

  // Fallback: If no recognized token or code
  return NextResponse.redirect(new URL("/login?error=missing_credentials", baseUrl));
}

