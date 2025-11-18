// src/components/chatbot/SimpleChatbot.jsx
import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import { getCurrentUserIdFromToken } from "../../utils/authUtils";
import useChatAPI from "./hooks/useChatAPI";
import useVoiceRecorder from "./hooks/useVoiceRecorder";
import useDraggable from "./hooks/useDraggable";

export default function SimpleChatbot() {
  const userId = getCurrentUserIdFromToken();
  const [open, setOpen] = useState(false);

  const {
    messages,
    setMessages,
    loading,
    sendMessage,
    inputRef,                // ⭐ NEW
    triggerFilePicker,
    fileInputRef,
    handleFileInputChange,
  } = useChatAPI();

  const {
    listening,
    startListening,
    stopListening,
    handleVoiceText,        // ⭐ NEW (update useVoiceRecorder)
  } = useVoiceRecorder(inputRef);

  const { pos, onHeaderMouseDown } = useDraggable();

  // if (!userId) return null;
  if (
  !userId ||
  userId === "null" ||
  userId === "undefined" ||
  userId === "" ||
  userId === " " ||
  userId === null ||
  userId === undefined
  ) {
    return null;
  }


  return (
    <>
      {/* Floating Chat Launcher */}
      <div
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 w-14 h-14 bg-indigo-600 text-white
        rounded-full flex items-center justify-center text-2xl cursor-pointer shadow-xl z-[50]"
      >
        💬
      </div>

      {/* Chat Window */}
      {open && (
        <ChatWindow
          pos={pos}
          setOpen={setOpen}
          messages={messages}
          setMessages={setMessages}
          loading={loading}
          onHeaderMouseDown={onHeaderMouseDown}
          inputRef={inputRef}            // ⭐ FIXED
          sendMessage={sendMessage}
          listening={listening}
          startListening={startListening}
          stopListening={stopListening}
          triggerFilePicker={triggerFilePicker}
          fileInputRef={fileInputRef}
          handleFileInputChange={handleFileInputChange}
        />
      )}
    </>
  );
}
