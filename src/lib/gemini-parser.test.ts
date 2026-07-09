import { describe, it, expect } from "vitest";
import { parseGeminiResponse } from "./gemini-parser";

describe("parseGeminiResponse", () => {
  it("should parse valid JSON", () => {
    const json = JSON.stringify({
      produce_type: "apple",
      ripeness_stage: "ripe",
      visible_defects: ["bruise"],
      freshness_score: 90,
      estimated_shelf_life_days: 7,
      storage_recommendation: "Refrigerate.",
    });
    const result = parseGeminiResponse(json);
    expect(result.produce_type).toBe("apple");
    expect(result.freshness_score).toBe(90);
  });

  it("should parse JSON wrapped in markdown code blocks", () => {
    const input = "```json\n" + JSON.stringify({
      produce_type: "banana",
      ripeness_stage: "ripe",
      visible_defects: [],
      freshness_score: 85,
      estimated_shelf_life_days: 3,
      storage_recommendation: "Keep away from other fruits.",
    }) + "\n```";
    const result = parseGeminiResponse(input);
    expect(result.produce_type).toBe("banana");
  });

  it("should parse JSON wrapped in markdown code blocks without 'json' tag", () => {
    const input = "```\n" + JSON.stringify({
      produce_type: "orange",
      ripeness_stage: "ripe",
      visible_defects: [],
      freshness_score: 95,
      estimated_shelf_life_days: 10,
      storage_recommendation: "Cool dry place.",
    }) + "\n```";
    const result = parseGeminiResponse(input);
    expect(result.produce_type).toBe("orange");
  });

  it("should throw error for empty response", () => {
    expect(() => parseGeminiResponse("")).toThrow("No response received from Gemini API");
  });

  it("should throw error for non-JSON output", () => {
    expect(() => parseGeminiResponse("This is not JSON")).toThrow("Failed to parse Gemini response as JSON");
  });

  it("should throw error for malformed JSON", () => {
    expect(() => parseGeminiResponse('{"produce_type": "apple",')).toThrow("Failed to parse Gemini response as JSON");
  });
});
