// frontend/src/components/AlumniDirectory/AlumniCard.jsx

import React from 'react';

// 🛑 ADDED: Import Link for client-side routing
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { getCurrentUserRole } from '../../utils/authUtils';
// Assuming the user is logged in if localStorage has a token
const getToken = () => localStorage.getItem('token');


// 🛑 CRITICAL FIX 1: Define the API base URL for image loading.
const API_BASE_URL ='https://stualum.onrender.com';
// 'http://localhost:5000'; 
const DEFAULT_PROFILE_IMAGE = '/path/to/default/image.png'; // Fallback image path


const AlumniCard = ({ alumnus }) => {
    const navigate = useNavigate();
    const userRole = getCurrentUserRole();

    // Destructure necessary fields.
    const {
        id,
        user_id, // User/Account ID (Target for messaging and requests)
        name,
        title,
        company,
        location,
        profileImage,
        tags
    } = alumnus;

    // Construct the full URL for the profile image.
    const imageSource = profileImage
        ? `${API_BASE_URL}${profileImage}`
        : DEFAULT_PROFILE_IMAGE;

    // Separate skills and contribution preferences
    const skills = alumnus.skills || [];
    const contributionPreferences = alumnus.contribution_preferences || [];

    // Handle message button click
    const handleMessage = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop navigation to the profile page

        const token = getToken();
        if (!token) {
            return alert('You must be logged in to start a conversation.');
        }

        try {
            // Create or get conversation with this alumni
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

    // Handle mentorship request button click
    const handleMentorshipRequest = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop navigation to the profile page

        const token = getToken();
        if (!token) {
            return alert('You must be logged in to send a mentorship request.');
        }

        try {
            // 🛑 FIX: Use the correct, standardized Authorization header
            const response = await axios.post(`${API_BASE_URL}/api/mentorship/request`, {
                mentor_id: id // Assuming backend expects mentor_id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Mentorship request sent successfully!');
        } catch (error) {
            console.error('Error sending mentorship request:', error);
            const errorMessage = error.response?.data?.message || 'Failed to send mentorship request. Please try again.';
            alert(errorMessage);
        }
    };

    return (
        <div
            className="bg-[#1a1a2e] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate(`/alumni/profile/${id}`)}
        >
            <div className="flex items-start space-x-4">
                <img
                    src={imageSource}
                    alt={name || 'Alumnus Profile'}
                    className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{name || 'Name not available'}</h3>
                    <p className="text-gray-300 mb-2">
                        <span className="font-semibold">{title}</span> at {company}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center mb-2">
                        <i className="fas fa-map-marker-alt mr-1"></i> {location}
                    </p>
                    {/* Skills Section */}
                    {skills.length > 0 && (
                        <div className="mb-2">
                            <p className="text-xs text-gray-400 mb-1">Skills:</p>
                            <div className="flex flex-wrap gap-1">
                                {skills.slice(0, 3).map((skill, index) => (
                                    <span
                                        key={`skill-${index}`}
                                        className="px-2 py-1 bg-teal-600 text-white rounded-full text-xs"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contribution Preferences Section */}
                    {contributionPreferences.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-1">Contributions:</p>
                            <div className="flex flex-wrap gap-1">
                                {contributionPreferences.slice(0, 2).map((pref, index) => (
                                    <span
                                        key={`pref-${index}`}
                                        className="px-2 py-1 bg-orange-600 text-white rounded-full text-xs"
                                    >
                                        {pref}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
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
                        {userRole === 'student' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMentorshipRequest(e);
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                                Request Mentorship
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniCard;