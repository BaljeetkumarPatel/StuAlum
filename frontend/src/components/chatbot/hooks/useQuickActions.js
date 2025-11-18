// src/components/chatbot/hooks/useQuickActions.js
import { getCurrentUserRole } from "../../../utils/authUtils";

export default function useQuickActions() {
  const role = getCurrentUserRole() || "student";

  const studentActions = [
    { id: "career", label: "🎯 Career resources", text: "Show me career resources" },
    { id: "mentor", label: "🤝 Find mentor", text: "Find alumni mentors" },
    { id: "events", label: "📅 Events", text: "Show upcoming events" },
    { id: "resume", label: "📝 Resume review", text: "I want to upload my resume" },
    { id: "placement", label: "📊 Placement trends", text: "Show placement analytics" },
    { id: "career_pred", label: "🧭 Career prediction", text: "Predict my career" },
    { id: "search", label: "🔍 Search alumni", text: "Search alumni" },
  ];

  const alumniActions = [
    { id: "mentor", label: "🤝 Mentor students", text: "I want to mentor students" },
    { id: "speak", label: "📢 Speak at events", text: "I want to speak at events" },
    { id: "placement", label: "📊 Placement trends", text: "Show placement analytics" },
    { id: "referrals", label: "👨‍💼 Job referrals", text: "Share job referrals" },
    { id: "startup", label: "🚀 Startup mentorship", text: "Guide startups" },
  ];

  const adminActions = [
    { id: "events", label: "📅 Manage events", text: "Show event management dashboard" },
    { id: "users", label: "🧑‍💻 Manage users", text: "Show user list" },
    { id: "placement", label: "📊 Placement trends", text: "Show placement analytics" },
    { id: "analytics", label: "🧠 AI analytics", text: "Show AI analytics report" },
  ];

  if (role === "student") return studentActions;
  if (role === "alumni") return alumniActions;
  if (role === "admin") return adminActions;

  return []; // ALWAYS RETURN ARRAY
}
