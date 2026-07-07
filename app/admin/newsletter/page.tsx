"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Megaphone, Send, Pencil } from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import RichTextEditor from "../components/RichTextEditor";

type NewsletterItem = {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type Campaign = {
  id?: number;
  subject: string;
  content: string;
  createdAt?: string;
};

type SendResult = {
  title: string;
  message: string;
  failedEmails?: string[];
};

export default function NewsletterPage() {
  const [data, setData] = useState<NewsletterItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isViewCampaignOpen, setIsViewCampaignOpen] = useState(false);
  const [isSendResultOpen, setIsSendResultOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sendingCampaignId, setSendingCampaignId] = useState<number | null>(null);
  const [pageError, setPageError] = useState("");
  const [selectedSubscriberIds, setSelectedSubscriberIds] = useState<number[]>([]);
  const [campaignData, setCampaignData] = useState<Campaign>({ subject: "", content: "" });
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  const selectedSubscribers = data.filter((item) => selectedSubscriberIds.includes(item.id));
  const selectedEmails = selectedSubscribers.map((item) => item.email);
  const hasSelectedAll = data.length > 0 && selectedSubscriberIds.length === data.length;

  const fetchItems = async () => {
    setIsLoading(true);
    setPageError("");
    try {
      const res = await fetch("/api/newsletter");
      const json = await res.json();

      if (!res.ok) {
        setPageError(json?.error || `Failed to load newsletter subscriptions (${res.status}).`);
        setData([]);
        return;
      }

      setData(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error("Failed to fetch newsletter subscriptions:", error);
      setPageError("Network error while loading newsletter subscriptions.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      const json = await res.json();

      if (!res.ok) {
        setPageError(json?.error || `Failed to load campaigns (${res.status}).`);
        setCampaigns([]);
        return;
      }

      setCampaigns(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      setPageError("Network error while loading campaigns.");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCampaigns();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setEmail("");
    setFormError("");
    setStatusMessage("");
    setIsModalOpen(true);
  };

  const handleOpenCampaign = () => {
    setEditingCampaignId(null);
    setCampaignData({ subject: "", content: "" });
    setFormError("");
    setStatusMessage("");
    setIsCampaignModalOpen(true);
  };

  const handleOpenEditCampaign = (campaign: Campaign) => {
    if (!campaign.id) return;
    setEditingCampaignId(campaign.id);
    setCampaignData({
      id: campaign.id,
      subject: campaign.subject,
      content: campaign.content,
      createdAt: campaign.createdAt,
    });
    setFormError("");
    setStatusMessage("");
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!campaignData.subject.trim() || !campaignData.content.trim()) {
      setFormError("Subject and content are required.");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch(editingCampaignId ? `/api/campaigns/${editingCampaignId}` : "/api/campaigns", {
        method: editingCampaignId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: campaignData.subject,
          content: campaignData.content,
        }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setFormError(json?.error || `Failed to ${editingCampaignId ? "update" : "create"} campaign.`);
        return;
      }

      setIsCampaignModalOpen(false);
      setEditingCampaignId(null);
      setCampaignData({ subject: "", content: "" });
      setStatusMessage(editingCampaignId ? "Campaign updated successfully." : "Campaign created successfully.");
      await fetchCampaigns();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      await fetchCampaigns();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
    }
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setViewingCampaign(campaign);
    setIsViewCampaignOpen(true);
  };

  const handleToggleSubscriber = (id: number) => {
    setSelectedSubscriberIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleToggleAllSubscribers = () => {
    setSelectedSubscriberIds(hasSelectedAll ? [] : data.map((item) => item.id));
  };

  const handleSendCampaign = async (campaign: Campaign) => {
    if (!campaign.id || sendingCampaignId) return;

    if (selectedEmails.length === 0) {
      setPageError("Select at least one email address before sending a campaign.");
      return;
    }

    const confirmed = confirm(`Send "${campaign.subject}" to ${selectedEmails.length} selected email address${selectedEmails.length === 1 ? "" : "es"}?`);
    if (!confirmed) return;

    setPageError("");
    setStatusMessage("");
    setSendingCampaignId(campaign.id);

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: selectedEmails }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const message = json?.error || `Failed to send campaign (${res.status}).`;
        setPageError(message);
        setSendResult({
          title: "Campaign Not Sent",
          message,
        });
        setIsSendResultOpen(true);
        return;
      }

      if (json?.failed > 0) {
        const message = `Sent to ${json.sent} of ${json.total} selected email addresses. ${json.failed} failed.`;
        setPageError(message);
        setSendResult({
          title: "Campaign Partially Sent",
          message,
          failedEmails: Array.isArray(json.failedEmails) ? json.failedEmails : [],
        });
      } else {
        const message = `Campaign sent to ${json.sent} selected email address${json.sent === 1 ? "" : "es"}.`;
        setStatusMessage(message);
        setSendResult({
          title: "Campaign Sent",
          message,
        });
      }
      setIsSendResultOpen(true);
    } catch (error) {
      console.error("Failed to send campaign:", error);
      const message = "Network error while sending campaign. Please try again.";
      setPageError(message);
      setSendResult({
        title: "Campaign Not Sent",
        message,
      });
      setIsSendResultOpen(true);
    } finally {
      setSendingCampaignId(null);
    }
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
    {
      key: "select",
      label: "Select",
      render: (_val: unknown, item: NewsletterItem) => (
        <input
          type="checkbox"
          checked={selectedSubscriberIds.includes(item.id)}
          onChange={() => handleToggleSubscriber(item.id)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-label={`Select ${item.email}`}
        />
      ),
    },
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
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? "..." : data.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-50">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Latest Signup</p>
              <p className="text-sm font-semibold text-gray-900 break-all">
                {isLoading ? "Loading..." : data[0]?.email || "No subscriptions yet"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-50">
              <Megaphone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
            </div>
          </div>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600">
          {statusMessage}
        </div>
      ) : null}

      {pageError ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{pageError}</span>
        </div>
      ) : null}
      <div className="flex gap-3">
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow text-sm font-medium"
        >
          Add Subscriber
        </button>
        <button
          onClick={handleToggleAllSubscribers}
          disabled={data.length === 0}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg shadow text-sm font-medium disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {hasSelectedAll ? "Clear Selection" : "Select All"}
        </button>
        <button
          onClick={handleOpenCampaign}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow text-sm font-medium flex items-center gap-2"
        >
          <Megaphone className="w-4 h-4" />
          Create Campaign
        </button>
      </div>
      <p className="text-sm text-gray-600">
        {selectedEmails.length} of {data.length} email addresses selected for campaign sending.
      </p>

      <DataTable
        title="Newsletter Subscriptions"
        columns={columns}
        data={data}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {campaigns.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Campaigns</h3>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div>
                  <p className="font-medium text-gray-900">{campaign.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : "Just now"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendCampaign(campaign)}
                    disabled={!campaign.id || sendingCampaignId !== null}
                    className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                      sendingCampaignId === campaign.id
                        ? "bg-purple-100 text-purple-500 cursor-wait"
                        : "bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingCampaignId === campaign.id ? "Sending..." : "Send"}
                  </button>
                  <button
                    onClick={() => handleViewCampaign(campaign)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleOpenEditCampaign(campaign)}
                    disabled={!campaign.id || sendingCampaignId !== null}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm flex items-center gap-1 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => campaign.id && handleDeleteCampaign(campaign.id)}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Subscriber" : "Add Subscriber"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              required
              type="email"
              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          {formError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
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
        isOpen={isCampaignModalOpen}
        onClose={() => {
          setIsCampaignModalOpen(false);
          setEditingCampaignId(null);
        }}
        title={editingCampaignId ? "Edit Campaign" : "Create Campaign"}
      >
        <form onSubmit={handleSaveCampaign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Campaign Subject
            </label>
            <input
              required
              type="text"
              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900"
              value={campaignData.subject}
              onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
              placeholder="e.g., Weekly Newsletter - July 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Campaign Content
            </label>
            <RichTextEditor
              value={campaignData.content}
              onChange={(val) => setCampaignData({ ...campaignData, content: val })}
            />
          </div>

          {formError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {formError}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsCampaignModalOpen(false);
                setEditingCampaignId(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2 rounded shadow ${isSaving ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white"}`}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  {editingCampaignId ? "Updating..." : "Creating..."}
                </span>
              ) : (
                editingCampaignId ? "Update Campaign" : "Create Campaign"
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewCampaignOpen}
        onClose={() => setIsViewCampaignOpen(false)}
        title={viewingCampaign?.subject || "Campaign"}
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">Created on</p>
            <p className="text-sm text-gray-600">
              {viewingCampaign?.createdAt ? new Date(viewingCampaign.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 mb-3">Content</p>
            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded border border-gray-200">
              <div dangerouslySetInnerHTML={{ __html: viewingCampaign?.content || "" }} />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setIsViewCampaignOpen(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isSendResultOpen}
        onClose={() => setIsSendResultOpen(false)}
        title={sendResult?.title || "Campaign Status"}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">{sendResult?.message}</p>

          {sendResult?.failedEmails?.length ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="mb-2 text-sm font-medium text-red-700">Failed email addresses</p>
              <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-red-700">
                {sendResult.failedEmails.map((failedEmail) => (
                  <li key={failedEmail}>{failedEmail}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsSendResultOpen(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


