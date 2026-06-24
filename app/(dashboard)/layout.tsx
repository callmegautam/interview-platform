import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { cleanupExpiredRecordings } from "@/lib/cleanup";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  if (!session) redirect("/login");

  const cleanedCount = await cleanupExpiredRecordings();
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired recordings`);
  }

  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader companyName={session.companyName} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
