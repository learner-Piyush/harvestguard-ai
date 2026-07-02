import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    
    // As per instruction, model must be "gemini-3-flash"
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash",
      generationConfig: {
        responseMimeType: "application/json",
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
    if (!responseText) {
      throw new Error("No response received from Gemini API");
    }

    const parsedJson = JSON.parse(responseText.trim());

    return NextResponse.json(parsedJson);
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
