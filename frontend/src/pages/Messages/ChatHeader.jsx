// import React from 'react';

// const API_BASE = "http://localhost:5000"; // DIRECT URL

// const ChatHeader = ({ user }) => {
//   return (
//     <div className="bg-white border-b p-4 flex items-center space-x-3">
//       <img
//         src={
//           user?.profile_photo_url
//             ? API_BASE + user.profile_photo_url
//             : '/default-avatar.png'
//         }
//         className="w-10 h-10 rounded-full object-cover"
//       />
//       <div>
//         <div className="font-semibold">{user?.full_name}</div>
//         <div className="text-sm text-gray-500">{user?.role}</div>
//       </div>
//     </div>
//   );
// };

// export default ChatHeader;

import React from "react";

const API_BASE = "https://stualum.onrender.com";

const ChatHeader = ({ user }) => {
  return (
    <div className="bg-[#11131a] text-white p-4 flex items-center gap-3 shadow-md">
      <img
        src={
          user?.profile_photo_url
            ? API_BASE + user.profile_photo_url
            : "/default-avatar.png"
        }
        className="w-12 h-12 rounded-full object-cover border border-gray-700"
      />

      <div>
        <div className="text-lg font-semibold">{user?.full_name}</div>
        <div className="text-sm text-gray-300">{user?.role}</div>
      </div>
    </div>
  );
};

export default ChatHeader;

