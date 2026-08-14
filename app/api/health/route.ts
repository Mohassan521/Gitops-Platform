import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      service: process.env.NEXT_PUBLIC_APP_NAME || "gitops-control-center",
      environment:
        process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "v1.0.0",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
    },
  );
}