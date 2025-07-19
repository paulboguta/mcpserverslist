import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServers } from "@/app/actions/servers";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  // Check authentication and admin role on the server
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  // Fetch servers on the server
  const servers = await getServers();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">MCP Servers Admin</h1>
            <p className="text-muted-foreground mt-2">
              Welcome, {session.user.name} ({session.user.email})
            </p>
          </div>
        </div>

        <AdminClient initialServers={servers} />
      </div>
    </div>
  );
}
