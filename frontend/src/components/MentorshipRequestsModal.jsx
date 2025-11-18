import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://stualum.onrender.com';

const MentorshipRequestsModal = ({ isOpen, onClose }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchRequests();
        }
    }, [isOpen]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/mentorship/requests`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching mentorship requests:', error);
            alert('Failed to load mentorship requests.');
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = async (requestId, action) => {
        try {
            setResponding(requestId);
            await axios.post(`${API_BASE_URL}/api/mentorship/respond`, {
                requestId,
                action
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Remove the request from the list
            setRequests(prev => prev.filter(req => req._id !== requestId));
            alert(`Mentorship request ${action}ed successfully!`);
        } catch (error) {
            console.error('Error responding to mentorship request:', error);
            alert('Failed to respond to mentorship request. Please try again.');
        } finally {
            setResponding(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Mentorship Requests</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-8">
                        <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500">No pending mentorship requests</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(request => (
                            <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={request.mentee.profile_photo_url
                                            ? `${API_BASE_URL}${request.mentee.profile_photo_url}`
                                            : '/default-avatar.png'}
                                        alt={request.mentee.full_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">
                                            {request.mentee.full_name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {request.mentee.current_position} at {request.mentee.company}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Requested on {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleResponse(request._id, 'accept')}
                                            disabled={responding === request._id}
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                                        >
                                            {responding === request._id ? 'Accepting...' : 'Accept'}
                                        </button>
                                        <button
                                            onClick={() => handleResponse(request._id, 'decline')}
                                            disabled={responding === request._id}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm"
                                        >
                                            {responding === request._id ? 'Declining...' : 'Decline'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MentorshipRequestsModal;
