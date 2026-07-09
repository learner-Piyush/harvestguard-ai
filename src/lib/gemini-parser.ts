export interface GeminiAnalysis {
  produce_type: string;
  ripeness_stage: "unripe" | "ripe" | "overripe" | "spoiled";
  visible_defects: string[];
  freshness_score: number;
  estimated_shelf_life_days: number;
  storage_recommendation: string;
}

/**
 * Parses the Gemini API response text into a GeminiAnalysis object.
 * Handles cleaning up potential markdown code block formatting.
 */
export function parseGeminiResponse(responseText: string): GeminiAnalysis {
  if (!responseText) {
    throw new Error("No response received from Gemini API");
  }

  // Clean up potential markdown code block formatting (defense-in-depth)
  let cleanText = responseText.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
  }

  try {
    return JSON.parse(cleanText) as GeminiAnalysis;
  } catch (error) {
    throw new Error("Failed to parse Gemini response as JSON");
  }
}
