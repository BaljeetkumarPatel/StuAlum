// frontend/src/pages/AiTools/GrammarChecker.jsx
import React, { useState } from "react";
import withSidebarToggle from "../../hocs/withSidebarToggle";
import Navbar from '../../components/Navbar';

const GrammarChecker = ({onSidebarToggle}) => {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!text.trim()) return alert("Please enter some text to check.");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/grammar/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data.result || data.error || "No corrections found.");
    } catch (err) {
      console.error(err);
      setResult("Error checking grammar.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert("Corrected text copied to clipboard!");
  };

  return (
    <>
    <Navbar onSidebarToggle={onSidebarToggle} />
        <main className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white">
        <div className="min-h-screen bg-gradient-to-b from-[#16002c] to-[#2a014f] flex justify-center items-center transition-all duration-500">
          <div className="bg-[#2e005f] p-8 rounded-2xl shadow-xl w-full max-w-3xl transition-all duration-500 hover:shadow-[0_0_30px_#7f00ff]">
            <h1 className="text-3xl font-bold text-center mb-6 text-white tracking-wide">
              AI Grammar Checker
            </h1>

            <div className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows="6"
                placeholder="Enter your text here..."
                className="w-full p-4 bg-[#3b0764] text-gray-100 border border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none placeholder-gray-400 transition-all duration-300"
              ></textarea>

              <button
                onClick={handleCheck}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#7f00ff] to-[#e100ff] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Checking..." : "Check Grammar"}
              </button>
            </div>

            {result && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-purple-300 mb-3">
                  Corrected Text
                </h2>
                <textarea
                  value={result}
                  readOnly
                  rows="6"
                  className="w-full p-4 bg-[#3b0764] text-gray-100 border border-purple-700 rounded-lg focus:outline-none transition-all duration-300"
                ></textarea>

                <button
                  onClick={handleCopy}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300"
                >
                  Copy Result
                </button>
              </div>
            )}
          </div>
        </div>
        </main>
    </>
  );
};

export default withSidebarToggle(GrammarChecker);
