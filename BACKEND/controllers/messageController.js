// const mongoose = require('mongoose');
// const Conversation = require('../models/Conservation');
// const ConversationParticipant = require('../models/ConversationParticipant');
// const Message = require('../models/Message');
// const AlumniProfile = require('../models/AlumniProfile');
// const AdminProfile = require('../models/AdminProfile');
// const StudentProfile = require('../models/StudentProfile');
// const MentorshipRequest = require('../models/MentorshipRequest');

// // Get all conversations for the logged-in user
// exports.getConversations = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const userRole = req.user.role;

//         // Find all conversations where the user is a participant
//         const participants = await ConversationParticipant.find({ user_id: userId })
//             .populate('conversation_id');

//         const conversationsWithDetails = await Promise.all(
//             participants.map(async (participant) => {
//                 const conversation = participant.conversation_id;

//                 // Find the other participant
//                 const otherParticipantDoc = await ConversationParticipant.findOne({
//                     conversation_id: conversation._id,
//                     user_id: { $ne: userId }
//                 });

//                 if (!otherParticipantDoc) return null;

//                 const otherUser = await User.findById(otherParticipantDoc.user_id);
//                 if (!otherUser) return null;

//                 // Get profile based on email
//                 let profile = null;
//                 if (otherUser.role === 'alumni') {
//                     profile = await AlumniProfile.findOne({ email: otherUser.email });
//                 } else if (otherUser.role === 'admin') {
//                     profile = await AdminProfile.findOne({ email: otherUser.email });
//                 } else if (otherUser.role === 'student') {
//                     profile = await StudentProfile.findOne({ email: otherUser.email });
//                 }

//                 // Get last message (include deleted messages for sidebar display)
//                 const lastMessage = await Message.findOne({
//                     conversation_id: conversation._id
//                 })
//                     .sort({ sent_at: -1 })
//                     .populate('sender_id', 'full_name');

//                 // Count unread messages for this conversation
//                 const unreadCount = await Message.countDocuments({
//                     conversation_id: conversation._id,
//                     sender_id: { $ne: userId },
//                     is_read: false,
//                     is_deleted: false,
//                     deleted_by_users: { $ne: userId }
//                 });

//                 return {
//                     _id: conversation._id,
//                     title: conversation.title,
//                     otherParticipant: {
//                         _id: otherUser._id,
//                         full_name: profile?.full_name || otherUser.email || 'Unknown User',
//                         email: otherUser.email,
//                         role: otherUser.role,
//                         profile_photo_url: profile?.profile_photo_url,
//                         current_position: profile?.current_position,
//                         company: profile?.company
//                     },
//                     lastMessage: lastMessage ? {
//                         message_text: lastMessage.message_text,
//                         sent_at: lastMessage.sent_at,
//                         sender_id: lastMessage.sender_id
//                     } : null,
//                     unreadCount,
//                     created_at: conversation.created_at
//                 };
//             })
//         );

//         // Get mentorship-related conversations
//         let mentorshipConversations = [];
//         if (userRole === 'student') {
//             // For students: get conversations with accepted mentors
//             const acceptedRequests = await MentorshipRequest.find({
//                 mentee_id: userId,
//                 status: 'accepted'
//             }).populate('mentor_id');

//             mentorshipConversations = await Promise.all(
//                 acceptedRequests.map(async (request) => {
//                     const mentor = request.mentor_id;
//                     const mentorProfile = await AlumniProfile.findOne({ email: mentor.email });

//                     // Check if conversation already exists
//                     const existingConv = conversationsWithDetails.find(conv =>
//                         conv?.otherParticipant._id.toString() === mentor._id.toString()
//                     );

//                     if (existingConv) return null; // Skip if already in regular conversations

//                     // Create a pseudo-conversation for mentorship
//                     return {
//                         _id: `mentorship-${mentor._id}`,
//                         title: 'Mentorship Conversation',
//                         otherParticipant: {
//                             _id: mentor._id,
//                             full_name: mentorProfile?.full_name || mentor.email,
//                             email: mentor.email,
//                             role: 'alumni',
//                             profile_photo_url: mentorProfile?.profile_photo_url,
//                             current_position: mentorProfile?.current_position,
//                             company: mentorProfile?.company
//                         },
//                         lastMessage: null,
//                         unreadCount: 0,
//                         created_at: request.created_at,
//                         isMentorship: true
//                     };
//                 })
//             );
//         } else if (userRole === 'alumni') {
//             // For alumni: get conversations with accepted mentees
//             const acceptedRequests = await MentorshipRequest.find({
//                 mentor_id: userId,
//                 status: 'accepted'
//             }).populate('mentee_id');

