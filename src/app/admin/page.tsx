"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServersTable } from "@/components/admin/servers-table";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { Server } from "@/lib/db/schema";

async function fetchServers(): Promise<Server[]> {
  const response = await fetch("/api/servers");
  if (!response.ok) {
    throw new Error("Failed to fetch servers");
  }
  return response.json();
}

async function createServer(data: any): Promise<Server> {
  const response = await fetch("/api/servers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create server");
  }
  return response.json();
}

async function updateServer(id: string, data: any): Promise<Server> {
  const response = await fetch("/api/servers", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...data }),
  });
  if (!response.ok) {
    throw new Error("Failed to update server");
  }
  return response.json();
}

async function deleteServer(id: string): Promise<void> {
  const response = await fetch("/api/servers", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete server");
  }
}

async function revalidateCache(): Promise<void> {
  const response = await fetch("/api/revalidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tag: "servers" }),
  });
  if (!response.ok) {
    throw new Error("Failed to revalidate cache");
  }
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const session = await authClient.getSession();
        setUser(session?.user);
      } catch (error) {
        console.error("Failed to get user:", error);
      }
    };
    getUser();
  }, []);

  const { data: servers = [], isLoading } = useQuery({
    queryKey: ["servers"],
    queryFn: fetchServers,
  });

  const createMutation = useMutation({
    mutationFn: createServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      revalidateCache();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateServer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      revalidateCache();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      revalidateCache();
    },
  });

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const handleRevalidate = async () => {
    try {
      await revalidateCache();
      alert("Cache revalidated successfully!");
    } catch (error) {
      console.error("Failed to revalidate:", error);
      alert("Failed to revalidate cache");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            {user && (
              <p className="text-gray-600 mt-2">
                Welcome, {user.name} ({user.email})
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleRevalidate}>
              Revalidate Cache
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <ServersTable
          servers={servers}
          onCreateServer={(data) => createMutation.mutate(data)}
          onUpdateServer={(id, data) => updateMutation.mutate({ id, data })}
          onDeleteServer={(id) => deleteMutation.mutate(id)}
          isLoading={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
        />
      </div>
    </div>
  );
}