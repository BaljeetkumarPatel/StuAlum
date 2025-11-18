// src/components/chatbot/ChatbotLauncher.jsx
import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import { getCurrentUserIdFromToken } from "../../utils/authUtils";

export default function ChatbotLauncher() {
  const [open, setOpen] = useState(false);

  // Chat states
  const [messages, setMessages] = useState([]);
  const [firstOpen, setFirstOpen] = useState(true);

  // State to control resume upload visibility
  const [showUpload, setShowUpload] = useState(false);

  const userId = getCurrentUserIdFromToken();

  // Hide chatbot if not logged in
  if (!userId) return null;

  return (
    <>
      {/* Floating Chat Button — NOW TOP-RIGHT */}
      {!open && (
        <div
            onClick={() => setOpen(true)}
            className="fixed right-6 bottom-6 w-14 h-14 bg-indigo-600 text-white
            rounded-full flex items-center justify-center text-2xl cursor-pointer shadow-xl z-[50]"
            >
            💬
        </div>
      )}

      {/* Chat Window */}
      {open && (
        <ChatWindow
          setOpen={setOpen}
          messages={messages}
          setMessages={setMessages}
          firstOpen={firstOpen}
          setFirstOpen={setFirstOpen}
          showUpload={showUpload}
          setShowUpload={setShowUpload}
        />
      )}
    </>
  );
}
