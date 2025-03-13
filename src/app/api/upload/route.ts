import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // Create unique filename using timestamp
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${timestamp}.${extension}`;

    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), "public/uploads");
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    // Return the URL
    const imageUrl = `/uploads/${filename}`;
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 