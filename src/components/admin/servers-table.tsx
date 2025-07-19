"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash, ExternalLink } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Server } from "@/lib/db/schema";

interface ServersTableProps {
  servers: Server[];
  onDeleteServer?: (id: string) => void;
  isLoading?: boolean;
}

export function ServersTable({
  servers,
  onDeleteServer,
  isLoading,
}: ServersTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete server "${name}"?`)) return;

    setDeletingId(id);
    try {
      await onDeleteServer?.(id);
      toast.success("Server deleted successfully");
    } catch {
      toast.error("Failed to delete server");
    } finally {
      setDeletingId(null);
    }
  };

  if (servers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No servers found. Create your first server!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servers.map((server) => (
            <TableRow key={server.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {server.logoUrl && (
                    <Image
                      src={server.logoUrl}
                      alt={`${server.name} logo`}
                      className="h-6 w-6 rounded-sm object-cover"
                      width={24}
                      height={24}
                    />
                  )}
                  <div>
                    <div className="font-medium">{server.name}</div>
                    <div className="text-sm text-muted-foreground">
                      /{server.slug}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[300px] truncate text-sm">
                  {server.shortDesc}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {server.stars !== null && (
                    <Badge variant="secondary" className="text-xs">
                      ⭐ {server.stars}
                    </Badge>
                  )}
                  {server.license && (
                    <Badge variant="outline" className="text-xs">
                      {server.license}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {format(server.updatedAt, "MMM d, yyyy")}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {server.homepageUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={server.homepageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(server.id, server.name)}
                    disabled={deletingId === server.id || isLoading}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
