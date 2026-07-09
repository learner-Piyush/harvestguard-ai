import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GeminiAnalysis, parseGeminiResponse } from "@/lib/gemini-parser";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";

interface FastAPIResponse {
  predicted_shelf_life_days: number;
  confidence_note?: string;
}

async function fetchMLShelfLife(
  produce_type: string,
  ripeness_stage: string,
  defect_count: number
): Promise<FastAPIResponse | null> {
  try {
    const res = await fetch(`${FASTAPI_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produce_type, ripeness_stage, defect_count }),
      // Don't let a slow/offline FastAPI service block the whole request
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(`[analyze] FastAPI /predict returned ${res.status}`);
      return null;
    }

    return (await res.json()) as FastAPIResponse;
  } catch (err) {
    console.warn("[analyze] FastAPI service unreachable:", (err as Error).message);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Handle data URLs
    let mimeType = "image/jpeg";
    let base64Data = image;
    if (image.startsWith("data:")) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // As per instruction, model must be "gemini-3.5-flash"
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            produce_type: { type: SchemaType.STRING },
            ripeness_stage: { 
              type: SchemaType.STRING, 
              enum: ["unripe", "ripe", "overripe", "spoiled"],
              format: "enum"
            },
            visible_defects: { 
              type: SchemaType.ARRAY, 
              items: { type: SchemaType.STRING } 
            },
            freshness_score: { type: SchemaType.INTEGER },
            estimated_shelf_life_days: { type: SchemaType.INTEGER },
            storage_recommendation: { type: SchemaType.STRING }
          },
          required: [
            "produce_type",
            "ripeness_stage",
            "visible_defects",
            "freshness_score",
            "estimated_shelf_life_days",
            "storage_recommendation"
          ]
        }
      },
    });

    const prompt = `You are an agricultural post-harvest quality expert. Analyze this image of produce.
Return ONLY valid JSON with this exact structure:
{
  "produce_type": "string",
  "ripeness_stage": "unripe | ripe | overripe | spoiled",
  "visible_defects": ["string"],
  "freshness_score": 0-100,
  "estimated_shelf_life_days": number,
  "storage_recommendation": "string (max 2 sentences)"
}
Base your assessment on color, texture, blemishes, and visible decay signs.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ]);

    const responseText = result.response.text();
    const gemini = parseGeminiResponse(responseText);

    const defect_count = Array.isArray(gemini.visible_defects)
      ? gemini.visible_defects.length
      : 0;

    const mlResult = await fetchMLShelfLife(
      gemini.produce_type,
      gemini.ripeness_stage,
      defect_count
    );

    const mergedResponse = {
      // Core Gemini fields
      produce_type: gemini.produce_type,
      ripeness_stage: gemini.ripeness_stage,
      visible_defects: gemini.visible_defects,
      freshness_score: gemini.freshness_score,
      storage_recommendation: gemini.storage_recommendation,

      // Shelf life — ML model value is primary; Gemini estimate kept for comparison
      estimated_shelf_life_days: mlResult
        ? mlResult.predicted_shelf_life_days          // ML model (primary)
        : gemini.estimated_shelf_life_days,           // fallback to Gemini

      // Comparison data (available when FastAPI is running)
      gemini_estimated_shelf_life_days: gemini.estimated_shelf_life_days,
      ml_predicted_shelf_life_days: mlResult?.predicted_shelf_life_days ?? null,
      ml_confidence_note: mlResult?.confidence_note ?? null,
      ml_service_status: mlResult ? "online" : "offline",
    };

    return NextResponse.json(mergedResponse);
  } catch (error: any) {
    console.error("Analysis Error:", error);

    let errorMessage = "An unexpected error occurred while analyzing the produce.";
    let statusCode = 500;

    if (error.message?.includes("GEMINI_API_KEY")) {
      errorMessage = "AI Service is not configured. Please check your API keys.";
    } else if (error.message?.includes("No response received from Gemini")) {
      errorMessage = "The AI service failed to respond. Please try again.";
    } else if (error instanceof SyntaxError) {
      errorMessage = "Failed to parse the AI analysis results. Please try again.";
    } else if (error.message?.includes("fetch")) {
      errorMessage = "Network error. Please check your connection to the AI services.";
    }

    return NextResponse.json(
      { error: errorMessage, details: error?.message },
      { status: statusCode }
    );
  }
}
