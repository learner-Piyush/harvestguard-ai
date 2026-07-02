import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scans = await prisma.scan.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(scans);
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
