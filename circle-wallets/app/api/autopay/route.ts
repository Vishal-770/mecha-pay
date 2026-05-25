import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { toLowerHex } from "@/lib/subgraph";
import { validateWalletOwnership } from "@/lib/auth-util";

export async function GET(req: NextRequest) {
  try {
    const subscriberAddress = req.nextUrl.searchParams.get("subscriberAddress");
    const userToken = req.nextUrl.searchParams.get("userToken");

    if (!subscriberAddress || !userToken) {
      return NextResponse.json(
        { error: "subscriberAddress and userToken are required" },
        { status: 400 }
      );
    }

    const subscriberLower = toLowerHex(subscriberAddress);

    // Validate ownership/session
    const isValid = await validateWalletOwnership(userToken, subscriberLower);
    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized: Wallet address does not belong to this user session" },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();

    const settings = await db.collection("autopay_settings")
      .find({ subscriberAddress: subscriberLower })
      .toArray();

    return NextResponse.json({
      settings: settings.map(s => ({
        id: s._id.toString(),
        subscriberAddress: s.subscriberAddress,
        planId: s.planId,
        enabled: s.enabled,
        tierId: s.tierId,
        buyerData: s.buyerData,
        signature: s.signature,
        nonce: s.nonce,
        deadline: s.deadline,
        currentExpiresAt: s.currentExpiresAt,
        sessionPublicKey: s.sessionPublicKey || "",
        sessionPrivateKey: s.sessionPrivateKey || "",
        maxCycles: s.maxCycles ?? 1,
        executedCycles: s.executedCycles ?? 0,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }))
    });
  } catch (err) {
    console.error("[GET /api/autopay]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subscriberAddress,
      planId,
      enabled,
      tierId,
      buyerData,
      signature,
      nonce,
      deadline,
      currentExpiresAt,
      sessionPublicKey,
      sessionPrivateKey,
      maxCycles,
      userToken,
    } = body;

    if (!subscriberAddress || !planId || !tierId || !userToken) {
      return NextResponse.json(
        { error: "subscriberAddress, planId, tierId, and userToken are required" },
        { status: 400 }
      );
    }

    const subscriberLower = toLowerHex(subscriberAddress);
    const planLower = toLowerHex(planId);

    // Validate ownership/session
    const isValid = await validateWalletOwnership(userToken, subscriberLower);
    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized: Wallet address does not belong to this user session" },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();

    const updateDoc: { $set: Record<string, unknown>; $setOnInsert: Record<string, unknown> } = {
      $set: {
        enabled: enabled ?? true,
        tierId: tierId,
        buyerData: buyerData || "",
        signature: signature || "",
        nonce: nonce ? Number(nonce) : 0,
        deadline: deadline ? Number(deadline) : 0,
        currentExpiresAt: currentExpiresAt ? Number(currentExpiresAt) : 0,
        sessionPublicKey: sessionPublicKey || "",
        sessionPrivateKey: sessionPrivateKey || "",
        maxCycles: maxCycles ? Number(maxCycles) : 1,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        subscriberAddress: subscriberLower,
        planId: planLower,
        executedCycles: 0,
        createdAt: new Date(),
      }
    };

    const result = await db.collection("autopay_settings").updateOne(
      { subscriberAddress: subscriberLower, planId: planLower },
      updateDoc,
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      upsertedId: result.upsertedId ? result.upsertedId.toString() : null,
    });
  } catch (err) {
    console.error("[POST /api/autopay]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const subscriberAddress = req.nextUrl.searchParams.get("subscriberAddress");
    const planId = req.nextUrl.searchParams.get("planId");
    const userToken = req.nextUrl.searchParams.get("userToken");

    if (!subscriberAddress || !planId || !userToken) {
      return NextResponse.json(
        { error: "subscriberAddress, planId, and userToken are required" },
        { status: 400 }
      );
    }

    const subscriberLower = toLowerHex(subscriberAddress);
    const planLower = toLowerHex(planId);

    // Validate ownership/session
    const isValid = await validateWalletOwnership(userToken, subscriberLower);
    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized: Wallet address does not belong to this user session" },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection("autopay_settings").deleteOne({
      subscriberAddress: subscriberLower,
      planId: planLower,
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("[DELETE /api/autopay]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
