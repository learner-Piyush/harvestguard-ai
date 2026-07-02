import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">eco</span>
          <h1 className="font-headline-md text-primary tracking-tight text-2xl">HarvestGuard AI</h1>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
