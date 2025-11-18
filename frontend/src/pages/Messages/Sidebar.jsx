// // src/pages/Messages/Sidebar.jsx
// import React from 'react';

// const API_BASE = "http://localhost:5000"; // DIRECT URL

// const Sidebar = ({ conversations, selectedId, onSelect }) => {
//   return (
//     <div className="w-1/4 bg-white border-r flex flex-col">
//       <div className="p-4 border-b">
//         <h2 className="text-lg font-bold">Messages</h2>
//         <input
//           type="text"
//           placeholder="Search..."
//           onChange={(e) => {
//             const s = e.target.value.toLowerCase();
//             // parent can handle filtering
//           }}
//           className="w-full mt-2 px-3 py-2 border rounded"
//         />
//       </div>

//       <div className="flex-1 overflow-auto">
//         {conversations.map((conv) => (
//           <div
//             key={conv._id}
//             onClick={() => onSelect(conv._id)}
//             className={`p-3 border-b cursor-pointer ${
//               conv._id === selectedId ? "bg-blue-50" : ""
//             }`}
//           >
//             <div className="flex items-center">

//               <img
//                 src={
//                   conv.otherParticipant?.profile_photo_url
//                     ? API_BASE + conv.otherParticipant.profile_photo_url
//                     : "/default-avatar.png"
//                 }
//                 className="w-10 h-10 rounded-full mr-3 object-cover"
//               />

//               <div className="flex-1">
//                 <div className="font-semibold">
//                   {conv.otherParticipant?.full_name}
//                 </div>
//                 <div className="text-sm text-gray-500 truncate">
//                   {conv.lastMessage?.message_text}
//                 </div>
//               </div>

//               {conv.unreadCount > 0 && (
//                 <div className="bg-red-500 text-white rounded-full w-6 h-6 flex justify-center items-center text-xs">
//                   {conv.unreadCount}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;


// src/pages/Messages/Sidebar.jsx
import React, { useState } from "react";

const API_BASE = "https://stualum.onrender.com";
const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // same UI as screenshot

const Sidebar = ({ conversations, selectedId, onSelect }) => {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((conv) =>
    conv.otherParticipant?.full_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">

      {/* HEADER + SEARCH */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-xl font-bold">Messages</h2>

        <div className="relative mt-3">
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-full bg-gray-100 focus:bg-black 
                       border focus:border-blue-500 outline-none transition pr-10 text-black"
          />

          {/* Search Icon */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {/* USER LIST */}
      <div className="flex-1 overflow-auto">
        {filtered.map((conv) => (
          <div
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={`p-3 cursor-pointer flex items-center gap-3 transition ${
              conv._id === selectedId ? "bg-blue-50" : "hover:bg-gray-100"
            }`}
          >
            {/* USER IMAGE WITH FALLBACK */}
            <img
              src={
                conv.otherParticipant?.profile_photo_url
                  ? API_BASE + conv.otherParticipant.profile_photo_url
                  : DEFAULT_AVATAR
              }
              onError={(e) => (e.target.src = DEFAULT_AVATAR)}
              className="w-12 h-12 rounded-full object-cover shadow-sm"
            />

            {/* NAME + LAST MESSAGE */}
            <div className="flex-1">
              <div className="font-semibold text-gray-900">
                {conv.otherParticipant?.full_name}
              </div>

              <div className="text-sm text-gray-500 truncate">
                {conv.lastMessage?.message_text || "No messages yet"}
              </div>
            </div>

            {/* UNREAD BADGE */}
            {conv.unreadCount > 0 && (
              <div className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {conv.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;


