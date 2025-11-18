import { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { colleges } from "../../assets/assets";

const selectStyles = {
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'white',
    color: 'black',
    border: '1.5px solid #a78bfa',
    zIndex: 100,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#a78bfa' : state.isFocused ? '#ede9fe' : 'white',
    color: state.isSelected ? 'white' : '#3b0764',
    fontWeight: state.isSelected ? 'bold' : 'normal',
    fontSize: '1rem',
  }),
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    color: 'black',
    border: state.isFocused ? '2px solid #a78bfa' : '1.5px solid #a78bfa',
    boxShadow: state.isFocused ? '0 0 0 2px #a78bfa55' : provided.boxShadow,
    fontWeight: 'bold',
    fontSize: '1rem',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#3b0764',
    fontWeight: 'bold',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#ede9fe',
    color: '#3b0764',
    fontWeight: 'bold',
  }),
  input: (provided) => ({
    ...provided,
    color: '#3b0764',
    fontWeight: 'bold',
  }),
};

const steps = ["Basic Info", "College Info", "Permissions", "Review & Submit"];

const AdminRegistration = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    designation: "",
    department: "",
    contact_office: "",
    college: "",
    admin_level: "admin",
    permissions: {
      edit_user: false,
      manage_events: false,
    },
  });

  const passwordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(formData.password);
  const confirmPasswordValid = formData.password === formData.confirm_password;

  const isStepValid = () => {
    switch (step) {
      case 0:
        return (
          formData.full_name.trim() &&
          formData.email.trim() &&
          formData.password.trim() &&
          formData.confirm_password.trim() &&
          passwordValid &&
          confirmPasswordValid
        );
      case 1:
        return (
          formData.designation.trim() &&
          formData.department.trim() &&
          formData.contact_office.trim() &&
          formData.college
        );
      case 2:
        return true; // Permissions are optional
      default:
        return true;
    }
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirm_password,
      designation: formData.designation,
      department: formData.department,
      contact_office: formData.contact_office,
      college: formData.college,
      admin_level: formData.admin_level,
      permissions: formData.permissions,
    };

    try {
      const res = await fetch("https://stualum.onrender.com/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Admin registered successfully");
        navigate("/login/admin"); // Redirect to home page after successful signup
      } else {
        const err = await res.json();
        alert("Registration failed: " + err.error);
      }
    } catch (error) {
      alert("Error submitting form: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black text-white flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl bg-gray-900/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-between mb-2">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i <= step ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              <p className={`text-xs mt-2 ${i === step ? "text-purple-400" : "text-gray-400"}`}>{s}</p>
            </div>
          ))}
        </div>

        <div className="relative h-2 mb-6">
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

        {step === 0 && (
          <div className="border p-6 rounded-lg shadow-md bg-gray-800">
            <div className="w-full h-full text-center py-6 px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 mx-auto">Admin Registration</h2>
              <h4 className="text-sm md:text-base text-gray-200 mx-auto">Enter your admin account details.</h4>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4 text-center">Basic Info</h2>
              <div className="flex gap-4 mb-3">
                <div className="w-1/2">
                  <h4>Full Name</h4>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="border p-2 w-full"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div className="w-1/2">
                  <h4>Email</h4>
                  <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 w-full"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 mb-3">
                <div className="w-1/2">
                  <h4>Password</h4>
                  <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 w-full"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  {!passwordValid && formData.password && (
                    <p className="text-red-500 text-xs mb-2">
                      Password must contain at least one uppercase letter, one number, one special character, and be at least 8 characters long.
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <h4>Confirm Password</h4>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="border p-2 w-full"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  />
                  {!confirmPasswordValid && formData.confirm_password && (
                    <p className="text-red-500 text-xs mb-2">Confirm password should match the password.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="border p-6 rounded-lg shadow-md bg-gray-800">
            <h2 className="text-lg font-semibold mb-4 text-center">College Info</h2>
            <div className="flex gap-4 mb-3">
              <div className="w-1/2">
                <h4>Designation</h4>
                <input
                  type="text"
                  placeholder="Designation"
                  className="border p-2 w-full"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>
              <div className="w-1/2">
                <h4>Department</h4>
                <input
                  type="text"
                  placeholder="Department"
                  className="border p-2 w-full"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="w-1/2">
                <h4>Contact (Office)</h4>
                <input
                  type="text"
                  placeholder="Contact Number"
                  className="border p-2 w-full"
                  value={formData.contact_office}
                  onChange={(e) => setFormData({ ...formData, contact_office: e.target.value })}
                />
              </div>
              <div className="w-1/2">
                <h4>College</h4>
                <Select
                  options={colleges}
                  placeholder="Select college"
                  value={colleges.find((c) => c.value === formData.college) || null}
                  onChange={(selectedOption) => setFormData({ ...formData, college: selectedOption.value })}
                  styles={selectStyles}
                  className="mb-3"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="border p-6 rounded-lg shadow-md bg-gray-800">
            <h2 className="text-lg font-semibold mb-4 text-center">Permissions</h2>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.permissions.edit_user}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, edit_user: e.target.checked },
                    })
                  }
                  className="h-4 w-4"
                />
                Edit Users
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.permissions.manage_events}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, manage_events: e.target.checked },
                    })
                  }
                  className="h-4 w-4"
                />
                Manage Events
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-[#1E0033] text-white p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-center mb-2">Review Your Information</h2>
            <p className="text-center text-gray-300 mb-8">
              Please review all the details below. Click <span className="font-semibold">Edit</span> to update any section.
            </p>
            <div className="bg-[#2A0E45] p-5 rounded-lg shadow-md mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Basic Info</h3>
                <button onClick={() => setStep(0)} className="text-purple-400 text-sm">
                  Edit
                </button>
              </div>
              <p><strong>Full Name:</strong> {formData.full_name || "Not provided"}</p>
              <p><strong>Email:</strong> {formData.email || "Not provided"}</p>
            </div>
            <div className="bg-[#2A0E45] p-5 rounded-lg shadow-md mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">College Info</h3>
                <button onClick={() => setStep(1)} className="text-purple-400 text-sm">
                  Edit
                </button>
              </div>
              <p><strong>Designation:</strong> {formData.designation || "Not provided"}</p>
              <p><strong>Department:</strong> {formData.department || "Not provided"}</p>
              <p><strong>Contact (Office):</strong> {formData.contact_office || "Not provided"}</p>
              <p><strong>College:</strong> {formData.college || "Not provided"}</p>
            </div>
            <div className="bg-[#2A0E45] p-5 rounded-lg shadow-md mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Permissions</h3>
                <button onClick={() => setStep(2)} className="text-purple-400 text-sm">
                  Edit
                </button>
              </div>
              <p><strong>Edit Users:</strong> {formData.permissions.edit_user ? "Yes" : "No"}</p>
              <p><strong>Manage Events:</strong> {formData.permissions.manage_events ? "Yes" : "No"}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              step === 0 ? "bg-gray-600 text-gray-300 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800 text-white"
            }`}
          >
            Previous
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                !isStepValid() ? "bg-gray-600 text-gray-300 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800 text-white"
              }`}
            >
              Next
            </button>
          ) : (
            <button
              className="px-6 py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRegistration;
