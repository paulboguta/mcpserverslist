import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // Check if user is authenticated and has admin role
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tag } = await request.json();
    
    if (!tag) {
      return NextResponse.json({ error: "Tag is required" }, { status: 400 });
    }

    revalidateTag(tag);
    
    return NextResponse.json({ revalidated: true, tag });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 });
  }
}