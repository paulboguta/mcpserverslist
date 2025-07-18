"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServerForm } from "./server-form";
import type { Server } from "@/lib/db/schema";
import { Pencil, Trash2, Plus } from "lucide-react";

interface ServersTableProps {
  servers: Server[];
  onCreateServer: (data: any) => void;
  onUpdateServer: (id: string, data: any) => void;
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

  const columns: ColumnDef<Server>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },
    {
      accessorKey: "shortDesc",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.getValue("shortDesc") as string;
        return desc.length > 50 ? `${desc.substring(0, 50)}...` : desc;
      },
    },
    {
      accessorKey: "stars",
      header: "Stars",
      cell: ({ row }) => {
        const stars = row.getValue("stars") as number;
        return stars || 0;
      },
    },
    {
      accessorKey: "license",
      header: "License",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const server = row.original;
        return (
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
        );
      },
    },
  ];

  const table = useReactTable({
    data: servers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleFormSubmit = (data: any) => {
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
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