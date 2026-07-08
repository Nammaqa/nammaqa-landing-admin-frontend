"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Paperclip,
} from "lucide-react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
};

const toolbarButtons = [
  { label: "Bold", icon: Bold, command: "bold" },
  { label: "Italic", icon: Italic, command: "italic" },
  { label: "Underline", icon: Underline, command: "underline" },
  { label: "Bulleted list", icon: List, command: "insertUnorderedList" },
  { label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write rich text...",
  minHeight = 140,
  maxLength,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
      setCharCount(editorRef.current.innerText.length || 0);
    }
  }, [value]);

  const emitChange = () => {
    const text = editorRef.current?.innerText || "";
    setCharCount(text.length);
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (maxLength && charCount >= maxLength) {
      // Allow backspace, delete, arrow keys, and combinations with Ctrl/Cmd
      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key.startsWith("Arrow") ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return;
      }
      e.preventDefault();
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const insertHtml = (html: string) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    emitChange();
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.secure_url) {
        throw new Error(data?.error || "Upload failed");
      }

      const url = data.secure_url;
      if (file.type.startsWith("image/")) {
        insertHtml(`<img src="${url}" alt="${file.name}" />`);
      } else {
        insertHtml(`<a href="${url}" target="_blank" rel="noopener noreferrer">${file.name}</a>`);
      }
    } catch (error) {
      console.error("File attach failed:", error);
      window.alert("File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void handleFileUpload(file);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        {toolbarButtons.map(({ label, icon: Icon, command }) => (
          <button
            key={command}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand(command)}
            className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title={label}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openFilePicker}
          disabled={isUploading}
          className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-400"
          title="Attach image or document"
          aria-label="Attach image or document"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          onInput={emitChange}
          onBlur={emitChange}
          onKeyDown={handleKeyDown}
          className="rich-text-editor min-h-[140px] w-full overflow-y-auto p-3 text-sm leading-6 text-gray-900 outline-none"
          style={{ minHeight }}
          data-placeholder={placeholder}
        />
      </div>
      {maxLength && (
        <div className={`text-xs mt-1 text-right px-1 ${charCount > maxLength ? "text-red-500" : "text-gray-500"}`}>
          {charCount} / {maxLength}
        </div>
      )}
    </div>
  );
}