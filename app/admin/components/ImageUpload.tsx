import React, { useState, useRef } from "react";
import { UploadCloud, Loader2, Trash2, Plus, X } from "lucide-react";

type SingleImageUploadProps = {
  multiple?: false;
  value: string;
  onChange: (url: string) => void;
};

type MultipleImageUploadProps = {
  multiple: true;
  value: string[];
  onChange: (urls: string[]) => void;
};

export type ImageUploadProps = SingleImageUploadProps | MultipleImageUploadProps;

export default function ImageUpload(props: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      }
      return null;
    } catch (err) {
      console.error("Error uploading file:", err);
      return null;
    }
  };

  const processFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const validFiles = files.filter((f) => allowedTypes.includes(f.type));
    if (validFiles.length < files.length) {
      alert("Some files were skipped. Only PNG, JPG, and JPEG images are allowed.");
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    if (props.multiple) {
      setUploadProgress({ current: 0, total: validFiles.length });
      const uploadedUrls: string[] = [];
      let completed = 0;

      for (const file of validFiles) {
        const url = await uploadFile(file);
        completed += 1;
        setUploadProgress({ current: completed, total: validFiles.length });
        if (url) {
          uploadedUrls.push(url);
        }
      }

      if (uploadedUrls.length === 0) {
        alert("Upload failed. Please try again.");
      } else {
        const currentUrls = Array.isArray(props.value) ? props.value : [];
        props.onChange([...currentUrls, ...uploadedUrls]);
      }
    } else {
      const file = validFiles[0];
      const url = await uploadFile(file);
      if (url) {
        props.onChange(url);
      } else {
        alert("Upload failed");
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    await processFiles(files);
  };

  const removeSingleImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!props.multiple) {
      props.onChange("");
    }
  };

  const removeImageAt = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.multiple) {
      const currentUrls = Array.isArray(props.value) ? props.value : [];
      props.onChange(currentUrls.filter((_, idx) => idx !== indexToRemove));
    }
  };

  // MULTIPLE IMAGES MODE
  if (props.multiple) {
    const urls = Array.isArray(props.value) ? props.value : [];

    return (
      <div className="space-y-3">
        {urls.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {urls.length} Image{urls.length === 1 ? "" : "s"} Selected
              </span>
              <button
                type="button"
                onClick={() => props.onChange([])}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {urls.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-sm"
                >
                  <img
                    src={url}
                    alt={`Uploaded image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => removeImageAt(idx, e)}
                      className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono pointer-events-none">
                    #{idx + 1}
                  </span>
                </div>
              ))}

              {/* Add more button tile in grid */}
              <label
                className={`flex flex-col items-center justify-center aspect-square transition bg-white border-2 border-dashed rounded-lg cursor-pointer text-center p-2 ${
                  isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-300 hover:border-blue-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <span className="text-[11px] font-medium text-gray-600">
                      {uploadProgress.total > 0
                        ? `${uploadProgress.current}/${uploadProgress.total}`
                        : "Uploading..."}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-600">
                    <Plus className="w-6 h-6" />
                    <span className="text-xs font-medium">Add more</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        ) : (
          /* Empty state dropzone */
          <label
            className={`flex flex-col items-center justify-center w-full h-36 px-4 transition bg-white border-2 border-dashed rounded-lg cursor-pointer ${
              isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-300 hover:border-blue-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-2 pointer-events-none">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <span className="font-medium text-gray-600 text-sm">
                    Uploading {uploadProgress.current} of {uploadProgress.total} images...
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-gray-400" />
                  <div className="text-center">
                    <span className="font-medium text-gray-700 block text-sm">
                      Click to browse or drag & drop images
                    </span>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      PNG, JPG, or JPEG (Select multiple images)
                    </span>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
    );
  }

  // SINGLE IMAGE MODE (Default)
  const singleUrl = typeof props.value === "string" ? props.value : "";
  return (
    <div className="space-y-4">
      {singleUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
          <img src={singleUrl} alt="Uploaded" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={removeSingleImage}
            className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition shadow"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <label
        className={`flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-lg cursor-pointer ${
          isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-300 hover:border-blue-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className="flex items-center space-x-2 pointer-events-none">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6 text-gray-400" />
          )}
          <span className="font-medium text-gray-500">
            {isUploading ? "Uploading..." : singleUrl ? "Change Image" : "Upload Image"}
          </span>
        </span>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
