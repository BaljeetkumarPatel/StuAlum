// import React, { useState, useEffect, useRef } from 'react';

// import { useParams, useNavigate } from 'react-router-dom';

// import axios from 'axios';

// import { getCurrentUserIdFromToken } from '../utils/authUtils';

// const API_BASE_URL = 'http://localhost:5000';

// const Messages = () => {
//     const { conversationId } = useParams();
//     const navigate = useNavigate();
//     const [conversations, setConversations] = useState([]);
//     const [filteredConversations, setFilteredConversations] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [currentConversation, setCurrentConversation] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [loading, setLoading] = useState(true);
//     const [sending, setSending] = useState(false);
//     const [editingMessageId, setEditingMessageId] = useState(null);
//     const [editingText, setEditingText] = useState('');
//     const [showContextMenu, setShowContextMenu] = useState(false);
//     const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
//     const [selectedMessage, setSelectedMessage] = useState(null);
//     const [replyTo, setReplyTo] = useState(null);
//     const [menuTimeout, setMenuTimeout] = useState(null);
//     const [triggerHovered, setTriggerHovered] = useState(false);
//     const [menuHovered, setMenuHovered] = useState(false);

//     const messagesEndRef = useRef(null);

//     const currentUserId = getCurrentUserIdFromToken();

//     // Scroll to bottom when new messages arrive
//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     // Fetch user's conversations
//     useEffect(() => {
//         const fetchConversations = async () => {
//             try {
//                 const response = await axios.get(`${API_BASE_URL}/api/messages/conversations`, {
//                     headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//                 });
//                 setConversations(response.data);
//                 setFilteredConversations(response.data);
//             } catch (error) {
//                 console.error('Error fetching conversations:', error);
//             }
//         };

//         if (currentUserId) {
//             fetchConversations();
//         }
//     }, [currentUserId]);

//     // Filter conversations based on search term
//     useEffect(() => {
//         if (!searchTerm.trim()) {
//             setFilteredConversations(conversations);
//         } else {
//             const filtered = conversations.filter(conversation =>
//                 conversation.otherParticipant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 conversation.lastMessage?.message_text?.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//             setFilteredConversations(filtered);
//         }
//     }, [searchTerm, conversations]);

//     // Fetch messages for current conversation
//     useEffect(() => {
//         const fetchMessages = async () => {
//             if (!conversationId) return;

//             // Skip if this is a mentorship conversation ID (not a real conversation)
//             if (conversationId.startsWith('mentorship-')) {
//                 // For mentorship conversations, set currentConversation from conversations list
//                 const mentorshipConv = conversations.find(conv => conv._id === conversationId);
//                 if (mentorshipConv) {
//                     setCurrentConversation({
//                         _id: mentorshipConv._id,
//                         title: mentorshipConv.title,
//                         otherParticipant: mentorshipConv.otherParticipant
//                     });
//                 }
//                 return;
//             }

//             setLoading(true);
//             try {
//                 const response = await axios.get(`${API_BASE_URL}/api/messages/conversation/${conversationId}`, {
//                     headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//                 });

//                 setMessages(response.data.messages);
//                 setCurrentConversation(response.data.conversation);

//                 // Refresh conversations to update unread counts after viewing messages
//                 const conversationsResponse = await axios.get(`${API_BASE_URL}/api/messages/conversations`, {
//                     headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//                 });
//                 setConversations(conversationsResponse.data);
//             } catch (error) {
//                 console.error('Error fetching messages:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchMessages();
//     }, [conversationId]);

//     // Update currentConversation for mentorship conversations when conversations load
//     useEffect(() => {
//         if (conversationId?.startsWith('mentorship-')) {
//             const mentorshipConv = conversations.find(conv => conv._id === conversationId);
//             if (mentorshipConv) {
//                 setCurrentConversation({
//                     _id: mentorshipConv._id,
//                     title: mentorshipConv.title,
//                     otherParticipant: mentorshipConv.otherParticipant
//                 });
//             }
//         }
//     }, [conversations, conversationId]);

//     const handleSendMessage = async (e) => {
//         e.preventDefault();
//         if (!newMessage.trim() || !conversationId) return;

//         // Skip if this is a mentorship conversation ID (not a real conversation)
//         if (conversationId.startsWith('mentorship-')) return;

