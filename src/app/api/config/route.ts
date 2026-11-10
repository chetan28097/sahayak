import { NextResponse } from "next/server";
import { geminiAvailable, liveVoiceAvailable, MOCK_FORCED } from "@/server/config";
import { repo } from "@/server/store";

export function GET() {
  return NextResponse.json({
    mockForced: MOCK_FORCED,
    liveVoice: liveVoiceAvailable(),
    gemini: geminiAvailable(),
    storage: repo.kind,
  });
}
