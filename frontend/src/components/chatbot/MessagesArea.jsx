// // src/components/chatbot/MessagesArea.jsx
// import React, { useEffect, useRef } from "react";
// import WelcomeCard from "./WelcomeCard";
// import MessageBubble from "./MessageBubble";

// export default function MessagesArea({ messages, loading, firstOpen, setFirstOpen }) {
//   const ref = useRef();

//   useEffect(() => {
//     ref.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="flex-1 p-3 overflow-y-auto bg-slate-50">
//       {messages.length === 0 && firstOpen && (
//         <WelcomeCard setFirstOpen={setFirstOpen} />
//       )}

//       <div className="space-y-3 mt-2">
//         {messages.map((m, i) => (
//           <MessageBubble key={i} sender={m.sender} text={m.text} />
//         ))}

//         {loading && (
//           <div className="text-sm text-slate-500">Typing...</div>
//         )}

//         <div ref={ref} />
//       </div>
//     </div>
//   );
// }

// src/components/chatbot/MessagesArea.jsx
// import React, { useEffect, useRef } from "react";
// import WelcomeCard from "./WelcomeCard";
// import { marked } from "marked";
// import DOMPurify from "dompurify";
// import MessageBubble from "./MessageBubble";

// export default function MessagesArea({ messages, loading, firstOpen, setFirstOpen }) {
//   const bottomRef = useRef();

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   // Convert markdown → safe HTML
//   const renderMessage = (text) => {
//     const html = marked.parse(text || "").replace(/\n/g, "<br/>");
//     return DOMPurify.sanitize(html);
//   };

//   return (
//     <div className="flex-1 p-3 overflow-y-auto bg-slate-50">
//       {/* Show welcome card first */}
//       {messages.length === 0 && firstOpen && (
//         <WelcomeCard setFirstOpen={setFirstOpen} />
//       )}

//       <div className="space-y-4">
//         {messages.map((m, i) => (
//           <MessageBubble
//             key={i}
//             sender={m.sender}
//             html={renderMessage(m.text)}
//           />
//         ))}

//         {loading && (
//           <div className="text-sm text-slate-500">Typing...</div>
//         )}

//         <div ref={bottomRef} />
//       </div>
//     </div>
//   );
// }


// src/components/chatbot/MessagesArea.jsx
import React, { useEffect, useRef } from "react";
import WelcomeCard from "./WelcomeCard";
import MessageBubble from "./MessageBubble";

export default function MessagesArea({ messages, loading, firstOpen, setFirstOpen }) {
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex-1 p-3 overflow-y-auto bg-slate-50">
      
      {/* Welcome message */}
      {messages.length === 0 && firstOpen && (
        <WelcomeCard setFirstOpen={setFirstOpen} />
      )}

      <div className="space-y-4">
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            sender={m.sender}
            text={m.text}     // ⭐ correct field
            type={m.type}     // ⭐ for cards (optional)
            data={m.data}     // ⭐ card payload
          />
        ))}

        {loading && <div className="text-sm text-slate-500">Typing...</div>}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}



