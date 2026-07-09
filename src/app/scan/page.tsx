"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNavBar from "@/components/BottomNavBar";

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = () => {
    if (!imagePreview) {
      setError("Please capture or upload an image first.");
      return;
    }

    // Store in sessionStorage and move to results page immediately to show loading skeleton
    sessionStorage.setItem("harvestguard_pending_image", imagePreview);
    sessionStorage.removeItem("harvestguard_pending_analysis");

    router.push("/results");
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col pb-24">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-container-margin py-stack-md max-w-lg mx-auto w-full">
        {/* Instructional Header */}
        <div className="text-center mb-stack-md">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">
            Scan Produce
          </h2>
          <p className="text-on-surface-variant font-body-md">
            Capture a clear photo of your fruits or vegetables to analyze freshness and ripeness.
          </p>
        </div>

        {/* Camera/Upload Area (Bento-style Card) */}
        <div className="w-full bg-surface-container-lowest rounded-[1.5rem] p-stack-sm shadow-[0_4px_12px_rgba(45,90,39,0.08)] border border-[#E6EBE6] relative overflow-hidden group">
          {/* Scan Preview Area */}
          <div
            onClick={handleContainerClick}
            className={`relative aspect-square w-full rounded-xl overflow-hidden bg-surface-container flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-all duration-300 ${
              imagePreview ? "border-primary border-2" : ""
            }`}
          >
            {/* Dashed Border Overlay */}
            <div className="absolute inset-4 scanner-frame opacity-40 rounded-lg"></div>

            {imagePreview ? (
              /* Image Preview */
              <img
                src={imagePreview}
                alt="Uploaded produce scan preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              /* Empty State Content */
              <div className="z-10 flex flex-col items-center gap-4 text-on-surface-variant group-hover:scale-105 transition-transform">
                <div className="w-20 h-20 bg-primary-container/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-primary">
                    center_focus_strong
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-headline-md text-headline-md text-primary">Tap to Capture</p>
                  <p className="text-label-sm font-label-sm opacity-70">or drag and drop photo</p>
                </div>
              </div>
            )}

            {/* Hidden Input */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Context Chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <span className="bg-tertiary-fixed/20 text-tertiary text-label-sm font-label-sm px-3 py-1 rounded-full whitespace-nowrap">
              Auto-detecting...
            </span>
            <span className="bg-surface-container-highest text-on-surface-variant text-label-sm font-label-sm px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
              <span className="material-symbols-outlined text-[16px]">light_mode</span> Optimal Light
            </span>
            <span className="bg-surface-container-highest text-on-surface-variant text-label-sm font-label-sm px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
              <span className="material-symbols-outlined text-[16px]">straighten</span> 15cm distance
            </span>
          </div>
        </div>

        {error && (
          <div className="w-full mt-4 p-4 bg-error-container text-on-error-container rounded-xl flex flex-col gap-3 border border-error/20 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 font-semibold text-label-sm">
              <span className="material-symbols-outlined text-error">error</span>
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-label-sm font-bold text-error self-end hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="w-full mt-stack-md">
          <button
            onClick={handleAnalyze}
            disabled={!imagePreview}
            className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-md text-headline-md flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                Analyzing Produce...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-2xl">analytics</span>
                {error ? "Try Analysis Again" : "Analyze Produce"}
              </>
            )}
          </button>
          <p className="text-center text-label-sm font-label-sm text-on-surface-variant mt-4 opacity-60">
            Powered by HarvestGuard AI Engine v2.4
          </p>
        </div>
      </main>

      <BottomNavBar active="scan" />
    </div>
  );
}
