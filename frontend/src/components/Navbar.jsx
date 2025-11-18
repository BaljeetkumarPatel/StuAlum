import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = ({ onSidebarToggle }) => {
  const [showSignupDropdown, setShowSignupDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const signupDropdownRef = useRef(null);
  const loginDropdownRef = useRef(null);

  // ✅ Detect login state on every route change
  useEffect(() => {
    const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken");
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  // 🔒 Logout
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("token");   
    localStorage.removeItem("userRole");

    sessionStorage.removeItem("userToken");
    sessionStorage.removeItem("token"); 
    setIsLoggedIn(false);
    navigate("/");
    window.location.reload(); 
  };

  // 📜 Dropdowns
  const handleSignupClick = () => {
    setShowSignupDropdown((prev) => !prev);
    setShowLoginDropdown(false);
  };

  const handleLoginClick = () => {
    setShowLoginDropdown((prev) => !prev);
    setShowSignupDropdown(false);
  };

  const handleSignupOptionClick = (role) => {
    setShowSignupDropdown(false);
    navigate(`/signup/${role.toLowerCase()}`);
  };

  const handleLoginOptionClick = (role) => {
    setShowLoginDropdown(false);
    navigate(`/login/${role.toLowerCase()}`);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (signupDropdownRef.current && !signupDropdownRef.current.contains(e.target)) &&
        (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target))
      ) {
        setShowSignupDropdown(false);
        setShowLoginDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================================
  // BEFORE LOGIN VIEW
  // ================================
  const renderBeforeLogin = () => (
    <header className="fixed top-0 w-full z-40 flex items-center justify-between h-[65px] bg-[#111019] border-b border-[#23232b] px-10 shadow-md">
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <img src="/logo1.png" alt="StuAlum Logo" className="w-8 h-8 rounded-full" />
          <h1 className="text-xl font-bold text-white hover:text-purple-400 transition">
            StuAlum
          </h1>
      </div>

      {/* Links */}
      <nav className="flex items-center space-x-10 text-white text-sm">
        <span
          onClick={() => navigate("/")}
          className="cursor-pointer hover:text-purple-400 transition"
        >
          Home
        </span>
        <span className="cursor-pointer hover:text-purple-400 transition">Language</span>
        <span className="cursor-pointer hover:text-purple-400 transition">Contact Us</span>
      </nav>

      {/* Signup / Login */}
      <div className="flex items-center space-x-4 relative">
        {/* Signup */}
        <div ref={signupDropdownRef} className="relative">
          <button
            onClick={handleSignupClick}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md font-semibold transition"
          >
            Signup
          </button>
          {showSignupDropdown && (
            <div className="absolute right-0 mt-10 w-40 bg-[#23232b] rounded-md shadow-lg text-white text-sm z-50">
              {["Student", "Alumni", "Admin"].map((role) => (
                <button
                  key={role}
                  className="block w-full text-left px-4 py-2 hover:bg-purple-600 transition"
                  onClick={() => handleSignupOptionClick(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Login */}
        <div ref={loginDropdownRef} className="relative">
          <button
            onClick={handleLoginClick}
            className="bg-[#2d223f] hover:bg-[#3b2e58] text-white px-5 py-2 rounded-md font-semibold transition"
          >
            Login
          </button>
          {showLoginDropdown && (
            <div className="absolute right-0 mt-10 w-40 bg-[#23232b] rounded-md shadow-lg text-white text-sm z-50">
              {["Student", "Alumni", "Admin"].map((role) => (
                <button
                  key={role}
                  className="block w-full text-left px-4 py-2 hover:bg-purple-600 transition"
                  onClick={() => handleLoginOptionClick(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );

  // AFTER LOGIN VIEW
 
  const renderAfterLogin = () => (
    <header className="fixed top-0 w-full z-40 flex items-center h-[65px] bg-[#111019] border-b border-[#23232b] px-6 shadow-lg transition-all duration-300">
      {/* Sidebar Toggle */}
      <button onClick={onSidebarToggle} className="mr-4 text-white focus:outline-none">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Search */}
      <div className="flex-1 flex items-center">
        <input
          type="text"
          placeholder="Search alumni, events, discussions..."
          className="w-96 py-2 px-4 rounded-md bg-[#23232b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
        />
      </div>

      {/* Nav Links */}
      <div className="flex items-center space-x-8 text-white ml-8 text-sm">
        <span onClick={() => navigate("/")} className="cursor-pointer hover:text-purple-400 transition">Home</span>
        <span className="cursor-pointer hover:text-purple-400 transition">Language</span>
        <span className="cursor-pointer hover:text-purple-400 transition">Notifications</span>
        <span onClick={() => navigate("/messages")} className="cursor-pointer hover:text-purple-400 transition"><svg  xmlns="http://www.w3.org/2000/svg" width={24} height={24} 
fill={"currentColor"} viewBox="0 0 24 24">
{/* Boxicons v3.0.3 https://boxicons.com | License  https://docs.boxicons.com/free */}
<path d="M4 19h3v2c0 .36.19.69.51.87a1.002 1.002 0 0 0 1-.01L13.27 19h6.72c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2M4 5h16v12h-7c-.18 0-.36.05-.51.14L9 19.23V18c0-.55-.45-1-1-1H4z"></path><path d="M10.71 13.29 8.41 11l2.3-2.29-1.42-1.42L5.59 11l3.7 3.71zM14.71 14.71l3.7-3.71-3.7-3.71-1.42 1.42 2.3 2.29-2.3 2.29z"></path>
</svg></span>
        {/* <span onClick={() => navigate("/profile")} className="cursor-pointer hover:text-purple-400 transition">
          Profile
        </span> */}
        <button
          onClick={handleLogout}
          className="bg-[#2d223f] hover:bg-[#3b2e58] text-white px-5 py-2 rounded-md font-semibold transition"
        >
          Logout
        </button>
      </div>
    </header>
  );

  return isLoggedIn ? renderAfterLogin() : renderBeforeLogin();
};

export default Navbar;
