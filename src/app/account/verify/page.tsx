import { Metadata } from "next";
import VerifyEmailClient from "@/app/verify-email/VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify Email Address | ModularHome.com",
  description: "Confirm your customer email address to unlock your blueprints and customer dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountVerifyPage() {
  return <VerifyEmailClient />;
}
