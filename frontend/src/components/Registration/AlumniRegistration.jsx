import React, { useState } from "react";
import Select from "react-select";
import { colleges, courses, skills, hearAbout, mentorshipAreas } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: currentYear - 1979 }, (_, i) => {
  const year = 1980 + i;
  return { value: year.toString(), label: year.toString() };
});

const selectStyles = {
  menu: (provided) => ({
    ...provided,
    backgroundColor: "white",
    color: "black",
    border: "1.5px solid #a78bfa",
    zIndex: 100,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#a78bfa" : state.isFocused ? "#ede9fe" : "white",
    color: state.isSelected ? "white" : "#3b0764",
    fontWeight: state.isSelected ? "bold" : "normal",
    fontSize: "1rem",
  }),
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "white",
    color: "black",
    border: state.isFocused ? "2px solid #a78bfa" : "1.5px solid #a78bfa",
    boxShadow: state.isFocused ? "0 0 0 2px #a78bfa55" : provided.boxShadow,
    fontWeight: "bold",
    fontSize: "1rem",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#3b0764",
    fontWeight: "bold",
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#ede9fe",
    color: "#3b0764",
    fontWeight: "bold",
  }),
  input: (provided) => ({
    ...provided,
    color: "#3b0764",
    fontWeight: "bold",
  }),
};

const AlumniRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact_number: "",
    linkedin_url: "",
    github_url: "",
    leetcode_url: "",

    college_id: "",
    graduation_year: "",
    verificationFile: null,
    degree: "",

    current_position: "",
    company: "",
    industry: "",
    location: "",
    yearsOfExperience: "",
    skills: [],
    professional_achievements: "",

    contribution_preferences: [],
    communication: [],

    about_me: "",
    profile_photo_url: null,
    twitter: "",
    portfolio: "",
  });

  const steps = [
    "Quick Join",
    "Alumni Status",
    "Career Snapshot",
    "Contribution Style",
    "Personal Touch",
    "Review & Submit",
  ];

  const passwordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(formData.password);
  const confirmPasswordValid = formData.password === formData.confirmPassword;

  const isStepValid = () => {
    switch (step) {
      case 0:
        return (
          formData.full_name.trim() &&
          formData.email.trim() &&
          formData.password.trim() &&
          formData.confirmPassword.trim() &&
          formData.contact_number.trim() &&
          formData.linkedin_url.trim() &&
          formData.github_url.trim() &&
          formData.leetcode_url.trim() &&
          passwordValid &&
          confirmPasswordValid
        );
      case 1:
        return formData.college_id && formData.graduation_year && formData.degree && formData.verificationFile;
      case 2:
        return (
          formData.current_position &&
          formData.company &&
          formData.industry &&
          formData.location &&
          formData.yearsOfExperience &&
          formData.skills.length > 0
        );
      case 3:
        return formData.contribution_preferences.length > 0 && formData.communication.length > 0;
      default:
        return true;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    console.log("Submit clicked");

    const formPayload = new FormData();
    for (const key in formData) {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((item) => formPayload.append(key, item));
      } else if (formData[key] instanceof File) {
        formPayload.append(key, formData[key]);
      } else {
        formPayload.append(key, formData[key]);
      }
    }

    try {
      const res = await fetch("https://stualum.onrender.com/api/alumni/register", {
        method: "POST",
        body: formPayload,
      });

      const text = await res.text();
      console.log("Response text:", text);

      let result = {};
      try {
        result = JSON.parse(text);
      } catch {
        console.warn("Response is not valid JSON");
      }

      console.log("Parsed result:", result);
      console.log("Response ok:", res.ok);

      if (res.ok) {
        alert("Alumni registered successfully!");
        navigate('/login/alumni'); // Redirect to login page after successful signup
        return;
      } else {
        alert("Failed to register alumni: " + (result.error || res.statusText));
        return;
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error submitting form. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black text-white flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl bg-gray-900/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-between mb-2">
          {steps.map((label, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= step ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-400"
                }`}
              >
                {index + 1}
              </div>
              <p className={`text-xs mt-2 ${index === step ? "text-purple-400" : "text-gray-400"}`}>{label}</p>
            </div>
          ))}
        </div>
        <div className="relative h-2 mb-8">
          <div
            className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 rounded-full"
            style={{ transform: "translateY(-50%)" }}
          ></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-purple-600 rounded-full transition-all duration-300"
            style={{
              width: `${(step / (steps.length - 1)) * 100}%`,
              transform: "translateY(-50%)",
            }}
          ></div>
        </div>

        <h2 className="text-center text-2xl font-bold mb-2">
          Step {step + 1}: {steps[step]}
        </h2>
        <p className="text-center text-gray-400 mb-8">
          {step === 4
            ? "Add a personal touch to your profile – optional but highly recommended!"
            : "Please fill in the required details for this step."}
        </p>

        <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-6 space-y-4">
          {/* Step 0 */}
          {step === 0 && (
            <>
              <div className="flex gap-4 mb-3">
                <div className="w-1/2">
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full p-3 rounded bg-gray-700 text-white"
                  />
                </div>
                <div className="w-1/2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded bg-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4 mb-3">
                <div className="w-1/2">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 rounded bg-gray-700 text-white"
                  />
                  <small>Use at least one uppercase letter, one number, one special character, and minimum 8 characters.</small>
                  {!passwordValid && formData.password && (
                    <p className="text-red-400 text-xs mb-2">
                      Password must contain at least one uppercase letter, one number, one special character, and be at least 8 characters long.
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-3 rounded bg-gray-700 text-white"
                  />
                  {!confirmPasswordValid && formData.confirmPassword && (
                    <p className="text-red-400 text-xs mb-2">Confirm password should match the password.</p>
                  )}
                </div>
              </div>
              <input
                type="text"
                name="contact_number"
                placeholder="Phone Number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
              <input
                type="url"
                name="linkedin_url"
                placeholder="LinkedIn URL"
                value={formData.linkedin_url}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
              <input
                type="url"
                name="github_url"
                placeholder="GitHub URL"
                value={formData.github_url}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
              <input
                type="url"
                name="leetcode_url"
                placeholder="LeetCode URL"
                value={formData.leetcode_url}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
            </>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <>
              <Select
                options={colleges}
                name="college_id"
                placeholder="Select College"
                value={colleges.find((c) => c.value === formData.college_id) || null}
                onChange={(selected) => setFormData({ ...formData, college_id: selected ? selected.value : "" })}
                className="mb-3"
                styles={selectStyles}
              />
              <Select
                options={courses}
                name="degree"
                placeholder="Select Degree/Course"
                value={courses.find((c) => c.value === formData.degree) || null}
                onChange={(selected) => setFormData({ ...formData, degree: selected ? selected.value : "" })}
                className="mb-3"
                styles={selectStyles}
              />
              <Select
                options={graduationYears}
                name="graduation_year"
                placeholder="Select Graduation Year"
                value={graduationYears.find((y) => y.value === formData.graduation_year) || null}
                onChange={(selected) => setFormData({ ...formData, graduation_year: selected ? selected.value : "" })}
                className="mb-3"
                styles={selectStyles}
              />
              <div className="mb-3">
                <label className="block mb-1">Upload Verification File (ID, Certificate, etc.)</label>
                <input
                  type="file"
                  name="verificationFile"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-white text-black"
                />
                {formData.verificationFile && formData.verificationFile.type && formData.verificationFile.type.startsWith("image") && (
                  <img
                    src={URL.createObjectURL(formData.verificationFile)}
                    alt="Uploaded Preview"
                    className="mt-2 max-h-32 rounded shadow border"
                  />
                )}
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <input
                type="text"
                name="current_position"
                placeholder="Current Position"
                value={formData.current_position}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
              <input
                type="text"
                name="company"
                placeholder="Company"
                value={formData.company}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
              <input
                type="text"
                name="industry"
                placeholder="Industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
              <input
                type="number"
                name="yearsOfExperience"
                placeholder="Years of Experience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
              <Select
                isMulti
                options={skills}
                name="skills"
                placeholder="Select Skills"
                value={skills.filter((s) => formData.skills.includes(s.value))}
                onChange={(selected) => setFormData({ ...formData, skills: selected ? selected.map((s) => s.value) : [] })}
                className="mb-3"
                styles={selectStyles}
              />
              <textarea
                name="professional_achievements"
                placeholder="Professional Achievements"
                value={formData.professional_achievements}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <Select
                isMulti
                options={mentorshipAreas}
                name="contribution_preferences"
                placeholder="Contribution Areas"
                value={mentorshipAreas.filter((a) => formData.contribution_preferences.includes(a.value))}
                onChange={(selected) => setFormData({ ...formData, contribution_preferences: selected ? selected.map((a) => a.value) : [] })}
                className="mb-3"
                styles={selectStyles}
              />
              <Select
                isMulti
                options={hearAbout}
                name="communication"
                placeholder="Preferred Communication"
                value={hearAbout.filter((c) => formData.communication.includes(c.value))}
                onChange={(selected) => setFormData({ ...formData, communication: selected ? selected.map((c) => c.value) : [] })}
                className="mb-3"
                styles={selectStyles}
              />
            </>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <>
              <textarea
                name="about_me"
                placeholder="Tell us about yourself..."
                value={formData.about_me}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
              <input
                type="file"
                name="profile_photo_url"
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
              <input
                type="url"
                name="twitter"
                placeholder="Twitter URL"
                value={formData.twitter}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
              <input
                type="url"
                name="portfolio"
                placeholder="Portfolio/Website"
                value={formData.portfolio}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white mb-3"
              />
            </>
          )}

          {/* Step 5 (Review & Submit) */}
          {step === 5 && (
            <div className="space-y-2 text-gray-300">
              <div className="bg-gray-700 p-4 rounded mb-4">
                <h3 className="text-lg font-bold mb-2 text-purple-300">Quick Join</h3>
                <p><strong>Full Name:</strong> {formData.full_name || "Not provided"}</p>
                <p><strong>Email:</strong> {formData.email || "Not provided"}</p>
                <p><strong>Phone:</strong> {formData.contact_number || "Not provided"}</p>
                <p><strong>LinkedIn:</strong> {formData.linkedin_url || "Not provided"}</p>
                <p><strong>GitHub:</strong> {formData.github_url || "Not provided"}</p>
                <p><strong>LeetCode:</strong> {formData.leetcode_url || "Not provided"}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded mb-4">
                <h3 className="text-lg font-bold mb-2 text-purple-300">Alumni Status</h3>
                <p><strong>College:</strong> {formData.college_id || "Not provided"}</p>
                <p><strong>Degree:</strong> {formData.degree || "Not provided"}</p>
                <p><strong>Graduation Year:</strong> {formData.graduation_year || "Not provided"}</p>
                <p><strong>ID File:</strong> {formData.verificationFile ? "Uploaded" : "Not uploaded"}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded mb-4">
                <h3 className="text-lg font-bold mb-2 text-purple-300">Career Snapshot</h3>
                <p><strong>Current Position:</strong> {formData.current_position || "Not provided"}</p>
                <p><strong>Company:</strong> {formData.company || "Not provided"}</p>
                <p><strong>Industry:</strong> {formData.industry || "Not provided"}</p>
                <p><strong>Location:</strong> {formData.location || "Not provided"}</p>
                <p><strong>Years of Experience:</strong> {formData.yearsOfExperience || "Not provided"}</p>
                <p><strong>Skills:</strong> {formData.skills.length > 0 ? formData.skills.join(", ") : "None"}</p>
                <p><strong>Achievements:</strong> {formData.professional_achievements || "Not provided"}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded mb-4">
                <h3 className="text-lg font-bold mb-2 text-purple-300">Contribution Style</h3>
                <p><strong>Contribution Areas:</strong> {formData.contribution_preferences.length > 0 ? formData.contribution_preferences.join(", ") : "None"}</p>
                <p><strong>Preferred Communication:</strong> {formData.communication.length > 0 ? formData.communication.join(", ") : "None"}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded mb-4">
                <h3 className="text-lg font-bold mb-2 text-purple-300">Personal Touch</h3>
                <p><strong>About Me:</strong> {formData.about_me || "Not provided"}</p>
                <p><strong>Twitter:</strong> {formData.twitter || "Not provided"}</p>
                <p><strong>Portfolio:</strong> {formData.portfolio || "Not provided"}</p>
                <p><strong>Profile Photo:</strong> {formData.profile_photo_url ? "Uploaded" : "Not uploaded"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => isStepValid() && setStep(step + 1)}
              disabled={!isStepValid()}
              className={`ml-auto px-6 py-2 rounded-lg transition ${
                isStepValid() ? "bg-purple-600 hover:bg-purple-500" : "bg-gray-700 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="ml-auto px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniRegistration;
