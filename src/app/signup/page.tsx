import { Metadata } from "next";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
  title: "Create Customer Account | ModularHome.com",
  description: "Register for your ModularHome.com customer account to access blueprints, architectural CAD files, and order tracking.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupPage() {
  return <SignupClient />;
}