//         setSending(true);
//         try {
//             const response = await axios.post(`${API_BASE_URL}/api/messages/send`, {
//                 conversation_id: conversationId,
//                 message_text: newMessage.trim()
//             }, {
//                 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//             });

//             setMessages(prev => [...prev, response.data]);
//             setNewMessage('');

//             // Refresh conversations to update last message and unread counts
//             const conversationsResponse = await axios.get(`${API_BASE_URL}/api/messages/conversations`, {
//                 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//             });
//             setConversations(conversationsResponse.data);
//         } catch (error) {
//             console.error('Error sending message:', error);
//             alert('Failed to send message. Please try again.');
//         } finally {
//             setSending(false);
//         }
//     };

//     const handleEditMessage = async (messageId, newText) => {
//         if (!newText.trim()) return;

//         try {
//             const response = await axios.put(`${API_BASE_URL}/api/messages/${messageId}`, {
//                 message_text: newText.trim()
//             }, {
//                 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//             });

//             setMessages(prev => prev.map(msg =>
//                 msg._id === messageId ? response.data : msg
//             ));

//             setEditingMessageId(null);
//             setEditingText('');
//         } catch (error) {
//             console.error('Error editing message:', error);
//             alert('Failed to edit message. Please try again.');
//         }
//     };

//     const handleDeleteMessage = async (messageId, isCurrentUser, deleteType) => {
//         const confirmMessage = deleteType === 'forEveryone'
//             ? 'Are you sure you want to delete this message for everyone?'
//             : 'Are you sure you want to delete this message for yourself?';

//         if (!window.confirm(confirmMessage)) return;

//         try {
//             await axios.delete(`${API_BASE_URL}/api/messages/${messageId}`, {
//                 data: { deleteType },
//                 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//             });

//             if (deleteType === 'forEveryone') {
//                 // For global delete, mark as deleted in UI
//                 setMessages(prev => prev.map(msg =>
//                     msg._id === messageId ? { ...msg, is_deleted: true } : msg
//                 ));
//             } else {
//                 // For delete for self, remove from UI
//                 setMessages(prev => prev.filter(msg => msg._id !== messageId));
//             }
//         } catch (error) {
//             console.error('Error deleting message:', error);
//             alert('Failed to delete message. Please try again.');
//         }
//     };

//     const formatTime = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     };

//     // Handle long press for context menu (removed as per plan)

//     // Handle context menu actions
//     const handleReply = () => {
//         setReplyTo(selectedMessage);
//         setShowContextMenu(false);
//     };

//     const handleForward = () => {
//         // For now, just copy to clipboard
//         navigator.clipboard.writeText(selectedMessage.message_text);
//         alert('Message copied to clipboard');
//         setShowContextMenu(false);
//     };

//     const handleCopy = () => {
//         navigator.clipboard.writeText(selectedMessage.message_text);
//         alert('Message copied to clipboard');
//         setShowContextMenu(false);
//     };

//     const handleEdit = () => {
//         setEditingMessageId(selectedMessage._id);
//         setEditingText(selectedMessage.message_text);
//         setShowContextMenu(false);
//     };

//     // Close context menu when clicking outside
//     useEffect(() => {
//         const handleClickOutside = () => {
//             setShowContextMenu(false);
//         };
//         if (showContextMenu) {
//             document.addEventListener('click', handleClickOutside);
//         }
//         return () => {
//             document.removeEventListener('click', handleClickOutside);
//         };
//     }, [showContextMenu]);

//     // Handle menu visibility based on hover states
//     useEffect(() => {
//         if (triggerHovered || menuHovered) {
//             setShowContextMenu(true);
//         } else {
//             const timeout = setTimeout(() => setShowContextMenu(false), 300);
//             setMenuTimeout(timeout);
//             return () => clearTimeout(timeout);
//         }
//     }, [triggerHovered, menuHovered]);