//             mentorshipConversations = await Promise.all(
//                 acceptedRequests.map(async (request) => {
//                     const mentee = request.mentee_id;
//                     const menteeProfile = await StudentProfile.findOne({ email: mentee.email });

//                     // Check if conversation already exists
//                     const existingConv = conversationsWithDetails.find(conv =>
//                         conv?.otherParticipant._id.toString() === mentee._id.toString()
//                     );

//                     if (existingConv) return null; // Skip if already in regular conversations

//                     // Create a pseudo-conversation for mentorship
//                     return {
//                         _id: `mentorship-${mentee._id}`,
//                         title: 'Mentorship Conversation',
//                         otherParticipant: {
//                             _id: mentee._id,
//                             full_name: menteeProfile?.full_name || mentee.email,
//                             email: mentee.email,
//                             role: 'student',
//                             profile_photo_url: menteeProfile?.profile_photo_url,
//                             current_position: null,
//                             company: null
//                         },
//                         lastMessage: null,
//                         unreadCount: 0,
//                         created_at: request.created_at,
//                         isMentorship: true
//                     };
//                 })
//             );
//         }

//         // Filter out null conversations and sort by last message time
//         const validConversations = conversationsWithDetails
//             .filter(conv => conv !== null)
//             .concat(mentorshipConversations.filter(conv => conv !== null))
//             .sort((a, b) => {
//                 if (!a.lastMessage && !b.lastMessage) return 0;
//                 if (!a.lastMessage) return 1;
//                 if (!b.lastMessage) return -1;
//                 return new Date(b.lastMessage.sent_at) - new Date(a.lastMessage.sent_at);
//             });

//         res.status(200).json(validConversations);
//     } catch (error) {
//         console.error('Error fetching conversations:', error);
//         res.status(500).json({ message: 'Server error while fetching conversations' });
//     }
// };

// // Get messages for a specific conversation
// exports.getConversationMessages = async (req, res) => {
//     try {
//         const { conversationId } = req.params;
//         const userId = req.user.id;

//         // Verify user is participant in this conversation
//         const isParticipant = await ConversationParticipant.findOne({
//             conversation_id: conversationId,
//             user_id: userId
//         });

//         if (!isParticipant) {
//             return res.status(403).json({ message: 'Access denied to this conversation' });
//         }

//         // Get conversation details
//         const conversation = await Conversation.findById(conversationId);
//         if (!conversation) {
//             return res.status(404).json({ message: 'Conversation not found' });
//         }

//         // Get other participant details
//         const otherParticipantDoc = await ConversationParticipant.findOne({
//             conversation_id: conversationId,
//             user_id: { $ne: userId }
//         });

//         let otherParticipant = null;
//         if (otherParticipantDoc) {
//             const otherUser = await User.findById(otherParticipantDoc.user_id);
//             if (otherUser) {
//                 // Get profile based on email
//                 let profile = null;
//                 if (otherUser.role === 'alumni') {
//                     profile = await AlumniProfile.findOne({ email: otherUser.email });
//                 } else if (otherUser.role === 'admin') {
//                     profile = await AdminProfile.findOne({ email: otherUser.email });
//                 } else if (otherUser.role === 'student') {
//                     profile = await StudentProfile.findOne({ email: otherUser.email });
//                 }

//                 otherParticipant = {
//                     _id: otherUser._id,
//                     full_name: profile?.full_name || otherUser.email || 'Unknown User',
//                     email: otherUser.email,
//                     role: otherUser.role,
//                     profile_photo_url: profile?.profile_photo_url,
//                     current_position: profile?.current_position,
//                     company: profile?.company
//                 };
//             }
//         }

//         // Get messages (exclude globally deleted and those deleted by current user)
//         const messagesRaw = await Message.find({
//             conversation_id: conversationId,
//             is_deleted: false,
//             deleted_by_users: { $ne: userId }
//         })
//             .sort({ sent_at: 1 });

//         // Populate sender details
//         const messages = await Promise.all(messagesRaw.map(async message => {
//             let full_name = message.sender_name;
//             let email = message.sender_email;
//             let role = message.sender_role;
//             let senderId = message.sender_id;
//             let profile_photo_url = null;

