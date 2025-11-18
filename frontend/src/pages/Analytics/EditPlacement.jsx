// frontend/src/pages/Analytics/EditPlacement.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUserRole } from "../../utils/authUtils";

export default function EditPlacement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // -------------------- FORM STATE --------------------
  const [form, setForm] = useState({
    year: "",
    total_students: "",
    total_eligible: "",
    total_placed: "",
    higher_studies: "",
    avg_ctc: "",
    highest_ctc: "",
    lowest_ctc: "",
    median_ctc: "",
  });

  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [internships, setInternships] = useState({
    total_internships: "",
    paid_internships: "",
    min_stipend: "",
    max_stipend: "",
  });

  // -------------------- CHECK ROLE --------------------
  useEffect(() => {
    const role = getCurrentUserRole();
    setIsAdmin(role === "admin");
  }, []);

  // -------------------- FETCH DATA --------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`https://stualum.onrender.com/api/placement/single/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;

        setForm({
          year: data.year || "",
          total_students: data.total_students || "",
          total_eligible: data.total_eligible || "",
          total_placed: data.total_placed || "",
          higher_studies: data.higher_studies || "",
          avg_ctc: data.avg_ctc || "",
          highest_ctc: data.highest_ctc || "",
          lowest_ctc: data.lowest_ctc || "",
          median_ctc: data.median_ctc || "",
        });

        setBranches(data.branches || []);
        setCompanies(data.companies || []);
        setInternships(data.internships || {});

        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch data:", err);
        alert("Could not load placement data");
        navigate("/placement-dashboard");
      });
  }, [id]);

  // -------------------- INPUT HANDLERS --------------------
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value || "" });

  const handleInternshipChange = (e) =>
    setInternships({ ...internships, [e.target.name]: e.target.value || "" });

  const handleBranchChange = (index, e) => {
    const updated = [...branches];
    updated[index][e.target.name] = e.target.value || "";
    setBranches(updated);
  };

  const handleCompanyChange = (index, e) => {
    const updated = [...companies];
    updated[index][e.target.name] = e.target.value || "";
    setCompanies(updated);
  };

  // -------------------- ADD / REMOVE --------------------
  const addBranch = () =>
    setBranches([
      ...branches,
      {
        name: "",
        eligible: "",
        placed: "",
        higher_studies: "",
        avg_ctc: "",
        highest_ctc: "",
        lowest_ctc: "",
      },
    ]);

  const removeBranch = (i) =>
    setBranches(branches.filter((_, index) => index !== i));

  const addCompany = () =>
    setCompanies([
      ...companies,
      { name: "", total_hires: "", avg_ctc: "", branches: {} },
    ]);

  const removeCompany = (i) =>
    setCompanies(companies.filter((_, index) => index !== i));

  // -------------------- FINAL UPDATE --------------------
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...form,
        branches,
        companies,
        internships,
      };

      console.log("📦 FINAL UPDATE PAYLOAD:", payload);

      await axios.put(
        `https://stualum.onrender.com/api/placement/update/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Placement Data Updated Successfully!");

      navigate("/placement-dashboard");
    } catch (err) {
      console.error("❌ Update failed:", err.response?.data || err);
      alert("Update failed. Check console for details.");
    }
  };

  // -------------------- UI --------------------
  if (!isAdmin)
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-red-400 text-lg font-semibold">
        🚫 Access Denied — Only Admins Can Edit Placement Data
      </div>
    );

  if (loading)
    return <div className="text-center text-gray-400 mt-10">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto bg-zinc-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-violet-400 mb-8 text-center">
        ✏️ Edit Placement Data ({form.year})
      </h1>

      <form onSubmit={handleUpdate} className="space-y-10">

        {/* GENERAL INFO */}
        <section className="bg-zinc-800 p-6 rounded-xl border border-violet-700 shadow-lg">
          <h2 className="text-xl font-semibold text-violet-400 mb-4">
            General Information
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              ["Year", "year"],
              ["Total Students", "total_students"],
              ["Eligible Students", "total_eligible"],
              ["Placed Students", "total_placed"],
              ["Higher Studies", "higher_studies"],
              ["Average CTC (LPA)", "avg_ctc"],
              ["Highest CTC (LPA)", "highest_ctc"],
              ["Lowest CTC (LPA)", "lowest_ctc"],
              ["Median CTC (LPA)", "median_ctc"],
            ].map(([label, name]) => (
              <Input
                key={name}
                label={label}
                name={name}
                value={form[name]}
                onChange={handleChange}
              />
            ))}
          </div>
        </section>

        {/* BRANCH DETAILS */}
        <section className="bg-zinc-800 p-6 rounded-xl border border-violet-700 shadow-lg">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold text-violet-400">
              Branch-wise Details
            </h2>

            <button
              type="button"
              onClick={addBranch}
              className="bg-violet-600 hover:bg-violet-700 px-3 py-1 rounded-md"
            >
              + Add Branch
            </button>
          </div>

          {branches.map((branch, index) => (
            <div key={index} className="grid grid-cols-7 gap-2 mb-3">
              {[
                "name",
                "eligible",
                "placed",
                "higher_studies",
                "avg_ctc",
                "highest_ctc",
                "lowest_ctc",
              ].map((field) => (
                <input
                  key={field}
                  type={field === "name" ? "text" : "number"}
                  placeholder={field.replace("_", " ")}
                  name={field}
                  value={branch[field] || ""}
                  onChange={(e) => handleBranchChange(index, e)}
                  className="bg-zinc-700 border border-zinc-600 p-2 rounded-md"
                />
              ))}

              {branches.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBranch(index)}
                  className="text-red-400 font-bold"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </section>

        {/* COMPANY DETAILS */}
        <section className="bg-zinc-800 p-6 rounded-xl border border-violet-700 shadow-lg">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold text-violet-400">
              Company-wise Details
            </h2>

            <button
              type="button"
              onClick={addCompany}
              className="bg-violet-600 hover:bg-violet-700 px-3 py-1 rounded-md"
            >
              + Add Company
            </button>
          </div>

          {companies.map((c, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 mb-3">
              <input
                type="text"
                placeholder="Company Name"
                name="name"
                value={c.name || ""}
                onChange={(e) => handleCompanyChange(index, e)}
                className="bg-zinc-700 border border-zinc-600 p-2 rounded-md"
              />
              <input
                type="number"
                placeholder="Total Hires"
                name="total_hires"
                value={c.total_hires || ""}
                onChange={(e) => handleCompanyChange(index, e)}
                className="bg-zinc-700 border border-zinc-600 p-2 rounded-md"
              />
              <input
                type="number"
                placeholder="Avg CTC"
                name="avg_ctc"
                value={c.avg_ctc || ""}
                onChange={(e) => handleCompanyChange(index, e)}
                className="bg-zinc-700 border border-zinc-600 p-2 rounded-md"
              />

              {companies.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCompany(index)}
                  className="text-red-400 font-bold"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </section>

        {/* INTERNSHIP */}
        <section className="bg-zinc-800 p-6 rounded-xl border border-violet-700 shadow-lg">
          <h2 className="text-xl font-semibold text-violet-400 mb-4">
            Internship Data
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              ["Total Internships", "total_internships"],
              ["Paid Internships", "paid_internships"],
              ["Min Stipend", "min_stipend"],
              ["Max Stipend", "max_stipend"],
            ].map(([label, name]) => (
              <Input
                key={name}
                label={label}
                name={name}
                value={internships[name] || ""}
                onChange={handleInternshipChange}
              />
            ))}
          </div>
        </section>

        {/* SAVE */}
        <button
          type="submit"
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold"
        >
          ✨ Update Placement Data
        </button>
      </form>
    </div>
  );
}

// -------------------- INPUT COMPONENT --------------------
function Input({ label, name, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-400 mb-1">{label}</label>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        type="text"
        className="bg-zinc-700 border border-zinc-600 p-2 rounded-md"
      />
    </div>
  );
}
