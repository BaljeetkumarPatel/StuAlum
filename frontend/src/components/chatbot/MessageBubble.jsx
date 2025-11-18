// import React from "react";

// export default function MessageBubble({ sender, html }) {
//   const isUser = sender === "user";

//   if (isUser) {
//     return (
//       <div className="flex justify-end">
//         <div className="flex items-end gap-2">
//           <div
//             className="bg-indigo-50 text-indigo-900 p-2 rounded-md whitespace-pre-wrap max-w-[80%]"
//             dangerouslySetInnerHTML={{ __html: html }}
//           ></div>
//           <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-sm font-semibold">
//             U
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Bot bubble
//   return (
//     <div className="flex gap-2">
//       <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
//         AI
//       </div>
//       <div
//         className="bg-slate-100 text-slate-900 p-2 rounded-md whitespace-pre-wrap max-w-[80%]"
//         dangerouslySetInnerHTML={{ __html: html }}
//       ></div>
//     </div>
//   );
// }

// // src/components/chatbot/MessageBubble.jsx
// import React from "react";
// import DOMPurify from "dompurify";
// import { marked } from "marked";

// export default function MessageBubble({ sender, text, type, data }) {
//   const isUser = sender === "user";

//   // 1) Render structured cards (future upgrades)
//   if (type === "student_card") {
//     return (
//       <div className="flex gap-2">
//         <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
//           AI
//         </div>
//         <div className="p-3 bg-white border rounded-lg shadow-sm max-w-[80%] space-y-1">
//           <div className="font-semibold">👨‍🎓 {data.full_name}</div>
//           <div className="text-sm text-slate-600">
//             <b>Skills:</b> {data.skills?.join(", ")}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (type === "alumni_card") {
//     return (
//       <div className="flex gap-2">
//         <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
//           AI
//         </div>
//         <div className="p-3 bg-white border rounded-lg shadow-sm max-w-[80%] space-y-1">
//           <div className="font-semibold">🧑‍💼 {data.full_name}</div>
//           <div className="text-sm text-slate-600">
//             <b>Company:</b> {data.company}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (type === "event_card") {
//     return (
//       <div className="flex gap-2">
//         <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
//           AI
//         </div>
//         <div className="p-3 bg-white border rounded-lg shadow-sm max-w-[80%] space-y-1">
//           <div className="font-semibold">📅 {data.title}</div>
//           <div className="text-sm">{data.description}</div>
//         </div>
//       </div>
//     );
//   }

//   // 2) Default message ← HTML or Markdown
//   const cleanHtml = DOMPurify.sanitize(
//     marked.parse(text || "").replace(/\n/g, "<br/>")
//   );

//   if (isUser) {
//     return (
//       <div className="flex justify-end">
//         <div className="flex items-end gap-2">
//           <div
//             className="bg-indigo-50 text-indigo-900 p-2 rounded-md max-w-[80%]"
//             dangerouslySetInnerHTML={{ __html: cleanHtml }}
//           />
//           <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-sm font-semibold">
//             U
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Bot bubble default
//   return (
//     <div className="flex gap-2">
//       <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
//         AI
//       </div>
//       <div
//         className="bg-slate-100 text-slate-900 p-2 rounded-md max-w-[80%]"
//         dangerouslySetInnerHTML={{ __html: cleanHtml }}
//       />
//     </div>
//   );
// }


