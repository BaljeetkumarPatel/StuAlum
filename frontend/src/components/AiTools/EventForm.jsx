import { useState } from "react";
import axios from "axios";

export default function EventForm({ setOutput }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    startTime: "",
    endTime: "",
    capacity: "",
    audience: "Students",
    mode: "In person",
    location: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Backend API URL moved here
  const BACKEND_URL ="https://stualum.onrender.com/api/events/generate";
  
   //"http://localhost:5000/api/events/generate";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(BACKEND_URL, formData);
      setOutput(res.data.plan);
    } catch (err) {
      console.error(err);
      setOutput("⚠️ Error generating event plan. Please check the backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 p-8 rounded-2xl shadow-lg text-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-center text-white">
        🧠 AI Event Planner
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm">Event Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g., Hackathon, Career Fair"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-purple-800 border border-purple-600 rounded-md p-3 focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Category</label>
          <input
            type="text"
            name="category"
            placeholder="Workshop, Meetup, Seminar"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-purple-800 border border-purple-600 rounded-md p-3 focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full bg-purple-800 border border-purple-600 rounded-md p-3"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full bg-purple-800 border border-purple-600 rounded-md p-3"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Target Audience</label>
          <select
            name="audience"
            value={formData.audience}
            onChange={handleChange}
            className="w-full bg-purple-800 border border-purple-600 rounded-md p-3"
          >
            <option>Students</option>
            <option>Developers</option>
            <option>Corporate</option>
            <option>General Public</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm">Capacity (0 for unlimited)</label>
          <input
            type="number"
            name="capacity"
            placeholder="0"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full bg-purple-800 border border-purple-600 rounded-md p-3"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Event Mode</label>
          <select
            name="mode"
            value={formData.mode}
            onChange={handleChange}
            className="w-full bg-purple-800 border border-purple-600 rounded-md p-3"
          >
            <option>In person</option>
            <option>Online</option>
            <option>Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm">Location / Link</label>
          <input
            type="text"
            name="location"
            placeholder="e.g., Online link or Room 404"
            value={formData.location}
            onChange={handleChange}
            className="w-full bg-purple-800 border border-purple-600 rounded-md p-3"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm">Description</label>
        <textarea
          name="description"
          placeholder="Detailed description of the event, speakers, etc."
          rows="4"
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-purple-800 border border-purple-600 rounded-md p-3"
        />
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={() =>
            setFormData({
              title: "",
              category: "",
              startTime: "",
              endTime: "",
              capacity: "",
              audience: "Students",
              mode: "In person",
              location: "",
              description: "",
            })
          }
          className="px-6 py-3 bg-purple-700 hover:bg-purple-600 rounded-md text-white transition-all"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-md font-semibold text-white transition-all"
        >
          {loading ? "Generating..." : "Generate Event Plan"}
        </button>
      </div>
    </div>
  );
}
