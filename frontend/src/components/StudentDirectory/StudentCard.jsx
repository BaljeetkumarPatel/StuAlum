// frontend/src/components/StudentDirectory/StudentCard.jsx

import React from 'react';

// 🛑 ADDED: Import Link for client-side routing
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { getCurrentUserRole } from '../../utils/authUtils';
// Assuming the user is logged in if localStorage has a token
const getToken = () => localStorage.getItem('token');


// 🛑 CRITICAL FIX 1: Define the API base URL for image loading.
const API_BASE_URL = 'http://localhost:5000'; 
const DEFAULT_PROFILE_IMAGE = '/path/to/default/image.png'; // Fallback image path


const StudentCard = ({ student }) => {
    const navigate = useNavigate();
    const userRole = getCurrentUserRole();

    // Destructure necessary fields.
    const {
        id,
        name,
        branch,
        yearOfGraduation,
        profileImage,
        tags
    } = student;

    // Construct the full URL for the profile image.
    const imageSource = profileImage
        ? `${API_BASE_URL}${profileImage}`
        : DEFAULT_PROFILE_IMAGE;

    // Check if tags is an array before slicing/mapping
    const displayTags = Array.isArray(tags) ? tags : [];

    // Handle message button click
    const handleMessage = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop navigation to the profile page

        const token = getToken();
        if (!token) {
            return alert('You must be logged in to start a conversation.');
        }

        try {
            // Create or get conversation with this student
            const response = await axios.post(`${API_BASE_URL}/api/messages/conversation`, {
                otherUserId: id // Use the specific user ID for the conversation partner
            }, {
                // 🛑 AUTH FIX: Uses the Authorization: Bearer standard header
                headers: { Authorization: `Bearer ${token}` }
            });

            // Navigate to the messages page with the conversation
            navigate(`/messages/${response.data.conversation_id}`);
        } catch (error) {
            console.error('Error creating conversation:', error);
            // Check for 401/403 and provide better feedback
            const errorMessage = error.response?.status === 401 
                ? 'Unauthorized. Please log in again.' 
                : 'Failed to start conversation. Please try again.';
            alert(errorMessage);
        }
    };

    return (
        <div
            className="bg-[#1a1a2e] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate(`/student/profile/${id}`)}
        >
            <div className="flex items-start space-x-4">
                <img
                    src={imageSource}
                    alt={name}
                    className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{name}</h3>
                    <p className="text-gray-300 mb-2">{branch} - Graduating {yearOfGraduation}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {displayTags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMessage(e);
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                        >
                            Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentCard;
