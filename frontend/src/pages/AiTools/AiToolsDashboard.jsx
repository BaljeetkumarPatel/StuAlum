import React from "react";
import { useNavigate } from "react-router-dom";
import withSidebarToggle from "../../hocs/withSidebarToggle";
import { Type, PenTool } from "lucide-react";
import Navbar from "../../components/Navbar";
import { getCurrentUserRoleFromToken } from "../../utils/authUtils";

const AiToolsDashboard = ({ onSidebarToggle }) => {
  const navigate = useNavigate();
  const role = getCurrentUserRoleFromToken(); // "student" | "alumni" | "admin"

  // All tools
  const tools = [
    {
      name: "Grammar Checker",
      desc: "Instantly correct grammar, punctuation, and clarity errors in your writing.",
      icon: <PenTool size={32} />,
      path: "/aitools/grammar-checker",
      gradient: "from-[#a855f7] to-[#7e22ce]",
    },
    {
      name: "Text Generator",
      desc: "Generate creative, professional, or formal text from your topic instantly.",
      icon: <Type size={32} />,
      path: "/aitools/text-generator",
      gradient: "from-[#7f00ff] to-[#e100ff]",
    },
    {
      name: "Event Generator",
      desc: "Create detailed event plans and itineraries with ease using AI.",
      icon: <PenTool size={32} />,
      path: "/aitools/AiEventGenerator",
      gradient: "from-[#a855f7] to-[#7e22ce]",
    },
    {
      name:"AI Recommendation Alumni",
      desc:"Get personalized alumni recommendations based on your profile and goals.",
      icon: <PenTool size={32} />,
      path: "/aitools/recommendations",
      gradient: "from-[#a855f7] to-[#7e22ce]",
      key: "alumniRec"
    }
  ];

  // ❌ For alumni/admin → remove "AI Recommendation Alumni"
  const filteredTools =
    role === "student"
      ? tools // show all
      : tools.filter((t) => t.key !== "alumniRec");

  return (
    <>
      <Navbar onSidebarToggle={onSidebarToggle} />
      <div className="min-h-screen bg-gradient-to-b from-[#16002c] to-[#2a014f] text-white flex flex-col items-center py-16 px-6 transition-all duration-500">

        <h1 className="text-4xl font-bold mb-4 text-center tracking-wide">
          AI Assistant Tools
        </h1>
        <p className="text-purple-200 text-center mb-12 max-w-2xl">
          Enhance your Work with intelligent AI tools — from grammar checking to
          creative text generation, all in one place.
        </p>

        <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-10 w-full max-w-4xl">
          {filteredTools.map((tool, index) => (
            <div
              key={index}
              onClick={() => navigate(tool.path)}
              className="bg-[#2e005f]/80 border border-purple-700 rounded-2xl p-8 cursor-pointer text-center hover:shadow-[0_0_25px_#9b5cff] transition-all duration-500 hover:scale-105"
            >
              <div className={`w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-r ${tool.gradient} flex items-center justify-center shadow-lg`}>
                {tool.icon}
              </div>

              <h2 className="text-xl font-semibold mb-3">{tool.name}</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>

        <footer className="mt-16 text-sm text-gray-400">
          <span className="text-purple-400 font-semibold">AI Tools Suite</span> — Designed with 💜 by B07 Team
        </footer>

      </div>
    </>
  );
};

export default withSidebarToggle(AiToolsDashboard);
