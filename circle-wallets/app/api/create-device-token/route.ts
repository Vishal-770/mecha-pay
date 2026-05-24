import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ deviceToken: "mock-device-token", appId: "mock-app-id" });
}
