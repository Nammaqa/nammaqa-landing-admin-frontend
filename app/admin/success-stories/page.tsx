"use client";

import { useCallback, useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ImageUpload from "../components/ImageUpload";

type SuccessStoryItem = {
  id: string | number;
  student_name?: string;
  student_image?: string;
  student_type?: string;
  college_name?: string;
  feedback?: string;
  student_package?: string;
};

const emptyForm: Partial<SuccessStoryItem> = {
  student_type: "Student",
};

export default function SuccessStoriesPage() {
  const [data, setData] = useState<SuccessStoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SuccessStoryItem>>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/success-stories`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchItems();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchItems]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SuccessStoryItem) => {
    setEditingId(String(item.id));
    setFormData({
      ...item,
      student_type: item.student_type || "Student",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    await fetch(`/api/success-stories/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/success-stories/${editingId}` : "/api/success-stories";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setIsModalOpen(false);
      fetchItems();
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { key: "student_name", label: "Student Name" },
    { key: "student_type", label: "Designation" },
    { key: "college_name", label: "College Name" },
    { key: "student_package", label: "Package" },
  ];

  return (
    <div>
      <DataTable
        title="Success Stories"
        columns={columns}
        data={data}
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Success Story" : "Create Success Story"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Student Image</label>
            <ImageUpload
              value={formData.student_image || ""}
              onChange={(url) => setFormData({ ...formData, student_image: url })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Student Name</label>
            <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.student_name || ""} onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Designation</label>
              <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.student_type || ""} onChange={(e) => setFormData({ ...formData, student_type: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Package</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.student_package || ""} onChange={(e) => setFormData({ ...formData, student_package: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">College Name</label>
            <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.college_name || ""} onChange={(e) => setFormData({ ...formData, college_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Feedback</label>
            <textarea required className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white min-h-[100px]" value={formData.feedback || ""} onChange={(e) => setFormData({ ...formData, feedback: e.target.value })} />
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