import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function MessageBubble({ sender, text, type, data }) {
  const isUser = sender === "user";

  // Convert markdown → safe HTML
  const renderHTML = (md) => {
    const html = marked.parse(md || "").replace(/\n/g, "<br/>");
    return { __html: DOMPurify.sanitize(html) };
  };

  /* =========================================================
      CARD RENDERERS
  ========================================================= */
  // 🔹 Placement Analytics Card
    if (type === "placement_analytics") {
      const s = data;

      return (
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            AI
          </div>

          <div className="bg-white shadow p-3 rounded-md max-w-[80%]">

            <h2 className="font-bold text-lg mb-2">
              📊 Placement Analytics – {s.year}
            </h2>

            <div className="text-sm space-y-1">
              <p><b>Total Students:</b> {s.total_students}</p>
              <p><b>Eligible:</b> {s.total_eligible}</p>
              <p><b>Placed:</b> {s.total_placed}</p>
              <p><b>Higher Studies:</b> {s.higher_studies}</p>
              <p><b>Avg CTC:</b> ₹{s.avg_ctc} LPA</p>
              <p><b>Highest CTC:</b> ₹{s.highest_ctc} LPA</p>
              <p><b>Median CTC:</b> ₹{s.median_ctc} LPA</p>
            </div>

            <hr className="my-2" />

            <h3 className="font-semibold mb-1">🏫 Branch-wise Stats</h3>
            {s.branches?.map((b, i) => (
              <div key={i} className="mb-1 bg-slate-50 p-2 rounded">
                <p><b>{b.name}</b></p>
                <p>Eligible: {b.eligible} | Placed: {b.placed}</p>
                <p>Avg CTC: {b.avg_ctc} | Highest: {b.highest_ctc}</p>
              </div>
            ))}

            <hr className="my-2" />

            <h3 className="font-semibold mb-1">🏢 Top Companies</h3>
            {s.companies?.slice(0, 5).map((c, i) => (
              <div key={i} className="mb-1 bg-slate-50 p-2 rounded">
                <p><b>{c.name}</b> — Hires: {c.total_hires}</p>
                <p>Avg CTC: {c.avg_ctc} LPA</p>
              </div>
            ))}

            <hr className="my-2" />

            <h3 className="font-semibold mb-1">💼 Internships</h3>
            <p>Total: {s.internships.total_internships}</p>
            <p>Paid: {s.internships.paid_internships}</p>
            <p>Stipend: ₹{s.internships.min_stipend} – ₹{s.internships.max_stipend}</p>

          </div>
        </div>
      );
    }


  // --- Event List Card ---
  if (type === "event_list") {
    return (
      <div className="flex gap-2">
        <div className="font-bold">📅</div>
        <div className="bg-white p-3 rounded-md shadow max-w-[80%]">
          {text && <div dangerouslySetInnerHTML={renderHTML(text)} />}
          <div className="mt-2 space-y-2">
            {data?.map((ev,index) => (
              <div key={index} className="p-2 border rounded bg-slate-50">
                <div className="font-semibold">{ev.title}</div>
                <div className="text-xs text-gray-600">{ev.date}</div>
                <div className="text-xs">{ev.location}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Alumni List Card ---
  if (type === "alumni_list") {
    return (
      <div className="flex gap-2">
        <div className="font-bold">👨‍💼</div>
        <div className="bg-white p-3 rounded-md shadow max-w-[80%]">
          <div className="font-semibold mb-1">Alumni you may connect with:</div>
          <div className="space-y-2">
            {data?.map((a,index) => (
              <div key={index} className="p-2 border rounded bg-slate-50">
                <div className="font-semibold">{a.full_name}</div>
                <div className="text-xs text-gray-600">{a.company}</div>
                <div className="text-xs text-gray-700">
                  Skills: {a.skills?.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Student List Card ---
  if (type === "student_list") {
    return (
      <div className="flex gap-2">
        <div className="font-bold">🎓</div>
        <div className="bg-white p-3 rounded-md shadow max-w-[80%]">
          <div className="font-semibold mb-1">Students:</div>
          <div className="space-y-2">
            {data?.map((s,index) => (
              <div key={index} className="p-2 border rounded bg-slate-50">
                <div className="font-semibold">{s.full_name}</div>
                <div className="text-xs text-gray-700">{s.department}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Resume Review Result Card ---
  if (type === "resume_result") {
    return (
      <div className="flex gap-2">
        <div className="font-bold">📄</div>
        <div className="bg-white p-3 rounded-md shadow max-w-[80%] space-y-2">
          <div dangerouslySetInnerHTML={renderHTML(text)} />

          <div className="p-2 bg-indigo-50 rounded-md border">
            <div className="font-bold">ATS Score: {data?.score || "-"}</div>
          </div>

          {data?.strengths && (
            <div>
              <div className="font-semibold">Strengths</div>
              <ul className="list-disc ml-4 text-sm">
                {data.strengths.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}

          {data?.weaknesses && (
            <div>
              <div className="font-semibold">Weaknesses</div>
              <ul className="list-disc ml-4 text-sm">
                {data.weaknesses.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    );
  }

  /* =========================================================
      DEFAULT TEXT MESSAGE (User / Bot)
  ========================================================= */
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-indigo-50 text-indigo-900 p-2 rounded-md max-w-[80%] whitespace-pre-wrap">
          <div dangerouslySetInnerHTML={renderHTML(text)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="bg-slate-100 p-2 rounded-md max-w-[80%]">
        <div dangerouslySetInnerHTML={renderHTML(text)} />
      </div>
    </div>
  );
}
