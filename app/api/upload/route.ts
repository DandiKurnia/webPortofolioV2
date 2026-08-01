import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/auth";
import { s3, MINIO_BUCKET, publicUrl } from "@/lib/minio";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOC_TYPES = ["application/pdf"];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...DOC_TYPES];

const MAX_SIZE_IMAGE = 5 * 1024 * 1024; // 5MB
const MAX_SIZE_DOC = 10 * 1024 * 1024; // 10MB

const FOLDER_BY_KIND: Record<string, string> = {
  image: "projects",
  resume: "resume",
  portfolio: "portfolio",
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const kindRaw = formData.get("kind");
    const kind =
      typeof kindRaw === "string" && kindRaw in FOLDER_BY_KIND
        ? kindRaw
        : "image";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type." },
        { status: 400 }
      );
    }

    const isDoc = DOC_TYPES.includes(file.type);

    if (kind === "resume" && !isDoc) {
      return NextResponse.json(
        { error: "Resume must be a PDF." },
        { status: 400 }
      );
    }

    if (kind === "portfolio" && !isDoc) {
      return NextResponse.json(
        { error: "Portfolio must be a PDF." },
        { status: 400 }
      );
    }

    if (kind === "image" && isDoc) {
      return NextResponse.json(
        { error: "Image upload requires a JPG/PNG/WEBP/GIF." },
        { status: 400 }
      );
    }

    const maxSize = isDoc ? MAX_SIZE_DOC : MAX_SIZE_IMAGE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max ${Math.round(maxSize / 1024 / 1024)}MB.` },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const folder = FOLDER_BY_KIND[kind];
    const key = `${folder}/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    return NextResponse.json({
      url: publicUrl(key),
      key,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
