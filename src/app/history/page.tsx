import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import HistoryClient from "./HistoryClient";

export const revalidate = 0; // Disable page caching so updates show immediately

export default async function HistoryPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch scans from NeonDB database
  const scans = await prisma.scan.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convert Date objects to strings for Client Component serialization
  const serializedScans = scans.map((scan) => ({
    ...scan,
    createdAt: scan.createdAt.toISOString(),
  }));

  return <HistoryClient initialScans={serializedScans} />;
}
