import { redirect } from "next/navigation";

export default function DownloadsRedirectPage() {
  redirect("/account?tab=downloads");
}
