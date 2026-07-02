"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNavBar from "@/components/BottomNavBar";

interface ScanItem {
  id: string;
  produceType: string;
  ripenessStage: string;
  freshnessScore: number;
  shelfLifeDays: number;
  recommendation: string;
  imageUrl: string;
  createdAt: Date | string;
}

interface HistoryClientProps {
  initialScans: ScanItem[];
}

export default function HistoryClient({ initialScans }: HistoryClientProps) {
  const [filter, setFilter] = useState<"all" | "fruit" | "vegetable">("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Group list categories
  const fruitsList = ["apple", "banana", "orange", "strawberry", "grape", "peach", "pear", "mango", "berry", "cherry", "melon"];
  
  const getCategory = (produceType: string) => {
    const name = produceType.toLowerCase();
    if (fruitsList.some(fruit => name.includes(fruit))) {
      return "fruit";
    }
    return "vegetable"; // Default fallback
  };

  const filteredScans = initialScans.filter((scan) => {
    if (filter === "all") return true;
    return getCategory(scan.produceType) === filter;
  });

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 50) return "text-secondary";
    return "text-error";
  };

  const getRipenessText = (stage: string) => {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  return (
    <div className="font-body-md text-on-surface pb-24">
      <Header />

      <main className="max-w-7xl mx-auto px-container-margin">
        {/* History Header & Filter */}
        <section className="py-stack-md flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">History</h2>
              <p className="text-on-surface-variant text-label-sm">
                {initialScans.length} total scans logged
              </p>
            </div>
            
            <div className="relative inline-block text-left">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl border border-outline-variant hover:bg-surface-container transition-colors active:scale-95"
              >
                <span className="text-label-sm font-semibold text-on-surface-variant">
                  {filter === "all" ? "All Produce" : filter === "fruit" ? "Fruits" : "Vegetables"}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface border border-outline-variant shadow-lg z-10 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setFilter("all");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 text-label-sm text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                      All Produce
                    </button>
                    <button
                      onClick={() => {
                        setFilter("fruit");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 text-label-sm text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                      Fruits
                    </button>
                    <button
                      onClick={() => {
                        setFilter("vegetable");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 text-label-sm text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                      Vegetables
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Scan History List */}
        <section className="flex flex-col gap-4 max-w-2xl mx-auto">
          {filteredScans.length > 0 ? (
            filteredScans.map((scan) => {
              const category = getCategory(scan.produceType);
              const scoreColor = getScoreColorClass(scan.freshnessScore);
              const strokeDashoffset = 125.6 - (scan.freshnessScore / 100) * 125.6; // 2 * PI * r (r=20) => ~125.6

              return (
                <div
                  key={scan.id}
                  className="group flex items-center gap-4 p-3 bg-surface-container-lowest rounded-[1.5rem] border border-[#E6EBE6] shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      alt={scan.produceType}
                      src={scan.imageUrl}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-label-sm px-2 py-0.5 rounded-full ${
                          category === "fruit"
                            ? "text-on-tertiary-container bg-tertiary-fixed"
                            : "text-on-secondary-container bg-secondary-fixed"
                        }`}
                      >
                        {category === "fruit" ? "Fruit" : "Vegetable"}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-on-surface mt-0.5 truncate">
                      {scan.produceType}
                    </h3>
                    <p className="text-label-sm text-on-surface-variant truncate">
                      Shelf life: {scan.shelfLifeDays} days
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center pr-2 flex-shrink-0">
                    <div className="relative flex items-center justify-center w-12 h-12">
                      <svg className="w-12 h-12">
                        <circle
                          className="text-surface-container-high"
                          cx="24"
                          cy="24"
                          fill="transparent"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <circle
                          className={`${scoreColor} progress-ring__circle`}
                          cx="24"
                          cy="24"
                          fill="transparent"
                          r="20"
                          stroke="currentColor"
                          strokeDasharray="125.6"
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          strokeWidth="4"
                        ></circle>
                      </svg>
                      <span className={`absolute text-[10px] font-bold ${scoreColor}`}>
                        {scan.freshnessScore}%
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${scoreColor}`}>
                      {getRipenessText(scan.ripenessStage)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-surface-container-lowest border border-dashed border-[#E6EBE6] rounded-2xl p-6">
              <span className="material-symbols-outlined text-primary/50 text-5xl">inventory_2</span>
              <p className="mt-4 font-headline-md text-on-surface-variant text-base">No scans found.</p>
              <Link href="/scan" className="mt-4 inline-block px-6 py-2 bg-primary text-on-primary rounded-xl font-label-sm text-label-sm">
                Scan Now
              </Link>
            </div>
          )}
        </section>
      </main>

      <BottomNavBar active="history" />
    </div>
  );
}
