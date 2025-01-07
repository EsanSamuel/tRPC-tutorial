"use client";
import Image from "next/image";
import React, { useState } from "react";

const ImagePreviewer = ({ imageFile }: { imageFile: File }) => {
  const [imageUrl, setImageUrl] = useState("");

  React.useEffect(() => {
    const blobImage = () => {
      if (!imageFile) return;
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => url && URL.revokeObjectURL(url);
    };
    blobImage();
  }, [imageFile]);
  if (imageFile) {
    return (
      <>
        <Image src={imageUrl} alt="" width={100} height={100} />
        <p>{`${(imageFile.size / 1024 / 1024).toFixed(2)} MB`}</p>
      </>
    );
  }
};

export default ImagePreviewer;
