import React, { useState, useEffect } from "react";
import { Copy, Loader2, Download } from "lucide-react";
import withSidebarToggle from '../../hocs/withSidebarToggle';
import Navbar from '../../components/Navbar';


const TextGenerator = ({onSidebarToggle}) => {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("informative");
  const [length, setLength] = useState("short");
  const [output, setOutput] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return alert("Please enter a topic.");
    setLoading(true);
    setOutput("");
    setDisplayText("");

    try {
      const res = await fetch("http://localhost:5000/api/text/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, length }),
      });
      const data = await res.json();
      setOutput(data.result || "No output generated.");
    } catch (err) {
      console.error(err);
      setOutput("Something went wrong. Please try again later.");
    }
    setLoading(false);
  };

  // Typing animation effect
  useEffect(() => {
    if (output) {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayText((prev) => prev + output.charAt(i));
        i++;
        if (i >= output.length) clearInterval(interval);
      }, 15);
      return () => clearInterval(interval);
    }
  }, [output]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.replace(/\s+/g, "_")}_AI_Text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    
     <Navbar onSidebarToggle={onSidebarToggle} />
         <main className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white">
        <div className="min-h-screen bg-gradient-to-br from-[#12002c] via-[#240046] to-[#3c096c] p-8 text-white flex flex-col md:flex-row items-center justify-center gap-8 transition-all">
          {/* Left Input Panel */}
          <div className="bg-[#2e005f]/60 backdrop-blur-md rounded-2xl p-8 w-full md:w-1/2 shadow-[0_0_25px_#9b5cff]">
            <h1 className="text-3xl font-bold mb-6 text-center">AI Text Generator</h1>
            <label className="block mb-3 font-semibold text-purple-200">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 rounded-lg text-white"
              placeholder="Enter your topic..."
            />

            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <label className="block mb-2 text-purple-200 font-semibold">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-3 rounded-lg text-white"
                >
                  <option value="informative">Informative</option>
                  <option value="formal">Formal</option>
                  <option value="creative">Creative</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block mb-2 text-purple-200 font-semibold">Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full p-3 rounded-lg text-white"
                >
                  <option value="short">Short (100 words)</option>
                  <option value="medium">Medium (300 words)</option>
                  <option value="long">Long (600 words)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-[#9b5cff] to-[#6a00f4] font-semibold text-lg hover:scale-105 transition-transform"
            >
              {loading ? (
                <span className="flex justify-center items-center gap-2">
                  <Loader2 className="animate-spin" /> Generating...
                </span>
              ) : (
                "Generate Text"
              )}
            </button>
          </div>

          {/* Right Output Panel */}
          <div className="bg-[#2e005f]/60 backdrop-blur-md rounded-2xl p-8 w-full md:w-1/2 shadow-[0_0_25px_#9b5cff] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-center">AI Output</h2>
            <div className="bg-[#16002c]/60 rounded-xl p-4 min-h-[250px] text-gray-100 whitespace-pre-wrap overflow-y-auto font-light">
              {loading ? (
                <p className="italic text-purple-300">Generating AI content...</p>
              ) : (
                <p>{displayText}</p>
              )}
            </div>

            {output && (
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
                >
                  <Copy size={18} /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
                >
                  <Download size={18} /> Download
                </button>
              </div>
            )}
          </div>
        </div>
        </main>
    </>
  );
};

export default TextGenerator;
