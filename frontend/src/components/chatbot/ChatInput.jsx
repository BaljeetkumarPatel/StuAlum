
// // src/components/chatbot/ChatInput.jsx
// import React from "react";

// export default function ChatInput({
//   inputRef,
//   sendMessage,
//   listening,
//   startListening,
//   stopListening,
//   triggerFilePicker,
//   fileInputRef,
//   handleFileInputChange,
// }) {
//   return (
//     <div className="px-3 py-2 border-t bg-white flex items-center gap-2">

//       {/* Mic */}
//       <button
//         onClick={() => (listening ? stopListening() : startListening())}
//         className={`p-2 rounded ${listening ? "bg-amber-400" : "bg-slate-100"}`}
//       >
//         {listening ? "🎙️" : "🎤"}
//       </button>

//       {/* Input box */}
//       <input
//         ref={inputRef}   // ⭐⭐ IMPORTANT FIX ⭐⭐
//         onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         placeholder="Ask something..."
//         className="flex-1 px-3 py-2 rounded border focus:outline-none"
//       />

//       {/* Send button */}
//       <button
//         onClick={() => sendMessage()}
//         className="px-3 py-2 bg-indigo-600 text-white rounded"
//       >
//         ➤
//       </button>

//       {/* Resume upload button */}
//       <button
//         onClick={triggerFilePicker}
//         className="p-2 bg-slate-100 rounded"
//         title="Upload resume"
//       >
//         📄
//       </button>

//       <input
//         ref={fileInputRef}
//         type="file"
//         accept=".pdf"
//         className="hidden"
//         onChange={handleFileInputChange}
//       />
//     </div>
//   );
// }

// src/components/chatbot/ChatInput.jsx
import React from "react";

export default function ChatInput({
  inputRef,
  sendMessage,
  listening,
  startListening,
  stopListening,
  triggerFilePicker,
  fileInputRef,
  handleFileInputChange,
}) {
  return (
    <div className="px-3 py-2 border-t bg-white flex items-center gap-2 relative">

      {/* Mic Button */}
      <button
        onClick={() => (listening ? stopListening() : startListening())}
        className={`p-2 rounded transition-all duration-300 
          ${listening ? "bg-red-500 shadow-[0_0_12px_3px_rgba(255,0,0,0.5)] scale-110" : "bg-slate-100"}
        `}
      >
        {listening ? "🎙️" : "🎤"}
      </button>

      {/* Waveform Animation (shows only while listening) */}
      {listening && (
        <div className="absolute left-14 flex gap-[3px] items-end h-6">
          <span className="w-[3px] bg-indigo-500 animate-wave1"></span>
          <span className="w-[3px] bg-indigo-500 animate-wave2"></span>
          <span className="w-[3px] bg-indigo-500 animate-wave3"></span>
          <span className="w-[3px] bg-indigo-500 animate-wave2"></span>
          <span className="w-[3px] bg-indigo-500 animate-wave1"></span>
        </div>
      )}

      {/* Text Input */}
      <input
        ref={inputRef}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Ask something..."
        className="flex-1 px-3 py-2 rounded border focus:outline-none"
      />

      {/* Send Button */}
      <button
        onClick={() => sendMessage()}
        className="px-3 py-2 bg-indigo-600 text-white rounded"
      >
        ➤
      </button>

      {/* Resume Upload Button */}
      <button
        onClick={triggerFilePicker}
        className="p-2 bg-slate-100 rounded"
        title="Upload resume"
      >
        📄
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
}
