import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { servers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allServers = await db.select().from(servers);
    return NextResponse.json(allServers);
  } catch (error) {
    console.error("Failed to fetch servers:", error);
    return NextResponse.json({ error: "Failed to fetch servers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const [newServer] = await db.insert(servers).values(data).returning();
    return NextResponse.json(newServer);
  } catch (error) {
    console.error("Failed to create server:", error);
    return NextResponse.json({ error: "Failed to create server" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, ...data } = await request.json();
    const [updatedServer] = await db
      .update(servers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(servers.id, id))
      .returning();
    
    return NextResponse.json(updatedServer);
  } catch (error) {
    console.error("Failed to update server:", error);
    return NextResponse.json({ error: "Failed to update server" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    await db.delete(servers).where(eq(servers.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete server:", error);
    return NextResponse.json({ error: "Failed to delete server" }, { status: 500 });
  }
}