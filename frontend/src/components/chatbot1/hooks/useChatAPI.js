// src/components/chatbot/hooks/useChatAPI.js
import axios from "axios";
import { getCurrentUserRole } from "../../../utils/authUtils";

const BASE_URL = "http://localhost:5000";  // <<< ADD THIS

export default function useChatAPI(setMessages) {
  const token =
    localStorage.getItem("userToken") || localStorage.getItem("token");

  const sendText = async (text) => {
    setMessages((m) => [...m, { sender: "user", text }]);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/chatbot/query`,         // <<< UPDATED
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((m) => [...m, { sender: "bot", text: res.data.reply }]);
    } catch {
      setMessages((m) => [...m, { sender: "bot", text: "❌ Error sending" }]);
    }
  };

  // --- Resume Upload Logic ---
  const uploadResume = async (file) => {
    if (!file) return;

    const form = new FormData();
    form.append("resume", file);

    try {
      setMessages((m) => [
        ...m,
        {
          sender: "bot",
          text:
            "📄 Resume received! Reviewing now. Please wait, I’ll send a detailed report.",
        },
      ]);

      const res = await axios.post(
        `${BASE_URL}/api/chatbot/upload-resume`,  // <<< UPDATED
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      pollStatus(res.data.sessionId);
    } catch (err) {
      setMessages((m) => [...m, { sender: "bot", text: "❌ Upload failed" }]);
    }
  };

  const pollStatus = (sessionId) => {
    let elapsed = 0;

    const interval = setInterval(async () => {
      elapsed += 3;

      try {
        const r = await axios.get(
          `${BASE_URL}/api/chatbot/resume-status/${sessionId}`,  // <<< UPDATED
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (r.data.status === "Ready") {
          clearInterval(interval);
          setMessages((m) => [...m, { sender: "bot", text: r.data.review }]);
        }
      } catch (err) {
        console.error("Polling error:", err.response?.data);
      }

      if (elapsed >= 60) clearInterval(interval);
    }, 3000);
  };

  return { sendText, uploadResume };
}
