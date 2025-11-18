// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { Trophy, Medal } from "lucide-react";
// import BadgeDisplay from "./BadgeDisplay";
// import ProgressLine from "./ProgressLine";
// import Leaderboard from "./Leaderboard";
// import UserInfoModal from "./UserInfoModal";
// import {
//   getCurrentUserIdFromToken,
//   getCurrentUserRoleFromToken,
// } from "../../utils/authUtils";

// const BASE_URL = "http://localhost:5000/api/points";

// export default function PointsDashboard() {
//   const [points, setPoints] = useState(0);
//   const [badges, setBadges] = useState([]);
//   const [studentLeaderboard, setStudentLeaderboard] = useState([]);
//   const [alumniLeaderboard, setAlumniLeaderboard] = useState([]);
//   const [level, setLevel] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);

//   const userId = getCurrentUserIdFromToken();
//   const role = getCurrentUserRoleFromToken(); // "student" | "alumni" | "admin"

//   // Load user points
//   const loadUserPoints = async () => {
//     const res = await fetch(`${BASE_URL}/${userId}`);
//     return res.json();
//   };

//   // Load both leaderboards
//   const loadBothLeaderboards = async () => {
//     const s = await fetch(`${BASE_URL}/leaderboard?userType=Student`);
//     const a = await fetch(`${BASE_URL}/leaderboard?userType=Alumni`);
//     return {
//       student: await s.json(),
//       alumni: await a.json(),
//     };
//   };

//   // Load data
//   const loadData = async () => {
//     try {
//       if (!userId) {
//         setLoading(false);
//         return;
//       }

//       // Student & Alumni get their points
//       if (role === "student" || role === "alumni") {
//         const data = await loadUserPoints();
//         setPoints(data.totalPoints || 0);
//         setBadges(data.badges || []);
//         setLevel(Math.floor((data.totalPoints || 0) / 500) + 1);
//       }

//       // Admin gets BOTH leaderboards
//       if (role === "admin") {
//         const all = await loadBothLeaderboards();
//         setStudentLeaderboard(all.student || []);
//         setAlumniLeaderboard(all.alumni || []);
//       }

//       // Student → student LB only
//       if (role === "student") {
//         const s = await fetch(`${BASE_URL}/leaderboard?userType=Student`);
//         setStudentLeaderboard(await s.json());
//       }

//       // Alumni → alumni LB only
//       if (role === "alumni") {
//         const a = await fetch(`${BASE_URL}/leaderboard?userType=Alumni`);
//         setAlumniLeaderboard(await a.json());
//       }
//     } catch (err) {
//       console.error("Dashboard Load Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Admin click → fetch full user info
//   const handleAdminUserClick = async (user) => {
//     try {
//       // Backend now returns userType inside leaderboard
//       const userType = user.userType || "StudentProfile";

//       const res = await fetch(
//         `${BASE_URL}/userinfo/${user.id}?type=${userType}`
//       );
//       const data = await res.json();

//       setSelectedUser(data);
//       setModalOpen(true);
//     } catch (err) {
//       console.error("Admin fetch user error:", err);
//     }
//   };

//   useEffect(() => {
//     loadData();
//     const interval = setInterval(loadData, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64 text-purple-300 text-lg">
//         Loading dashboard...
//       </div>
//     );
//   }

//   const progress = Math.min((points / 1000) * 100, 100);

//   return (
//     <div className="min-h-screen text-gray-100">

//       {/* HEADER — Only for student & alumni */}
//       {(role === "student" || role === "alumni") && (
//         <motion.div
//           className="flex items-center justify-between mb-10"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           <h1 className="text-4xl font-bold flex items-center gap-3
//           text-transparent bg-clip-text bg-gradient-to-r 
//           from-purple-400 via-indigo-400 to-pink-500">
//             <Trophy className="text-yellow-400 w-9 h-9" />
//             Reward Points Dashboard
//           </h1>
//         </motion.div>
//       )}

