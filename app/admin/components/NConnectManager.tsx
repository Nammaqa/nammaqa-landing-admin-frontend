"use client";

import { useState, useEffect } from "react";
import DataTable from "./DataTable";
import Modal from "./Modal";
import ImageUpload from "./ImageUpload";
import RichTextEditor from "./RichTextEditor";

export default function NConnectManager({ title, type }: { title: string; type: string }) {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({ meeting_type: type });
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/nconnect?type=${type}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ meeting_type: type });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    await fetch(`/api/nconnect/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/nconnect/${editingId}` : "/api/nconnect";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setIsModalOpen(false);
    fetchItems();
  };

  const columns = [
    { key: "title", label: "Title" },
    { key: "start_date", label: "Start Date", render: (val: string) => new Date(val).toLocaleDateString() },
    { key: "address", label: "Address" },
    { key: "participants", label: "Participants" },
  ];

  return (
    <div>
      <DataTable
        title={title}
        columns={columns}
        data={data}
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? `Edit ${title}` : `Create ${title}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
            <ImageUpload 
              value={formData.imageurl || ""} 
              onChange={(url) => setFormData({ ...formData, imageurl: url })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <RichTextEditor value={formData.description || ""} onChange={(val) => setFormData({ ...formData, description: val })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
              <input type="date" required className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ""} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
              <input type="date" required className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ""} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
              <input type="time" required className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.start_time || ""} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
              <input type="time" required className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.end_time || ""} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
            <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Participants Limit</label>
              <input required type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.participants || ""} onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Registration Link</label>
              <input type="url" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.link || ""} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
            </div>
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
