// src/components/chatbot/WelcomeCard.jsx
import React from "react";
import { getCurrentUserRole } from "../../utils/authUtils";

export default function WelcomeCard({ setFirstOpen, setMessages }) {
  const role = getCurrentUserRole();

  const quickActions = {
    student: [
      { label: "🎯 Career Resources", text: "Show me career resources" },
      { label: "🤝 Find Mentor", text: "Find alumni mentors" },
      { label: "📅 Events", text: "Show upcoming events" },
      { label: "📝 Resume Review", text: "I want to upload my resume" },
      { label: "🔍 Search Alumni", text: "Search alumni" },
      { label: "🧭 Career Prediction", text: "Predict my career" },
    ],
    alumni: [
      { label: "🤝 Mentor Students", text: "I want to mentor students" },
      { label: "📢 Speak at Events", text: "I want to speak at campus events" },
      { label: "👨‍💼 Job Referrals", text: "Share job referrals" },
      { label: "🚀 Startup Mentorship", text: "Guide startups" },
    ],
    admin: [
      { label: "📅 Manage Events", text: "Show event management dashboard" },
      { label: "🧑‍💻 Manage Users", text: "Show user list" },
      { label: "📊 Placement Trends", text: "Show placement analytics" },
      { label: "🧠 AI Analytics", text: "Show AI analytics report" },
    ],
  }[role];

  return (
    <div className="bg-indigo-50 p-3 rounded-xl shadow-sm animate-fade-in">
      {/* Title */}
      <div className="font-bold text-indigo-800 text-lg mb-1">
        {role === "student"
          ? "Hi Student 👋"
          : role === "alumni"
          ? "Welcome Alumni 👋"
          : "Hello Admin 👋"}
      </div>

      {/* Description */}
      <div className="text-sm text-indigo-700 mb-3">
        {role === "student"
          ? "I can help with career, mentorship, resume review & more"
          : role === "alumni"
          ? "Guide students, share referrals & more"
          : "View analytics, manage events & more"}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {quickActions.map((btn, idx) => (
          <button
            key={idx}
            className="bg-white border border-indigo-200 text-indigo-700 text-xs p-2 rounded-lg hover:bg-indigo-100 transition"
            onClick={() => {
              // Push user message
              setMessages((m) => [...m, { sender: "user", text: btn.text }]);

              // Special logic for Resume Review
              if (btn.text === "I want to upload my resume") {
                setMessages((m) => [
                  ...m,
                  {
                    sender: "bot",
                    text:
                      "**📄 Please upload your resume:**\n\nClick the 📄 button below to upload your PDF.",
                    showUpload: true,
                  },
                ]);
              }

              // Close welcome screen
              setFirstOpen(false);
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Start Chat Button */}
      <button
        onClick={() => setFirstOpen(false)}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        Start Chat
      </button>
    </div>
  );
}
