"use client";

import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ImageUpload from "../components/ImageUpload";
import RichTextEditor from "../components/RichTextEditor";

export default function BlogsPage() {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/blogs`);
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
    setFormData({ is_highlight: false });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    await fetch(`/api/blogs/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/blogs/${editingId}` : "/api/blogs";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setIsModalOpen(false);
    fetchItems();
  };

  const columns = [
    { key: "blog_title", label: "Title" },
    { key: "blog_type", label: "Type" },
    { key: "is_highlight", label: "Highlighted", render: (val: boolean) => (val ? "Yes" : "No") },
  ];

  return (
    <div>
      <DataTable
        title="Blogs"
        columns={columns}
        data={data}
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Blog" : "Create Blog"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Blog Image URL</label>
            <ImageUpload 
              value={formData.blog_image || ""} 
              onChange={(url) => setFormData({ ...formData, blog_image: url })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.blog_title || ""} onChange={(e) => setFormData({ ...formData, blog_title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type (e.g. Technical, News)</label>
            <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.blog_type || ""} onChange={(e) => setFormData({ ...formData, blog_type: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <RichTextEditor value={formData.blog_description || ""} onChange={(val) => setFormData({ ...formData, blog_description: val })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">External Link (Optional)</label>
            <input type="url" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={formData.blog_link || ""} onChange={(e) => setFormData({ ...formData, blog_link: e.target.value })} />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="is_highlight" checked={formData.is_highlight || false} onChange={(e) => setFormData({ ...formData, is_highlight: e.target.checked })} className="w-4 h-4 bg-gray-900 border border-gray-700 rounded" />
            <label htmlFor="is_highlight" className="text-sm font-medium text-gray-400">Mark as Highlighted</label>
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
