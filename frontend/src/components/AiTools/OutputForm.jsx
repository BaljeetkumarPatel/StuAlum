export default function OutputDisplay({ output, eventData }) {
  if (!output) return null;

  const { title, startTime, endTime, location, description } = eventData || {};

  const copyText = () => {
    navigator.clipboard.writeText(output);
    alert("✅ Event plan copied to clipboard!");
  };

  const downloadText = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title || "Event_Plan"}.txt`;
    a.click();
  };

  const addToGoogleCalendar = () => {
    const eventTitle = encodeURIComponent(title || "AI Generated Event");
    const eventDescription = encodeURIComponent(output || description || "No description provided.");
    const eventLocation = encodeURIComponent(location || "Online / TBD");

    const start = startTime
      ? new Date(startTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
      : new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const end = endTime
      ? new Date(endTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
      : new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
          .toISOString()
          .replace(/[-:]/g, "")
          .split(".")[0] + "Z";

    const googleCalendarURL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDescription}&location=${eventLocation}&dates=${start}/${end}`;

    window.open(googleCalendarURL, "_blank");
  };

  // const publishOnApp = () => {
  //   alert("🚀 Event published successfully on your app!");
  // };

  const publishOnApp = () => {
    // 🔹 Dummy backend endpoint
    //http://localhost:5000/api/events/publish
    fetch("https://stualum.onrender.com/api/events/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, location, output }),
    })
      .then((res) => res.json())
    .then((data) => {
      alert("🚀 Event published successfully!");
      console.log("📦 Published Event:", data.event);
    })
      .catch(() => alert("⚠️ Failed to publish event."));
  };

  return (
    <div className="bg-gradient-to-br from-purple-950 via-indigo-900 to-purple-950 p-8 rounded-2xl shadow-lg text-gray-100 border border-purple-700 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-fuchsia-400 text-center">
        🎉 Generated Event Plan
      </h2>

      <div className="whitespace-pre-wrap bg-purple-900 p-5 rounded-xl border border-purple-700 text-gray-100 shadow-inner overflow-x-auto">
        {output}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button
          onClick={copyText}
          className="bg-purple-700 hover:bg-purple-600 px-5 py-2 rounded-md font-medium text-white transition-all"
        >
          📋 Copy
        </button>

        <button
          onClick={downloadText}
          className="bg-fuchsia-600 hover:bg-fuchsia-500 px-5 py-2 rounded-md font-medium text-white transition-all"
        >
          ⬇️ Download
        </button>

        <button
          onClick={addToGoogleCalendar}
          className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-md font-medium text-white transition-all"
        >
          📅 Add to Google Calendar
        </button>

        <button
          onClick={publishOnApp}
          className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-md font-medium text-white transition-all"
        >
          🚀 Publish on App
        </button>
      </div>
    </div>
  );
}
