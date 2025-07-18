"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServerForm } from "./server-form";
import type { Server, NewServer } from "@/lib/db/schema";
import { Pencil, Trash2, Plus } from "lucide-react";

interface ServersTableProps {
  servers: Server[];
  onCreateServer: (data: NewServer) => void;
  onUpdateServer: (id: string, data: Partial<NewServer>) => void;
  onDeleteServer: (id: string) => void;
  isLoading?: boolean;
}

export function ServersTable({
  servers,
  onCreateServer,
  onUpdateServer,
  onDeleteServer,
  isLoading,
}: ServersTableProps) {
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleFormSubmit = (data: NewServer) => {
    if (editingServer) {
      onUpdateServer(editingServer.id, data);
    } else {
      onCreateServer(data);
    }
    setShowForm(false);
    setEditingServer(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingServer(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Servers</h2>
        <Button
          onClick={() => {
            setEditingServer(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Server
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Stars</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.length ? (
              servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell>{server.name}</TableCell>
                  <TableCell>{server.slug}</TableCell>
                  <TableCell>
                    {server.shortDesc.length > 50
                      ? `${server.shortDesc.substring(0, 50)}...`
                      : server.shortDesc}
                  </TableCell>
                  <TableCell>{server.stars || 0}</TableCell>
                  <TableCell>{server.license}</TableCell>
                  <TableCell>
                    {new Date(server.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingServer(server);
                          setShowForm(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteServer(server.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No servers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <ServerForm
          server={editingServer}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isLoading}
        />
      </Dialog>
    </div>
  );
}