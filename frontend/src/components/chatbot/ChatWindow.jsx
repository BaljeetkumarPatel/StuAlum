
// src/components/chatbot/ChatWindow.jsx
import React, { useState } from "react";
import ChatHeader from "./ChatHeader";
import QuickActions from "./QuickActions";
import MessagesArea from "./MessagesArea";
import ChatInput from "./ChatInput";

export default function ChatWindow({
  pos,
  setOpen,
  messages,
  setMessages,
  loading,
  onHeaderMouseDown,
  inputRef,                  // ⭐ FIX
  sendMessage,
  listening,
  startListening,
  stopListening,
  triggerFilePicker,
  fileInputRef,
  handleFileInputChange,
}) {
  const [expanded, setExpanded] = useState(false);
  const [firstOpen, setFirstOpen] = useState(true);

  return (
    <div
      className="fixed z-[999]"
      style={{
        right: pos.right,
        bottom: pos.bottom,
        width: expanded ? 420 : 320,
        height: expanded ? 560 : 420,
      }}
    >
      <div className="flex flex-col h-full bg-white rounded-lg shadow-2xl">

        {/* HEADER */}
        <ChatHeader
          onDrag={onHeaderMouseDown}
          onExpand={() => setExpanded(!expanded)}
          onClose={() => setOpen(false)}
          triggerFilePicker={triggerFilePicker}
        />

        {/* QUICK ACTIONS */}
        <QuickActions
          sendMessage={sendMessage}
          triggerFilePicker={triggerFilePicker}
        />

        {/* MESSAGES + WELCOME CARD */}
        <MessagesArea
          messages={messages}
          loading={loading}
          firstOpen={firstOpen}
          setFirstOpen={setFirstOpen}
        />

        {/* INPUT */}
        <ChatInput
          inputRef={inputRef}                    // ⭐ FIX
          sendMessage={sendMessage}
          listening={listening}
          startListening={startListening}
          stopListening={stopListening}
          triggerFilePicker={triggerFilePicker}
          fileInputRef={fileInputRef}
          handleFileInputChange={handleFileInputChange}
        />
      </div>
    </div>
  );
}
