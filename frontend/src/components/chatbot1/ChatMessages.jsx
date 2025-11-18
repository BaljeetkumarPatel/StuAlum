// // src/components/chatbot/ChatMessages.jsx
// import React, { useEffect, useRef } from "react";
// import WelcomeCard from "./WelcomeCard";
// import { marked } from "marked";
// import DOMPurify from "dompurify";

// export default function ChatMessages({ messages, firstOpen, setFirstOpen }) {
//   const ref = useRef();

//   useEffect(() => {
//     ref.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Convert markdown → clean HTML
//   const renderMessage = (text) => {
//     const cleanHtml = DOMPurify.sanitize(
//       marked.parse(text || "").replace(/\n/g, "<br/>")
//     );
//     return { __html: cleanHtml };
//   };

//   return (
//     <div className="flex-1 p-3 overflow-y-auto bg-slate-50">
//       {/* Show welcome card */}
//       {messages.length === 0 && firstOpen && (
//         <WelcomeCard setFirstOpen={setFirstOpen} />
//       )}

//       <div className="space-y-4">
//         {messages.map((m, i) => (
//           <div
//             key={i}
//             className={`flex ${
//               m.sender === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`max-w-[80%] p-3 rounded-xl shadow-sm prose prose-sm
//                 ${m.sender === "user"
//                   ? "bg-indigo-600 text-white prose-invert"
//                   : "bg-white text-gray-900 border border-gray-200"
//                 }`}
//               dangerouslySetInnerHTML={renderMessage(m.text)}
//             ></div>
//           </div>
//         ))}

//         <div ref={ref} />
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useRef } from "react";
import WelcomeCard from "./WelcomeCard";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function ChatMessages({ messages, firstOpen, setFirstOpen, setMessages }) {
  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderMessage = (text) => {
    const html = DOMPurify.sanitize(marked.parse(text || ""));
    return { __html: html };
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-xl">
      {messages.length === 0 && firstOpen && (
        <WelcomeCard setFirstOpen={setFirstOpen} setMessages={setMessages} />
      )}

      <div className="space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-lg prose prose-sm ${
                m.sender === "user"
                  ? "bg-indigo-600 text-white prose-invert"
                  : "bg-white/80 backdrop-blur border border-gray-200 text-gray-900"
              }`}
              dangerouslySetInnerHTML={renderMessage(m.text)}
            ></div>
          </div>
        ))}

        <div ref={ref} />
      </div>
    </div>
  );
}
