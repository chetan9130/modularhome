import AdminVideoManager from "@/components/AdminVideoManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "YouTube Video Management | Admin Dashboard",
  description: "Manage automated YouTube channel sync, video categories, and website visibility for ModularHome.com.",
};

export default function AdminVideosPage() {
  return (
    <div className="space-y-6">
      <AdminVideoManager />
    </div>
  );
}
