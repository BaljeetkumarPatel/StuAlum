// src/components/chatbot/ChatInput.jsx
import React, { useRef, useState } from "react";
import useVoiceRecorder from "./hooks/useVoiceRecorder";
import useChatAPI from "./hooks/useChatAPI";

export default function ChatInput({ setMessages }) {
  const [input, setInput] = useState("");
  const fileRef = useRef(null);

  const { listening, startListening, stopListening } = useVoiceRecorder({
    onText: (text) => setInput((i) => i + " " + text),
  });

  const { sendText, uploadResume } = useChatAPI(setMessages);

  const onSend = () => {
    if (!input.trim()) return;
    sendText(input);
    setInput("");
  };

  return (
    <div className="p-2 border-t bg-white flex items-center gap-2">
      <button
        onClick={() => (listening ? stopListening() : startListening())}
        className={`p-2 rounded ${
          listening ? "bg-amber-400" : "bg-slate-100"
        }`}
      >
        🎤
      </button>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        className="flex-1 px-3 py-2 border rounded"
        placeholder="Type your message..."
      />

      <button onClick={onSend} className="px-3 py-2 bg-indigo-600 text-white rounded">
        ➤
      </button>

      <button onClick={() => fileRef.current.click()} className="p-2 bg-slate-100 rounded">
        📄
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        onChange={(e) => uploadResume(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}
