"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Inbox } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

type ContactMessageItem = {
  id: number;
  full_name: string;
  email: string;
  contact_number: string | null;
  otp: string | null;
  otpverified: boolean;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export default function ContactMessagesPage() {
  const [data, setData] = useState<ContactMessageItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    message: "",
  });
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewItem, setPreviewItem] = useState<ContactMessageItem | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/contact-messages");
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
    setFormData({
      full_name: "",
      email: "",
      contact_number: "",
      message: "",
    });
    setFormError("");
    setStatusMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ContactMessageItem) => {
    setEditingId(String(item.id));
    setFormData({
      full_name: item.full_name,
      email: item.email,
      contact_number: item.contact_number || "",
      message: item.message,
    });
    setFormError("");
    setStatusMessage("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this contact message?")) return;
    await fetch(`/api/contact-messages/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError("");
    setStatusMessage("");

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/contact-messages/${editingId}` : "/api/contact-messages";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json?.error || "Something went wrong.");
        return;
      }

      setStatusMessage(editingId ? "Message updated successfully." : "Message saved successfully.");
      setIsModalOpen(false);
      fetchItems();
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "contact_number", label: "Contact Number" },
    {
      key: "otpverified",
      label: "OTP Verified",
      render: (val: boolean) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${val ? "bg-green-500/10 text-green-300" : "bg-yellow-500/10 text-yellow-300"}`}>
          {val ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "message",
      label: "Message",
      render: (val: string) => (
        <span className="block max-w-xs truncate" title={val}>
          {val}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Received",
      render: (val: string) =>
        val
          ? new Intl.DateTimeFormat("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(val))
          : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Messages</p>
              <p className="text-2xl font-bold text-white">{isLoading ? "..." : data.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Latest Sender</p>
              <p className="text-sm font-semibold text-white break-all">
                {isLoading ? "Loading..." : data[0]?.email || "No messages yet"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {statusMessage}
        </div>
      ) : null}

      <DataTable
        title="Contact Messages"
        columns={columns}
        data={data}
        onCreate={handleOpenCreate}
        onPreview={(item: ContactMessageItem) => setPreviewItem(item)}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Message" : "Add Message"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full name</label>
            <input
              required
              type="text"
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              required
              type="email"
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Contact Number</label>
            <input
              required
              type="tel"
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
            <textarea
              required
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white min-h-[140px]"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          {formError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {formError}
            </div>
          ) : null}

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

      <Modal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={previewItem ? `Message from ${previewItem.full_name || previewItem.email}` : "Preview"}
      >
        {previewItem ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-400">Received</div>
            <div className="text-sm text-white">{previewItem.createdAt ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(previewItem.createdAt)) : ""}</div>
            <div className="pt-2">
              <div className="text-sm text-gray-400">Email</div>
              <div className="text-sm text-white break-words">{previewItem.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Contact Number</div>
              <div className="text-sm text-white break-words">{previewItem.contact_number || "-"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">OTP Verified</div>
              <div className={previewItem.otpverified ? "text-sm text-green-300" : "text-sm text-yellow-300"}>{previewItem.otpverified ? "Verified" : "Pending"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Message</div>
              <pre className="whitespace-pre-wrap text-sm text-white bg-gray-900 p-3 rounded mt-1">{previewItem.message}</pre>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