//             // Always fetch fresh user details from profile models using sender_id
//             if (senderId) {
//                 // First get the User to find the email
//                 const user = await User.findById(senderId);
//                 if (user) {
//                     email = user.email;
//                     role = user.role;

//                     // Now find the profile using email
//                     let profile = null;
//                     if (user.role === 'alumni') {
//                         profile = await AlumniProfile.findOne({ email: user.email });
//                     } else if (user.role === 'student') {
//                         profile = await StudentProfile.findOne({ email: user.email });
//                     } else if (user.role === 'admin') {
//                         profile = await AdminProfile.findOne({ email: user.email });
//                     }

//                     if (profile) {
//                         full_name = profile.full_name;
//                         profile_photo_url = profile.profile_photo_url;
//                     }
//                 }
//             }

//             if (!full_name) {
//                 full_name = email || 'Unknown User';
//             }

//             const messageObj = message.toObject();
//             messageObj.sender_name = full_name; // Ensure sender_name is set in response

//             return {
//                 ...messageObj,
//                 sender_id: {
//                     _id: senderId,
//                     email: email,
//                     role: role,
//                     full_name,
//                     profile_photo_url
//                 }
//             };
//         }));

//         console.log('Messages with populated sender_id:', messages.map(msg => ({
//             _id: msg._id,
//             message_text: msg.message_text,
//             sender_id: msg.sender_id
//         })));

//         // Mark messages from other participant as read
//         await Message.updateMany(
//             {
//                 conversation_id: conversationId,
//                 sender_id: { $ne: userId },
//                 is_read: false,
//                 is_deleted: false
//             },
//             { is_read: true }
//         );

//         res.status(200).json({
//             conversation: {
//                 _id: conversation._id,
//                 title: conversation.title,
//                 otherParticipant
//             },
//             messages
//         });
//     } catch (error) {
//         console.error('Error fetching conversation messages:', error);
//         res.status(500).json({ message: 'Server error while fetching messages' });
//     }
// };

// // Send a message
// exports.sendMessage = async (req, res) => {
//     try {
//         const { conversation_id, message_text } = req.body;
//         const senderId = req.user.id;

//         if (!message_text || !message_text.trim()) {
//             return res.status(400).json({ message: 'Message text is required' });
//         }

//         // Verify user is participant in this conversation
//         const isParticipant = await ConversationParticipant.findOne({
//             conversation_id: conversation_id,
//             user_id: senderId
//         });

//         if (!isParticipant) {
//             return res.status(403).json({ message: 'Access denied to this conversation' });
//         }

//         // Get sender details from req.user (already authenticated)
//         let senderEmail = req.user.email;
//         const senderRole = req.user.role;

//         // If email not in token (old tokens), fetch from profile
//         if (!senderEmail) {
//             if (senderRole === 'alumni') {
//                 const profile = await AlumniProfile.findById(req.user.id);
//                 senderEmail = profile?.email || '';
//             } else if (senderRole === 'student') {
//                 const profile = await StudentProfile.findById(req.user.id);
//                 senderEmail = profile?.email || '';
//             } else if (senderRole === 'admin') {
//                 const profile = await AdminProfile.findById(req.user.id);
//                 senderEmail = profile?.email || '';
//             }
//         }

//         let senderName = senderEmail; // fallback

//         if (senderRole === 'alumni') {
//             const profile = await AlumniProfile.findOne({ email: senderEmail });
//             if (profile?.full_name) senderName = profile.full_name;
//         } else if (senderRole === 'admin') {
//             const profile = await AdminProfile.findOne({ email: senderEmail });
//             if (profile?.full_name) senderName = profile.full_name;
//         } else if (senderRole === 'student') {
//             const profile = await StudentProfile.findOne({ email: senderEmail });
//             if (profile?.full_name) senderName = profile.full_name;
//         }

//         // Create and save message
//         const newMessage = new Message({
//             conversation_id,
//             sender_id: senderId,
//             sender_email: senderEmail,
//             sender_role: senderRole,
//             sender_name: senderName,
//             message_text: message_text.trim()
//         });

//         await newMessage.save();

//         // Use the sender details already fetched
//         const responseMessage = {
//             ...newMessage.toObject(),
//             sender_id: {
//                 _id: senderId,
//                 email: senderEmail,
//                 role: senderRole,
//                 full_name: senderName
//             }
//         };

//         res.status(201).json(responseMessage);
//     } catch (error) {
//         console.error('Error sending message:', error);
//         res.status(500).json({ message: 'Server error while sending message' });
//     }
// };

