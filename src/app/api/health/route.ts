import { NextResponse } from "next/server";

export async function GET() {
  const aiKey = process.env.GEMINI_API_KEY;
  const aiMode = process.env.AI_MODE;
  const isAiConfigured = Boolean(aiKey && aiKey.trim().length > 0 && aiMode !== "off");
  const deploymentMode = process.env.DEPLOYMENT_MODE === "public_demo" ? "public_demo" : "local";

  return NextResponse.json(
    {
      status: "ok",
      aiConfigured: isAiConfigured,
      deploymentMode,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

