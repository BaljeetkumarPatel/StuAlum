export default function AlumniCard({ alumni, onRequest }) {
  return (
    <div className="p-3 bg-white border rounded-lg shadow-sm max-w-[85%] space-y-2">
      <div className="font-semibold text-slate-800">
        🧑‍💼 {alumni.full_name}
      </div>

      <div className="text-sm text-slate-600">
        <span className="font-medium">Company:</span> {alumni.company || "—"}
      </div>

      <div className="text-sm text-slate-600">
        <span className="font-medium">Skills:</span> {alumni.skills?.join(", ")}
      </div>

      <button
        onClick={() => onRequest(alumni._id)}
        className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-sm w-full"
      >
        🙋 Request Mentorship
      </button>
    </div>
  );
}
