import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

type validFormat = "jpeg" | "png" | "webp" | "avif" | "tiff" | "gif";

export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    const formData = await req.formData();

    const files = formData.getAll("files") as Blob[] | null;
    const format = formData.get("format") as string | null;

    if (
      !files ||
      !format ||
      !["jpeg", "png", "webp", "gif", "tiff", "avif"].includes(format!)
    ) {
      return NextResponse.json(
        { error: "Requirements not found!" },
        { status: 400 },
      );
    }

    const convertedImages = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        // Convert the image format
        const convertedImageBuffer = await sharp(imageBuffer)
          .toFormat(format as validFormat)
          .toBuffer();

        return convertedImageBuffer;
      }),
    );

    // Combine all converted images into a single response
    return new NextResponse(
      JSON.stringify({
        images: convertedImages.map((img) => img.toString("base64")),
      }), // Return images as base64 strings
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error during image conversion" },
      { status: 500 },
    );
  }
};
