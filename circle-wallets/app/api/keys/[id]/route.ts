import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userToken = req.nextUrl.searchParams.get("userToken");

    if (!userToken) {
      return NextResponse.json({ error: "userToken is required" }, { status: 400 });
    }

    const userId = userToken;

    const { db } = await connectToDatabase();

    // Soft delete / Revoke by setting revokedAt
    const result = await db.collection("api_keys").updateOne(
      { _id: new ObjectId(id), userId },
      { $set: { revokedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/keys/[id]]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
