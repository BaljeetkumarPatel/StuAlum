import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { getCurrentUserIdFromToken } from "../../utils/authUtils";

const StudentEditProfile = () => {
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
    enrollment_number: "",
    email: "",
    branch: "",
    year_of_admission: "",
    year_of_graduation: "",
    contact_number: "",
    address: "",
    skills: "",
    interests: "",
    career_goals: "",
    discovery_insights: "",
    preferences: "",
    current_position: "",
    company: "",
    linkedin: "",
    github: "",
    extracurricular: "",
    mentorship_area: "",
    mentor_type: "",
    communication: "",
    hear_about: "",
    projects: "",
    notifications: {
      mentorship: true,
      events: true,
      community: false,
      content: true,
    },
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
        const res = await api.get(`/student/profile/${userId}`);
        const data = res.data || {};

        setForm({
          full_name: data.full_name || "",
          enrollment_number: data.enrollment_number || "",
          email: data.email || "",
          branch: data.branch || "",
          year_of_admission: data.year_of_admission || "",
          year_of_graduation: data.year_of_graduation || "",
          contact_number: data.contact_number || "",
          address: data.address || "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : (data.skills || ""),
          interests: Array.isArray(data.interests) ? data.interests.join(", ") : (data.interests || ""),
          career_goals: data.career_goals || "",
          discovery_insights: data.discovery_insights || "",
          preferences: data.preferences || "",
          current_position: data.current_position || "",
          company: data.company || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
          extracurricular: data.extracurricular || "",
          mentorship_area: data.mentorship_area || "",
          mentor_type: data.mentor_type || "",
          communication: Array.isArray(data.communication) ? data.communication.join(", ") : (data.communication || ""),
          hear_about: data.hear_about || "",
          projects: Array.isArray(data.projects) ? JSON.stringify(data.projects, null, 2) : (data.projects ? JSON.stringify(data.projects, null, 2) : ""),
          notifications: Object.assign({
            mentorship: true,
            events: true,
            community: false,
            content: true,
          }, data.notifications || {}),
        });

        setPreviewUrl(data.photo || data.profile_photo_url || "");
      } catch (err) {
        console.error("Failed to load student profile:", err?.response?.data || err.message);
        setError(err?.response?.data?.message || "Failed to load profile from server.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, token]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleNotificationChange = (key, value) => {
    setForm(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: !!value } }));
  };

  const handleFile = (setter, e) => {
    const f = e.target.files?.[0] || null;
    setter(f);
    if (setter === setPhotoFile && f) setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();

      // Basic scalar fields
      [
        "full_name","enrollment_number","email","branch",
        "year_of_admission","year_of_graduation","contact_number","address",
        "career_goals","discovery_insights","preferences","current_position",
        "company","linkedin","github","extracurricular","mentorship_area",
        "mentor_type","hear_about"
      ].forEach(k => {
        if (form[k] !== undefined && form[k] !== null) fd.append(k, String(form[k]));
      });

      // Arrays: convert comma-separated strings into arrays and stringify
      const skillsArr = form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
      const interestsArr = form.interests ? form.interests.split(",").map(s => s.trim()).filter(Boolean) : [];
      const communicationArr = form.communication ? form.communication.split(",").map(s => s.trim()).filter(Boolean) : [];

      fd.append("skills", JSON.stringify(skillsArr));
      fd.append("interests", JSON.stringify(interestsArr));
      fd.append("communication", JSON.stringify(communicationArr));

      // projects: parse JSON or fallback to titles
      let projectsValue = [];
      if (form.projects) {
        try {
          projectsValue = JSON.parse(form.projects);
        } catch (err) {
          projectsValue = form.projects.split(",").map(s => s.trim()).filter(Boolean).map(title => ({ title }));
        }
      }
      fd.append("projects", JSON.stringify(projectsValue));

      // notifications object
      fd.append("notifications", JSON.stringify(form.notifications || {}));

      // files
      if (photoFile) fd.append("photo", photoFile);
      if (verificationFile) fd.append("verificationFile", verificationFile);

      await api.patch(`/student/edit/${userId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/");
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
      <h2>Edit Student Profile</h2>
      {error && <div style={{ color: "crimson", margin: "8px 0" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        <Field label="Full name">
          <input value={form.full_name} onChange={(e) => handleChange("full_name", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Enrollment number">
          <input value={form.enrollment_number} onChange={(e) => handleChange("enrollment_number", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Email (read-only)">
          <input value={form.email} readOnly style={{ ...inputStyle, background: "#f7f7f7" }} />
        </Field>

        <Field label="Branch">
          <input value={form.branch} onChange={(e) => handleChange("branch", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Year of admission">
          <input type="number" value={form.year_of_admission} onChange={(e) => handleChange("year_of_admission", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Year of graduation">
          <input type="number" value={form.year_of_graduation} onChange={(e) => handleChange("year_of_graduation", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Contact number">
          <input value={form.contact_number} onChange={(e) => handleChange("contact_number", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Address">
          <textarea value={form.address} onChange={(e) => handleChange("address", e.target.value)} style={{ ...inputStyle, minHeight: 80 }} />
        </Field>

        <Field label="Skills (comma separated)">
          <input value={form.skills} onChange={(e) => handleChange("skills", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Interests (comma separated)">
          <input value={form.interests} onChange={(e) => handleChange("interests", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Career goals">
          <textarea value={form.career_goals} onChange={(e) => handleChange("career_goals", e.target.value)} style={{ ...inputStyle, minHeight: 80 }} />
        </Field>

        <Field label="Discovery insights">
          <textarea value={form.discovery_insights} onChange={(e) => handleChange("discovery_insights", e.target.value)} style={{ ...inputStyle, minHeight: 80 }} />
        </Field>

        <Field label="Preferences">
          <input value={form.preferences} onChange={(e) => handleChange("preferences", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Current position">
          <input value={form.current_position} onChange={(e) => handleChange("current_position", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Company">
          <input value={form.company} onChange={(e) => handleChange("company", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="LinkedIn URL">
          <input value={form.linkedin} onChange={(e) => handleChange("linkedin", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="GitHub URL">
          <input value={form.github} onChange={(e) => handleChange("github", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Extracurricular">
          <textarea value={form.extracurricular} onChange={(e) => handleChange("extracurricular", e.target.value)} style={{ ...inputStyle, minHeight: 60 }} />
        </Field>

        <Field label="Mentorship area">
          <input value={form.mentorship_area} onChange={(e) => handleChange("mentorship_area", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Mentor type">
          <input value={form.mentor_type} onChange={(e) => handleChange("mentor_type", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="Preferred communication (comma separated)">
          <input value={form.communication} onChange={(e) => handleChange("communication", e.target.value)} style={inputStyle} />
        </Field>

        <Field label="How did you hear about us?">
          <input value={form.hear_about} onChange={(e) => handleChange("hear_about", e.target.value)} style={inputStyle} />
        </Field>

        <Field label='Projects (JSON array) — example: [{"title":"P1","desc":"..."}] or comma list'>
          <textarea value={form.projects} onChange={(e) => handleChange("projects", e.target.value)} style={{ ...inputStyle, minHeight: 100 }} />
        </Field>

        <Field label="Notifications">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label><input type="checkbox" checked={!!form.notifications?.mentorship} onChange={(e) => handleNotificationChange("mentorship", e.target.checked)} /> Mentorship</label>
            <label><input type="checkbox" checked={!!form.notifications?.events} onChange={(e) => handleNotificationChange("events", e.target.checked)} /> Events</label>
            <label><input type="checkbox" checked={!!form.notifications?.community} onChange={(e) => handleNotificationChange("community", e.target.checked)} /> Community</label>
            <label><input type="checkbox" checked={!!form.notifications?.content} onChange={(e) => handleNotificationChange("content", e.target.checked)} /> Content</label>
          </div>
        </Field>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Profile photo (photo)</label>
          {previewUrl ? <img src={previewUrl} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} /> : null}
          <input type="file" accept="image/*" onChange={(e) => handleFile(setPhotoFile, e)} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Verification file (ID / document)</label>
          <input type="file" onChange={(e) => handleFile(setVerificationFile, e)} />
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

// Field + styles
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
  background: "#0b5cff",
  color: "#fff",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};

export default StudentEditProfile;



