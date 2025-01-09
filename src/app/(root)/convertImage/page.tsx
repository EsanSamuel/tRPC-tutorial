"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [image, setImage] = useState("");
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [format, setFormat] = useState("jpeg");
  const [isLoading, setIsLoading] = useState(false);
  const [fileType, setFileType] = useState<any>(selectedImage?.type);
  const [convertedFileType, setConvertedFileType] = useState<any>("");
  const [convertedImageType, setConvertedImageType] = useState<Blob | null>(
    null,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image")) {
      setSelectedImage(file);
      if (file?.type.includes("/")) {
        const [, type]: any = file?.type.split("/");
        setFileType(type);
      } else {
        setFileType(selectedImage?.type);
      }
    } else {
      alert("Please upload a valid image file.");
    }
  };

  useEffect(() => {
    const previewSelectedImage = () => {
      if (!selectedImage) return;
      const url = URL.createObjectURL(selectedImage);
      setImage(url);
      return () => URL.revokeObjectURL(url);
    };
    previewSelectedImage();
  }, [selectedImage]);

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormat(e.target.value);
  };

  const handleConvert = async () => {
    if (!selectedImage) {
      alert("Please select an image first.");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("format", format);

      const response = await fetch("/api/convertImage", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to convert image.");
      }

      const blob = await response.blob();
      setConvertedImageType(blob);
      if (blob?.type && blob?.type.includes("/")) {
        const [file, type]: any = blob?.type.split("/");
        setConvertedFileType(type);
      } else {
        setConvertedFileType(convertedImageType?.type);
      }
      const url = URL.createObjectURL(blob);
      setConvertedImage(url);
    } catch (error) {
      console.error(error);
      alert("An error occurred during image conversion.");
    } finally {
      setIsLoading(false);
    }
  };
  //"avif", "tiff", "heif"

  return (
    <div className="mt-20 flex flex-col items-center justify-center">
      <h1>Image Converter</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <p>Type: {fileType === null ? selectedImage?.type : fileType}</p>
      {selectedImage?.size && (
        <p>{`${(selectedImage?.size / 1024 / 1024).toFixed(2)} MB`}</p>
      )}
      <h1>Selected Image</h1>
      <Image
        src={image}
        alt="Converted"
        width={200}
        height={200}
        className="h-20 w-20"
      />

      <select value={format} onChange={handleFormatChange}>
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
        <option value="webp">WEBP</option>
        <option value="avif">AVIF</option>
        <option value="tiff">TIFF</option>
        <option value="gif">GIF</option>
      </select>

      <button onClick={handleConvert} disabled={isLoading}>
        {isLoading ? "Converting..." : "Convert"}
      </button>

      {convertedImage && (
        <div>
          <h2>Converted Image:</h2>
          <Image
            src={convertedImage}
            alt="Converted"
            width={200}
            height={200}
            className="h-20 w-20"
          />
          <p>
            Type:{" "}
            {convertedFileType === ""
              ? convertedImageType?.type
              : convertedFileType}
          </p>
          {convertedImageType && (
            <p>{`${(convertedImageType?.size / 1024 / 1024).toFixed(2)} MB`}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
