// import React, { useState } from "react";
// import { ChevronDown, ChevronUp } from "lucide-react";

// export default function Feedback() {
//   const feedbackInfo = [
//     {
//       q: "How can I share feedback?",
//       a: "Click on Help & Support → Feedback & Suggestions. Fill in your comments or feature requests and submit the form.",
//     },
//     {
//       q: "Is feedback anonymous?",
//       a: "You can choose to share feedback anonymously or attach your profile if you wish to receive follow-up communication.",
//     },
//     {
//       q: "What kind of feedback is most helpful?",
//       a: "We value feedback about user experience, feature requests, and improvement ideas related to performance or usability.",
//     },
//     {
//       q: "When will I hear back after submitting feedback?",
//       a: "For actionable feedback, our team may reach out within 3–5 business days if further clarification is needed.",
//     },
//   ];

//   const [open, setOpen] = useState(null);

//   return (
//     <div className="bg-[#150035] text-white rounded-3xl p-8 shadow-2xl border border-purple-800 mt-10">
//       <h2 className="text-3xl font-bold mb-6 text-purple-200">Feedback & Suggestions 💬</h2>
//       {feedbackInfo.map((item, i) => (
//         <div key={i} className="mb-3">
//           <button
//             onClick={() => setOpen(open === i ? null : i)}
//             className="w-full flex justify-between items-center bg-[#1e004f] hover:bg-[#2b007a] text-left px-5 py-4 rounded-2xl border border-purple-900 transition-all duration-200"
//           >
//             <span className="font-semibold text-lg">{item.q}</span>
//             {open === i ? (
//               <ChevronUp className="text-purple-300" />
//             ) : (
//               <ChevronDown className="text-purple-300" />
//             )}
//           </button>
//           {open === i && (
//             <p className="bg-[#230060] border border-purple-800 text-gray-300 p-5 rounded-2xl mt-2">
//               {item.a}
//             </p>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }


import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FeedbackSuggestions() {
  const info = [
    {
      q: "How can I share my feedback?",
      a: "You can submit your feedback directly through this form. Your insights help us improve our system.",
    },
    {
      q: "Can I suggest new features?",
      a: "Yes! You can suggest new features or improvements anytime using this feedback form.",
    },
    {
      q: "Is feedback anonymous?",
      a: "No, please include your name and email so our team can follow up if needed.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const toggleFAQ = (idx) => setOpenIndex(openIndex === idx ? null : idx);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://stualum.onrender.com/api/contact", { //http://localhost:5000/api/contact
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert(" Feedback submitted successfully!\n\nThank you for helping us improve.\n\Our team may reach out if needed.");
        setForm({ name: "", email: "", message: "" });
        setFormVisible(false);
      } else alert("❌ Something went wrong. Try again.");
    } catch (err) {
      console.error(err);
      alert("Server error. Please try later.");
    }
  };

  return (
    <div className="bg-[#150035] text-white rounded-3xl p-8 shadow-2xl border border-purple-800 mt-10">
    <section className="bg-[#130028] text-white p-8 rounded-3xl shadow-md my-10">
      <h2 className="text-3xl font-bold mb-6 text-purple-100 flex items-center">
        Feedback & Suggestions <span className="ml-2">💬</span>
      </h2>

      <div className="space-y-3">
        {info.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#1E0144] hover:bg-[#29015a] transition-colors rounded-2xl"
          >
            <button
              onClick={() => toggleFAQ(idx)}
              className="flex justify-between items-center w-full text-left font-medium px-6 py-4 text-purple-100"
            >
              <span>{item.q}</span>
              {openIndex === idx ? (
                <ChevronUp className="text-purple-300" />
              ) : (
                <ChevronDown className="text-purple-300" />
              )}
            </button>
            {openIndex === idx && (
              <p className="px-6 pb-4 text-sm text-purple-200 border-t border-purple-800">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-2xl transition-all"
        >
          {formVisible ? "Close Form" : "Send Feedback"}
        </button>
      </div>

      {formVisible && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#1E0144] mt-6 p-6 rounded-2xl border border-purple-700 space-y-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-transparent border border-purple-600 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-transparent border border-purple-600 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <textarea
            name="message"
            placeholder="Write your feedback..."
            value={form.message}
            onChange={handleChange}
            rows="4"
            className="w-full bg-transparent border border-purple-600 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-800 w-full text-white font-semibold px-6 py-2 rounded-lg"
          >
            Submit Feedback
          </button>
        </form>
      )}
    </section>
    </div>
  );
}
