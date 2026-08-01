import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { s3, MINIO_BUCKET, keyFromUrl } from "@/lib/minio";

// GET current portfolio (singleton: latest row)
export async function GET() {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

// POST set active portfolio (replaces any existing one)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, filename, size } = body;

    if (!url || !filename || typeof size !== "number") {
      return NextResponse.json(
        { error: "url, filename, and size are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.portfolio.findMany();

    await prisma.portfolio.create({
      data: { url, filename, sizeBytes: size },
    });

    for (const old of existing) {
      const key = keyFromUrl(old.url);
      if (key) {
        try {
          await s3.send(
            new DeleteObjectCommand({ Bucket: MINIO_BUCKET, Key: key })
          );
        } catch (err) {
          console.error("Failed to delete old portfolio object", key, err);
        }
      }
      await prisma.portfolio.delete({ where: { id: old.id } });
    }

    const current = await prisma.portfolio.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(current, { status: 201 });
  } catch (error) {
    console.error("Error saving portfolio:", error);
    return NextResponse.json(
      { error: "Failed to save portfolio" },
      { status: 500 }
    );
  }
}

// DELETE current portfolio
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const all = await prisma.portfolio.findMany();
    for (const r of all) {
      const key = keyFromUrl(r.url);
      if (key) {
        try {
          await s3.send(
            new DeleteObjectCommand({ Bucket: MINIO_BUCKET, Key: key })
          );
        } catch (err) {
          console.error("Failed to delete portfolio object", key, err);
        }
      }
      await prisma.portfolio.delete({ where: { id: r.id } });
    }

    return NextResponse.json({ message: "Portfolio removed" });
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    return NextResponse.json(
      { error: "Failed to delete portfolio" },
      { status: 500 }
    );
  }
}
