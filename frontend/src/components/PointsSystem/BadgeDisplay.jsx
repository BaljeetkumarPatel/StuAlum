import React from "react";
import { motion } from "framer-motion";

export default function BadgeDisplay({ badges = [] }) {
  if (!badges.length)
    return <p className="text-gray-400 text-center">No badges earned yet.</p>;

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
      {badges.map((badge, index) => (
        <motion.div
          key={badge.name || index}   // FIXED KEY
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gradient-to-br from-[#151530] via-[#1c1c44] to-[#0f0f25]
                     rounded-2xl p-5 shadow-lg border border-purple-700/40
                     hover:border-purple-400/70 transition"
        >
          <div className="flex flex-col items-center text-center">
            
            {/* SAFE ICON */}
            <img
              src={badge.icon || "/placeholder-badge.png"}
              alt={badge.name || "Badge"}
              className="w-16 h-16 mb-3 drop-shadow-lg"
            />

            {/* SAFE NAME */}
            <h3 className="text-lg font-semibold text-purple-300">
              {badge.name || "Unnamed Badge"}
            </h3>

            {/* SAFE DESCRIPTION */}
            <p className="text-gray-400 text-sm mt-2">
              {badge.description || "No description available."}
            </p>

          </div>
        </motion.div>
      ))}
    </div>
  );
}
