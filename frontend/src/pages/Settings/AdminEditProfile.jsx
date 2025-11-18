import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { getCurrentUserIdFromToken, getCurrentUserRole } from "../../utils/authUtils";

const AdminEditProfile = () => {
  const userRole = getCurrentUserRole();
  const userId = getCurrentUserIdFromToken();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    designation: "",
    department: "",
    contact_office: "",
    college: "",
  });

  // ❌ If token missing or role not admin → block
  if (!token || userRole !== "admin") {
    return <div>Only admin can edit this profile.</div>;
  }

  // 🔥 CORRECT FETCH URL NOW
  useEffect(() => {
    if (!userId) {
      setError("User ID missing from token");
      setLoading(false);
      return;
    }

    api
      .get(`/admin/profile/${userId}`)
      .then((res) => {
        const data = res.data || {};
        setForm({
          full_name: data.full_name || "",
          designation: data.designation || "",
          department: data.department || "",
          contact_office: data.contact_office || "",
          college: data.college || "",
        });
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load admin profile.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 🔥 CORRECT PATCH URL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.patch(`/admin/edit/${userId}`, form);
      alert("Admin profile updated");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: "28px auto", padding: 16 }}>
      <h2>Edit Admin Profile</h2>

      {loading && <p>Loading...</p>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        <Field label="Full name">
          <input
            value={form.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="Designation">
          <input
            value={form.designation}
            onChange={(e) => handleChange("designation", e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="Department">
          <input
            value={form.department}
            onChange={(e) => handleChange("department", e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="Contact office">
          <input
            value={form.contact_office}
            onChange={(e) => handleChange("contact_office", e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="College">
          <input
            value={form.college}
            onChange={(e) => handleChange("college", e.target.value)}
            style={inputStyle}
          />
        </Field>

        <button type="submit" disabled={saving} style={btnStyle}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #ccc",
};

const btnStyle = {
  padding: "10px 16px",
  background: "#0b5cff",
  color: "white",
  borderRadius: 6,
  cursor: "pointer",
  border: "none",
};

export default AdminEditProfile;
