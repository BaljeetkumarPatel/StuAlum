// // frontend/src/pages/Analytics/PlacementDashboard.jsx
// import React, { useEffect, useState } from "react";
// import PlacementUpload from "./PlacementUpload";
// import PlacementAnalytics from "./PlacementAnalytics";
// import { getCurrentUserRole } from "../../utils/authUtils";
// import withSidebarToggle from '../../hocs/withSidebarToggle';
// import Navbar from '../../components/Navbar';

// export default function PlacementDashboard({ onSidebarToggle }) {
//   const [loading, setLoading] = useState(true);
//   const [role, setRole] = useState("");

//   useEffect(() => {
//     const userRole = getCurrentUserRole();
//     setRole(userRole ? userRole.toLowerCase() : "");
//     setLoading(false);
//   }, []);

//   if (loading)
//     return <p className="text-center mt-10 text-gray-600">Loading...</p>;

//   const isAdmin = role === "admin";

//   return (
//     <>
//           <Navbar onSidebarToggle={onSidebarToggle} />
//           <div className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white">
//             <h1 className="text-3xl font-bold text-indigo-700 mb-6">
//               Placement Dashboard ({role?.toUpperCase() || "GUEST"})
//             </h1>

//             {/* ✅ Only admin sees upload */}
//             {isAdmin && (
//               <>
//                 <PlacementUpload />
//                 <hr className="my-10" />
//               </>
//             )}

//             {/* ✅ Everyone sees analytics */}
//             <PlacementAnalytics />
//           </div>
//     </>
//   );
// }


import React, { useEffect, useState } from "react";
import PlacementUpload from "./PlacementUpload";
import PlacementAnalytics from "./PlacementAnalytics";
import { getCurrentUserRole } from "../../utils/authUtils";
import withSidebarToggle from "../../hocs/withSidebarToggle";
import Navbar from "../../components/Navbar";
import DashboardStatsCards from "./DashboardStatsCards"; // ✅ NEW IMPORT

export default function PlacementDashboard({ onSidebarToggle }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  useEffect(() => {
    const userRole = getCurrentUserRole();
    setRole(userRole ? userRole.toLowerCase() : "");
    setLoading(false);
  }, []);

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  const isAdmin = role === "admin";

  return (
    <>
      <Navbar onSidebarToggle={onSidebarToggle} />
      <div className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white">
        <h1 className="text-3xl font-bold text-violet-400 mb-6">
          Placement Dashboard ({role?.toUpperCase() || "GUEST"})
        </h1>

        {/* ✅ Add new modular stats cards */}
        <DashboardStatsCards />

        {/* ✅ Only admin sees upload */}
        {isAdmin && (
          <>
            <PlacementUpload />
            <hr className="my-10" />
          </>
        )}

        {/* ✅ Everyone sees analytics */}
        <PlacementAnalytics />
      </div>
    </>
  );
}
