// Components/chatbot/cards/StudentCard.jsx
export default function StudentCard({ student, onMentor }) {
  return (
    <div className="p-3 bg-white border rounded-lg shadow-sm max-w-[85%] space-y-2">
      <div className="font-semibold text-slate-800">
        👨‍🎓 {student.full_name}
      </div>

      <div className="text-sm text-slate-600">
        <span className="font-medium">Skills:</span> {student.skills?.join(", ")}
      </div>

      <div className="text-sm text-slate-600">
        <span className="font-medium">Branch:</span> {student.branch || "—"}
      </div>

      <button
        onClick={() => onMentor(student._id)}
        className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-sm w-full"
      >
        🤝 Mentor this student
      </button>
    </div>
  );
}
