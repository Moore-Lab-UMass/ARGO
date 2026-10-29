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
  if (!upstream.ok) console.error(`GraphQL API responded with HTTP ${upstream.status}`);
  // Stream the response back with its status unchanged; the GraphQL client reads errors from the body.
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}
