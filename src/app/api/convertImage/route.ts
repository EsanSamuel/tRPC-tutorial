import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

type validFormat = "jpeg" | "png" | "webp" | "avif" | "tiff" | "gif";

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request
    const formData = await req.formData();

    // Extract the image file and desired format from the form data
    const file = formData.get("file") as Blob | null;
    const format = formData.get("format") as string | null;

    if (!file || !format || !["jpeg", "png", "webp", "avif", "tiff", "gif"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid file or format provided" },
        { status: 400 }
      );
    }

    // Convert the file Blob to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Process the image with Sharp
    const convertedImageBuffer = await sharp(imageBuffer)
      .toFormat(format as validFormat)
      .toBuffer();

    // Return the converted image
    return new NextResponse(convertedImageBuffer, {
      headers: {
        "Content-Type": `image/${format}`,
      },
    });
  } catch (error) {
    console.error("Image conversion error:", error);
    return NextResponse.json(
      { error: "Error during image conversion" },
      { status: 500 }
    );
  }
}
