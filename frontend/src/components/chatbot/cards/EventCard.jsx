export default function EventCard({ event, onRegister }) {
  return (
    <div className="p-3 bg-white border rounded-lg shadow-sm max-w-[85%] space-y-2">
      <div className="font-semibold text-slate-800">
        📅 {event.title}
      </div>

      <div className="text-sm text-slate-600">{event.description}</div>

      <div className="text-sm text-slate-600">
        <span className="font-medium">Starts:</span> {new Date(event.start_time).toLocaleString()}
      </div>

      <button
        onClick={() => onRegister(event._id)}
        className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-sm w-full"
      >
        ➕ Register
      </button>
    </div>
  );
}
