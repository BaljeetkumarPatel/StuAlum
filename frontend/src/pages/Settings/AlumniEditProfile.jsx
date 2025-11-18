

import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { getCurrentUserIdFromToken } from "../../utils/authUtils";

const AlumniEditProfile = () => {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();
  const userId = storedUser?.id || getCurrentUserIdFromToken();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    contact_number: "",
    graduation_year: "",
    degree: "",
    current_position: "",
    company: "",
    industry: "",
    location: "",
    professional_achievements: "",
    years_of_experience: "",
    skills: "",
    linkedin_url: "",
    github_url: "",
    leetcode_url: "",
    contribution_preferences: "",
    preferred_communication: "",
    about_me: "",
    // DO NOT include is_verified, engagement_status, prospect_type, email (email shown read-only)
    email: ""
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [verificationFile, setVerificationFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!userId || !token) {
      setLoading(false);
      setError("Not authenticated. Please login.");
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/alumni/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data || {};

        setForm({
          full_name: data.full_name || "",
          contact_number: data.contact_number || "",
          graduation_year: data.graduation_year || "",
          degree: data.degree || "",
          current_position: data.current_position || "",
          company: data.company || "",
          industry: data.industry || "",
          location: data.location || "",
          professional_achievements: data.professional_achievements || "",
          years_of_experience: data.years_of_experience || "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : (data.skills || ""),
          linkedin_url: data.linkedin_url || "",
          github_url: data.github_url || "",
          leetcode_url: data.leetcode_url || "",
          contribution_preferences: Array.isArray(data.contribution_preferences) ? data.contribution_preferences.join(", ") : (data.contribution_preferences || ""),
          preferred_communication: Array.isArray(data.preferred_communication) ? data.preferred_communication.join(", ") : (data.preferred_communication || ""),
          about_me: data.about_me || "",
          email: data.email || ""
        });

        setPreviewUrl(data.profile_photo_url || "");
      } catch (err) {
        console.error("Failed to load alumni profile:", err?.response?.data || err.message);
        setError(err?.response?.data?.message || "Failed to load profile from server.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, token]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleFile = (setter) => (e) => {
    const f = e.target.files?.[0] || null;
    setter(f);
    if (setter === setPhotoFile && f) setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const fd = new FormData();

      // Allowed scalar fields
      [
        "full_name",
        "contact_number",
        "graduation_year",
        "degree",
        "current_position",
        "company",
        "industry",
        "location",
        "professional_achievements",
        "years_of_experience",
        "linkedin_url",
        "github_url",
        "leetcode_url",
        "about_me"
      ].forEach(k => {
        if (form[k] !== undefined && form[k] !== null) fd.append(k, String(form[k]));
      });

      // Arrays -> JSON
      const skillsArr = form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
      const contributionArr = form.contribution_preferences ? form.contribution_preferences.split(",").map(s => s.trim()).filter(Boolean) : [];
      const prefCommArr = form.preferred_communication ? form.preferred_communication.split(",").map(s => s.trim()).filter(Boolean) : [];

      fd.append("skills", JSON.stringify(skillsArr));
      fd.append("contribution_preferences", JSON.stringify(contributionArr));
      fd.append("preferred_communication", JSON.stringify(prefCommArr));

      // Files (optional)
      if (photoFile) fd.append("profile_photo_url", photoFile);
      if (verificationFile) fd.append("verificationFile", verificationFile);

      // IMPORTANT: do not append is_verified, prospect_type, engagement_status, or email (email is read-only)
      await api.patch(`/alumni/edit/${userId}`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      // redirect to alumni profile page
      //navigate(`/alumni/profile/${userId}`);

      //navigate to home page after successful update
      navigate(`/`);
    } catch (err) {
      console.error("Update failed:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading profile…</div>;
  if (!token) return <div style={{ padding: 20 }}>Please log in to edit your profile.</div>;

  return (
    <div style={{ maxWidth: 960, margin: "28px auto", padding: 16 }}>
      <h2>Your profile — update your alumni details</h2>
      {error && <div style={{ color: "crimson", margin: "8px 0" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        <Field label="Full name">
          <input value={form.full_name} onChange={(e) => handleChange("full_name", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Email (read-only)">
          <input value={form.email} readOnly style={{ ...inputStyle, background: "#f7f7f7" }} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <Field label="Graduation year">
              <input value={form.graduation_year} onChange={(e) => handleChange("graduation_year", e.target.value)} style={inputStyle} />
            </Field>
          </div>
          <div>
            <Field label="Degree">
              <input value={form.degree} onChange={(e) => handleChange("degree", e.target.value)} style={inputStyle} />
            </Field>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <Field label="Current position">
              <input value={form.current_position} onChange={(e) => handleChange("current_position", e.target.value)} style={inputStyle} />
            </Field>
          </div>
          <div>
            <Field label="Company">
              <input value={form.company} onChange={(e) => handleChange("company", e.target.value)} style={inputStyle} />
            </Field>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <Field label="Industry">
              <input value={form.industry} onChange={(e) => handleChange("industry", e.target.value)} style={inputStyle} />
            </Field>
          </div>
          <div>
            <Field label="Location">
              <input value={form.location} onChange={(e) => handleChange("location", e.target.value)} style={inputStyle} />
            </Field>
          </div>
        </div>

        <Field label="Professional achievements">
          <textarea value={form.professional_achievements} onChange={(e) => handleChange("professional_achievements", e.target.value)} style={{ ...inputStyle, minHeight: 120 }} />
        </Field>

        <Field label="Years of experience">
          <input value={form.years_of_experience} onChange={(e) => handleChange("years_of_experience", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Skills (comma separated)">
          <input value={form.skills} onChange={(e) => handleChange("skills", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Contribution preferences (comma separated)">
          <input value={form.contribution_preferences} onChange={(e) => handleChange("contribution_preferences", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Preferred communication (comma separated)">
          <input value={form.preferred_communication} onChange={(e) => handleChange("preferred_communication", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="LinkedIn URL">
          <input value={form.linkedin_url} onChange={(e) => handleChange("linkedin_url", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="GitHub URL">
          <input value={form.github_url} onChange={(e) => handleChange("github_url", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="LeetCode / Portfolio URL">
          <input value={form.leetcode_url} onChange={(e) => handleChange("leetcode_url", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="About / Bio">
          <textarea value={form.about_me} onChange={(e) => handleChange("about_me", e.target.value)} style={{ ...inputStyle, minHeight: 120 }} />
        </Field>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Profile photo</label>
          {previewUrl ? <img src={previewUrl} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} /> : null}
          <input type="file" accept="image/*" onChange={handleFile(setPhotoFile)} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Verification file (optional)</label>
          <input type="file" onChange={handleFile(setVerificationFile)} />
        </div>

        <div style={{ marginTop: 20 }}>
          <button type="submit" disabled={saving} style={btnStyle}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #ddd",
  boxSizing: "border-box",
};

const btnStyle = {
  padding: "10px 16px",
  background: "#6b21a8",
  color: "#fff",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};

export default AlumniEditProfile;
