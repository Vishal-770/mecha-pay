import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({ transactions: [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
