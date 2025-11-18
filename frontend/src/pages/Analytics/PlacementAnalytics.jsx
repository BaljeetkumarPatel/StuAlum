import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { getCurrentUserRole } from "../../utils/authUtils"; 



export default function PlacementAnalytics() {
  const [stats, setStats] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [filtered, setFiltered] = useState(null);
  const [branchFilter, setBranchFilter] = useState("All");
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleEdit = (stat) => {
      navigate(`/placement-dashboard/edit/${stat._id}`);
    };

  const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this entry?")) return;

      const token = localStorage.getItem("token");

      await axios.delete(`https://stualum.onrender.com/api/placement/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Deleted successfully!");
      window.location.reload();
    };

  const saveChanges = async () => {
  const token = localStorage.getItem("token");
  await axios.put(
      `https://stualum.onrender.com/api/placement/update/${editData._id}`,
      editData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Updated successfully!");
    setShowModal(false);
    window.location.reload();
  };


  useEffect(() => {
    const r = getCurrentUserRole();
    setRole(r ? r.toLowerCase() : "");
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://stualum.onrender.com/api/placement/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStats(res.data);
        if (res.data.length) setSelectedYear(res.data[res.data.length - 1].year);
      })
      .catch((err) => console.error("Error fetching analytics:", err));
  }, []);

  useEffect(() => {
    const found = stats.find((s) => s.year === Number(selectedYear));
    setFiltered(found || null);
  }, [selectedYear, stats]);

  if (!stats.length)
    return (
      <p className="text-center mt-10 text-gray-400">
        No placement analytics data available.
      </p>
    );

  const COLORS = ["#8b5cf6", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

  const branchTableData = filtered?.branches?.map((b) => ({
    name: b.name,
    registered: b.eligible,
    placed: b.placed,
    percentage: ((b.placed / b.eligible) * 100).toFixed(2),
  }));

  const ctcChartData = filtered?.branches?.map((b) => ({
    name: b.name,
    avg_ctc: b.avg_ctc,
    highest_ctc: b.highest_ctc,
    lowest_ctc: b.lowest_ctc,
  }));

  return (
    <div className="bg-zinc-900 min-h-screen text-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-violet-400 tracking-wide">
            Placement Analytics Dashboard
          </h1>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-zinc-800 border border-violet-600 text-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
          >
            {stats.map((s) => (
              <option key={s.year} value={s.year}>
                {s.year}
              </option>
              
            ))}
          </select>
          
          {/* edit and delete button */}
          {/* Admin Actions */}
         {role === "admin" && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleEdit(filtered)}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(filtered._id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {showModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-zinc-900 p-6 rounded-xl w-[450px] border border-violet-600">
                <h2 className="text-xl font-bold text-violet-400 mb-4">
                  Edit Placement - {editData.year}
                </h2>

                {["total_students", "total_eligible", "total_placed", "higher_studies", "avg_ctc"]
                  .map((field) => (
                    <div key={field} className="mb-3">
                      <label className="text-sm text-gray-300 capitalize">{field.replace("_", " ")}</label>
                      <input
                        type="number"
                        value={editData[field]}
                        onChange={(e) =>
                          setEditData({ ...editData, [field]: e.target.value })
                        }
                        className="w-full bg-zinc-800 p-2 rounded border border-zinc-600 text-white"
                      />
                    </div>
                  ))}

                <button
                  onClick={saveChanges}
                  className="w-full bg-violet-600 hover:bg-violet-700 py-2 rounded text-white mt-4"
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-zinc-700 py-2 rounded text-white mt-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        {/* Summary */}
        {filtered && <SummaryCards data={filtered} />}

        {/* Year-wise + Internship */}
        <div className="grid lg:grid-cols-2 gap-10 mt-8">
          <YearWiseChart stats={stats} />
          <InternshipSection filtered={filtered} />
        </div>

        {/* Branch-Wise Chart */}
        {filtered?.branches?.length > 0 && (
          <BranchWiseChart filtered={filtered} branchFilter={branchFilter} setBranchFilter={setBranchFilter} />
        )}

        {/* Branch Table */}
        {branchTableData?.length > 0 && (
          <BranchTable branchTableData={branchTableData} />
        )}

        {/* NEW ✅ CTC Comparison Chart */}
        {ctcChartData?.length > 0 && (
          <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-violet-700">
            <h2 className="text-xl font-semibold mb-4 text-violet-400">
              CTC Comparison Across Branches ({filtered.year})
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={ctcChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: "#27272a", borderColor: "#8b5cf6" }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="highest_ctc"
                  stroke="#10B981"
                  name="Highest CTC"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_ctc"
                  stroke="#8b5cf6"
                  name="Average CTC"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="lowest_ctc"
                  stroke="#F59E0B"
                  name="Lowest CTC"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie Chart */}
        {filtered && <PlacementPieChart filtered={filtered} COLORS={COLORS} />}
      </div>
    </div>
  );
}

/* ----------------- COMPONENTS ------------------- */

function SummaryCards({ data }) {
  const placedPercent = ((data.total_placed / data.total_eligible) * 100).toFixed(1);
  const higherPercent = ((data.higher_studies / data.total_students) * 100).toFixed(1);
  const cards = [
    { title: "Total Students", value: data.total_students },
    { title: "Eligible Students", value: data.total_eligible },
    { title: "Placed Students", value: `${data.total_placed} (${placedPercent}%)` },
    { title: "Higher Studies", value: `${data.higher_studies} (${higherPercent}%)` },
    { title: "Average CTC", value: `${data.avg_ctc} LPA` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-violet-500/10 border border-violet-700 p-4 rounded-lg text-center hover:bg-violet-500/20 transition"
        >
          <h3 className="text-sm text-gray-400">{card.title}</h3>
          <p className="text-xl font-bold text-violet-400 mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function YearWiseChart({ stats }) {
  return (
    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-violet-700">
      <h2 className="text-xl font-semibold mb-4 text-violet-400">
        Placement Data (Last 5 Years)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={stats.map((s) => ({
          year: s.year,
          total_students: s.total_students,
          total_placed: s.total_placed,
        }))}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="year" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip contentStyle={{ backgroundColor: "#27272a", borderColor: "#8b5cf6" }} />
          <Legend />
          <Bar dataKey="total_students" fill="#3B82F6" name="Enrolled" />
          <Bar dataKey="total_placed" fill="#EF4444" name="Placed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function InternshipSection({ filtered }) {
  return (
    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-violet-700">
      <h2 className="text-xl font-semibold mb-4 text-violet-400">Internship Statistics</h2>
      {filtered?.internships ? (
        <div className="grid grid-cols-2 gap-6">
          <InternshipCard
            year={filtered.year}
            total={filtered.internships.total_internships}
            paid={filtered.internships.paid_internships}
            min={filtered.internships.min_stipend}
            max={filtered.internships.max_stipend}
          />
        </div>
      ) : (
        <p className="text-gray-400 italic">No internship data for this year.</p>
      )}
    </div>
  );
}

function BranchWiseChart({ filtered, branchFilter, setBranchFilter }) {
  return (
    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-violet-700">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold text-violet-400">
          Branch-wise Placement Overview ({filtered.year})
        </h2>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="bg-zinc-700 border border-violet-600 text-gray-200 rounded-md px-3 py-1 text-sm"
        >
          <option value="All">All Branches</option>
          {filtered.branches.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={
            branchFilter === "All"
              ? filtered.branches
              : filtered.branches.filter((b) => b.name === branchFilter)
          }
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="name" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip contentStyle={{ backgroundColor: "#27272a", borderColor: "#8b5cf6" }} />
          <Legend />
          <Bar dataKey="eligible" fill="#3B82F6" name="Eligible" />
          <Bar dataKey="placed" fill="#8b5cf6" name="Placed" />
          <Bar dataKey="higher_studies" fill="#10B981" name="Higher Studies" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BranchTable({ branchTableData }) {
  return (
    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-violet-700">
      <h2 className="text-xl font-semibold mb-4 text-violet-400">
        Branch Placement Summary (% & Count)
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-violet-600 text-white">
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-center">Eligible</th>
              <th className="px-4 py-2 text-center">Placed</th>
              <th className="px-4 py-2 text-center">% Placement</th>
            </tr>
          </thead>
          <tbody>
            {branchTableData.map((b, i) => (
              <tr
                key={i}
                className={`${
                  i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800"
                } hover:bg-violet-500/10`}
              >
                <td className="px-4 py-2 font-medium">{b.name}</td>
                <td className="text-center">{b.registered}</td>
                <td className="text-center">{b.placed}</td>
                <td className="text-center text-violet-400 font-semibold">
                  {b.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlacementPieChart({ filtered, COLORS }) {
  return (
    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-violet-700">
      <h2 className="text-xl font-semibold mb-4 text-violet-400">
        Placement vs Higher Studies
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={[
              { name: "Placed", value: filtered.total_placed },
              { name: "Higher Studies", value: filtered.higher_studies },
              {
                name: "Not Placed",
                value: filtered.total_eligible - filtered.total_placed,
              },
            ]}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {COLORS.map((c, i) => (
              <Cell key={i} fill={c} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#27272a", borderColor: "#8b5cf6" }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function InternshipCard({ year, total, paid, min, max }) {
  return (
    <div className="bg-violet-500/10 border border-violet-700 rounded-lg p-4 shadow text-center hover:bg-violet-500/20 transition">
      <h3 className="text-lg font-semibold text-violet-400 mb-2">
        Internship Status {year}
      </h3>
      <div className="space-y-2 text-sm text-gray-300">
        <p><span className="text-violet-300">Total Internships:</span> {total}</p>
        <p><span className="text-violet-300">Paid Internships:</span> {paid}</p>
        <p><span className="text-violet-300">Min Stipend:</span> ₹{min}/month</p>
        <p><span className="text-violet-300">Max Stipend:</span> ₹{max}/month</p>
      </div>
    </div>
  );
}
