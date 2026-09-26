import { Metadata } from "next";
import CustomerLoginPage from "@/app/account/login/page";

export const metadata: Metadata = {
  title: "Customer Sign In | ModularHome.com",
  description: "Sign in to your ModularHome.com customer account to access your blueprint downloads, CAD files, and orders.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <CustomerLoginPage />;
}
