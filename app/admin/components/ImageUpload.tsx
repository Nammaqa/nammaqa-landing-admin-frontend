import React, { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-700 bg-gray-900/50">
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
        </div>
      )}
      
      <label className="flex items-center justify-center w-full h-32 px-4 transition bg-gray-800 border-2 border-gray-600 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
        <span className="flex items-center space-x-2">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6 text-gray-400" />
          )}
          <span className="font-medium text-gray-400">
            {isUploading ? "Uploading..." : "Drop files to Attach, or browse"}
          </span>
        </span>
        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
      </label>
    </div>
  );
}
