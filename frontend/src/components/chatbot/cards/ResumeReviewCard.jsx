export default function ResumeReviewCard({ text }) {
  return (
    <div className="p-3 bg-slate-50 border rounded-lg shadow-sm max-w-[85%]">
      <div className="font-semibold text-indigo-700 mb-1">📄 Resume Review</div>
      <div className="text-sm whitespace-pre-wrap">{text}</div>
    </div>
  );
}
