import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { generateApiKey, hashApiKey } from "@/lib/api-keys";
import { toLowerHex } from "@/lib/subgraph";

export async function GET(req: NextRequest) {
  try {
    const userToken = req.nextUrl.searchParams.get("userToken");
    if (!userToken) {
      return NextResponse.json({ error: "userToken is required" }, { status: 400 });
    }

    const userId = userToken;

    const { db } = await connectToDatabase();

    const keys = await db.collection("api_keys")
      .find({ userId, revokedAt: null })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      keys: keys.map(k => ({
        id: k._id.toString(),
        name: k.name,
        prefix: k.prefix,
        mask: k.mask,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt
      }))
    });
  } catch (err) {
    console.error("[GET /api/keys]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userToken, name, merchantAddress } = body;

    if (!userToken || !name) {
      return NextResponse.json({ error: "userToken and name are required" }, { status: 400 });
    }

    const userId = userToken;

    const rawKey = generateApiKey();
    const hashedKey = hashApiKey(rawKey);

    const { db } = await connectToDatabase();

    const newKey = {
      userId,
      merchantAddress: merchantAddress ? toLowerHex(merchantAddress) : null,
      name,
      keyHash: hashedKey,
      prefix: rawKey.slice(0, 8),
      mask: rawKey.slice(-4),
      createdAt: new Date(),
      lastUsedAt: null,
      revokedAt: null
    };

    const result = await db.collection("api_keys").insertOne(newKey);

    return NextResponse.json({
      id: result.insertedId.toString(),
      rawKey // WE SHOW THIS ONLY ONCE
    });
  } catch (err) {
    console.error("[POST /api/keys]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
