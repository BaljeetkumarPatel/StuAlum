// src/components/chatbot/ChatHeader.jsx
import React from "react";

export default function ChatHeader({ onDrag, onExpand, onClose }) {
  return (
    <div
      className="bg-indigo-600 text-white h-11 px-3 flex items-center justify-between rounded-t-lg cursor-grab"
      onMouseDown={onDrag}
    >
      <div className="font-semibold">Campus AI</div>
      <div className="flex items-center gap-2">
        <button onClick={onExpand} className="p-1 hover:bg-indigo-500 rounded">
          ⤢
        </button>
        <button onClick={onClose} className="p-1 hover:bg-indigo-500 rounded">
          ✕
        </button>
      </div>
    </div>
  );
}