// // Edit a message
// exports.editMessage = async (req, res) => {
//     try {
//         const { messageId } = req.params;
//         const { message_text } = req.body;
//         const userId = req.user.id;

//         if (!message_text || !message_text.trim()) {
//             return res.status(400).json({ message: 'Message text is required' });
//         }

//         // Find the message and verify ownership
//         const message = await Message.findById(messageId);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }

//         if (message.sender_id.toString() !== userId) {
//             return res.status(403).json({ message: 'You can only edit your own messages' });
//         }

//         if (message.is_deleted) {
//             return res.status(400).json({ message: 'Cannot edit deleted message' });
//         }



//         // Update the message
//         message.message_text = message_text.trim();
//         message.edited_at = new Date();
//         await message.save();

//         // Ensure sender email is available (fallback for old messages)
//         let senderEmail = message.sender_email;
//         if (!senderEmail) {
//             const senderRole = message.sender_role;
//             if (senderRole === 'alumni') {
//                 const profile = await AlumniProfile.findById(message.sender_id);
//                 senderEmail = profile?.email || '';
//             } else if (senderRole === 'student') {
//                 const profile = await StudentProfile.findById(message.sender_id);
//                 senderEmail = profile?.email || '';
//             } else if (senderRole === 'admin') {
//                 const profile = await AdminProfile.findById(message.sender_id);
//                 senderEmail = profile?.email || '';
//             }
//         }

//         // Use the sender details stored in the message
//         const responseMessage = {
//             ...message.toObject(),
//             sender_id: {
//                 _id: message.sender_id,
//                 email: senderEmail,
//                 role: message.sender_role,
//                 full_name: message.sender_name
//             }
//         };

//         res.status(200).json(responseMessage);
//     } catch (error) {
//         console.error('Error editing message:', error);
//         res.status(500).json({ message: 'Server error while editing message' });
//     }
// };

// // Delete a message
// exports.deleteMessage = async (req, res) => {
//     try {
//         const { messageId } = req.params;
//         const { deleteType } = req.body; // 'forEveryone' or 'forMe'
//         const userId = req.user.id;
//         const userObjectId = new mongoose.Types.ObjectId(userId);

//         // Find the message
//         const message = await Message.findById(messageId);
//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }

//         const isOwnMessage = message.sender_id.toString() === userId;

//         if (isOwnMessage) {
//             if (deleteType === 'forMe') {
//                 // Delete for self
//                 if (!message.deleted_by_users.some(id => id.equals(userObjectId))) {
//                     message.deleted_by_users.push(userObjectId);
//                     await message.save();
//                 }
//                 res.status(200).json({ message: 'Message deleted for you' });
//             } else {
//                 // Global delete
//                 message.is_deleted = true;
//                 message.deleted_at = new Date();
//                 await message.save();
//                 res.status(200).json({ message: 'Message deleted for everyone' });
//             }
//         } else {
//             // For received messages, always delete for self
//             if (!message.deleted_by_users.some(id => id.equals(userObjectId))) {
//                 message.deleted_by_users.push(userObjectId);
//                 await message.save();
//             }
//             res.status(200).json({ message: 'Message deleted for you' });
//         }
//     } catch (error) {
//         console.error('Error deleting message:', error);
//         res.status(500).json({ message: 'Server error while deleting message' });
//     }
// };

// // Create or get conversation between two users
// // exports.createOrGetConversation = async (req, res) => {
// //     try {
// //         const { otherUserId } = req.body;
// //         const currentUserId = req.user.id;

// //         if (!otherUserId) {
// //             return res.status(400).json({ message: 'Other user ID is required' });
// //         }

// //         // Check if conversation already exists between these two users
// //         const existingParticipants = await ConversationParticipant.find({
// //             user_id: { $in: [currentUserId, otherUserId] }
// //         }).populate('conversation_id');

// //         // Group by conversation
// //         const conversationMap = {};
// //         existingParticipants.forEach(participant => {
// //             const convId = participant.conversation_id._id.toString();
// //             if (!conversationMap[convId]) {
// //                 conversationMap[convId] = [];
// //             }
// //             conversationMap[convId].push(participant);
// //         });

// //         // Find conversation with exactly 2 participants (both users)
// //         let existingConversation = null;
// //         for (const [convId, participants] of Object.entries(conversationMap)) {
// //             if (participants.length === 2) {
// //                 const userIds = participants.map(p => p.user_id.toString());
// //                 if (userIds.includes(currentUserId) && userIds.includes(otherUserId)) {
// //                     existingConversation = participants[0].conversation_id;
// //                     break;
// //                 }
// //             }
// //         }

