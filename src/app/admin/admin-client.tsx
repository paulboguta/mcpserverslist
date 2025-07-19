"use client";

import { useState } from "react";
import { useServerAction } from "zsa-react";
import { ServersTable } from "@/components/admin/servers-table";
import { CreateServerDialog } from "@/components/admin/create-server-dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  deleteServerAction,
  revalidateCacheAction,
} from "@/app/actions/servers";
import type { Server } from "@/lib/db/schema";
import { useRouter } from "next/navigation";

interface AdminClientProps {
  initialServers: Server[];
}

export function AdminClient({ initialServers }: AdminClientProps) {
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const { execute: deleteServer, isPending: isDeleteLoading } = useServerAction(
    deleteServerAction,
    {
      onSuccess: () => {
        if (deletingId) {
          setServers((prev) => prev.filter((s) => s.id !== deletingId));
          setDeletingId(null);
        }
      },
      onError: ({ err }) => {
        console.error("Failed to delete server:", err);
        alert(`Failed to delete server: ${err.message}`);
        setDeletingId(null);
      },
    },
  );

  const { execute: revalidateCache, isPending: isRevalidateLoading } =
    useServerAction(revalidateCacheAction, {
      onSuccess: () => {
        alert("Cache revalidated successfully!");
        router.refresh();
      },
      onError: ({ err }) => {
        console.error("Failed to revalidate cache:", err);
        alert(`Failed to revalidate cache: ${err.message}`);
      },
    });

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const handleDeleteServer = (id: string) => {
    setDeletingId(id);
    deleteServer({ id });
  };

  const handleRevalidate = () => {
    revalidateCache({ tag: "servers" });
  };

  const handleServerCreated = () => {
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <CreateServerDialog onServerCreated={handleServerCreated} />

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRevalidate}
            disabled={isRevalidateLoading}
          >
            {isRevalidateLoading ? "Revalidating..." : "Revalidate Cache"}
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <ServersTable
        servers={servers}
        onDeleteServer={handleDeleteServer}
        isLoading={isDeleteLoading}
      />
    </>
  );
}
