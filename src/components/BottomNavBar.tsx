import Link from "next/link";

interface BottomNavBarProps {
  active: "home" | "scan" | "history";
}

export default function BottomNavBar({ active }: BottomNavBarProps) {
  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface border-t border-surface-container-high md:hidden">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all active:scale-90 duration-200 ${
            active === "home"
              ? "bg-primary-container text-on-primary-container rounded-full px-4 py-1.5"
              : "text-on-surface-variant hover:bg-surface-container-highest"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: active === "home" ? "'FILL' 1" : undefined }}
          >
            home
          </span>
          <span className="font-label-sm text-label-sm">Home</span>
        </Link>

        {active === "scan" ? (
          <Link
            href="/scan"
            className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1.5 active:scale-90 transition-transform duration-200"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              center_focus_strong
            </span>
            <span className="font-label-sm text-label-sm">Scan</span>
          </Link>
        ) : (
          <Link
            href="/scan"
            className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-all p-2 rounded-lg"
          >
            {active === "history" ? (
              <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-full -mt-8 shadow-lg ring-4 ring-surface">
                <span className="material-symbols-outlined text-on-primary">center_focus_strong</span>
              </div>
            ) : (
              <span className="material-symbols-outlined">center_focus_strong</span>
            )}
            <span className="font-label-sm text-label-sm mt-1">Scan</span>
          </Link>
        )}

        <Link
          href="/history"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all active:scale-90 duration-200 ${
            active === "history"
              ? "bg-primary-container text-on-primary-container rounded-full px-4 py-1.5"
              : "text-on-surface-variant hover:bg-surface-container-highest"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: active === "history" ? "'FILL' 1" : undefined }}
          >
            history
          </span>
          <span className="font-label-sm text-label-sm">History</span>
        </Link>
      </nav>

      {/* Desktop Side Nav Support (Floating on large screens) */}
      <div className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-6 p-4 bg-surface rounded-2xl shadow-xl border border-outline-variant z-50">
        <Link
          href="/"
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
            active === "home"
              ? "bg-primary-container text-on-primary-container"
              : "hover:bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: active === "home" ? "'FILL' 1" : undefined }}
          >
            home
          </span>
        </Link>
        <Link
          href="/scan"
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors active:scale-95 ${
            active === "scan"
              ? "bg-primary text-on-primary shadow-lg"
              : "hover:bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined">center_focus_strong</span>
        </Link>
        <Link
          href="/history"
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
            active === "history"
              ? "bg-primary-container text-on-primary-container"
              : "hover:bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: active === "history" ? "'FILL' 1" : undefined }}
          >
            history
          </span>
        </Link>
      </div>
    </>
  );
}
