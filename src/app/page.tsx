import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import BottomNavBar from "@/components/BottomNavBar";

export const revalidate = 0; // Disable caching so database updates show immediately

export default async function HomePage() {
  const { userId } = auth();
  
  let recentScans: any[] = [];
  let dailyScansCount = 0;
  let averageFreshness = 0;
  let gradeLetter = "N/A";

  if (userId) {
    // Fetch actual scans from database
    recentScans = await prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const allScans = await prisma.scan.findMany({
      where: { userId },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    dailyScansCount = allScans.filter(scan => new Date(scan.createdAt) >= today).length;

    if (allScans.length > 0) {
      const sum = allScans.reduce((acc, scan) => acc + scan.freshnessScore, 0);
      averageFreshness = Math.round(sum / allScans.length);
      
      if (averageFreshness >= 90) gradeLetter = "A+";
      else if (averageFreshness >= 80) gradeLetter = "A";
      else if (averageFreshness >= 70) gradeLetter = "B";
      else if (averageFreshness >= 60) gradeLetter = "C";
      else gradeLetter = "D";
    }
  } else {
    // If not logged in, display mockup default stats
    dailyScansCount = 128;
    gradeLetter = "A+";
  }

  // Fallback to mock recent scans if user is logged out or has no scans yet
  const displayScans = (userId && recentScans.length > 0) 
    ? recentScans.map(scan => ({
        id: scan.id,
        produceType: scan.produceType,
        freshnessScore: scan.freshnessScore,
        ripenessStage: scan.ripenessStage,
        imageUrl: scan.imageUrl,
        createdAt: new Date(scan.createdAt).toLocaleDateString(),
        isMock: false
      }))
    : [
        {
          id: "mock-1",
          produceType: "Gala Apples",
          freshnessScore: 98,
          ripenessStage: "fresh",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvxUWwQ2clNn-x2fYswEtZtxqkGJrw4PVp5YEhpUmZtaUOTE5zlWbMG7S8bVHPZ0-tk_005-GST-P14W9XAcnTJKMnGG71WRpHvcwfODJzgZC-tLmDll5u2TEL-9ljt10iw7GVIAsdIaidhXC7JpOUI9nlHR11-8-XMXCJabgM3U87vxPpTv3AZ65O8Dz9AFVrJ7VjBVtEhMbqB_lVIkJcaspa7rNcox_wsZ6IdJyBFJz9y6qbuNaw1WKB0ggH3LaciapsBe-JZbE",
          createdAt: "2m ago",
          isMock: true
        },
        {
          id: "mock-2",
          produceType: "Organic Spinach",
          freshnessScore: 74,
          ripenessStage: "watch",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCq7HADGgiWZbyfETCpF7QFdkGx-E6XyIcK7zJhIA2n2SfWheoAevBC_r-8OfdK8n-GV-Dns_diMxqHy2dKeY_JKjdnyA7QwGpmdOQsK2Ogus7J0V7Fg8t98Tm8-PMNAKzsxy6Y8GzyY_YAw8A0TFMQJCgY1hWo2E3nZoCu0UPRI50M_jz1fAN392FvlUcM5pu0iY3G41bdR1vSyYQbRM-KpEt8qhCXP27aBmQ78u8U__Zcdz9oZAtSGvCAhLJ6mvUj0EI96Kuto68",
          createdAt: "45m ago",
          isMock: true
        },
        {
          id: "mock-3",
          produceType: "Navel Oranges",
          freshnessScore: 92,
          ripenessStage: "fresh",
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgmAko7vAu48RKXOyBivj_Rop1PJwX6KWSlb3Z3atcHqtQj_XifG7HU-H1u7U26MvOMu5nYEhZATOz5xCpzU5yCblo2f-n7jDOeiy6mMjlAW__fhX7bHOeORfUJhyvhIQED5RXiSi_KicoVQZ6ICyjWAT9L7EBMzxK5yXQscd_dXLGq8d05MhykjuH3hVbYn2XvRBNfI3gHgl_QHmWCyo-IaLGyWES73bsH5uzbrkHJEPKec_tk1hSLwcxaXz1U9jeoseNxeV-5UY",
          createdAt: "1h ago",
          isMock: true
        }
      ];

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-7xl mx-auto px-container-margin pt-stack-md flex flex-col gap-stack-lg">
        {/* Hero Section: Scan CTA */}
        <section className="relative w-full overflow-hidden rounded-3xl bg-primary-container text-on-primary shadow-lg p-stack-md flex flex-col items-center text-center gap-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-tertiary-fixed opacity-10 rounded-full -ml-12 -mb-12"></div>
          <div className="flex flex-col gap-2 relative z-10">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-white leading-tight">
              Check Your Harvest
            </h2>
            <p className="font-body-md text-body-md text-on-primary-container opacity-90 max-w-xs mx-auto">
              AI-powered freshness analysis for smarter inventory management.
            </p>
          </div>
          <Link
            href="/scan"
            className="group relative flex flex-col items-center justify-center bg-white text-primary w-44 h-44 rounded-full shadow-2xl transition-all hover:shadow-primary/20 active:scale-95 animate-scan-pulse"
          >
            <div className="flex flex-col items-center gap-1">
              <span
                className="material-symbols-outlined text-6xl group-hover:scale-110 transition-transform duration-300"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                center_focus_strong
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest mt-2">
                Scan Produce
              </span>
            </div>
            {/* Interactive corner markers */}
            <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl"></div>
            <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr"></div>
            <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl"></div>
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br"></div>
          </Link>
        </section>

        {/* Stats Bento Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-1 border border-[#E6EBE6]">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Daily Scans</span>
            <span className="font-headline-md text-headline-md text-primary">{dailyScansCount}</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-1 border border-[#E6EBE6]">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Avg Grade</span>
            <span className="font-headline-md text-headline-md text-secondary">{gradeLetter}</span>
          </div>
        </div>

        {/* Recent Scans Section */}
        <section className="flex flex-col gap-stack-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Scans</h3>
            <Link
              href="/history"
              className="text-primary font-label-sm text-label-sm flex items-center gap-1 hover:underline"
            >
              See All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="flex flex-col gap-gutter md:grid md:grid-cols-3">
            {displayScans.map((scan) => (
              <div
                key={scan.id}
                className="bg-surface-container-lowest p-3 rounded-[1.5rem] flex items-center gap-4 shadow-[0_4px_12px_rgba(45,90,39,0.08)] border border-[#E6EBE6] transition-transform hover:scale-[0.99] active:scale-[0.98]"
              >
                <div className="w-20 h-20 rounded-xl bg-surface-container overflow-hidden flex-shrink-0 relative">
                  <img
                    className="w-full h-full object-cover"
                    alt={scan.produceType}
                    src={scan.imageUrl}
                  />
                </div>
                <div className="flex flex-col flex-grow gap-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-headline-md text-base text-on-surface truncate pr-1">
                      {scan.produceType}
                    </h4>
                    <span className="font-label-sm text-[10px] text-on-surface-variant flex-shrink-0">
                      {scan.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] flex items-center gap-1 ${
                        scan.freshnessScore >= 80
                          ? "bg-primary/10 text-primary"
                          : scan.freshnessScore >= 50
                          ? "bg-secondary/10 text-secondary"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          scan.freshnessScore >= 80
                            ? "bg-primary"
                            : scan.freshnessScore >= 50
                            ? "bg-secondary"
                            : "bg-error"
                        }`}
                      ></span>
                      {scan.freshnessScore >= 80
                        ? "Fresh"
                        : scan.freshnessScore >= 50
                        ? "Watch"
                        : "Spoiled"}
                    </span>
                    <span className="text-on-surface-variant text-body-md text-xs">
                      {scan.freshnessScore}% Quality
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/40">
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Freshness Insight Card */}
        <section className="bg-secondary-fixed text-on-secondary-fixed p-container-margin rounded-3xl flex flex-col gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-on-secondary-fixed rounded-full flex items-center justify-center text-secondary-fixed">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                lightbulb
              </span>
            </div>
            <h4 className="font-headline-md text-on-secondary-fixed">Daily Insight</h4>
          </div>
          <p className="font-body-md text-on-secondary-fixed-variant leading-snug">
            Ethylene levels in Storage A are rising. Consider moving your leafy greens to a cooler zone to maintain peak freshness.
          </p>
          <button className="bg-on-secondary-fixed text-secondary-fixed py-3 rounded-xl font-label-sm text-label-sm transition-all hover:bg-opacity-90 active:scale-95">
            Optimize Storage
          </button>
        </section>
      </main>

      <BottomNavBar active="home" />
    </div>
  );
}
