"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const page = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<
    {
      url: string;
      type: string;
    }[]
  >([]);
  const [format, setFormat] = useState("");
  const [convertedImages, setConvertedImages] = useState([]);

  const handleFileChange = (e: any) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages(filesArray as File[]);
    }
  };

  useEffect(() => {
    const previewSelectedImage = () => {
      if (!selectedImages) return;
      const url = selectedImages.map((image) => ({
        url: URL.createObjectURL(image),
        type: image.type,
      }));
      setPreviewImage(url);
      return () => {
        if (previewImage) {
          previewImage.forEach(({ url }) => URL.revokeObjectURL(url));
        }
      };
    };
    previewSelectedImage();
  }, [selectedImages]);

  const handleFormat = async () => {
    try {
      const formData = new FormData();
      selectedImages.forEach((file) => formData.append("files", file));
      formData.append("format", format);

      const response = await fetch("/api/convertMultiple", {
        method: "POST",
        body: formData,
      });
      console.log(response);
      if (!response.ok) {
        alert("Converting images failed");
      }

      const data = await response.json();
      const images = data.images;
      console.log(images)

      const imageUrls = images.map(
        (base64Image: string) => `data:image/${format};base64,${base64Image}`,
      );
      setConvertedImages(imageUrls);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        multiple
      />
      {previewImage?.map(({ url, type }) => {
        return (
          <div className="" key={url}>
            <Image
              src={url}
              alt="Converted"
              width={200}
              height={200}
              className="h-20 w-20"
            />
            <p>Type:{type}</p>
          </div>
        );
      })}
      <select value={format} onChange={(e) => setFormat(e.target.value)}>
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
        <option value="webp">WEBP</option>
        <option value="avif">AVIF</option>
        <option value="tiff">TIFF</option>
        <option value="gif">GIF</option>
      </select>
      <button onClick={handleFormat}>Convert</button>

      {convertedImages?.map((image, index) => {
        console.log(image);
        return (
          <div className="" key={index}>
            <Image
              src={image}
              alt="Converted"
              width={200}
              height={200}
              className="h-20 w-20"
            />
          </div>
        );
      })}
    </div>
  );
};

export default page;