//       {/* STUDENT/ALUMNI POINTS + BADGES */}
//       {(role === "student" || role === "alumni") && (
//         <>
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.6 }}
//             className="mb-8"
//           >
//             <div className="bg-[#1a1a3b] p-6 rounded-xl text-center shadow-lg">
//               <h2 className="text-xl mb-2 text-purple-300">Total Points</h2>
//               <p className="text-6xl text-green-300 font-bold">{points}</p>
//               <p className="text-gray-400 mt-2">
//                 {1000 - points} points to next level
//               </p>
//             </div>
//           </motion.div>

//           <ProgressLine points={points} level={level} progress={progress} />

//           <h2 className="text-2xl mt-10 text-purple-300">Your Badges</h2>
//           <BadgeDisplay badges={badges} />
//         </>
//       )}

//       {/* ADMIN → Two leaderboards ONLY */}
//       {role === "admin" && (
//         <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">

//           {/* Student LB */}
//           <div>
//             <h2 className="text-2xl mb-4 flex items-center gap-2 text-indigo-300">
//               <Medal className="text-yellow-300" /> Student Leaderboard
//             </h2>
//             <Leaderboard
//               leaderboard={studentLeaderboard}
//               isAdmin={true}
//               onUserClick={handleAdminUserClick}
//             />
//           </div>

//           {/* Alumni LB */}
//           <div>
//             <h2 className="text-2xl mb-4 flex items-center gap-2 text-indigo-300">
//               <Medal className="text-yellow-300" /> Alumni Leaderboard
//             </h2>
//             <Leaderboard
//               leaderboard={alumniLeaderboard}
//               isAdmin={true}
//               onUserClick={handleAdminUserClick}
//             />
//           </div>

//         </div>
//       )}

//       {/* STUDENT → student LB only */}
//       {role === "student" && (
//         <>
//           <h2 className="text-2xl mt-10 flex items-center gap-2 text-indigo-300">
//             <Medal className="text-yellow-300" /> Leaderboard (Student)
//           </h2>
//           <Leaderboard leaderboard={studentLeaderboard} />
//         </>
//       )}

//       {/* ALUMNI → alumni LB only */}
//       {role === "alumni" && (
//         <>
//           <h2 className="text-2xl mt-10 flex items-center gap-2 text-indigo-300">
//             <Medal className="text-yellow-300" /> Leaderboard (Alumni)
//           </h2>
//           <Leaderboard leaderboard={alumniLeaderboard} />
//         </>
//       )}

//       {/* GLOBAL MODAL (admin clicks user) */}
//       <UserInfoModal
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         user={selectedUser || {}}
//       />

//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import BadgeDisplay from "./BadgeDisplay";
import ProgressLine from "./ProgressLine";
import Leaderboard from "./Leaderboard";
import UserInfoModal from "./UserInfoModal";
import {
  getCurrentUserIdFromToken,
  getCurrentUserRoleFromToken,
} from "../../utils/authUtils";

const BASE_URL = "https://stualum.onrender.com/api/points";

