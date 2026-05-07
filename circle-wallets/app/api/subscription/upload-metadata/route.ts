import { NextRequest, NextResponse } from "next/server";
import { ObjectManager } from "@filebase/sdk";
import {
  normalizeIpfsUri,
  validateSubscriptionMetadata,
  type SubscriptionUiMetadata,
} from "@/lib/subscription";

function getFilebaseManager() {
  const key = process.env.FILE_BASE_ACCESS_TOKEN;
  const secret = process.env.FILE_BASE_SECRET_KEY;
  const bucket = process.env.FILE_BASE_BUCKET_NAME;

  if (!key || !secret || !bucket) {
    throw new Error("Missing Filebase credentials in env");
  }

  return new ObjectManager(key, secret, { bucket });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { metadata?: SubscriptionUiMetadata };
    const metadata = body.metadata;

    const validation = validateSubscriptionMetadata(metadata);
    if (!validation.valid) {
      console.error("[upload-metadata] Validation failed:", validation.errors);
      console.log("[upload-metadata] Received metadata:", JSON.stringify(metadata, null, 2));
      return NextResponse.json(
        {
          error: "Invalid subscription metadata",
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    const manager = getFilebaseManager();
    const key = `plans/${Date.now()}-${Math.random().toString(36).slice(2)}.json`;

    const payload = JSON.stringify(metadata, null, 2);
    const uploaded = await manager.upload(
      key,
      Buffer.from(payload, "utf8"),
      { contentType: "application/json" },
      undefined,
    );

    const cid =
      (uploaded as { cid?: string; data?: { cid?: string } }).cid ??
      (uploaded as { cid?: string; data?: { cid?: string } }).data?.cid;

    if (!cid) {
      return NextResponse.json(
        { error: "Upload succeeded but CID was not returned by Filebase" },
        { status: 500 },
      );
    }

    const ipfsHash = normalizeIpfsUri(cid);

    return NextResponse.json({
      cid,
      ipfsHash,
      objectKey: key,
    });
  } catch (err) {
    console.error("[/api/subscription/upload-metadata]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
