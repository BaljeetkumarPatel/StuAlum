// src/components/chatbot/QuickActions.jsx
import React from "react";
import useQuickActions from "./hooks/useQuickActions";

export default function QuickActions({ sendMessage, triggerFilePicker }) {
  const quickActions = useQuickActions();

  // SAFETY CHECK
  if (!Array.isArray(quickActions)) return null;

  return (
    <div className="px-2 py-2 border-b flex gap-2 overflow-x-auto bg-white">
      {quickActions.map((action, i) => (
        <button
          key={action.id || i}   // UNIQUE KEY
          onClick={() => {
            if (action.id === "resume") triggerFilePicker();
            else sendMessage(action.text);
          }}
          className="text-xs whitespace-nowrap px-2 py-1 rounded border bg-white hover:bg-slate-50"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
