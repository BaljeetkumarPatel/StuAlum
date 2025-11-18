// import React from "react";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const Login = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleLogin = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   setError("");
//   try {
//     const res = await axios.post('http://localhost:5000/api/student/login', formData);

//     localStorage.setItem("token", res.data.token);
//     alert("Logged in successfully!");
//     navigate("/"); 
//   } catch (err) {
//     setError(err.response?.data?.message || "Login failed");
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
//         <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
//         {error && <div className="text-red-500 text-center mb-2">{error}</div>}
//         <form onSubmit={handleLogin} className="space-y-4">
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full border rounded-lg p-2"
//             value={formData.email}
//             onChange={(e) =>
//               setFormData({ ...formData, email: e.target.value })
//             }
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full border rounded-lg p-2"
//             value={formData.password}
//             onChange={(e) =>
//               setFormData({ ...formData, password: e.target.value })
//             }
//           />

//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white py-2 rounded-lg"
//             disabled={loading}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         {/* Not Registered */}
//         <div className="mt-6 text-center text-sm text-gray-600">
//           Not registered yet?{" "}
//           <span
//             onClick={() => navigate("/signup/student")}
//             className="text-blue-600 hover:underline cursor-pointer"
//           >
//             Click here
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const StudentLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
  const res = await axios.post("http://localhost:5000/api/student/login", formData);
  // Store token under both keys for compatibility with different modules
      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", "student");



      alert("✅ Logged in successfully!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* LEFT IMAGE SIDE */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/login-bg.png')", // ✅ Put your uploaded image path here
        }}
      >
        <div className="bg-black/50 w-full h-full flex items-center justify-center text-white p-10">
          <div className="max-w-md text-center space-y-6">
            <h1 className="text-5xl font-extrabold tracking-wide leading-snug bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Welcome to StuAlum Connect
            </h1>
            <p className="text-gray-200 text-lg">
              Empower your career through alumni mentorship, networking, and AI-driven opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-2">
            Sign in
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Welcome back! Please log in to continue.
          </p>

          {error && (
            <div className="text-red-500 text-center mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-medium">
                Email ID
              </label>
              <input
                type="email"
                placeholder="Enter your student email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-600">
                <input type="checkbox" className="accent-purple-500" />
                <span>Remember me</span>
              </label>
              <span className="text-purple-600 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup/student")}
              className="text-purple-600 font-semibold hover:underline cursor-pointer"
            >
              Sign up
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
