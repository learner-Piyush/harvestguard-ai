import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full top-0 sticky shadow-[0_4px_12px_rgba(45,90,39,0.08)] bg-surface dark:bg-surface-container-low z-50">
      <div className="flex items-center justify-between px-container-margin py-base w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary dark:text-primary-fixed text-2xl">eco</span>
          <h1 className="font-headline-md text-headline-md-mobile text-primary dark:text-primary-fixed tracking-tight">
            HarvestGuard AI
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