export default function PointsDashboard() {
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [studentLeaderboard, setStudentLeaderboard] = useState([]);
  const [alumniLeaderboard, setAlumniLeaderboard] = useState([]);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const userId = getCurrentUserIdFromToken();
  const role = getCurrentUserRoleFromToken(); // student | alumni | admin

  const loadUserPoints = async () => {
    const res = await fetch(`${BASE_URL}/${userId}`);
    return res.json();
  };

  const loadBothLeaderboards = async () => {
    const s = await fetch(`${BASE_URL}/leaderboard?userType=Student`);
    const a = await fetch(`${BASE_URL}/leaderboard?userType=Alumni`);
    return {
      student: await s.json(),
      alumni: await a.json(),
    };
  };

  const loadData = async () => {
    try {
      if (!userId) {
        setLoading(false);
        return;
      }

      if (role === "student" || role === "alumni") {
        const data = await loadUserPoints();
        setPoints(data.totalPoints || 0);
        setBadges(data.badges || []);
        setLevel(Math.floor((data.totalPoints || 0) / 500) + 1);
      }

      if (role === "admin") {
        const all = await loadBothLeaderboards();
        setStudentLeaderboard(all.student || []);
        setAlumniLeaderboard(all.alumni || []);
      }

      if (role === "student") {
        const s = await fetch(`${BASE_URL}/leaderboard?userType=Student`);
        setStudentLeaderboard(await s.json());
      }

      if (role === "alumni") {
        const a = await fetch(`${BASE_URL}/leaderboard?userType=Alumni`);
        setAlumniLeaderboard(await a.json());
      }

    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIXED ADMIN CLICK HANDLER
  const handleAdminUserClick = async (user) => {
    try {
      if (!user || !user.id || !user.userType) {
        console.error("Invalid user clicked:", user);
        return;
      }

      const res = await fetch(
        `${BASE_URL}/userinfo/${user.id}?type=${user.userType}`
      );

      const data = await res.json();

      setSelectedUser(data);
      setModalOpen(true);

    } catch (err) {
      console.error("Admin fetch user error:", err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-purple-300 text-lg">
        Loading dashboard...
      </div>
    );
  }

  const progress = Math.min((points / 1000) * 100, 100);

  return (
    <div className="min-h-screen text-gray-100">

      {(role === "student" || role === "alumni") && (
        <motion.div
          className="flex items-center justify-between mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold flex items-center gap-3 
            text-transparent bg-clip-text bg-gradient-to-r 
            from-purple-400 via-indigo-400 to-pink-500">
            <Trophy className="text-yellow-400 w-9 h-9" />
            Reward Points Dashboard
          </h1>
        </motion.div>
      )}

      {(role === "student" || role === "alumni") && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="bg-[#1a1a3b] p-6 rounded-xl text-center shadow-lg">
              <h2 className="text-xl mb-2 text-purple-300">Total Points</h2>
              <p className="text-6xl text-green-300 font-bold">{points}</p>
              <p className="text-gray-400 mt-2">
                {1000 - points} points to next level
              </p>
            </div>
          </motion.div>

          <ProgressLine points={points} level={level} progress={progress} />

          <h2 className="text-2xl mt-10 text-purple-300">Your Badges</h2>
          <BadgeDisplay badges={badges} />
        </>
      )}

      {role === "admin" && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">

          <div>
            <h2 className="text-2xl mb-4 flex items-center gap-2 text-indigo-300">
              <Medal className="text-yellow-300" /> Student Leaderboard
            </h2>

            <Leaderboard
              leaderboard={studentLeaderboard}
              isAdmin={true}
              onUserClick={handleAdminUserClick}
            />
          </div>

          <div>
            <h2 className="text-2xl mb-4 flex items-center gap-2 text-indigo-300">
              <Medal className="text-yellow-300" /> Alumni Leaderboard
            </h2>

            <Leaderboard
              leaderboard={alumniLeaderboard}
              isAdmin={true}
              onUserClick={handleAdminUserClick}
            />
          </div>
        </div>
      )}

      {role === "student" && (
        <>
          <h2 className="text-2xl mt-10 flex items-center gap-2 text-indigo-300">
            <Medal className="text-yellow-300" /> Leaderboard (Student)
          </h2>
          <Leaderboard leaderboard={studentLeaderboard} />
        </>
      )}

      {role === "alumni" && (
        <>
          <h2 className="text-2xl mt-10 flex items-center gap-2 text-indigo-300">
            <Medal className="text-yellow-300" /> Leaderboard (Alumni)
          </h2>
          <Leaderboard leaderboard={alumniLeaderboard} />
        </>
      )}

      <UserInfoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser || {}}
      />

    </div>
  );
}
