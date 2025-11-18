import React from "react";
import { motion } from "framer-motion";

export default function UserInfoModal({ open, onClose, user }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1a1a3b] p-6 rounded-2xl w-full max-w-md shadow-lg"
      >
        <h2 className="text-2xl font-bold text-purple-300 mb-4">
          User Details
        </h2>

        <div className="space-y-3">
          <p><span className="text-purple-400 font-semibold">Name:</span> {user.full_name}</p>
          <p><span className="text-purple-400 font-semibold">Email:</span> {user.email}</p>
          <p><span className="text-purple-400 font-semibold">Phone:</span> {user.phone}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}
