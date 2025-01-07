"use client";
import ImagePreviewer from "@/app/_components/ImagePreviewer";
import { compressFile } from "@/utils/helper";
import React, { useEffect, useState } from "react";

const page = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [compressesImage, setCompressedImage] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [imageUrl, setImageUrl] = useState();

  const handleOnChange = (event: any) => {
    setSelectedImage(event.target.files?.[0]);
  };

  const handleCompressedFile = async () => {
    if (selectedImage) {
      try {
        const compressedImageFile = await compressFile(selectedImage);

        setCompressedImage(compressedImageFile);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div>
      <input className="border-[1px] border-black" onChange={handleOnChange} type="file" />

      {selectedImage && (
        <button onClick={handleCompressedFile} disabled={isCompressing}>
          {isCompressing ? "Compressing..." : "Compress"}
        </button>
      )}

      <ImagePreviewer imageFile={selectedImage as File} />
      <ImagePreviewer imageFile={compressesImage as File} />
    </div>
  );
};

export default page;
