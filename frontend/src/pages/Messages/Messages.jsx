// src/pages/Messages/Messages.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import withSidebarToggle from '../../hocs/withSidebarToggle';
import Navbar from '../../components/Navbar';

import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import useChatSocket from "./useChatSocket";

import { getCurrentUserIdFromToken } from "../../utils/authUtils";

const API_BASE = "http://localhost:5000";
const SOCKET_URL = "http://localhost:5000";

const Messages = ({ onSidebarToggle }) => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserIdFromToken();

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const endRef = useRef(null);

  // SOCKET.IO CONNECT
  const token = localStorage.getItem("token");
  const socketRef = useChatSocket(token, {
    newMessage: (msg) => {
      if (String(msg.conversation_id) === String(conversationId)) {
        setMessages((prev) => [...prev, msg]);
      }
      refreshConversations();
    },

    messageEdited: (msg) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    },

    messageDeleted: ({ messageId, conversation_id, deleteType }) => {
      if (conversation_id === conversationId) {
        if (deleteType === "forEveryone") {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId ? { ...m, is_deleted: true } : m
            )
          );
        } else {
          setMessages((prev) => prev.filter((m) => m._id !== messageId));
        }
      }
      refreshConversations();
    },

    conversationsUpdated: () => refreshConversations(),
  });

  // REFRESH CONVERSATIONS
  const refreshConversations = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setConversations(res.data);
      setFilteredConversations(res.data);
    } catch (err) {
      console.error("Conversation fetch failed:", err);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, []);

  // FETCH MESSAGES OF CURRENT CONVERSATION
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId || conversationId.startsWith("mentorship-")) {
        setMessages([]);
        setCurrentConversation(null);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/api/messages/conversation/${conversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCurrentConversation(res.data.conversation);
        setMessages(res.data.messages || []);

        // join room
        socketRef.current?.emit("joinConversation", { conversationId });
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();
    return () => {
      socketRef.current?.emit("leaveConversation", { conversationId });
    };
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/messages/send`,
        {
          conversation_id: conversationId,
          message_text: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const created = res.data;
      setMessages((prev) => [...prev, created]);
      setNewMessage("");

      socketRef.current?.emit("sendMessage", created);

      refreshConversations();
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
        <Navbar onSidebarToggle={onSidebarToggle} />
        <main className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white">
            <div className="messages-page flex h-screen bg-gray-50">
              {/* SIDEBAR */}
              <Sidebar
                conversations={filteredConversations}
                selectedId={conversationId}
                // onSelect={(id) => navigate(`/messages/${id}`)}
                onSelect={async (id) => {
                    // If mentorship pseudo-id
                    if (id.startsWith("mentorship-")) {
                        const otherUserId = id.replace("mentorship-", "");

                        // Call backend to create/get real conversation
                        const res = await axios.post(`${API_BASE}/api/messages/conversation`, {
                            otherUserId
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        navigate(`/messages/${res.data.conversation_id}`);
                    } else {
                        navigate(`/messages/${id}`);
                    }
                  }}

              />

              {/* MAIN CHAT PANEL */}
              <div className="flex-1 flex flex-col">
                {conversationId ? (
                  <>
                    <ChatHeader user={currentConversation?.otherParticipant} />

                    <ChatMessages
                      messages={messages}
                      currentUserId={currentUserId}
                      scrollRef={endRef}
                    />

                    <MessageInput
                      newMessage={newMessage}
                      setNewMessage={setNewMessage}
                      onSend={handleSend}
                      sending={sending}
                    />
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <h3 className="text-xl">Select a conversation</h3>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </main>
    </>
  );
};

export default Messages;

