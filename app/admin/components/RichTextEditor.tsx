"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Unlink,
  Eraser,
} from "lucide-react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
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
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const addLink = () => {
    const url = window.prompt("Enter link URL");
    if (!url) return;
    runCommand("createLink", url);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-700 bg-gray-800/80 p-2">
        {toolbarButtons.map(({ label, icon: Icon, command }) => (
          <button
            key={command}
            type="button"
            onClick={() => runCommand(command)}
            className="rounded-md p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            title={label}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <span className="mx-1 h-6 w-px bg-gray-700" />
        <button
          type="button"
          onClick={addLink}
          className="rounded-md p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          title="Add link"
          aria-label="Add link"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => runCommand("unlink")}
          className="rounded-md p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          title="Remove link"
          aria-label="Remove link"
        >
          <Unlink className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => runCommand("removeFormat")}
          className="rounded-md p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          title="Clear formatting"
          aria-label="Clear formatting"
        >
          <Eraser className="h-4 w-4" />
        </button>
      </div>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          onInput={emitChange}
          onBlur={emitChange}
          className="rich-text-editor min-h-[140px] w-full overflow-y-auto p-3 text-sm leading-6 text-white outline-none"
          style={{ minHeight }}
          data-placeholder={placeholder}
        />
      </div>
    </div>
  );
}