//     return (
//         <div className="messages-page flex h-screen bg-gray-50">
//             {/* Conversations Sidebar */}
//             <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
//                 <div className="p-4 border-b border-gray-200">
//                     <h2 className="text-xl font-bold text-gray-800">Messages</h2>
//                     <input
//                         type="text"
//                         placeholder="Search conversations..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>
//                 <div className="flex-1 overflow-y-auto">
//                     {filteredConversations.map(conversation => (
//                         <div
//                             key={conversation._id}
//                             onClick={() => {
//                                 if (conversation.isMentorship) {
//                                     // For mentorship conversations, create or get real conversation first
//                                     const otherUserId = conversation.otherParticipant._id;
//                                     axios.post(`${API_BASE_URL}/api/messages/conversation`, {
//                                         otherUserId: otherUserId
//                                     }, {
//                                         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//                                     }).then(response => {
//                                         navigate(`/messages/${response.data.conversation._id}`);
//                                     }).catch(error => {
//                                         console.error('Error creating mentorship conversation:', error);
//                                         alert('Failed to start mentorship conversation. Please try again.');
//                                     });
//                                 } else {
//                                     navigate(`/messages/${conversation._id}`);
//                                 }
//                             }}
//                             className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
//                                 conversation._id === conversationId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
//                             }`}
//                         >
//                             <div className="flex items-center space-x-3">
//                                 <img
//                                     src={conversation.otherParticipant?.profile_photo_url
//                                         ? `${API_BASE_URL}${conversation.otherParticipant.profile_photo_url}`
//                                         : '/default-avatar.png'}
//                                     alt={conversation.otherParticipant?.full_name}
//                                     className="w-10 h-10 rounded-full object-cover"
//                                 />
//                                 <div className="flex-1 min-w-0">
//                                     <div className="flex justify-between items-start">
//                                         <div className="flex-1 min-w-0">
//                                             <p className="font-semibold text-gray-900 truncate">
//                                                 {conversation.otherParticipant?.full_name}
//                                             </p>
//                                             <p className="text-sm text-gray-500 truncate">
//                                                 {conversation.lastMessage?.message_text || ''}
//                                             </p>
//                                         </div>
//                                         {conversation.unreadCount > 0 && (
//                                             <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
//                                                 {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                     {filteredConversations.length === 0 && searchTerm && (
//                         <div className="p-8 text-center text-gray-500">
//                             No conversations match your search.
//                         </div>
//                     )}
//                     {filteredConversations.length === 0 && !searchTerm && (
//                         <div className="p-8 text-center text-gray-500">
//                             No conversations yet. Start messaging with alumni!
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Messages Area */}
//             <div className="flex-1 flex flex-col">
//                 {conversationId ? (
//                     <>
//                         {/* Chat Header */}
//                         <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
//                             <img
//                                 src={currentConversation?.otherParticipant?.profile_photo_url
//                                     ? `${API_BASE_URL}${currentConversation.otherParticipant.profile_photo_url}`
//                                     : '/default-avatar.png'}
//                                 alt={currentConversation?.otherParticipant?.full_name || 'Avatar'}
//                                 className="w-10 h-10 rounded-full object-cover"
//                             />
//                             <div>
//                                 <h3 className="font-semibold text-gray-900">
//                                     {currentConversation?.otherParticipant?.full_name || currentConversation?.otherParticipant?.email || 'User'}
//                                 </h3>
//                                 <p className="text-sm text-gray-500">
//                                     {currentConversation?.otherParticipant?.role
//                                         ? currentConversation.otherParticipant.role.charAt(0).toUpperCase() + currentConversation.otherParticipant.role.slice(1)
//                                         : ''
//                                     }
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Messages List */}
//                         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//                             {conversationId.startsWith('mentorship-') ? (
//                                 <div className="text-center text-gray-500">
//                                     <i className="fas fa-handshake text-6xl text-gray-300 mb-4"></i>
//                                     <h3 className="text-xl font-semibold text-gray-600 mb-2">Mentorship Conversation</h3>
//                                     <p className="text-gray-500">Send your first message to start the mentorship conversation!</p>
//                                 </div>
//                             ) : loading ? (
//                                 <div className="text-center text-gray-500">Loading messages...</div>
//                             ) : messages.length === 0 ? (
//                                 <div className="text-center text-gray-500">
//                                     No messages yet. Start the conversation!
//                                 </div>
//                             ) : (
//                                 messages.map(message => {
//                                     const senderId = message.sender_id?._id || message.sender_id;
//                                     const isCurrentUser = senderId && senderId.toString() === currentUserId;
//                                     return (
//                                         <div
//                                             key={message._id}
//                                             className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
//                                         >
//                                             <div className="flex flex-col">
//                                                 <div
//                                                     className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
//                                                         isCurrentUser
//                                                             ? 'bg-blue-500 text-white'
//                                                             : 'bg-gray-200 text-gray-800'
//                                                     }`}
//                                                 >
//                                                     {editingMessageId === message._id ? (
//                                                         <div className="space-y-2">
//                                                             <input
//                                                                 type="text"
//                                                                 value={editingText}
//                                                                 onChange={(e) => setEditingText(e.target.value)}
//                                                                 className="w-full px-2 py-1 text-sm border rounded"
//                                                                 autoFocus
//                                                             />
//                                                             <div className="flex space-x-2">
//                                                                 <button
//                                                                     onClick={() => handleEditMessage(message._id, editingText)}
//                                                                     className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
//                                                                 >
//                                                                     Save
//                                                                 </button>
//                                                                 <button
//                                                                     onClick={() => {
//                                                                         setEditingMessageId(null);
//                                                                         setEditingText('');
//                                                                     }}
//                                                                     className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
//                                                                 >
//                                                                     Cancel
//                                                                 </button>
//                                                             </div>
//                                                         </div>
//                                                     ) : (
//                                                         <>
//                                                             <p className="text-sm">
//                                                                 {message.is_deleted ? (
//                                                                     <span className="italic text-gray-500">This message was deleted</span>
//                                                                 ) : (
//                                                                     message.message_text
//                                                                 )}
//                                                             </p>
//                                                             <div className="flex items-center justify-between mt-1">
//                                                                 <p className={`text-xs ${
//                                                                     isCurrentUser ? 'text-blue-100' : 'text-gray-500'
//                                                                 }`}>
//                                                                     {formatTime(message.sent_at)}
//                                                                     {message.edited_at && ' (edited)'}
//                                                                 </p>
//                                                                 {!message.is_deleted && (
//                                                                     <div className="flex items-center space-x-1 relative">
//                                                                         <div
//                                                                             className="relative"
//                                                                             onMouseEnter={(e) => {
//                                                                                 setSelectedMessage(message);
//                                                                                 setContextMenuPosition({ x: e.clientX, y: e.clientY });
//                                                                                 setTriggerHovered(true);
//                                                                             }}
//                                                                             onMouseLeave={() => {
//                                                                                 setTriggerHovered(false);
//                                                                             }}
//                                                                         >
//                                                                             <span className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
//                                                                                 ^
//                                                                             </span>
//                                                                         </div>
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                         </>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })
//                             )}
//                             <div ref={messagesEndRef} />
//                         </div>

