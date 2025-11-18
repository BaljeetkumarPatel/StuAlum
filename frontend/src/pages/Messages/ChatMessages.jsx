// // src/pages/Messages/ChatMessages.jsx
// import React from 'react';
// import MessageBubble from './MessageBubble';

// const ChatMessages = ({ messages, currentUserId, scrollRef }) => {
//   return (
//     <div className="flex-1 overflow-auto p-4 space-y-4 bg-slate-50">
//       {messages.length === 0 ? (
//         <div className="text-center text-gray-500">No messages yet</div>
//       ) : (
//         messages.map(msg => {
//           const senderId = msg.sender_id?._id || msg.sender_id;
//           const isMe = String(senderId) === String(currentUserId);

//           return <MessageBubble key={msg._id} msg={msg} isMe={isMe} />;
//         })
//       )}

//       <div ref={scrollRef}></div>
//     </div>
//   );
// };

// export default ChatMessages;


// // src/pages/Messages/ChatMessages.jsx
// import React from "react";
// import MessageBubble from "./MessageBubble";

// const ChatMessages = ({ messages, currentUserId, scrollRef, typingUser }) => {
//   return (
//     <div className="flex-1 overflow-auto p-6 bg-[#f4f6fb] space-y-4">

//       {messages.map((msg) => {
//         const senderId = msg.sender_id?._id || msg.sender_id;
//         const isMe = String(senderId) === String(currentUserId);

//         return <MessageBubble key={msg._id} msg={msg} isMe={isMe} />;
//       })}

//       {/* Typing indicator */}
//       {typingUser && (
//         <div className="flex justify-start">
//           <div className="px-4 py-2 bg-white rounded-lg shadow text-gray-600">
//             typing...
//           </div>
//         </div>
//       )}

//       <div ref={scrollRef}></div>
//     </div>
//   );
// };

// export default ChatMessages;


// src/pages/Messages/ChatMessages.jsx
import React from "react";
import MessageBubble from "./MessageBubble";
import "./typing.css"; // <-- we will create this file

const ChatMessages = ({ messages, currentUserId, scrollRef, typingUser }) => {
  return (
    <div className="flex-1 overflow-auto p-6 bg-[#eceff3] space-y-4">

      {/* All Messages */}
      {messages.map((msg) => {
        const senderId = msg.sender_id?._id || msg.sender_id;
        const isMe = String(senderId) === String(currentUserId);

        return <MessageBubble key={msg._id} msg={msg} isMe={isMe} />;
      })}

      {/* Typing Indicator */}
      {typingUser && (
        <div className="flex justify-start">
          <div className="typing-bubble">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
        </div>
      )}

      <div ref={scrollRef}></div>
    </div>
  );
};

export default ChatMessages;
