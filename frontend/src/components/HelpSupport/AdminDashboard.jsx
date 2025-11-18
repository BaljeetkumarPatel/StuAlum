import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("https://stualum.onrender.com/api/contact"); //http://localhost:5000/api/contact
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, []);

  return (
    <section id="admin-dashboard" className="max-w-6xl mx-auto p-6 mt-10">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">
        All Complaint list 🧾
      </h2>
      <div className="overflow-x-auto bg-white shadow rounded-2xl border-l-4 border-blue-500">
        <table className="min-w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Message</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <tr
                  key={msg._id}
                  className="border-b hover:bg-blue-50 transition"
                >
                  <td className="px-4 py-2">{msg.name}</td>
                  <td className="px-4 py-2">{msg.email}</td>
                  <td className="px-4 py-2">{msg.message}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(msg.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
