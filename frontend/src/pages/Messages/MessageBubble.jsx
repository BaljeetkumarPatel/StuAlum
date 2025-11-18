// // src/pages/Messages/MessageBubble.jsx
// import React from 'react';

// const MessageBubble = ({ msg, isMe }) => {
//   return (
//     <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
//       <div className={`max-w-[70%] px-4 py-2 rounded-lg ${isMe ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}>
//         <div className="text-sm">
//           {msg.is_deleted ? <em>This message was deleted</em> : msg.message_text}
//         </div>
//         <div className="text-xs mt-1 text-gray-400">
//           {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//           {msg.edited_at && " (edited)"}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageBubble;


// src/pages/Messages/MessageBubble.jsx
import React from "react";

const MessageBubble = ({ msg, isMe }) => {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow 
        ${
          isMe
            ? "bg-[#d4ffc4] text-gray-900 rounded-br-none"
            : "bg-white text-gray-900 rounded-bl-none"
        }`}
      >
        <div className="text-sm">
          {msg.is_deleted ? <em>This message was deleted</em> : msg.message_text}
        </div>

        <div className="text-[10px] mt-1 text-gray-500 text-right">
          {new Date(msg.sent_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {msg.edited_at && " (edited)"}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

