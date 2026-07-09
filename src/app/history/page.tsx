import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import HistoryClient from "./HistoryClient";
import { fruitsList } from "@/lib/produce";

export const revalidate = 0; // Disable page caching so updates show immediately

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const page = typeof searchParams.page === "string" ? Math.max(1, parseInt(searchParams.page) || 1) : 1;
  const filter = typeof searchParams.filter === "string" ? searchParams.filter : "all";
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  let where: any = { userId };

  if (filter === "fruit") {
    where.OR = fruitsList.map((fruit) => ({
      produceType: { contains: fruit, mode: "insensitive" },
    }));
  } else if (filter === "vegetable") {
    where.AND = fruitsList.map((fruit) => ({
      produceType: { not: { contains: fruit, mode: "insensitive" } },
    }));
  }

  // Fetch scans from NeonDB database with pagination and filtering
  const [scans, totalCount] = await Promise.all([
    prisma.scan.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: pageSize,
    }),
    prisma.scan.count({
      where,
    }),
  ]);

  // Convert Date objects to strings for Client Component serialization
  const serializedScans = scans.map((scan) => ({
    ...scan,
    createdAt: scan.createdAt.toISOString(),
  }));

  return (
    <HistoryClient
      initialScans={serializedScans}
      totalCount={totalCount}
      totalPages={Math.ceil(totalCount / pageSize)}
      currentPage={page}
      initialFilter={filter as "all" | "fruit" | "vegetable"}
    />
  );
}
