"use client";

import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ImageUpload from "../components/ImageUpload";

export default function SuccessStoriesPage() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const fetchItems = async () => {
    const res = await fetch(`/api/success-stories`);
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    await fetch(`/api/success-stories/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/success-stories/${editingId}` : "/api/success-stories";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setIsModalOpen(false);
    fetchItems();
  };

  const columns = [
    { key: "student_name", label: "Student Name" },
    { key: "student_type", label: "Type" },
    { key: "placed_company", label: "Company" },
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
              <label className="block text-sm font-medium text-gray-400 mb-1">Student Type</label>
              <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.student_type || ""} onChange={(e) => setFormData({ ...formData, student_type: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Package</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.student_package || ""} onChange={(e) => setFormData({ ...formData, student_package: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Placed Company</label>
            <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.placed_company || ""} onChange={(e) => setFormData({ ...formData, placed_company: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Feedback</label>
            <textarea required className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white min-h-[100px]" value={formData.feedback || ""} onChange={(e) => setFormData({ ...formData, feedback: e.target.value })} />
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