//                         {/* Context Menu */}
//                         {showContextMenu && selectedMessage && (
//                             <div
//                                 className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50"
//                                 style={{
//                                     left: contextMenuPosition.x,
//                                     top: contextMenuPosition.y,
//                                     transform: 'translate(-50%, -100%)'
//                                 }}
//                                 onMouseEnter={() => {
//                                     setMenuHovered(true);
//                                 }}
//                                 onMouseLeave={() => {
//                                     setMenuHovered(false);
//                                 }}
//                             >
//                                 <div className="py-2">
//                                     <button
//                                         onClick={handleReply}
//                                         className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
//                                     >
//                                         Reply
//                                     </button>
//                                     <button
//                                         onClick={handleForward}
//                                         className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
//                                     >
//                                         Forward
//                                     </button>
//                                     <button
//                                         onClick={handleCopy}
//                                         className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
//                                     >
//                                         Copy
//                                     </button>
//                                     {selectedMessage.sender_id?._id === currentUserId && (
//                                         <button
//                                             onClick={handleEdit}
//                                             className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
//                                         >
//                                             Edit
//                                         </button>
//                                     )}
//                                     {selectedMessage.sender_id?._id === currentUserId ? (
//                                         <>
//                                             <button
//                                                 onClick={() => {
//                                                     handleDeleteMessage(selectedMessage._id, true, 'forEveryone');
//                                                     setShowContextMenu(false);
//                                                 }}
//                                                 className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
//                                             >
//                                                 Delete for Everyone
//                                             </button>
//                                             <button
//                                                 onClick={() => {
//                                                     handleDeleteMessage(selectedMessage._id, true, 'forMe');
//                                                     setShowContextMenu(false);
//                                                 }}
//                                                 className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
//                                             >
//                                                 Delete for Me
//                                             </button>
//                                         </>
//                                     ) : (
//                                         <button
//                                             onClick={() => {
//                                                 handleDeleteMessage(selectedMessage._id, false, 'forMe');
//                                                 setShowContextMenu(false);
//                                             }}
//                                             className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
//                                         >
//                                             Delete for Me
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Reply Indicator */}
//                         {replyTo && (
//                             <div className="bg-gray-100 border-l-4 border-blue-500 p-3 flex items-center justify-between">
//                                 <div className="flex-1">
//                                     <p className="text-sm font-semibold text-gray-700">
//                                         Replying to {replyTo.sender_id?._id === currentUserId ? 'yourself' : currentConversation?.otherParticipant?.full_name}
//                                     </p>
//                                     <p className="text-sm text-gray-600 truncate">{replyTo.message_text}</p>
//                                 </div>
//                                 <button
//                                     onClick={() => setReplyTo(null)}
//                                     className="text-gray-500 hover:text-gray-700 ml-2"
//                                 >
//                                     ✕
//                                 </button>
//                             </div>
//                         )}

