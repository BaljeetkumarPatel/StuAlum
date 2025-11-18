import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentUserRole } from "../../utils/authUtils";

export default function PlacementUpload() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    total_students: "",
    total_eligible: "",
    total_placed: "",
    higher_studies: "",
    avg_ctc: "",
    highest_ctc: "",
    median_ctc: "",
  });

  const [branches, setBranches] = useState([
    { name: "CSE", eligible: "", placed: "", higher_studies: "", avg_ctc: "", highest_ctc: "", lowest_ctc: "" },
  ]);

  const [companies, setCompanies] = useState([
    { name: "", total_hires: "", avg_ctc: "", branches: {} },
  ]);

  const [internships, setInternships] = useState({
    total_internships: "",
    paid_internships: "",
    min_stipend: "",
    max_stipend: "",
  });

  // ✅ Restrict non-admin users
  useEffect(() => {
    const role = getCurrentUserRole();
    setIsAdmin(role === "admin");
    setLoading(false);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleInternshipChange = (e) =>
    setInternships({ ...internships, [e.target.name]: e.target.value });

  const handleBranchChange = (index, e) => {
    const updated = [...branches];
    updated[index][e.target.name] = e.target.value;
    setBranches(updated);
  };

  const handleCompanyChange = (index, e) => {
    const updated = [...companies];
    updated[index][e.target.name] = e.target.value;
    setCompanies(updated);
  };

  const addBranch = () =>
    setBranches([
      ...branches,
      { name: "", eligible: "", placed: "", higher_studies: "", avg_ctc: "", highest_ctc: "", lowest_ctc: "" },
    ]);
  const addCompany = () =>
    setCompanies([...companies, { name: "", total_hires: "", avg_ctc: "", branches: {} }]);

  const removeBranch = (i) => setBranches(branches.filter((_, index) => index !== i));
  const removeCompany = (i) => setCompanies(companies.filter((_, index) => index !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = { ...form, branches, companies, internships };

      await axios.post("http://localhost:5000/api/placement/upload", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Placement data uploaded successfully!");
      setForm({
        year: new Date().getFullYear(),
        total_students: "",
        total_eligible: "",
        total_placed: "",
        higher_studies: "",
        avg_ctc: "",
        highest_ctc: "",
        median_ctc: "",
      });
      setBranches([{ name: "CSE", eligible: "", placed: "", higher_studies: "", avg_ctc: "", highest_ctc: "", lowest_ctc: "" }]);
      setCompanies([{ name: "", total_hires: "", avg_ctc: "", branches: {} }]);
      setInternships({ total_internships: "", paid_internships: "", min_stipend: "", max_stipend: "" });
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Upload failed. Check console for details.");
    }
  };

  if (loading) return <div className="text-center text-gray-400 mt-10">Loading...</div>;
  if (!isAdmin)
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-red-400 text-lg font-semibold">
        🚫 Access Denied — Only Admins Can Upload Placement Data
      </div>
    );

  return (
    <div className="p-8 max-w-6xl mx-auto bg-zinc-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-violet-400 mb-8 text-center">
        Placement Data Upload (Admin Panel)
      </h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* --- SUMMARY SECTION --- */}
        <section className="bg-zinc-800 p-6 rounded-xl border border-violet-700 shadow-lg">
          <h2 className="text-xl font-semibold text-violet-400 mb-4">General Information</h2>
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
            ].map(([label, name]) => (
              <Input key={name} label={label} name={name} value={form[name]} onChange={handleChange} />
            ))}
          </div>
        </section>

        {/* --- BRANCH DETAILS --- */}
        <section className="bg-zinc-800 p-6 rounded-xl border border-violet-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-violet-400">Branch-wise Details</h2>
            <button
              type="button"
              onClick={addBranch}
              className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-md"
            >
              + Add Branch
            </button>
          </div>

          {branches.map((branch, index) => (
            <div key={index} className="grid grid-cols-7 gap-2 mb-3">
              {["name", "eligible", "placed", "higher_studies", "avg_ctc", "highest_ctc", "lowest_ctc"].map((field) => (
                <input
                  key={field}
                  type={field === "name" ? "text" : "number"}
                  placeholder={field.replace("_", " ")}
                  name={field}
                  value={branch[field]}
                  onChange={(e) => handleBranchChange(index, e)}
                  className="bg-zinc-700 border border-zinc-600 p-2 rounded-md text-gray-100"
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

        {/* --- COMPANY DETAILS --- */}
        <section className="bg-zinc-800 p-6 rounded-xl border border-violet-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-violet-400">Company-wise Details</h2>
            <button
              type="button"
              onClick={addCompany}
              className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-md"
            >
              + Add Company
            </button>
          </div>

          {companies.map((company, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 mb-3">
              <input
                type="text"
                placeholder="Company Name"
                name="name"
                value={company.name}
                onChange={(e) => handleCompanyChange(index, e)}
                className="bg-zinc-700 border border-zinc-600 p-2 rounded-md text-gray-100"
              />
              <input
                type="number"
                placeholder="Total Hires"
                name="total_hires"
                value={company.total_hires}
                onChange={(e) => handleCompanyChange(index, e)}
                className="bg-zinc-700 border border-zinc-600 p-2 rounded-md text-gray-100"
              />
              <input
                type="number"
                placeholder="Avg CTC (LPA)"
                name="avg_ctc"
                value={company.avg_ctc}
                onChange={(e) => handleCompanyChange(index, e)}
                className="bg-zinc-700 border border-zinc-600 p-2 rounded-md text-gray-100"
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

        {/* --- INTERNSHIP SECTION --- */}
        <section className="bg-zinc-800 p-6 rounded-xl border border-violet-700 shadow-lg">
          <h2 className="text-xl font-semibold text-violet-400 mb-4">Internship Data</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              ["Total Internships", "total_internships"],
              ["Paid Internships", "paid_internships"],
              ["Min Stipend (₹/month)", "min_stipend"],
              ["Max Stipend (₹/month)", "max_stipend"],
            ].map(([label, name]) => (
              <Input
                key={name}
                label={label}
                name={name}
                value={internships[name]}
                onChange={handleInternshipChange}
              />
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-semibold transition"
        >
          🚀 Upload Placement Data
        </button>
      </form>
    </div>
  );
}

// 🔹 Reusable Input
function Input({ label, name, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-400 mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type="text"
        className="bg-zinc-700 border border-zinc-600 p-2 rounded-md text-gray-100 focus:ring-1 focus:ring-violet-500"
      />
    </div>
  );
}
