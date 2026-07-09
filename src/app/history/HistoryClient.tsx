"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import BottomNavBar from "@/components/BottomNavBar";
import { getCategory } from "@/lib/produce";

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
  totalCount: number;
  totalPages: number;
  currentPage: number;
  initialFilter: "all" | "fruit" | "vegetable";
}

export default function HistoryClient({
  initialScans,
  totalCount,
  totalPages,
  currentPage,
  initialFilter,
}: HistoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<"all" | "fruit" | "vegetable">(initialFilter);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const handleExportCSV = () => {
    if (initialScans.length === 0) return;

    const headers = ["ID", "Produce Type", "Ripeness Stage", "Freshness Score", "Shelf Life (Days)", "Recommendation", "Created At"];
    const rows = initialScans.map(scan => [
      scan.id,
      scan.produceType,
      scan.ripenessStage,
      scan.freshnessScore,
      scan.shelfLifeDays,
      `"${scan.recommendation.replace(/"/g, '""')}"`,
      new Date(scan.createdAt).toISOString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `harvestguard_scans_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 50) return "text-secondary";
    return "text-error";
  };

  const getRipenessText = (stage: string) => {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/history?${params.toString()}`);
  };

  const handleFilterChange = (newFilter: "all" | "fruit" | "vegetable") => {
    setFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", newFilter);
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`/history?${params.toString()}`);
  };

  return (
    <div className="font-body-md text-on-surface pb-24">
      <Header />

      <main className="max-w-7xl mx-auto px-container-margin">
        {/* History Header & Filter */}
        <section className="py-stack-md flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">History</h2>
              <p className="text-on-surface-variant text-label-sm">
                {totalCount} total scans logged
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span className="text-label-sm font-semibold whitespace-nowrap">Export CSV</span>
              </button>

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
                          handleFilterChange("all");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left block px-4 py-2 text-label-sm text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors"
                      >
                        All Produce
                      </button>
                      <button
                        onClick={() => {
                          handleFilterChange("fruit");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left block px-4 py-2 text-label-sm text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors"
                      >
                        Fruits
                      </button>
                      <button
                        onClick={() => {
                          handleFilterChange("vegetable");
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
          </div>
        </section>

        {/* Scan History List */}
        <section className="flex flex-col gap-4 max-w-2xl mx-auto">
          {initialScans.length > 0 ? (
            initialScans.map((scan) => {
              const category = getCategory(scan.produceType);
              const scoreColor = getScoreColorClass(scan.freshnessScore);
              const strokeDashoffset = 125.6 - (scan.freshnessScore / 100) * 125.6; // 2 * PI * r (r=20) => ~125.6

              return (
                <div
                  key={scan.id}
                  className="group flex items-center gap-4 p-3 bg-surface-container-lowest rounded-[1.5rem] border border-[#E6EBE6] shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-surface-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="w-full h-full object-cover"
                      alt={scan.produceType}
                      src={scan.imageUrl}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-label-sm px-2 py-0.5 rounded-full ${category === "fruit"
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <section className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low border border-outline-variant text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Simple logic to show current page and a few around it if there are many pages
                  if (
                    totalPages <= 5 ||
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-full text-label-md font-medium transition-all ${currentPage === pageNum
                            ? "bg-primary text-on-primary shadow-md"
                            : "text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === 2 && currentPage > 3) ||
                    (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={pageNum} className="px-1 text-on-surface-variant">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low border border-outline-variant text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
                aria-label="Next page"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <p className="text-label-sm text-on-surface-variant">
              Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
            </p>
          </section>
        )}
      </main>

      <BottomNavBar active="history" />
    </div>
  );
}
