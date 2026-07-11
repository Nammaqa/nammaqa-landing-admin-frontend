"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox, MessageSquare, RefreshCw, ShieldCheck } from "lucide-react";
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

type OtpTarget = {
  id: number;
  contact_number: string | null;
};

const resendCooldownSeconds = 30;

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
  const [otpTarget, setOtpTarget] = useState<OtpTarget | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpStatus, setOtpStatus] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const resetOtpState = () => {
    setOtpTarget(null);
    setOtpCode("");
    setOtpError("");
    setOtpStatus("");
    setIsSendingOtp(false);
    setIsVerifyingOtp(false);
    setResendCooldown(0);
  };

  const handleCloseFormModal = () => {
    setIsModalOpen(false);
    resetOtpState();
  };

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
    resetOtpState();
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
    resetOtpState();
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this contact message?")) return;
    await fetch(`/api/contact-messages/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const requestOtp = async (target: OtpTarget, endpoint: string, successMessage: string) => {
    setIsSendingOtp(true);
    setOtpError("");
    setOtpStatus("");

    try {
      const isResend = endpoint.endsWith("/resend-otp");
      const res = await fetch(
        isResend
          ? `${endpoint}?id=${encodeURIComponent(String(target.id))}&contact_number=${encodeURIComponent(target.contact_number || "")}`
          : endpoint,
        isResend
          ? {
              method: "GET",
            }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: target.id,
                contact_number: target.contact_number,
              }),
            }
      );
      const json = await res.json();

      if (!res.ok) {
        const remainingCooldown = Number(json?.remainingCooldownSeconds);
        if (remainingCooldown > 0) {
          setResendCooldown(remainingCooldown);
        } else if (json?.providerStatus) {
          setResendCooldown(resendCooldownSeconds);
        }

        setOtpError(json?.error || "Failed to send OTP.");
        return false;
      }

      setOtpStatus(successMessage);
      setResendCooldown(resendCooldownSeconds);
      return true;
    } catch {
      setOtpError("Failed to send OTP.");
      return false;
    } finally {
      setIsSendingOtp(false);
    }
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

      if (editingId) {
        setStatusMessage("Message updated successfully.");
        handleCloseFormModal();
        fetchItems();
        return;
      }

      const createdItem = json?.item as ContactMessageItem | undefined;

      if (!createdItem?.id) {
        setFormError("Message saved, but OTP could not be started.");
        return;
      }

      const target = {
        id: createdItem.id,
        contact_number: createdItem.contact_number,
      };

      setOtpTarget(target);
      setOtpCode("");
      await requestOtp(target, "/api/contact-messages/send-otp", "OTP sent successfully.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpTarget) return;

    setIsVerifyingOtp(true);
    setOtpError("");
    setOtpStatus("");

    try {
      const res = await fetch("/api/contact-messages/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: otpTarget.id,
          contact_number: otpTarget.contact_number,
          otp: otpCode,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setOtpError(json?.error || "Failed to verify OTP.");
        return;
      }

      setStatusMessage("OTP verified and message saved successfully.");
      handleCloseFormModal();
      fetchItems();
    } catch {
      setOtpError("Failed to verify OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const columns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "contact_number", label: "Contact Number" },
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
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? "..." : data.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Latest Sender</p>
              <p className="text-sm font-semibold text-gray-900 break-all">
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
        onClose={handleCloseFormModal}
        title={otpTarget ? "Verify OTP" : editingId ? "Edit Message" : "Add Message"}
      >
        {otpTarget ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Enter the OTP sent to {otpTarget.contact_number || "the contact number"}.</p>
                  <p className="mt-1 text-sm text-gray-600">You can resend the OTP after the timer ends.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">OTP</label>
              <input
                required
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6 digit OTP"
              />
            </div>

            {otpStatus ? (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700">
                {otpStatus}
              </div>
            ) : null}

            {otpError ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                {otpError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
              <button
                type="button"
                disabled={isSendingOtp || resendCooldown > 0}
                onClick={() => requestOtp(otpTarget, "/api/contact-messages/resend-otp", "OTP resent successfully.")}
                className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium shadow ${
                  isSendingOtp || resendCooldown > 0
                    ? "cursor-not-allowed bg-gray-200 text-gray-500"
                    : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isSendingOtp ? "animate-spin" : ""}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : isSendingOtp ? "Sending..." : "Resend OTP"}
              </button>

              <button
                type="submit"
                disabled={isVerifyingOtp || otpCode.length !== 6}
                className={`rounded px-6 py-2 shadow ${
                  isVerifyingOtp || otpCode.length !== 6
                    ? "cursor-not-allowed bg-gray-600 text-gray-400"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full name</label>
            <input
              required
              type="text"
              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              required
              type="email"
              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
            <input
              required
              type="tel"
              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Message</label>
            <textarea
              required
              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 min-h-[140px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
        )}
      </Modal>

      <Modal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={previewItem ? `Message from ${previewItem.full_name || previewItem.email}` : "Preview"}
      >
        {previewItem ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-500">Received</div>
            <div className="text-sm text-gray-900">{previewItem.createdAt ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(previewItem.createdAt)) : ""}</div>
            <div className="pt-2">
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-sm text-gray-900 break-words">{previewItem.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Contact Number</div>
              <div className="text-sm text-gray-900 break-words">{previewItem.contact_number || "-"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Message</div>
              <pre className="whitespace-pre-wrap text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1">{previewItem.message}</pre>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
