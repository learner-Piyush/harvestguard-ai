"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNavBar from "@/components/BottomNavBar";
import ResultsSkeleton from "@/components/ResultsSkeleton";

interface GeminiAnalysis {
  produce_type: string;
  ripeness_stage: "unripe" | "ripe" | "overripe" | "spoiled";
  visible_defects: string[];
  freshness_score: number;
  estimated_shelf_life_days: number;
  storage_recommendation: string;
}

const GAUGE_RADIUS = 110;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

export default function ResultsPage() {
  const router = useRouter();
  
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [dashOffset, setDashOffset] = useState(GAUGE_CIRCUMFERENCE); // Default full circle offset
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (imageData: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze produce.");
      }

      const result = await response.json() as GeminiAnalysis;
      setAnalysis(result);
      sessionStorage.setItem("harvestguard_pending_analysis", JSON.stringify(result));

      // Animate progress circle with a slight delay
      const score = result.freshness_score || 0;
      const offset = GAUGE_CIRCUMFERENCE - (score / 100) * GAUGE_CIRCUMFERENCE;
      setTimeout(() => {
        setDashOffset(offset);
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An error occurred during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Read from sessionStorage
    const storedImage = sessionStorage.getItem("harvestguard_pending_image");
    const storedAnalysis = sessionStorage.getItem("harvestguard_pending_analysis");

    if (!storedImage) {
      router.replace("/scan");
      return;
    }

    setImage(storedImage);

    if (storedAnalysis) {
      try {
        const parsed = JSON.parse(storedAnalysis) as GeminiAnalysis;
        setAnalysis(parsed);
        setLoading(false);

        // Animate progress circle with a slight delay
        const score = parsed.freshness_score || 0;
        const offset = GAUGE_CIRCUMFERENCE - (score / 100) * GAUGE_CIRCUMFERENCE;
        setTimeout(() => {
          setDashOffset(offset);
        }, 100);
      } catch (e) {
        console.error(e);
        runAnalysis(storedImage);
      }
    } else {
      runAnalysis(storedImage);
    }
  }, [router, runAnalysis]);

  const handleSaveToInventory = async () => {
    if (!analysis || !image) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produceType: analysis.produce_type,
          ripenessStage: analysis.ripeness_stage,
          freshnessScore: analysis.freshness_score,
          shelfLifeDays: analysis.estimated_shelf_life_days,
          recommendation: analysis.storage_recommendation,
          imageUrl: image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to log scan to inventory.");
      }

      // Clear storage
      sessionStorage.removeItem("harvestguard_pending_image");
      sessionStorage.removeItem("harvestguard_pending_analysis");

      router.push("/history");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Could not log results to inventory. Please try again.");
      setSaving(false);
    }
  };

  if (loading || (!analysis && !error)) {
    return <ResultsSkeleton image={image} />;
  }

  // Set visual indicators
  const ripenessTags = {
    unripe: { bg: "bg-secondary-fixed/20 text-secondary", text: "Unripe" },
    ripe: { bg: "bg-primary/10 text-primary", text: "Ripe (Peak Quality)" },
    overripe: { bg: "bg-secondary/10 text-secondary", text: "Overripe" },
    spoiled: { bg: "bg-error/10 text-error", text: "Spoiled / Critical" },
  };

  const ripenessConfig = analysis ? (ripenessTags[analysis.ripeness_stage] || {
    bg: "bg-surface-container-high text-on-surface-variant",
    text: analysis.ripeness_stage,
  }) : { bg: "", text: "" };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-24">
      <Header />

      <main className="max-w-md mx-auto px-container-margin pt-stack-md space-y-stack-md">
        {/* Result Header */}
        <div className="text-center space-y-1">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            Analysis Result
          </p>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            {analysis?.produce_type || "Analysis Failed"}
          </h2>
        </div>

        {/* Gauge Section */}
        <div className="relative flex flex-col items-center justify-center py-stack-sm">
          <div className="relative w-64 h-64">
            {/* SVG Gauge */}
            <svg className="w-full h-full">
              <circle
                className="text-surface-container-highest"
                cx="128"
                cy="128"
                fill="transparent"
                r="110"
                stroke="currentColor"
                strokeWidth="16"
              ></circle>
              <circle
                className="text-primary progress-ring-circle"
                cx="128"
                cy="128"
                fill="transparent"
                r={GAUGE_RADIUS}
                stroke="currentColor"
                strokeDasharray={GAUGE_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                strokeWidth="16"
              ></circle>
            </svg>
            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-headline-lg text-headline-lg text-primary">
                {analysis?.freshness_score || 0}%
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                FRESHNESS
              </span>
            </div>
          </div>
          <div className={`mt-stack-sm ${ripenessConfig.bg} px-4 py-2 rounded-full font-label-sm text-label-sm flex items-center gap-2`}>
            <span className="material-symbols-outlined text-sm">verified</span>
            {ripenessConfig.text}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded-xl text-label-sm font-semibold flex items-center gap-2 border border-error/20">
            <span className="material-symbols-outlined text-error">error</span>
            {error}
          </div>
        )}

        {/* Main Content Card */}
        <section className="bg-surface-container-lowest rounded-[1.5rem] p-stack-md shadow-[0_4px_12px_rgba(45,90,39,0.08)] border border-[#E6EBE6] space-y-stack-md">
          {/* Shelf Life Metric */}
          <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
            <div className="flex items-center gap-3">
              <div className="bg-primary-container text-on-primary-container p-2 rounded-lg flex items-center">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Est. Shelf-life</p>
                <p className="font-body-lg text-body-lg font-bold text-on-surface">
                  {analysis?.estimated_shelf_life_days || 0} Days Remaining
                </p>
              </div>
            </div>
          </div>

          {/* Defect Chips */}
          {analysis?.visible_defects && analysis.visible_defects.length > 0 && (
            <div className="space-y-stack-sm">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                Visual Indicators
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.visible_defects.map((defect, index) => (
                  <div
                    key={index}
                    className="bg-surface-container-high px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-outline-variant/30"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      report_problem
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface">{defect}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Image */}
          {image && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-inner group">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Scanned produce capture"
                src={image}
              />
              <div className="absolute top-2 right-2 glass-card rounded-lg px-2 py-1 flex items-center gap-1 border border-white/40">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-bold text-primary">AI SCANNED</span>
              </div>
            </div>
          )}
        </section>

        {/* Storage Recommendation Box */}
        <section className="bg-secondary-fixed rounded-xl p-stack-md border-l-4 border-secondary shadow-sm">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-on-secondary-fixed mt-1">lightbulb</span>
            <div className="space-y-1">
              <h3 className="font-headline-md text-on-secondary-fixed text-body-md font-bold">
                Storage Recommendation
              </h3>
              <p className="font-body-md text-on-secondary-fixed-variant leading-relaxed">
                {analysis?.storage_recommendation || "No recommendation available."}
              </p>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={handleSaveToInventory}
          disabled={saving || !analysis}
          className="w-full py-4 bg-primary text-on-primary rounded-full font-headline-md text-headline-md shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Saving to Inventory...
            </>
          ) : (
            <>
              Log to Inventory
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </>
          )}
        </button>
      </main>

      <BottomNavBar active="history" />
    </div>
  );
}
