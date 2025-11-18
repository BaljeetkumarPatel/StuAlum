
// import React from "react";
// import { motion } from "framer-motion";
// import { Crown } from "lucide-react";

// export default function Leaderboard({ leaderboard = [] }) {
//   if (!leaderboard.length)
//     return (
//       <p className="text-gray-400 text-center">
//         No leaderboard data available.
//       </p>
//     );

//   return (
//     <div className="overflow-x-auto rounded-2xl border border-purple-700/40 shadow-lg bg-gradient-to-br from-[#151530] via-[#1b1b3d] to-[#0f0f25]">
//       <table className="min-w-full text-left text-gray-200">
//         <thead>
//           <tr className="bg-[#1a1a3b]/60 text-purple-300">
//             <th className="py-3 px-4">Rank</th>
//             <th className="py-3 px-4">Name</th>
//             <th className="py-3 px-4 text-right">Points</th>
//           </tr>
//         </thead>

//         <tbody>
//           {leaderboard.map((user, index) => {
//             const displayName =
//               user.full_name || user.name || user.email || "User";

//             return (
//               <motion.tr
//                 key={user.id || index}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.05 }}
//                 className="border-t border-purple-800/30 hover:bg-[#2a2a55]/40 transition"
//               >
//                 {/* RANK + CROWN */}
//                 <td className="py-3 px-4 font-medium flex items-center gap-2">
//                   {index === 0 && (
//                     <Crown className="text-yellow-400 w-5 h-5 drop-shadow-md" />
//                   )}
//                   <span className={index === 0 ? "text-yellow-400 font-bold" : ""}>
//                     {index + 1}
//                   </span>
//                 </td>

//                 {/* NAME */}
//                 <td className="py-3 px-4">{displayName}</td>

//                 {/* POINTS */}
//                 <td className="py-3 px-4 text-right text-purple-300 font-semibold">
//                   {user.points ?? 0}
//                 </td>
//               </motion.tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import React from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

export default function Leaderboard({ leaderboard = [], isAdmin = false, onUserClick }) {
  if (!leaderboard.length)
    return (
      <p className="text-gray-400 text-center">
        No leaderboard data available.
      </p>
    );

  return (
    <div className="overflow-x-auto rounded-2xl border border-purple-700/40 shadow-lg bg-gradient-to-br from-[#151530] via-[#1b1b3d] to-[#0f0f25]">
      <table className="min-w-full text-left text-gray-200">
        <thead>
          <tr className="bg-[#1a1a3b]/60 text-purple-300">
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4 text-right">Points</th>
          </tr>
        </thead>

        <tbody>
          {leaderboard.map((user, index) => (
            <motion.tr
              key={user.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border-t border-purple-800/30 hover:bg-[#2a2a55]/40 transition cursor-pointer`}
              onClick={() => isAdmin && onUserClick(user)}
            >
              <td className="py-3 px-4 font-medium flex items-center gap-2">
                {index === 0 && (
                  <Crown className="text-yellow-400 w-5 h-5 drop-shadow-md" />
                )}
                <span className={index === 0 ? "text-yellow-400 font-bold" : ""}>
                  {index + 1}
                </span>
              </td>

              <td className="py-3 px-4">
                {user.full_name || user.name || user.email || "Unknown"}
              </td>

              <td className="py-3 px-4 text-right text-purple-300 font-semibold">
                {user.points ?? 0}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
