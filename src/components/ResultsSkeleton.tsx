import Header from "./Header";
import BottomNavBar from "./BottomNavBar";

interface ResultsSkeletonProps {
  image?: string | null;
}

export default function ResultsSkeleton({ image }: ResultsSkeletonProps) {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-24">
      <Header />

      <main className="max-w-md mx-auto px-container-margin pt-stack-md space-y-stack-md animate-pulse">
        {/* Result Header Skeleton */}
        <div className="text-center space-y-2">
          <div className="h-3 w-24 bg-surface-container-high mx-auto rounded-full"></div>
          <div className="h-8 w-48 bg-surface-container-high mx-auto rounded-lg"></div>
        </div>

        {/* Gauge Section Skeleton */}
        <div className="relative flex flex-col items-center justify-center py-stack-sm">
          <div className="relative w-64 h-64 rounded-full border-[16px] border-surface-container-highest flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-20 bg-surface-container-high rounded-lg"></div>
              <div className="h-3 w-16 bg-surface-container-high rounded-full"></div>
            </div>
          </div>
          <div className="mt-stack-sm h-10 w-36 bg-surface-container-high rounded-full"></div>
        </div>

        {/* Main Content Card Skeleton */}
        <section className="bg-surface-container-lowest rounded-[1.5rem] p-stack-md shadow-[0_4px_12px_rgba(45,90,39,0.08)] border border-outline-variant/30 space-y-stack-md">
          {/* Shelf Life Metric Placeholder */}
          <div className="h-20 w-full bg-surface-container rounded-xl"></div>

          {/* Defect Chips Placeholder */}
          <div className="space-y-2">
            <div className="h-3 w-32 bg-surface-container-high rounded-full"></div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-surface-container-high rounded-full"></div>
              <div className="h-8 w-28 bg-surface-container-high rounded-full"></div>
            </div>
          </div>

          {/* Analysis Image Skeleton */}
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-surface-container-high">
            {image && (
              <img
                className="w-full h-full object-cover opacity-50 grayscale"
                alt="Analyzing..."
                src={image}
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px]">
              <span className="material-symbols-outlined text-primary text-4xl animate-spin">
                progress_activity
              </span>
              <p className="mt-2 font-headline-md text-primary text-sm font-bold drop-shadow-sm">
                ANALYZING PRODUCE...
              </p>
            </div>
          </div>
        </section>

        {/* Storage Recommendation Box Skeleton */}
        <div className="h-24 w-full bg-surface-container-high rounded-xl opacity-60"></div>

        {/* Action Button Skeleton */}
        <div className="h-14 w-full bg-surface-container-highest rounded-full"></div>
      </main>

      <BottomNavBar active="history" />
    </div>
  );
}
