import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardStatsCards() {
  const [stats, setStats] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/placement/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(res.data?.stats || []);
        setRole(res.data?.role || "guest");
      } catch (err) {
        console.error("❌ Error fetching dashboard stats:", err);
        setError("Failed to load stats. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 🌀 Loading
  if (loading)
    return (
      <div className="text-center text-gray-400 mt-6 animate-pulse">
        Loading dashboard stats...
      </div>
    );

  // ⚠️ Error
  if (error)
    return (
      <p className="text-center text-red-400 mt-6 font-medium">{error}</p>
    );

  // ✅ If backend returns empty stats, show zero defaults
  // ✅ Role-based fallback stats
  let fallbackStats = [];

  if (role === "admin") {
    fallbackStats = [
      { title: "Total Alumni Registered", value: 0 },
      { title: "Total Students Registered", value: 0 },
      { title: "Total Events Created", value: 0 },
      { title: "Placement Rate", value: "0%" },
      { title: "Average CTC", value: "0 LPA" },
      { title: "Total Placed Students", value: 0 },
    ];
  } 
  else if (role === "student") {
    fallbackStats = [{ title: "Events Registered", value: 0 }];
  } 
  else if (role === "alumni") {
    fallbackStats = [
      { title: "Events Registered", value: 0 },
      { title: "Events Created", value: 0 },
      {title:"Completed Mentorship", value:0},
    ];
  } 
  else if (role === "mentor") {
    fallbackStats = [{ title: "Events Created", value: 0 }];
  }


  // 🧠 Merge backend data with fallbacks
  const mergedStats = fallbackStats.map((f) => {
    const match = stats.find(
      (s) => s.title?.toLowerCase() === f.title?.toLowerCase()
    );
    return match || f;
  });

  // 🟣 Icon selector
  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes("student")) return "🎓";
    if (t.includes("alumni")) return "👥";
    if (t.includes("event")) return "📅";
    if (t.includes("placement")) return "📊";
    if (t.includes("ctc")) return "💰";
    if (t.includes("rate")) return "📈";
    return "⭐";
  };

  // 🌈 Role-based color theme
  const roleColors = {
    admin: "violet",
    student: "emerald",
    alumni: "amber",
    mentor: "amber",
  };

  const color = roleColors[role] || "violet";

  return (
    <div className="mb-10">
      <h2
        className={`text-xl font-semibold text-${color}-400 mb-5 capitalize tracking-wide`}
      >
        {role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard` : "Dashboard"} Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {mergedStats.map((item, i) => {
          const value =
            item?.value && item.value !== "NaN" && item.value !== "undefined"
              ? item.value
              : 0;

          return (
            <div
              key={i}
              className={`bg-zinc-900 border border-${color}-700 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center hover:bg-${color}-500/10 hover:shadow-${color}-700/40 transition-all duration-300`}
            >
              <div className="text-3xl mb-2">{getIcon(item.title)}</div>
              <h3 className="text-sm text-gray-400 text-center">
                {item.title}
              </h3>
              <p className={`text-2xl font-bold text-${color}-400 mt-2`}>
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
