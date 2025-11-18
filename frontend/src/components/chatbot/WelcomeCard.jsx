// // src/components/chatbot/WelcomeCard.jsx
// import React from "react";
// import useQuickActions from "./hooks/useQuickActions";
// import { getCurrentUserRole } from "../../utils/authUtils";

// export default function WelcomeCard({ setFirstOpen, triggerFilePicker, setInput }) {
//   const role = getCurrentUserRole();
//   const quickActions = useQuickActions();

//   // Safety: If undefined → set empty array
//   const actions = Array.isArray(quickActions) ? quickActions.slice(0, 4) : [];

//   const title =
//     role === "student"
//       ? "Hi Student! 👋"
//       : role === "alumni"
//       ? "Welcome Alumni! 👋"
//       : "Hello Admin! 👋";

//   const desc =
//     role === "student"
//       ? "I can help with career resources, mentorship, events and resume review."
//       : role === "alumni"
//       ? "I can help you mentor, contribute, speak at events and give referrals."
//       : "Manage events, reports, users and analytics.";

//   return (
//     <div className="bg-indigo-50 text-slate-900 p-3 rounded-md space-y-2">
//       <div className="font-bold">{title}</div>
//       <div className="text-sm">{desc}</div>

//       {/* Quick actions */}
//       <div className="flex flex-wrap gap-2 mt-2">
//         {actions.map((a) => (
//           <button
//             key={a.id}
//             onClick={() => {
//               if (a.id === "resume") triggerFilePicker();
//               else setInput(a.text);
//             }}
//             className="px-2 py-1 bg-white border rounded text-sm hover:bg-slate-100"
//           >
//             {a.label}
//           </button>
//         ))}
//       </div>

//       <button
//         onClick={() => setFirstOpen(false)}
//         className="w-full py-2 bg-indigo-600 text-white rounded mt-3"
//       >
//         Start Chat
//       </button>
//     </div>
//   );
// }

import React from "react";
import useQuickActions from "./hooks/useQuickActions";
import { getCurrentUserRole } from "../../utils/authUtils";

export default function WelcomeCard({ setFirstOpen, triggerFilePicker, setInput }) {
  const role = getCurrentUserRole();
  const quickActions = useQuickActions();

  // FIX: ensure quickActions exists AND is array
  const actions = Array.isArray(quickActions) ? [...quickActions].slice(0, 4) : [];

  const title =
    role === "student"
      ? "Hi Student! 👋"
      : role === "alumni"
      ? "Welcome Alumni! 👋"
      : "Hello Admin! 👋";

  const desc =
    role === "student"
      ? "I can help with career resources, mentorship, events and resume review."
      : role === "alumni"
      ? "I can help you mentor, contribute, speak at events and give referrals."
      : "Manage events, reports, users and analytics.";

  return (
    <div className="bg-indigo-50 text-slate-900 p-3 rounded-md space-y-2">
      <div className="font-bold">{title}</div>
      <div className="text-sm">{desc}</div>

      {/* <div className="flex flex-wrap gap-2 mt-2">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              if (a.id === "resume") triggerFilePicker();
              else setInput(a.text);
            }}
            className="px-2 py-1 bg-white border rounded text-sm hover:bg-slate-100"
          >
            {a.label}
          </button>
        ))}
      </div> */}
      <div className="flex flex-wrap gap-2 mt-2">
        {actions.map((a, index) => (
          <button
            key={index}
            onClick={() => {
              if (a.id === "resume") triggerFilePicker();
              else setInput(a.text);
            }}
            className="px-2 py-1 bg-white border rounded text-sm hover:bg-slate-100"
          >
            {a.label}
          </button>
        ))}
      </div>


      <button
        onClick={() => setFirstOpen(false)}
        className="w-full py-2 bg-indigo-600 text-white rounded mt-3"
      >
        Start Chat
      </button>
    </div>
  );
}