//                         {/* Message Input */}
//                         <div className="bg-white border-t border-gray-200 p-4">
//                             <form onSubmit={handleSendMessage} className="flex space-x-2">
//                                 <input
//                                     type="text"
//                                     value={newMessage}
//                                     onChange={(e) => setNewMessage(e.target.value)}
//                                     placeholder="Type your message..."
//                                     className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     disabled={sending}
//                                 />
//                                 <button
//                                     type="submit"
//                                     disabled={sending || !newMessage.trim()}
//                                     className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                                 >
//                                     {sending ? 'Sending...' : 'Send'}
//                                 </button>
//                             </form>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="flex-1 flex items-center justify-center bg-gray-50">
//                         <div className="text-center">
//                             <i className="fas fa-comments text-6xl text-gray-300 mb-4"></i>
//                             <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a conversation</h3>
//                             <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

    // src/pages/Messages.jsx
    import React, { useEffect, useState, useRef, useCallback } from 'react';
    import axios from 'axios';
    import { io } from 'socket.io-client';
    import { useParams, useNavigate } from 'react-router-dom';
    import { getCurrentUserIdFromToken } from '../utils/authUtils';

    const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    const SOCKET_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

    const Messages = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const currentUserId = getCurrentUserIdFromToken();

    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const socketRef = useRef(null);
    const endRef = useRef(null);

    // connect socket
    useEffect(() => {
        const token = localStorage.getItem('token');
        socketRef.current = io(SOCKET_URL, { auth: { token } });

        socketRef.current.on('connect', () => {
        // console.log('socket connected', socketRef.current.id);
        });

        socketRef.current.on('newMessage', (msg) => {
        if (!msg) return;
        if (String(msg.conversation_id) === String(conversationId)) {
            setMessages(prev => [...prev, msg]);
        }
        refreshConversations();
        });

        socketRef.current.on('messageEdited', (msg) => {
        setMessages(prev => prev.map(m => m._id === msg._id ? msg : m));
        refreshConversations();
        });

        socketRef.current.on('messageDeleted', ({ messageId, conversation_id, deleteType }) => {
        if (String(conversationId) === String(conversation_id)) {
            if (deleteType === 'forEveryone') {
            setMessages(prev => prev.map(m => m._id === messageId ? { ...m, is_deleted: true } : m));
            } else {
            setMessages(prev => prev.filter(m => m._id !== messageId));
            }
        }
        refreshConversations();
        });

        socketRef.current.on('conversationsUpdated', () => {
        refreshConversations();
        });

        socketRef.current.on('typing', ({ conversation_id, user }) => {
        // show typing indicator if desired
        });

        return () => {
        socketRef.current.disconnect();
        };
    }, [conversationId]);

    const refreshConversations = useCallback(async () => {
        try {
        const res = await axios.get(`${API_BASE}/api/messages/conversations`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setConversations(res.data);
        setFilteredConversations(res.data);
        } catch (err) {
        console.error('Failed to load conversations', err);
        }
    }, []);

    useEffect(() => { refreshConversations(); }, [refreshConversations]);

    useEffect(() => {
        const fetchMessages = async () => {
        if (!conversationId) {
            setMessages([]);
            setCurrentConversation(null);
            return;
        }
        try {
            const res = await axios.get(`${API_BASE}/api/messages/conversation/${conversationId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCurrentConversation(res.data.conversation);
            setMessages(res.data.messages || []);
            if (socketRef.current) socketRef.current.emit('joinConversation', { conversationId });
        } catch (err) {
            console.error('Failed to load messages', err);
        }
        };
        fetchMessages();
        return () => {
        if (socketRef.current) socketRef.current.emit('leaveConversation', { conversationId });
        };
    }, [conversationId]);

    useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !conversationId) return;
        setSending(true);
        try {
        const res = await axios.post(`${API_BASE}/api/messages/send`, {
            conversation_id: conversationId,
            message_text: newMessage.trim()
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

        // REST returns created message; socket will also emit to others
        const created = res.data;
        setMessages(prev => [...prev, created]);
        setNewMessage('');
        if (socketRef.current) {
            // optional: let server handle broadcast; this is extra if you want optimistic update
            socketRef.current.emit('sendMessage', created);
        }
        refreshConversations();
        } catch (err) {
        console.error('Send failed', err);
        alert('Send failed');
        } finally {
        setSending(false);
        }
    };

    const handleStartConversation = async (otherUserId) => {
        try {
        const res = await axios.post(`${API_BASE}/api/messages/conversation`, { otherUserId }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        navigate(`/messages/${res.data.conversation._id}`);
        } catch (err) {
        console.error('Start conv failed', err);
        alert('Could not start conversation');
        }
    };

    return (
        <div className="messages-page flex h-screen bg-gray-50">
        <div className="w-1/4 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
            <h2 className="text-lg font-bold">Messages</h2>
            <input type="text" placeholder="Search..." onChange={(e)=>{
                const s = e.target.value.toLowerCase();
                setFilteredConversations(conversations.filter(c => (c.otherParticipant?.full_name||'').toLowerCase().includes(s) || (c.lastMessage?.message_text||'').toLowerCase().includes(s)));
            }} className="w-full mt-2 px-3 py-2 border rounded" />
            </div>
            <div className="flex-1 overflow-auto">
            {filteredConversations.map(conv => (
                <div key={conv._id} onClick={() => navigate(`/messages/${conv._id}`)} className={`p-3 border-b cursor-pointer ${conv._id===conversationId ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center">
                    <img src={conv.otherParticipant?.profile_photo_url ? `${API_BASE}${conv.otherParticipant.profile_photo_url}` : '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full mr-3 object-cover" />
                    <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{conv.otherParticipant?.full_name || conv.otherParticipant?.email || 'User'}</div>
                    <div className="text-sm text-gray-500 truncate">{conv.lastMessage?.message_text || ''}</div>
                    </div>
                    {conv.unreadCount > 0 && <div className="ml-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">{conv.unreadCount>99 ? '99+' : conv.unreadCount}</div>}
                </div>
                </div>
            ))}
            {filteredConversations.length === 0 && <div className="p-4 text-center text-gray-500">No conversations</div>}
            </div>
        </div>

        <div className="flex-1 flex flex-col">
            {conversationId ? (
            <>
                <div className="bg-white border-b p-4 flex items-center space-x-3">
                <img src={currentConversation?.otherParticipant?.profile_photo_url ? `${API_BASE}${currentConversation.otherParticipant.profile_photo_url}` : '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <div className="font-semibold">{currentConversation?.otherParticipant?.full_name || currentConversation?.otherParticipant?.email || 'User'}</div>
                    <div className="text-sm text-gray-500">{currentConversation?.otherParticipant?.role || ''}</div>
                </div>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-4 bg-slate-50">
                {messages.length === 0 ? <div className="text-center text-gray-500">No messages yet</div> :
                    messages.map(m => {
                    const senderIdObj = m.sender_id && typeof m.sender_id === 'object' ? (m.sender_id._id || m.sender_id) : m.sender_id;
                    const isMe = String(senderIdObj) === String(currentUserId);
                    return (
                        <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-lg ${isMe ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}>
                            <div className="text-sm">{m.is_deleted ? <em>This message was deleted</em> : m.message_text}</div>
                            <div className="text-xs mt-1 text-gray-400">{new Date(m.sent_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}{m.edited_at && ' (edited)'}</div>
                        </div>
                        </div>
                    );
                    })
                }
                <div ref={endRef} />
                </div>

                <form onSubmit={handleSend} className="bg-white border-t p-3 flex items-center space-x-2">
                <input value={newMessage} onChange={(e)=> setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-3 py-2 border rounded"/>
                <button type="submit" disabled={!newMessage.trim() || sending} className="px-4 py-2 bg-blue-500 text-white rounded">{sending ? 'Sending...' : 'Send'}</button>
                </form>
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
    );
    };

    export default Messages;
