// src/components/chatbot/ChatWindow.jsx
import React from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import useDraggable from "./hooks/useDraggable";
import useResizable from "./hooks/useResizable";

export default function ChatWindow({
  setOpen,
  messages,
  setMessages,
  firstOpen,
  setFirstOpen,
}) {
  const { position, onMouseDown } = useDraggable();
  const { size, onResizeMouseDown } = useResizable();

  const handleDragStart = (e) => {
    const IGNORE_TAGS = ["INPUT", "TEXTAREA", "BUTTON"];
    if (IGNORE_TAGS.includes(e.target.tagName)) return;
    onMouseDown(e);
  };

  return (
    <div
      className="fixed bg-white shadow-xl rounded-xl border border-gray-300 flex flex-col z-[999]"
      style={{
        width: size.width,
        height: size.height,
        right: position.right,
        bottom: position.bottom,
      }}
      onMouseDown={handleDragStart}
    >
      {/* HEADER */}
      <div className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-t-xl flex justify-between">
        AI Assistant
        <button
          onClick={() => setOpen(false)}
          className="text-white hover:text-gray-200 text-xl"
        >
          ✖
        </button>
      </div>

      {/* CHAT BODY (FIXED) */}
      <div className="flex-1 overflow-y-auto">
        <ChatMessages
          messages={messages}
          firstOpen={firstOpen}
          setFirstOpen={setFirstOpen}
        />
      </div>

      {/* INPUT */}
      <ChatInput setMessages={setMessages} />

      {/* RESIZE HANDLE */}
     <div
        onMouseDown={onResizeMouseDown}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center 
        cursor-nw-resize bg-gray-200 border border-gray-400 rounded-full shadow"
        >
        ↗
        </div>

    </div>
  );
}
