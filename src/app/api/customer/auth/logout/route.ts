import { NextResponse } from "next/server";
import { destroyCustomerSession } from "@/lib/customerAuth";

export async function POST() {
  await destroyCustomerSession();
  return NextResponse.json({
    success: true,
    message: "Successfully signed out.",
  });
}
