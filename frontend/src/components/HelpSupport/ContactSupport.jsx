// import React, { useState } from "react";

// export default function ContactSupport() {
//   const [form, setForm] = useState({ name: "", email: "", message: "" });

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
//   // const handleSubmit = (e) => {
//   //   e.preventDefault();
//   //   alert("Your message has been submitted!");
//   // };
//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     const res = await fetch("http://localhost:5000/api/contact", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });
//     const data = await res.json();
//     if (data.success) {
//       alert("✅ Message submitted successfully!");
//       setForm({ name: "", email: "", message: "" });
//     } else {
//       alert("❌ Something went wrong. Try again.");
//     }
//   } catch (err) {
//     console.error(err);
//     alert("Server error. Please try later.");
//   }
// };

//   return (
//     <section id="contact">
//       <h2 className="text-2xl font-semibold text-blue-700 mb-4">Contact Support 📩</h2>
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-500 space-y-4"
//       >
//         <input
//           type="text"
//           name="name"
//           placeholder="Your Name"
//           onChange={handleChange}
//           value={form.name}
//           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
//           required
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Your Email"
//           onChange={handleChange}
//           value={form.email}
//           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
//           required
//         />
//         <textarea
//           name="message"
//           placeholder="Describe your issue..."
//           onChange={handleChange}
//           value={form.message}
//           rows="4"
//           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
//           required
//         />
//         <button
//           type="submit"
//           className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
//         >
//           Send Message
//         </button>
//       </form>
//     </section>
//   );
// }

//2nd logic


// import React, { useState } from "react";
// import { ChevronDown, ChevronUp } from "lucide-react";

// export default function ContactSupport() {
//   const info = [
//     {
//       q: "How can I contact support?",
//       a: "Go to Help & Support → Submit a Ticket. You’ll receive an acknowledgment within minutes.",
//     },
//     {
//       q: "Where can I track my support ticket?",
//       a: "Use 'My Tickets' under your profile to track current requests and their status.",
//     },
//     {
//       q: "Is live chat support available?",
//       a: "Live chat is available Monday–Friday, 9 AM to 6 PM IST via the 'Chat Now' button.",
//     },
//     {
//       q: "Can I email the support team?",
//       a: "Yes, send your queries to support@bmsit.in for direct assistance.",
//     },
//   ];

//   const [open, setOpen] = useState(null);

//   return (
//     <div className="bg-[#150035] text-white rounded-3xl p-8 shadow-2xl border border-purple-800 mt-10">
//       <h2 className="text-3xl font-bold mb-6 text-purple-200">Contact Support 📩</h2>
//       {info.map((item, i) => (
//         <div key={i} className="mb-3">
//           <button
//             onClick={() => setOpen(open === i ? null : i)}
//             className="w-full flex justify-between items-center bg-[#1e004f] hover:bg-[#2b007a] text-left px-5 py-4 rounded-2xl border border-purple-900"
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

export default function ContactSupport() {
  const info = [
    {
      q: "How can I contact support?",
      a: "Go to Help & Support → Submit a Ticket. You’ll receive an acknowledgment within minutes.",
    },
    {
      q: "Where can I track my support ticket?",
      a: "Use 'My Tickets' under your profile to track current requests and their status.",
    },
    {
      q: "Is live chat support available?",
      a: "Live chat is available Monday–Friday, 9 AM to 6 PM IST via the 'Chat Now' button.",
    },
    {
      q: "Can I email the support team?",
      a: "Yes, send your queries to support@bmsit.in for direct assistance.",
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
      const res = await fetch("https://stualum.onrender.com/api/contact", {  //http://localhost:5000/api/contact
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert("Message sent successfully!\nThank you for reaching out to us.\nShortly, our support team will get back to you.");
        setForm({ name: "", email: "", message: "" });
        setFormVisible(false);
      } else alert(" Something went wrong. Try again.");
    } catch (err) {
      console.error(err);
      alert("Server error. Please try later.");
    }
  };

  return (
    <div className="bg-[#150035] text-white rounded-3xl p-8 shadow-2xl border border-purple-800 mt-10">
    <section className="bg-[#130028] text-white p-8 rounded-3xl shadow-md my-10">
      <h2 className="text-3xl font-bold mb-6 text-purple-100 flex items-center">
        Contact Support <span className="ml-2">📩</span>
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
          {formVisible ? "Close Form" : "Send Message"}
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
            placeholder="Describe your issue..."
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
            Submit
          </button>
        </form>
      )}
    </section>
    </div>
  );
}