// //         if (existingConversation) {
// //             return res.status(200).json({ conversation: existingConversation });
// //         }

// //         // Create new conversation
// //         const newConversation = new Conversation({
// //             title: null // No title for 1-on-1 conversations
// //         });

// //         await newConversation.save();

// //         // Add participants
// //         const participants = [
// //             new ConversationParticipant({
// //                 conversation_id: newConversation._id,
// //                 user_id: currentUserId
// //             }),
// //             new ConversationParticipant({
// //                 conversation_id: newConversation._id,
// //                 user_id: otherUserId
// //             })
// //         ];

// //         await ConversationParticipant.insertMany(participants);

// //         res.status(201).json({ conversation: newConversation });
// //     } catch (error) {
// //         console.error('Error creating/getting conversation:', error);
// //         res.status(500).json({ message: 'Server error while creating conversation' });
// //     }
// // };

// exports.createOrGetConversation = async (req, res) => {
//     try {
//         const { otherUserId } = req.body;
//         const currentUserId = req.user.id;

//         if (!otherUserId) {
//             return res.status(400).json({ message: 'Other user ID is required' });
//         }

//         // Step 1: find all conv of current user
//         const myConversationIds = await ConversationParticipant
//             .find({ user_id: currentUserId })
//             .distinct("conversation_id");

//         // Step 2: check if other user is in any of these conv
//         const otherParticipant = await ConversationParticipant.findOne({
//             conversation_id: { $in: myConversationIds },
//             user_id: otherUserId
//         });

//         // Step 3: conversation exists
//         if (otherParticipant) {
//             const existingConversation = await Conversation.findById(otherParticipant.conversation_id);
//             return res.status(200).json({ conversation: existingConversation });
//         }

//         // Step 4: create new conv
//         const newConversation = await Conversation.create({ title: null });

//         // Add users
//         await ConversationParticipant.insertMany([
//             { conversation_id: newConversation._id, user_id: currentUserId },
//             { conversation_id: newConversation._id, user_id: otherUserId }
//         ]);

