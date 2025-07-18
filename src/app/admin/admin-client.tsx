"use client";

import { useState } from "react";
import { useServerAction } from "zsa-react";
import { ServersTable } from "@/components/admin/servers-table";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { 
  createServerAction, 
  updateServerAction, 
  deleteServerAction, 
  revalidateCacheAction 
} from "@/app/actions/servers";
import type { Server, NewServer } from "@/lib/db/schema";
import { useRouter } from "next/navigation";

interface AdminClientProps {
  initialServers: Server[];
}

export function AdminClient({ initialServers }: AdminClientProps) {
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const { execute: createServer, isPending: isCreateLoading } = useServerAction(createServerAction, {
    onSuccess: ({ data }) => {
      setServers(prev => [...prev, data]);
    },
    onError: ({ err }) => {
      console.error("Failed to create server:", err);
      alert(`Failed to create server: ${err.message}`);
    },
  });

  const { execute: updateServer, isPending: isUpdateLoading } = useServerAction(updateServerAction, {
    onSuccess: ({ data }) => {
      setServers(prev => prev.map(s => s.id === data.id ? data : s));
    },
    onError: ({ err }) => {
      console.error("Failed to update server:", err);
      alert(`Failed to update server: ${err.message}`);
    },
  });

  const { execute: deleteServer, isPending: isDeleteLoading } = useServerAction(deleteServerAction, {
    onSuccess: () => {
      if (deletingId) {
        setServers(prev => prev.filter(s => s.id !== deletingId));
        setDeletingId(null);
      }
    },
    onError: ({ err }) => {
      console.error("Failed to delete server:", err);
      alert(`Failed to delete server: ${err.message}`);
      setDeletingId(null);
    },
  });

  const { execute: revalidateCache, isPending: isRevalidateLoading } = useServerAction(revalidateCacheAction, {
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

  const handleCreateServer = (data: NewServer) => {
    createServer(data);
  };

  const handleUpdateServer = (id: string, data: Partial<NewServer>) => {
    updateServer({ id, ...data });
  };

  const handleDeleteServer = (id: string) => {
    setDeletingId(id);
    deleteServer({ id });
  };

  const handleRevalidate = () => {
    revalidateCache({ tag: "servers" });
  };

  const isLoading = isCreateLoading || isUpdateLoading || isDeleteLoading;

  return (
    <>
      <div className="flex justify-end space-x-2 mb-6">
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

      <ServersTable
        servers={servers}
        onCreateServer={handleCreateServer}
        onUpdateServer={handleUpdateServer}
        onDeleteServer={handleDeleteServer}
        isLoading={isLoading}
      />
    </>
  );
}