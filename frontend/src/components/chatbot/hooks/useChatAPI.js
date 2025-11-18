// src/components/chatbot/hooks/useChatAPI.js import { useState, useRef } from "react"; import axios from "axios"; export default function useChatAPI() { const [messages, setMessages] = useState([]); const [loading, setLoading] = useState(false); const fileInputRef = useRef(null); const token = localStorage.getItem("userToken") || localStorage.getItem("token"); // Send message to server const sendMessage = async (text) => { if (!text.trim()) return; setMessages((m) => [...m, { sender: "user", text }]); setLoading(true); try { const res = await axios.post( "/api/chatbot/query", { message: text }, { headers: { Authorization: Bearer ${token} } } ); const reply = res.data?.reply || "No response."; setMessages((m) => [...m, { sender: "bot", text: reply }]); } catch { setMessages((m) => [...m, { sender: "bot", text: "⚠️ Error sending message." }]); } setLoading(false); }; // Poll resume result const pollResumeStatus = (sessionId) => { let elapsed = 0; const timer = setInterval(async () => { elapsed += 3; try { const r = await axios.get(/api/chatbot/resume-status/${sessionId}, { headers: { Authorization: Bearer ${token} } }); if (r.data.status === "Ready") { clearInterval(timer); setMessages((m) => [...m, { sender: "bot", text: r.data.review }]); } } catch {} if (elapsed >= 90) clearInterval(timer); }, 3000); }; // Upload resume const uploadResume = async (file) => { if (!file) return; const form = new FormData(); form.append("resume", file); setMessages((m) => [ ...m, { sender: "bot", text: "📄 Resume received! Reviewing..." }, ]); try { const res = await axios.post("/api/chatbot/upload-resume", form, { headers: { Authorization: Bearer ${token} }, }); pollResumeStatus(res.data.sessionId); } catch { setMessages((m) => [...m, { sender: "bot", text: "❌ Upload failed." }]); } }; // Trigger hidden file picker const triggerFilePicker = () => fileInputRef.current?.click(); const handleFileInputChange = (e) => { const f = e.target.files?.[0]; if (f) uploadResume(f); }; return { messages, setMessages, loading, sendMessage, fileInputRef, triggerFilePicker, handleFileInputChange, }; }


import { useState, useRef } from "react";
import axios from "axios";

export default function useChatAPI() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const inputRef = useRef(null); // ⭐ FIXED — used for typed input

  const token =
    localStorage.getItem("userToken") ||
    localStorage.getItem("token") ||
    "";

  /* ============================================================
     SEND MESSAGE — FIXED
     Works from:
     - typing
     - pressing ENTER
     - clicking send button
     - quick action button
  ============================================================ */
  // const sendMessage = async (textParam) => {
  //   // When called without parameter → use input box value
  //   const typed = inputRef.current?.value || "";
  //   const text = (textParam ?? typed).trim();

  //   if (!text) return;

  //   // Clear input only if user typed manually
  //   if (!textParam && inputRef.current) inputRef.current.value = "";

  //   setMessages((m) => [...m, { sender: "user", text }]);
  //   setLoading(true);

  //   try {
  //     const res = await axios.post(
  //       "/api/chatbot/query",
  //       { message: text },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     const reply = res.data?.reply || "No response.";
  //     setMessages((m) => [...m, { sender: "bot", text: reply }]);
  //   } catch (err) {
  //     setMessages((m) => [
  //       ...m,
  //       { sender: "bot", text: "⚠️ Error sending message." },
  //     ]);
  //   }

  //   setLoading(false);
  // };


  const sendMessage = async (textParam) => {
  const typed = inputRef.current?.value || "";
  const text = (textParam ?? typed).trim();

  if (!text) return;

  if (!textParam && inputRef.current) inputRef.current.value = "";

  // Add user message
  setMessages((m) => [...m, { sender: "user", text }]);
  setLoading(true);

  try {
    const res = await axios.post(
      "/api/chatbot/query",
      { message: text },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const reply = res.data?.reply || "No response.";

    const type = res.data?.type || "text";   // ⭐ FIXED
    const data = res.data?.data || null;     // ⭐ FIXED

    // Push bot message WITH card support
    setMessages((m) => [
      ...m,
      {
        sender: "bot",
        text: reply,
        type,       // ⭐ card type
        data        // ⭐ card data
      }
    ]);

  } catch (err) {
    setMessages((m) => [
      ...m,
      { sender: "bot", text: "⚠️ Error sending message." },
    ]);
  }

  setLoading(false);
};

  /* ============================================================
     POLL RESUME REVIEW STATUS
  ============================================================ */
  const pollResumeStatus = (sessionId) => {
    let elapsed = 0;

    const timer = setInterval(async () => {
      elapsed += 3;

      try {
        const r = await axios.get(`/api/chatbot/resume-status/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (r.data.status === "Ready") {
          clearInterval(timer);
          setMessages((m) => [...m, { sender: "bot", text: r.data.review }]);
        }

        if (elapsed >= 90) clearInterval(timer);
      } catch {
        clearInterval(timer);
      }
    }, 3000);
  };

  /* ============================================================
     RESUME UPLOAD
  ============================================================ */
  const uploadResume = async (file) => {
    if (!file) return;

    const form = new FormData();
    form.append("resume", file);

    setMessages((m) => [
      ...m,
      { sender: "bot", text: "📄 Resume received! Reviewing..." },
    ]);

    try {
      const res = await axios.post("/api/chatbot/upload-resume", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      pollResumeStatus(res.data.sessionId);
    } catch {
      setMessages((m) => [
        ...m,
        { sender: "bot", text: "❌ Resume upload failed." },
      ]);
    }
  };

  /* ============================================================
     FILE PICKER
  ============================================================ */
  const triggerFilePicker = () => fileInputRef.current?.click();

  const handleFileInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) uploadResume(f);
    e.target.value = null;
  };

  return {
    messages,
    setMessages,
    loading,
    sendMessage,
    inputRef, // ⭐ Must be used in ChatInput
    fileInputRef,
    triggerFilePicker,
    handleFileInputChange,
  };
}
