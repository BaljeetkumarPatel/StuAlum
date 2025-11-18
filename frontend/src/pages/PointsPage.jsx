import React, { useEffect, useState } from "react";
import PointsDashboard from "../components/PointsSystem/PointsDashboard";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";

import { 
  getCurrentUserIdFromToken,
  getCurrentUserRoleFromToken
} from "../utils/authUtils";

export default function PointsPage({ onSidebarToggle }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = getCurrentUserIdFromToken();
        const role = getCurrentUserRoleFromToken();

        if (!userId || !role) {
          console.warn("❌ Token does not contain ID or role.");
          setLoading(false);
          return;
        }

        // Save consistent format for dashboard
        localStorage.setItem("userId", userId);
        localStorage.setItem("role", role); // student | alumni

        const response = await fetch(
          `https://stualum.onrender.com/api/auth/me?userId=${userId}&role=${role}`
        );

        const data = await response.json();

        if (data?.user) {
          console.log("✔ Fetched user:", data.user);
          setUser(data.user);
        } else {
          console.warn("⚠️ User data not found.");
        }
      } catch (err) {
        console.error("❌ Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <Navbar onSidebarToggle={onSidebarToggle} />
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#121232] to-[#060612] text-gray-100 p-6 sm:p-10">
        
        <motion.div
          className="text-center mb-10 mt-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 drop-shadow-lg">
            🎯 Reward Points Dashboard
          </h1>
          <div className="flex justify-center items-center gap-2 text-purple-400">
            <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
            <p className="text-sm tracking-wide">
              Track your achievements, unlock badges, and rise to the top!
            </p>
          </div>
        </motion.div>

        {loading ? (
          <p className="text-center text-gray-400 mt-10">
            Loading your points...
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <PointsDashboard user={user} />
          </motion.div>
        )}
      </div>
    </>
  );
}
  