//         res.status(201).json({ conversation: newConversation });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error" });
//     }
// };


    // Put these near top of controller file (after your existing requires)
    const StudentProfile = require('../models/StudentProfile');
    const AlumniProfile = require('../models/AlumniProfile');
    const AdminProfile = require('../models/AdminProfile');
    const Conversation = require('../models/Conservation');
    const ConversationParticipant = require('../models/ConversationParticipant');
    const Message = require('../models/Message');
    const MentorshipRequest = require('../models/MentorshipRequest');
    const mongoose = require('mongoose');

    // Helper - find a user across profile collections by ObjectId (or string)
    async function findProfileById(id) {
    if (!id) return null;
    const _id = mongoose.Types.ObjectId.isValid(id) ? id : null;
    if (!_id) return null;

    // Try student
    let doc = await StudentProfile.findById(_id).lean();
    if (doc) return { doc, role: 'student', email: doc.email, full_name: doc.full_name, profile_photo_url: doc.profile_photo_url };

    // Try alumni
    doc = await AlumniProfile.findById(_id).lean();
    if (doc) return { doc, role: 'alumni', email: doc.email, full_name: doc.full_name, profile_photo_url: doc.profile_photo_url };

    // Try admin
    doc = await AdminProfile.findById(_id).lean();
    if (doc) return { doc, role: 'admin', email: doc.email, full_name: doc.full_name, profile_photo_url: doc.profile_photo_url };

    return null;
    }

    // ---------- getConversations ----------
    exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // find participant records for this user
        const participants = await ConversationParticipant.find({ user_id: userId }).populate('conversation_id');

        const conversationsWithDetails = await Promise.all(participants.map(async (participant) => {
        const conversation = participant.conversation_id;
        if (!conversation) return null;

        // find the other participant(s) in this conversation
        const otherParticipantDoc = await ConversationParticipant.findOne({
            conversation_id: conversation._id,
            user_id: { $ne: userId }
        });

        if (!otherParticipantDoc) return null;

        // Look up that other participant across profile collections
        const profileInfo = await findProfileById(otherParticipantDoc.user_id);
        const otherParticipant = profileInfo ? {
            _id: otherParticipantDoc.user_id,
            full_name: profileInfo.full_name || profileInfo.email,
            email: profileInfo.email,
            role: profileInfo.role,
            profile_photo_url: profileInfo.profile_photo_url,
            current_position: profileInfo.doc?.current_position,
            company: profileInfo.doc?.company
        } : {
            _id: otherParticipantDoc.user_id,
            full_name: 'Unknown User',
            email: null,
            role: null
        };

        // Get last message
        const lastMessage = await Message.findOne({ conversation_id: conversation._id })
            .sort({ sent_at: -1 })
            .lean();

        // unread count for this conversation
        const unreadCount = await Message.countDocuments({
            conversation_id: conversation._id,
            sender_id: { $ne: userId },
            is_read: false,
            is_deleted: false,
            deleted_by_users: { $ne: userId }
        });

        return {
            _id: conversation._id,
            title: conversation.title,
            otherParticipant,
            lastMessage: lastMessage ? {
            message_text: lastMessage.message_text,
            sent_at: lastMessage.sent_at,
            sender_id: lastMessage.sender_id
            } : null,
            unreadCount,
            created_at: conversation.created_at
        };
        }));

        // Mentorship pseudo-conversations (same as before)
        let mentorshipConversations = [];
        if (userRole === 'student') {
        const acceptedRequests = await MentorshipRequest.find({ mentee_id: userId, status: 'accepted' }).populate('mentor_id');
        mentorshipConversations = await Promise.all(acceptedRequests.map(async (request) => {
            const mentor = request.mentor_id;
            if (!mentor) return null;
            const mentorProfile = await AlumniProfile.findOne({ email: mentor.email });
            const existingConv = conversationsWithDetails.find(conv => conv?.otherParticipant?._id?.toString() === mentor._id.toString());
            if (existingConv) return null;
            return {
            _id: `mentorship-${mentor._id}`,
            title: 'Mentorship Conversation',
            otherParticipant: {
                _id: mentor._id,
                full_name: mentorProfile?.full_name || mentor.email,
                email: mentor.email,
                role: 'alumni',
                profile_photo_url: mentorProfile?.profile_photo_url
            },
            lastMessage: null,
            unreadCount: 0,
            created_at: request.created_at,
            isMentorship: true
            };
        }));
        } else if (userRole === 'alumni') {
        const acceptedRequests = await MentorshipRequest.find({ mentor_id: userId, status: 'accepted' }).populate('mentee_id');
        mentorshipConversations = await Promise.all(acceptedRequests.map(async (request) => {
            const mentee = request.mentee_id;
            if (!mentee) return null;
            const menteeProfile = await StudentProfile.findOne({ email: mentee.email });
            const existingConv = conversationsWithDetails.find(conv => conv?.otherParticipant?._id?.toString() === mentee._id.toString());
            if (existingConv) return null;
            return {
            _id: `mentorship-${mentee._id}`,
            title: 'Mentorship Conversation',
            otherParticipant: {
                _id: mentee._id,
                full_name: menteeProfile?.full_name || mentee.email,
                email: mentee.email,
                role: 'student',
                profile_photo_url: menteeProfile?.profile_photo_url
            },
            lastMessage: null,
            unreadCount: 0,
            created_at: request.created_at,
            isMentorship: true
            };
        }));
        }

        const validConversations = conversationsWithDetails.filter(c => c !== null)
        .concat(mentorshipConversations.filter(c => c !== null))
        .sort((a, b) => {
            if (!a.lastMessage && !b.lastMessage) return 0;
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.sent_at) - new Date(a.lastMessage.sent_at);
        });

        res.status(200).json(validConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error while fetching conversations' });
    }
    };

    // ---------- getConversationMessages ----------
    exports.getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // verify participant
        const isParticipant = await ConversationParticipant.findOne({
        conversation_id: conversationId,
        user_id: userId
        });

        if (!isParticipant) {
        return res.status(403).json({ message: 'Access denied to this conversation' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        // find other participant
        const otherParticipantDoc = await ConversationParticipant.findOne({
        conversation_id: conversationId,
        user_id: { $ne: userId }
        });

        let otherParticipant = null;
        if (otherParticipantDoc) {
        const profileInfo = await findProfileById(otherParticipantDoc.user_id);
        otherParticipant = profileInfo ? {
            _id: otherParticipantDoc.user_id,
            full_name: profileInfo.full_name || profileInfo.email || 'Unknown User',
            email: profileInfo.email,
            role: profileInfo.role,
            profile_photo_url: profileInfo.profile_photo_url,
            current_position: profileInfo.doc?.current_position,
            company: profileInfo.doc?.company
        } : null;
        }

        // get messages (excluding globally deleted & deleted-by-user)
        const messagesRaw = await Message.find({
        conversation_id: conversationId,
        is_deleted: false,
        deleted_by_users: { $ne: userId }
        }).sort({ sent_at: 1 }).lean();

        // populate sender details without User model
        const messages = await Promise.all(messagesRaw.map(async (message) => {
        let senderId = message.sender_id;
        let email = message.sender_email || null;
        let role = message.sender_role || null;
        let full_name = message.sender_name || null;
        let profile_photo_url = null;

        // If senderId exists, try to find a profile by that id
        const profileInfo = await findProfileById(senderId);
        if (profileInfo) {
            email = email || profileInfo.email;
            role = role || profileInfo.role;
            full_name = full_name || profileInfo.full_name || profileInfo.email;
            profile_photo_url = profileInfo.profile_photo_url;
        }

        if (!full_name) full_name = email || 'Unknown User';

        const messageObj = { ...message };
        messageObj.sender_name = full_name;

        return {
            ...messageObj,
            sender_id: {
            _id: senderId,
            email,
            role,
            full_name,
            profile_photo_url
            }
        };
        }));

        console.log('Messages with populated sender_id:', messages.map(msg => ({
        _id: msg._id, message_text: msg.message_text, sender_id: msg.sender_id
        })));

        // mark other party messages as read
        await Message.updateMany({
        conversation_id: conversationId,
        sender_id: { $ne: userId },
        is_read: false,
        is_deleted: false
        }, { is_read: true });

        res.status(200).json({
        conversation: {
            _id: conversation._id,
            title: conversation.title,
            otherParticipant
        },
        messages
        });

    } catch (error) {
        console.error('Error fetching conversation messages:', error);
        res.status(500).json({ message: 'Server error while fetching messages' });
    }
    };

    // ---------- sendMessage ----------
    exports.sendMessage = async (req, res) => {
        console.log("---- SEND MESSAGE BODY ----", req.body);
  console.log("---- USER ----", req.user);
    try {
        const { conversation_id, message_text } = req.body;
        const senderId = req.user.id;

        if (!message_text || !message_text.trim()) {
        return res.status(400).json({ message: 'Message text is required' });
        }

        const isParticipant = await ConversationParticipant.findOne({
        conversation_id: conversation_id,
        user_id: senderId
        });

        if (!isParticipant) return res.status(403).json({ message: 'Access denied to this conversation' });

        // try to determine sender email/name/role from profile collections
        let senderEmail = req.user.email || null;
        let senderRole = req.user.role || null;
        let senderName = null;

        const profileInfo = await findProfileById(senderId);
        if (profileInfo) {
        senderEmail = senderEmail || profileInfo.email || '';
        senderRole = senderRole || profileInfo.role;
        senderName = profileInfo.full_name || senderEmail;
        }

        // create message
        const newMessage = new Message({
        conversation_id,
        sender_id: senderId,
        sender_email: senderEmail,
        sender_role: senderRole,
        sender_name: senderName || senderEmail,
        message_text: message_text.trim()
        });

        await newMessage.save();

        // Response to client
        const responseMessage = {
        ...newMessage.toObject(),
        sender_id: {
            _id: senderId,
            email: senderEmail,
            role: senderRole,
            full_name: senderName || senderEmail
        }
        };

        // emit via socket if available
        try {
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation:${conversation_id}`).emit('newMessage', responseMessage);
            io.emit('conversationsUpdated'); // notify sidebar listeners
        }
        } catch (e) {
        console.error('Socket emit error (non-fatal):', e.message);
        }

        res.status(201).json(responseMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error while sending message' });
    }
    };

    exports.editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { new_text } = req.body;
        const userId = req.user.id;

        if (!new_text || !new_text.trim()) {
            return res.status(400).json({ message: "New text required" });
        }

        // Fetch the message
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Only sender can edit
        if (String(message.sender_id) !== String(userId)) {
            return res.status(403).json({ message: "You can edit only your messages" });
        }

        message.message_text = new_text.trim();
        message.edited_at = new Date();
        await message.save();

        const updated = {
            ...message.toObject(),
            sender_id: {
                _id: userId,
                email: message.sender_email,
                role: message.sender_role,
                full_name: message.sender_name
            }
        };

        // Emit update
        const io = req.app.get("io");
        if (io) {
            io.to(`conversation:${message.conversation_id}`).emit("messageEdited", updated);
            io.emit("conversationsUpdated");
        }

        res.status(200).json(updated);
    } catch (err) {
        console.error("Error editing message:", err);
        res.status(500).json({ message: "Server error while editing message" });
    }
};


exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { deleteType } = req.body;
        const userId = req.user.id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        const conversationId = message.conversation_id;

        // FOR EVERYONE → Only sender allowed
        if (deleteType === "forEveryone") {
            if (String(message.sender_id) !== String(userId)) {
                return res.status(403).json({ message: "Only the sender can delete for everyone" });
            }

            message.is_deleted = true;
            message.deleted_at = new Date();
            await message.save();

            const io = req.app.get("io");
            if (io) {
                io.to(`conversation:${conversationId}`).emit("messageDeleted", {
                    messageId,
                    conversation_id: conversationId,
                    deleteType
                });
                io.emit("conversationsUpdated");
            }

            return res.status(200).json({ message: "Message deleted for everyone" });
        }

        // FOR ME (default)
        message.deleted_by_users.push(userId);
        await message.save();

        const io = req.app.get("io");
        if (io) {
            io.to(`conversation:${conversationId}`).emit("messageDeleted", {
                messageId,
                conversation_id: conversationId,
                deleteType: "forMe"
            });
        }

        res.status(200).json({ message: "Message deleted for you" });

    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ message: "Server error while deleting message" });
    }
};


// exports.createOrGetConversation = async (req, res) => {
//     try {
//         const { otherUserId } = req.body;
//         const userId = req.user.id;

//         if (!otherUserId) {
//             return res.status(400).json({ message: "otherUserId is required" });
//         }

//         // Check if conversation already exists between EXACT two users
//         const existing = await ConversationParticipant.aggregate([
//             {
//                 $match: {
//                     user_id: { $in: [userId, otherUserId] }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$conversation_id",
//                     members: { $addToSet: "$user_id" }
//                 }
//             },
//             {
//                 $match: {
//                     members: { $size: 2, $all: [userId, otherUserId] }
//                 }
//             }
//         ]);

//         if (existing.length > 0) {
//             return res.status(200).json({
//                 conversation_id: existing[0]._id,
//                 created: false
//             });
//         }

//         // Create new conversation
//         const newConv = await Conversation.create({
//             title: null
//         });

//         await ConversationParticipant.create([
//             { conversation_id: newConv._id, user_id: userId },
//             { conversation_id: newConv._id, user_id: otherUserId }
//         ]);

//         return res.status(201).json({
//             conversation_id: newConv._id,
//             created: true
//         });

//     } catch (err) {
//         console.error("Error creating conversation:", err);
//         res.status(500).json({ message: "Server error while creating conversation" });
//     }
// };

exports.createOrGetConversation = async (req, res) => {
    try {
        const { otherUserId } = req.body;
        const userId = req.user.id;

        if (!otherUserId) {
            return res.status(400).json({ message: "otherUserId is required" });
        }

        // Check existing conversation
        const existing = await ConversationParticipant.aggregate([
            {
                $match: {
                    user_id: { $in: [userId, otherUserId] }
                }
            },
            {
                $group: {
                    _id: "$conversation_id",
                    members: { $addToSet: "$user_id" }
                }
            },
            {
                $match: {
                    members: { $size: 2, $all: [userId, otherUserId] }
                }
            }
        ]);

        if (existing.length > 0) {
            return res.status(200).json({
                conversation_id: existing[0]._id,
                created: false
            });
        }

        // Create new conversation
        const newConv = await Conversation.create({
            title: null
        });

        // Get roles of both users
        const myProfile = await findProfileById(userId);
        const otherProfile = await findProfileById(otherUserId);

        if (!myProfile || !otherProfile) {
            return res.status(400).json({ message: "Could not find user profiles" });
        }

        // Add participants WITH ROLE
        await ConversationParticipant.create([
            { conversation_id: newConv._id, user_id: userId, role: myProfile.role },
            { conversation_id: newConv._id, user_id: otherUserId, role: otherProfile.role }
        ]);

        return res.status(201).json({
            conversation_id: newConv._id,
            created: true
        });

    } catch (err) {
        console.error("Error creating conversation:", err);
        res.status(500).json({ message: "Server error while creating conversation" });
    }
};
