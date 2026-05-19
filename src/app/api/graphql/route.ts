import { NextRequest, NextResponse } from "next/server";
import Config from "../../config.json";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const upstream = await fetch(Config.API.CcreAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.SCREEN_API_KEY
        ? { Authorization: "Bearer " + process.env.SCREEN_API_KEY }
        : {}),
    },
    body,
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}
