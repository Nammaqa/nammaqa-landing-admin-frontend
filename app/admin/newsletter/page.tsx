"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

type NewsletterItem = {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export default function NewsletterPage() {
  const [data, setData] = useState<NewsletterItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/newsletter");
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
    setEmail("");
    setFormError("");
    setStatusMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NewsletterItem) => {
    setEditingId(String(item.id));
    setEmail(item.email);
    setFormError("");
    setStatusMessage("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this email subscription?")) return;
    await fetch(`/api/newsletter/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError("");
    setStatusMessage("");

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/newsletter/${editingId}` : "/api/newsletter";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json?.error || "Something went wrong.");
        return;
      }

      if (json?.duplicate) {
        setStatusMessage("This email is already subscribed.");
      } else {
        setStatusMessage(editingId ? "Subscription updated successfully." : "Subscription saved successfully.");
      }

      setIsModalOpen(false);
      fetchItems();
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { key: "email", label: "Email Address" },
    {
      key: "createdAt",
      label: "Subscribed On",
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
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Subscribers</p>
              <p className="text-2xl font-bold text-white">{isLoading ? "..." : data.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Latest Signup</p>
              <p className="text-sm font-semibold text-white break-all">
                {isLoading ? "Loading..." : data[0]?.email || "No subscriptions yet"}
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
        title="Newsletter Subscriptions"
        columns={columns}
        data={data}
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Subscriber" : "Add Subscriber"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <input
              required
              type="email"
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
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
    </div>
  );
}