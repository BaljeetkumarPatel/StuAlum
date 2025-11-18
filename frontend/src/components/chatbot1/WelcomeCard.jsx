// src/components/chatbot/WelcomeCard.jsx
import React from "react";
import { getCurrentUserRole } from "../../utils/authUtils";

export default function WelcomeCard({ setFirstOpen }) {
  const role = getCurrentUserRole();

  const title =
    role === "student"
      ? "Hi Student 👋"
      : role === "alumni"
      ? "Welcome Alumni 👋"
      : "Hello Admin 👋";

  const desc =
    role === "student"
      ? "I can help with career, mentorship, resume review & more"
      : role === "alumni"
      ? "You can contribute, mentor students & more"
      : "Manage events, reports, analytics & more";

  return (
    <div className="bg-indigo-50 p-3 rounded space-y-2">
      <div className="font-bold">{title}</div>
      <div className="text-sm">{desc}</div>

      <button
        onClick={() => setFirstOpen(false)}
        className="w-full bg-indigo-600 text-white py-2 rounded mt-2"
      >
        Start Chat
      </button>
    </div>
  );
}
