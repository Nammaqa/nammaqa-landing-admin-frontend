"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ImageUpload from "../components/ImageUpload";

const formatDateWithFullYear = (dateString: string): string => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month}/${day}/${year}`;
};

const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function GalleryPage() {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const openDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    input.showPicker?.();
    input.focus();
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/gallery`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      image_urls: [],
      image_title: "",
      date: "",
      description: "",
      hashtags: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      ...item,
      image_urls: item.image_url ? [item.image_url] : [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageUrls: string[] = Array.isArray(formData.image_urls)
      ? formData.image_urls
      : formData.image_url
      ? [formData.image_url]
      : [];

    if (imageUrls.length === 0) {
      alert("Please upload at least one image before saving the gallery item.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingId) {
        // Edit mode: update existing record with the first image
        const updateRes = await fetch(`/api/gallery/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: imageUrls[0],
            image_title: formData.image_title || null,
            date: formData.date || null,
            description: formData.description || null,
            hashtags: formData.hashtags || null,
          }),
        });

        if (!updateRes.ok) {
          throw new Error("Failed to update item");
        }

        // If extra images were added during edit, create new records for them
        if (imageUrls.length > 1) {
          const extraUrls = imageUrls.slice(1);
          await fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_urls: extraUrls,
              image_title: formData.image_title || null,
              date: formData.date || null,
              description: formData.description || null,
              hashtags: formData.hashtags || null,
            }),
          });
        }
      } else {
        // Create mode: can be single or multiple images
        const createRes = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_urls: imageUrls,
            image_title: formData.image_title || null,
            date: formData.date || null,
            description: formData.description || null,
            hashtags: formData.hashtags || null,
          }),
        });

        if (!createRes.ok) {
          throw new Error("Failed to create item(s)");
        }
      }

      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error("Error saving gallery item:", err);
      alert("Error saving gallery item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { key: "image_url", label: "Image", render: (val: string) => <img src={val} alt="gallery" className="h-10 w-10 rounded object-cover" /> },
    { key: "image_title", label: "Title" },
    {
      key: "date",
      label: "Date",
      render: (val: string) => formatDateWithFullYear(val),
    },
    { key: "description", label: "Description" },
    { key: "hashtags", label: "Hashtags" },
  ];

  const imageCount = (formData.image_urls || []).length;

  return (
    <div>
      <DataTable
        title="Gallery"
        columns={columns}
        data={data}
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Gallery" : "Create Gallery"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Images <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 font-normal ml-2">
                (You can select or drop multiple images)
              </span>
            </label>
            <ImageUpload 
              multiple={true}
              value={formData.image_urls || []} 
              onChange={(urls) => setFormData({ ...formData, image_urls: urls })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Title (Optional)</label>
            <input type="text" className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900" value={formData.image_title || ""} onChange={(e) => setFormData({ ...formData, image_title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                className="w-full bg-white border border-gray-300 rounded p-2 pr-10 text-gray-900"
                value={formatDateForInput(formData.date)}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                onKeyDown={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
              />
              <Calendar
                className="absolute right-3 top-1/2 h-5 w-5 text-gray-500 -translate-y-1/2 cursor-pointer"
                onClick={() => openDatePicker(dateInputRef.current)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 min-h-[100px]"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Hashtags</label>
            <input
              type="text"
              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900"
              value={formData.hashtags || ""}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder="#festival #travel"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className={`px-6 py-2 rounded shadow ${isSaving ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Saving...
                </span>
              ) : imageCount > 1 ? (
                `Save (${imageCount} images)`
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}