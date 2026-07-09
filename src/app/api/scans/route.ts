import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { fruitsList } from "@/lib/produce";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const filter = searchParams.get("filter") || "all";
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    let where: any = { userId };

    if (filter === "fruit") {
      where.OR = fruitsList.map((fruit) => ({
        produceType: { contains: fruit, mode: "insensitive" },
      }));
    } else if (filter === "vegetable") {
      where.NOT = fruitsList.map((fruit) => ({
        produceType: { contains: fruit, mode: "insensitive" },
      }));
    }

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

    return NextResponse.json({
      scans,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    });
  } catch (error: any) {
    console.error("GET Scans Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch scans" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      produceType,
      ripenessStage,
      freshnessScore,
      shelfLifeDays,
      recommendation,
      imageUrl,
    } = await req.json();

    // Basic validation
    if (!produceType || !ripenessStage || freshnessScore === undefined || shelfLifeDays === undefined || !recommendation || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newScan = await prisma.scan.create({
      data: {
        userId,
        produceType,
        ripenessStage,
        freshnessScore: Number(freshnessScore),
        shelfLifeDays: Number(shelfLifeDays),
        recommendation,
        imageUrl,
      },
    });

    return NextResponse.json(newScan, { status: 201 });
  } catch (error: any) {
    console.error("POST Scan Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save scan" },
      { status: 500 }
    );
  }
}
