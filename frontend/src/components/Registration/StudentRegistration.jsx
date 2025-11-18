import React, { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

import { colleges, courses, careerGoals, skills, hearAbout, mentorTypes, mentorshipAreas } from "../../assets/assets";

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

const StudentRegistration = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    college: "",
    enrollment: "",
    verificationFile: null,
    photo: null,
    address: "",
    course: "",
    year: "",
    yearOfAdmission: "",
    yearOfGraduation: "",
    skills: [],
    careerGoal: "",
    hearAbout: "",
    mentorshipArea: "",
    mentorType: "",
    communication: [],
    notifications: {
      mentorship: true,
      events: true,
      community: false,
      content: true,
    },
    discoveryInsights: "",
    preferences: "",
    linkedinUrl: "",
    githubUrl: "",
    extracurricular: "",
  });

  const passwordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(formData.password);
  const confirmPasswordValid = formData.password === formData.confirmPassword;

  const isStepValid = () => {
    switch (step) {
      case 0:
        return (
          formData.fullName.trim() &&
          formData.email.trim() &&
          formData.password.trim() &&
          formData.confirmPassword.trim() &&
          formData.phone.trim() &&
          passwordValid &&
          confirmPasswordValid
        );
      case 1:
        return (
          formData.college &&
          formData.enrollment.trim() &&
          formData.verificationFile &&
          formData.address.trim() &&
          formData.photo
        );
      case 2:
        return (
          formData.course &&
          formData.year &&
          formData.skills.length > 0 &&
          formData.careerGoal &&
          formData.yearOfAdmission &&
          formData.yearOfGraduation
        );
      case 3:
        return formData.hearAbout && formData.mentorshipArea;
      case 4:
        return formData.mentorType.trim() !== "" && formData.communication.length > 0;
      default:
        return true;
    }
  };

  const steps = [
    "Account Setup",
    "Student Verification",
    "Profile Details",
    "Discovery Insights",
    "Preferences & Notifications",
    "Review & Submit",
  ];

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "checkbox" && name.startsWith("notifications")) {
      const notifKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [notifKey]: checked },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const mappedData = {
      full_name: formData.fullName,
      enrollment_number: formData.enrollment,
      email: formData.email,
      password: formData.password,
      branch: formData.course,
      year_of_admission: formData.yearOfAdmission,
      year_of_graduation: formData.yearOfGraduation,
      contact_number: formData.phone,
      address: formData.address,
      verificationFile: formData.verificationFile,
      photo: formData.photo,
      skills: formData.skills,
      career_goal: formData.careerGoal,
      mentorship_area: formData.mentorshipArea,
      mentor_type: formData.mentorType,
      communication: formData.communication,
      notifications: formData.notifications,
      discovery_insights: formData.hearAbout,
      preferences: formData.mentorshipArea,
      linkedin_url: formData.linkedinUrl,
      github_url: formData.githubUrl,
      extracurricular: formData.extracurricular,
    };

    const formPayload = new FormData();
    for (const key in mappedData) {
      const val = mappedData[key];
      if (Array.isArray(val)) {
        val.forEach((item) => formPayload.append(key, item));
      } else if (val instanceof File) {
        formPayload.append(key, val);
      } else if (typeof val === "object" && val !== null && key === "notifications") {
        Object.entries(val).forEach(([notifKey, notifVal]) => {
          formPayload.append(`notifications[${notifKey}]`, notifVal);
        });
      } else if (val !== undefined && val !== null) {
        formPayload.append(key, val);
      }
    }

    try {
      const res = await fetch("http://localhost:5000/api/student/register", {
        method: "POST",
        body: formPayload,
      });

      const text = await res.text();
      let result = {};
      try {
        result = JSON.parse(text);
      } catch {
        console.warn("Response is not valid JSON");
      }

      if (res.ok) {
        alert("Student registered successfully!");
        setStep(0);
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          college: "",
          enrollment: "",
          verificationFile: null,
          photo: null,
          address: "",
          course: "",
          year: "",
          yearOfAdmission: "",
          yearOfGraduation: "",
          skills: [],
          careerGoal: "",
          hearAbout: "",
          mentorshipArea: "",
          mentorType: "",
          communication: [],
          notifications: {
            mentorship: true,
            events: true,
            community: false,
            content: true,
          },
          discoveryInsights: "",
          preferences: "",
          linkedinUrl: "",
          githubUrl: "",
          extracurricular: "",
        });
        navigate("/login/student");
      } else {
        alert("Failed to register student: " + (result.error || res.statusText));
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error submitting form. Please try again.");
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black text-white flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl bg-gray-900/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
          {/* Progress Steps */}
          <div className="flex justify-between mb-2">
            {steps.map((label, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= step ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
                >
                  {index + 1}
                </div>
                {/* <span className="text-xs mt-2">{label}</span> */}
                <p className={`text-xs mt-2 ${index === step ? "text-purple-400" : "text-gray-400"}`}>{label}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 mb-6">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 rounded-full" style={{ transform: "translateY(-50%)" }}></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-purple-600 rounded-full transition-all duration-300"
              style={{
                width: `${(step / (steps.length - 1)) * 100}%`,
                transform: "translateY(-50%)",
              }}
            ></div>
          </div>

          {/* Step 0 */}
          {step === 0 && (
            <div className="border p-6 rounded-lg shadow-md">
              <div className="text-center py-10 px-4 bg-blue-700 rounded mb-4">
                <h2 className="text-4xl font-bold text-white">Start Your Journey with StuAlum</h2>
                <p className="text-sm text-gray-200 mt-2">Enter your basic details to create your student account.</p>
              </div>
              <div>
                <label className="block mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="border p-2 w-full mb-3 rounded"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                <label className="block mb-1 font-semibold">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="border p-2 w-full mb-3 rounded"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <small className="block mb-3 text-gray-500">A verification link will be sent to this email</small>
                <label className="block mb-1 font-semibold">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  className="border p-2 w-full mb-3 rounded"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {!passwordValid && formData.password && (
                  <p className="text-red-600 text-xs mb-3">Password must be at least 8 characters including uppercase, number, and special char.</p>
                )}
                <label className="block mb-1 font-semibold">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="border p-2 w-full rounded"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                {!confirmPasswordValid && formData.confirmPassword && (
                  <p className="text-red-600 text-xs mb-3">Confirmation password must match.</p>
                )}
                <label className="block mb-1 font-semibold">Phone</label>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="border p-2 w-full rounded"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <label className="block mb-1 font-semibold">College / University</label>
              <Select
                options={colleges}
                placeholder="Select College"
                value={colleges.find((c) => c.value === formData.college) || null}
                onChange={(sel) => setFormData({ ...formData, college: sel ? sel.value : "" })}
                className="mb-3"
                styles={selectStyles}
              />
              <label className="block mb-1 font-semibold">Enrollment Number</label>
              <input
                type="text"
                placeholder="Enrollment Number"
                className="border p-2 w-full mb-3 rounded"
                value={formData.enrollment}
                onChange={(e) => setFormData({ ...formData, enrollment: e.target.value })}
              />
              <label className="block mb-1 font-semibold">Address</label>
              <input
                type="text"
                placeholder="Address"
                className="border p-2 w-full mb-3 rounded"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />

              {/* Photo upload */}
              <label htmlFor="photoFile" className="block mb-1 font-semibold">
                Photo (JPEG/PNG, Max 5MB)
              </label>
              <label className="flex items-center justify-center border-2 border-dashed border-green-400 rounded p-6 cursor-pointer hover:bg-green-50 mb-3">
                <CloudArrowUpIcon className="h-10 w-10 text-green-500 mr-3" />
                <span>Upload Photo</span>
                <input
                  id="photoFile"
                  name="photo"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.size <= 5 * 1024 * 1024) {
                      setFormData({ ...formData, photo: file });
                    } else {
                      alert("Photo size exceeds 5MB limit");
                    }
                  }}
                />
              </label>
              {formData.photo && (
                <p className="text-sm text-gray-700">Selected Photo: {formData.photo.name}</p>
              )}

              {/* Verification file upload */}
              <label htmlFor="verificationFile" className="block mb-1 font-semibold">
                Verification File
              </label>
              <label className="flex items-center justify-center border-2 border-dashed border-blue-400 rounded p-6 cursor-pointer hover:bg-blue-50 mb-3">
                <CloudArrowUpIcon className="h-10 w-10 text-blue-500 mr-3" />
                <span>Upload Verification Document (Max 5MB, JPG/PNG/PDF)</span>
                <input
                  id="verificationFile"
                  name="verificationFile"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.size <= 5 * 1024 * 1024) {
                      setFormData({ ...formData, verificationFile: file });
                    } else {
                      alert("File size exceeds 5MB limit");
                    }
                  }}
                />
              </label>
              {formData.verificationFile && (
                <p className="text-sm text-gray-700">Selected File: {formData.verificationFile.name}</p>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <label className="block mb-1 font-semibold">Course</label>
              <Select
                options={courses}
                placeholder="Select Course"
                value={courses.find((c) => c.value === formData.course) || null}
                onChange={(sel) => setFormData({ ...formData, course: sel ? sel.value : "" })}
                className="mb-3"
                styles={selectStyles}
              />
              <label className="block mb-1 font-semibold">Year of Study</label>
              <Select
                options={[
                  { value: "1st", label: "1st Year" },
                  { value: "2nd", label: "2nd Year" },
                  { value: "3rd", label: "3rd Year" },
                  { value: "4th", label: "4th Year" },
                ]}
                placeholder="Select Year"
                value={formData.year ? { value: formData.year, label: `${formData.year} Year` } : null}
                onChange={(sel) => setFormData({ ...formData, year: sel ? sel.value : "" })}
                className="mb-3"
                styles={selectStyles}
              />
              <label className="block mb-1 font-semibold">Year of Admission</label>
              <select
                className="border p-2 w-full mb-3 rounded"
                value={formData.yearOfAdmission}
                onChange={(e) => setFormData({ ...formData, yearOfAdmission: e.target.value })}
              >
                <option value="">Select Year of Admission</option>
                {[...Array(10)].map((_, idx) => {
                  const year = 2025 - idx;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
              <label className="block mb-1 font-semibold">Year of Graduation</label>
              <select
                className="border p-2 w-full mb-3 rounded"
                value={formData.yearOfGraduation}
                onChange={(e) => setFormData({ ...formData, yearOfGraduation: e.target.value })}
              >
                <option value="">Select Year of Graduation</option>
                {[...Array(10)].map((_, idx) => {
                  const year = 2025 + idx;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
              <label className="block mb-1 font-semibold">Skills & Interests (max 10)</label>
              <Select
                options={skills}
                isMulti
                placeholder="Select Skills"
                value={skills.filter((s) => formData.skills.includes(s.value))}
                onChange={(options) => {
                  if (options.length <= 10) {
                    setFormData({ ...formData, skills: options.map((o) => o.value) });
                  } else {
                    alert("Maximum 10 skills allowed");
                  }
                }}
                className="mb-3"
                styles={selectStyles}
              />
              <label className="block mb-1 font-semibold">Career Goal</label>
              <Select
                options={careerGoals}
                placeholder="Select Career Goal"
                value={careerGoals.find((c) => c.value === formData.careerGoal) || null}
                onChange={(sel) => setFormData({ ...formData, careerGoal: sel ? sel.value : "" })}
                className="mb-3"
                styles={selectStyles}
              />
              <label className="block mb-1 font-semibold">LinkedIn URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                className="border p-2 w-full mb-3 rounded"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              />
              <label className="block mb-1 font-semibold">GitHub URL</label>
              <input
                type="url"
                placeholder="https://github.com/yourprofile"
                className="border p-2 w-full mb-3 rounded"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              />
              <label className="block mb-1 font-semibold">Extracurricular Activities</label>
              <textarea
                placeholder="Describe your extracurricular activities"
                className="border p-2 w-full mb-3 rounded"
                value={formData.extracurricular}
                onChange={(e) => setFormData({ ...formData, extracurricular: e.target.value })}
                rows={3}
              />
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <label className="block mb-1 font-semibold">How did you hear about us?</label>
              <Select
                options={hearAbout}
                placeholder="Select Option"
                value={hearAbout.find((h) => h.value === formData.hearAbout) || null}
                onChange={(sel) => setFormData({ ...formData, hearAbout: sel ? sel.value : "" })}
                className="mb-3"
                styles={selectStyles}
              />
              <label className="block mb-1 font-semibold">Mentorship Area</label>
              <Select
                options={mentorshipAreas}
                placeholder="Select Mentorship Area"
                value={mentorshipAreas.find((m) => m.value === formData.mentorshipArea) || null}
                onChange={(sel) => setFormData({ ...formData, mentorshipArea: sel ? sel.value : "" })}
                className="mb-3"
                styles={selectStyles}
              />
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div>
              <label className="block mb-1 font-semibold">
                Preferred Mentor Type <span className="text-red-600">*</span>
              </label>
              <Select
                options={mentorTypes}
                placeholder="Select Mentor Type"
                value={mentorTypes.find((m) => m.value === formData.mentorType) || null}
                onChange={(sel) => setFormData({ ...formData, mentorType: sel ? sel.value : "" })}
                className="mb-3"
                styles={selectStyles}
              />
              {formData.mentorType.trim() === "" && (
                <p className="text-red-600 text-xs mb-3">Please select a mentor type.</p>
              )}
              <label className="block mb-1 font-semibold">Preferred Communication Method</label>
              <div className="flex flex-col gap-3 mb-3">
                {["In-app Chat", "Email", "Phone/WhatsApp"].map((method) => (
                  <label key={method} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={method}
                      checked={formData.communication.includes(method)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (e.target.checked) {
                          setFormData({ ...formData, communication: [...formData.communication, val] });
                        } else {
                          setFormData({
                            ...formData,
                            communication: formData.communication.filter((c) => c !== val),
                          });
                        }
                      }}
                      className="h-4 w-4"
                    />
                    {method}
                  </label>
                ))}
              </div>

              <label className="block mb-1 font-semibold">Notification Preferences</label>
              <div className="flex flex-col gap-3">
                {[
                  { key: "mentorship", label: "Mentorship Updates" },
                  { key: "events", label: "Event Notifications" },
                  { key: "community", label: "Community Updates" },
                  { key: "content", label: "Content Updates" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex justify-between items-center border p-3 rounded-lg cursor-pointer">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      name={`notifications.${key}`}
                      checked={formData.notifications[key]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notifications: { ...formData.notifications, [key]: e.target.checked },
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">Review & Submit</h3>

              <div className="bg-gray-100 p-4 rounded mb-3">
                <h4 className="font-semibold mb-2">Basic Info</h4>
                <p><strong>Name:</strong> {formData.fullName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
              </div>

              <div className="bg-gray-100 p-4 rounded mb-3">
                <h4 className="font-semibold mb-2">Verification</h4>
                <p><strong>College:</strong> {formData.college}</p>
                <p><strong>Enrollment Number:</strong> {formData.enrollment}</p>
                <p><strong>Address:</strong> {formData.address}</p>
                <p><strong>Photo:</strong> {formData.photo ? formData.photo.name : "Not uploaded"}</p>
                <p><strong>Verification File:</strong> {formData.verificationFile ? formData.verificationFile.name : "Not uploaded"}</p>
              </div>

              <div className="bg-gray-100 p-4 rounded mb-3">
                <h4 className="font-semibold mb-2">Profile Details</h4>
                <p><strong>Branch:</strong> {formData.course}</p>
                <p><strong>Year:</strong> {formData.year}</p>
                <p><strong>Year of Admission:</strong> {formData.yearOfAdmission}</p>
                <p><strong>Year of Graduation:</strong> {formData.yearOfGraduation}</p>
                <p><strong>Skills:</strong> {formData.skills.length ? formData.skills.join(", ") : "None"}</p>
                <p><strong>Career Goal:</strong> {formData.careerGoal}</p>
                <p><strong>LinkedIn URL:</strong> {formData.linkedinUrl || "None"}</p>
                <p><strong>GitHub URL:</strong> {formData.githubUrl || "None"}</p>
                <p><strong>Extracurricular Activities:</strong> {formData.extracurricular || "None"}</p>
              </div>

              <div className="bg-gray-100 p-4 rounded mb-3">
                <h4 className="font-semibold mb-2">Discovery Insights</h4>
                <p><strong>Heard About:</strong> {formData.hearAbout}</p>
                <p><strong>Mentorship Area:</strong> {formData.mentorshipArea}</p>
              </div>

              <div className="bg-gray-100 p-4 rounded mb-3">
                <h4 className="font-semibold mb-2">Preferences & Notifications</h4>
                <p><strong>Mentor Type:</strong> {formData.mentorType}</p>
                <p><strong>Communication:</strong> {formData.communication.length ? formData.communication.join(", ") : "None"}</p>
                <p><strong>Notifications:</strong></p>
                <ul className="list-disc pl-5">
                  <li>Mentorship Updates: {formData.notifications.mentorship ? "Yes" : "No"}</li>
                  <li>Event Notifications: {formData.notifications.events ? "Yes" : "No"}</li>
                  <li>Community Updates: {formData.notifications.community ? "Yes" : "No"}</li>
                  <li>Content Updates: {formData.notifications.content ? "Yes" : "No"}</li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-4"
                >
                  Submit & Create Account
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="px-4 py-2 bg-gray-300 rounded">Back</button>
            )}
            {step < steps.length - 1 && (
              <button
                onClick={() => isStepValid() && setStep(step + 1)}
                disabled={!isStepValid()}
                className={`px-4 py-2 rounded font-semibold ${
                  isStepValid() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-500 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
  );
};

export default StudentRegistration;


