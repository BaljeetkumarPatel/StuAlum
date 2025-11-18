import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import mentorshipService from '../services/mentorshipService';
import withSidebarToggle from '../hocs/withSidebarToggle';
import Navbar from '../components/Navbar';
import MentorshipResourcesSection from '../components/MentorshipResourcesSection';
import { getCurrentUserRole, getCurrentUserIdFromToken } from '../utils/authUtils';

// Unified auth helper: prefer explicit `userRole` key, fall back to token payload
const getCurrentUser = () => {
    const storedRole = localStorage.getItem('userRole') || null;
    const roleFromToken = getCurrentUserRole();
    const rawRole = storedRole || roleFromToken || null;
    const role = rawRole ? String(rawRole).toLowerCase() : null;

    const id = getCurrentUserIdFromToken();

    const token = localStorage.getItem('userToken') || localStorage.getItem('token') || null;
    let payload = {};
    if (token) {
        try {
            payload = JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            payload = {};
        }
    }

    return {
        ...payload,
        role,
        id
    };
};

const API_BASE_URL = (typeof process !== 'undefined' && process.env.REACT_APP_API_BASE_URL) || 'http://localhost:5000';

const MentorshipDashboard = ({ onSidebarToggle }) => {
    const navigate = useNavigate();
    const user = getCurrentUser();

    // Role-based access - allow both students and alumni
    useEffect(() => {
        if (!user || (user.role !== 'student' && user.role !== 'alumni')) {
            navigate('/');
            return;
        }
    }, [user, navigate]);

    const [matches, setMatches] = useState([]);
    const [connections, setConnections] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Alumni-specific states
    const [mentorshipRequests, setMentorshipRequests] = useState([]);
    const [mentorshipHistory, setMentorshipHistory] = useState([]);
    const [mentorshipPreferences, setMentorshipPreferences] = useState({});
    const [scheduledSessions, setScheduledSessions] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    // Student-specific states
    const [studentSessions, setStudentSessions] = useState([]);
    const [studentSessionsLoading, setStudentSessionsLoading] = useState(false);



    // Filters state
    const [filters, setFilters] = useState({
        requirements: '',
        role: '',
        skills: '',
        location: '',
        availability: '',
        alumniYear: ''
    });

    // Track if search has been performed
    const [hasSearched, setHasSearched] = useState(false);

    // Modal states
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [selectedMentee, setSelectedMentee] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null); // For updating existing sessions

    const [messageText, setMessageText] = useState('');
    const [notesText, setNotesText] = useState('');

    // Session form state
    const [sessionForm, setSessionForm] = useState({
        scheduled_date: '',
        scheduled_time: '',
        duration: 60,
        mode: 'virtual',
        topic: '',
        meeting_link: ''
    });

    // Populate form when updating an existing session
    useEffect(() => {
        if (selectedSession) {
            setSessionForm({
                scheduled_date: selectedSession.scheduled_date ? new Date(selectedSession.scheduled_date).toISOString().split('T')[0] : '',
                scheduled_time: selectedSession.scheduled_time || '',
                duration: selectedSession.duration || 60,
                mode: selectedSession.mode || 'virtual',
                topic: selectedSession.topic || '',
                meeting_link: selectedSession.meeting_link || ''
            });
        }
    }, [selectedSession]);

    // Fetch data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Fetch student sessions separately
    useEffect(() => {
        const fetchStudentSessions = async () => {
            try {
                setStudentSessionsLoading(true);
                const sessions = await mentorshipService.getScheduledSessionsForStudent();
                setStudentSessions(sessions);
            } catch (err) {
                console.error('Error fetching student sessions:', err);
            } finally {
                setStudentSessionsLoading(false);
            }
        };

        if (user.role === 'student') {
            fetchStudentSessions();
        }
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            if (user.role === 'student') {
                // Student data
                const [connectionsRes, outgoingRes] = await Promise.all([
                    mentorshipService.getMentorshipConnections(),
                    mentorshipService.getOutgoingRequests()
                ]);

                setConnections(connectionsRes);
                setOutgoingRequests(outgoingRes);
            } else if (user.role === 'alumni') {
                // Alumni data
                const [requestsRes, connectionsRes, historyRes, preferencesRes, sessionsRes] = await Promise.all([
                    mentorshipService.getMentorshipRequests(),
                    mentorshipService.getMentorshipConnections(),
                    mentorshipService.getMentorshipHistory(),
                    mentorshipService.getMentorshipPreferences(),
                    mentorshipService.getScheduledSessions()
                ]);

                setMentorshipRequests(requestsRes);
                setConnections(connectionsRes);
                setMentorshipHistory(historyRes);
                setMentorshipPreferences(preferencesRes);
                setScheduledSessions(sessionsRes);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load mentorship data');
        } finally {
            setLoading(false);
        }
    };

    const handleSmartMatch = async () => {
        try {
            setError(null);
            // Send filters to backend for AI matching
            const response = await mentorshipService.smartMatchMentors(filters.requirements, {
                role: filters.role,
                skills: filters.skills,
                location: filters.location,
                availability: filters.availability,
                alumniYear: filters.alumniYear
            });
            setMatches(response);
            setHasSearched(true);
        } catch (err) {
            console.error('Error fetching matches:', err);
            setError('Failed to find matches');
        }
    };

    const handleRequestMentorship = async (mentorId) => {
        try {
            await mentorshipService.createMentorshipRequest(mentorId);
            alert('Mentorship request sent successfully!');
            fetchDashboardData(); // Refresh data
        } catch (err) {
            console.error('Error sending request:', err);
            alert(err.response?.data?.message || 'Failed to send mentorship request');
        }
    };

    const handleCancelRequest = async (requestId) => {
        try {
            await mentorshipService.cancelMentorshipRequest(requestId);
            alert('Request cancelled successfully!');
            fetchDashboardData(); // Refresh data
        } catch (err) {
            console.error('Error cancelling request:', err);
            alert('Failed to cancel request');
        }
    };

    // Alumni-specific handlers
    const handleRespondToRequest = async (requestId, action) => {
        try {
            await mentorshipService.respondToMentorshipRequest(requestId, action);
            alert(`Mentorship request ${action}ed successfully!`);
            fetchDashboardData(); // Refresh data
        } catch (err) {
            console.error('Error responding to request:', err);
            alert('Failed to respond to request');
        }
    };

    const handleUpdatePreferences = async (preferences) => {
        try {
            await mentorshipService.updateMentorshipPreferences(preferences);
            alert('Preferences updated successfully!');
            setShowPreferencesModal(false);
            fetchDashboardData(); // Refresh data
        } catch (err) {
            console.error('Error updating preferences:', err);
            alert('Failed to update preferences');
        }
    };

    const handleScheduleSession = async (sessionData) => {
        try {
            if (selectedSession) {
                // Update existing session
                await mentorshipService.updateMentorshipSession(sessionData);
                alert('Session updated successfully!');
            } else {
                // Schedule new session
                await mentorshipService.scheduleMentorshipSession(sessionData);
                alert('Session scheduled successfully!');
            }
            setShowScheduleModal(false);
            setSelectedSession(null);
            fetchDashboardData(); // Refresh data
        } catch (err) {
            console.error('Error scheduling session:', err);
            alert('Failed to schedule session');
        }
    };

    const handleCompleteMentorship = async (requestId) => {
        try {
            if (window.confirm('Are you sure you want to complete this mentorship? This action cannot be undone.')) {
                await mentorshipService.completeMentorship(requestId);
                alert('Mentorship completed successfully!');
                fetchDashboardData(); // Refresh data
            }
        } catch (err) {
            console.error('Error completing mentorship:', err);
            alert('Failed to complete mentorship');
        }
    };

    const resetFilters = () => {
        setFilters({
            requirements: '',
            role: '',
            skills: '',
            location: '',
            availability: '',
            alumniYear: ''
        });
        setMatches([]);
        setHasSearched(false);
        setError(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
                <div className="text-xl">Loading mentorship dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
                <div className="text-red-600 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <>
            {/* Fixed Navbar */}
            <Navbar onSidebarToggle={onSidebarToggle} />

            {/* Main content area with proper spacing */}
            <div className="min-h-screen pt-[60px] px-10 py-5 bg-gradient-to-br from-[#111019] to-[#0a0a0f] text-white">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Mentorship Dashboard</h1>
                        <p className="text-gray-300">
                            {user.role === 'student'
                                ? 'Find mentors, manage connections, and grow your career'
                                : 'Manage mentorship requests, guide mentees, and track your impact'
                            }
                        </p>
                    </div>

                    {user.role === 'student' ? (
                        // STUDENT VIEW
                        <>
                            {/* Section 1: Find a Mentor */}
                            <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-6 border border-[#3a3a45] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl"></div>
                                <h2 className="text-2xl font-semibold mb-4 text-white relative z-10">Find a Mentor</h2>

                                {/* Search Input */}
                                <div className="mb-4 relative z-10">
                                    <input
                                        type="text"
                                        placeholder="Describe what you're looking for in a mentor (e.g., career guidance, technical skills, leadership)"
                                        value={filters.requirements}
                                        onChange={(e) => setFilters({...filters, requirements: e.target.value})}
                                        className="w-full border border-[#3a3a45] rounded-lg px-4 py-3 text-lg bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                    />
                                </div>

                                {/* Filters Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 relative z-10">
                                    <select
                                        value={filters.role}
                                        onChange={(e) => setFilters({...filters, role: e.target.value})}
                                        className="border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                    >
                                        <option value="" className="bg-[#1a1a23]">Select Role</option>
                                        <option value="software engineer" className="bg-[#1a1a23]">Software Engineer</option>
                                        <option value="data scientist" className="bg-[#1a1a23]">Data Scientist</option>
                                        <option value="product manager" className="bg-[#1a1a23]">Product Manager</option>
                                        <option value="engineering manager" className="bg-[#1a1a23]">Engineering Manager</option>
                                        <option value="technical lead" className="bg-[#1a1a23]">Technical Lead</option>
                                        <option value="senior engineer" className="bg-[#1a1a23]">Senior Engineer</option>
                                        <option value="principal engineer" className="bg-[#1a1a23]">Principal Engineer</option>
                                        <option value="engineering director" className="bg-[#1a1a23]">Engineering Director</option>
                                        <option value="vp engineering" className="bg-[#1a1a23]">VP Engineering</option>
                                        <option value="cto" className="bg-[#1a1a23]">CTO</option>
                                    </select>

                                    <input
                                        type="text"
                                        placeholder="Skills (e.g., Python, Leadership)"
                                        value={filters.skills}
                                        onChange={(e) => setFilters({...filters, skills: e.target.value})}
                                        className="border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Location"
                                        value={filters.location}
                                        onChange={(e) => setFilters({...filters, location: e.target.value})}
                                        className="border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                    />

                                    <select
                                        value={filters.availability}
                                        onChange={(e) => setFilters({...filters, availability: e.target.value})}
                                        className="border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                    >
                                        <option value="" className="bg-[#1a1a23]">Availability</option>
                                        <option value="weekly" className="bg-[#1a1a23]">Weekly</option>
                                        <option value="monthly" className="bg-[#1a1a23]">Monthly</option>
                                        <option value="quarterly" className="bg-[#1a1a23]">Quarterly</option>
                                    </select>

                                    <input
                                        type="number"
                                        placeholder="Alumni Year"
                                        value={filters.alumniYear}
                                        onChange={(e) => setFilters({...filters, alumniYear: e.target.value})}
                                        className="border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                    />
                                </div>

                                <div className="flex gap-2 relative z-10">
                                    <button
                                        onClick={handleSmartMatch}
                                        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                    >
                                        🤖 Smart Match
                                    </button>
                                    <button
                                        onClick={resetFilters}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Section 2: Mentor Search Results */}
                            <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-6 border border-[#3a3a45] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl"></div>
                                <h2 className="text-2xl font-semibold mb-4 text-white relative z-10">Mentor Search Results</h2>
                                {!hasSearched ? (
                                    <div className="text-center py-8 relative z-10">
                                        <div className="text-gray-400 mb-2">
                                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-300 text-lg">Please enter your requirements and click "Smart Match" to find suitable mentors</p>
                                    </div>
                                ) : matches.length === 0 ? (
                                    <p className="text-gray-300 relative z-10">No matches found. Try adjusting your filters or requirements.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                                        {matches.map((mentor) => (
                                            <div key={mentor._id} className="border border-[#3a3a45] rounded-lg p-4 bg-gradient-to-br from-[#1a1a23] to-[#15151a] hover:border-purple-500/50 transition-all duration-200">
                                                <div className="flex items-center mb-3">
                                                    <img
                                                        src={mentor.profile_photo_url || '/default-avatar.png'}
                                                        alt={mentor.full_name}
                                                        className="w-12 h-12 rounded-full mr-3"
                                                    />
                                                    <div>
                                                        <h3 className="font-semibold text-white">{mentor.full_name}</h3>
                                                        <p className="text-sm text-gray-300">{mentor.current_position} at {mentor.company}</p>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="text-sm text-gray-300 mb-2">
                                                        Match Score: {mentor.ai_score}%
                                                    </div>
                                                    <div className="text-xs text-gray-400 mb-2">
                                                        {mentor.match_reason}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {mentor.skills.slice(0, 3).map((skill, index) => (
                                                            <span key={index} className="bg-purple-100/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/alumni/profile/${mentor._id}`)}
                                                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm hover:scale-105 transition-all duration-200"
                                                    >
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={() => handleRequestMentorship(mentor._id)}
                                                        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded text-sm hover:from-purple-700 hover:to-purple-800 hover:scale-105 transition-all duration-200"
                                                    >
                                                        Request Mentorship
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Section 3: Your Mentors */}
                            <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-6 border border-[#3a3a45] relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 w-28 h-28 bg-purple-600/5 rounded-full blur-2xl"></div>
                                <h2 className="text-2xl font-semibold mb-4 text-white relative z-10">Your Mentors</h2>
                                {connections.length === 0 ? (
                                    <p className="text-gray-300 relative z-10">No active mentorship connections yet.</p>
                                ) : (
                                    <div className="space-y-4 relative z-10">
                                        {connections.map((connection) => (
                                            <div key={connection._id} className="border border-[#3a3a45] rounded-lg p-4 bg-gradient-to-br from-[#1a1a23] to-[#15151a] hover:border-purple-500/50 transition-all duration-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={connection.mentor_id?.profile_photo_url || '/default-avatar.png'}
                                                            alt={connection.mentor_id?.full_name}
                                                            className="w-12 h-12 rounded-full mr-3"
                                                        />
                                                        <div>
                                                            <h3 className="font-semibold text-white">{connection.mentor_id?.full_name}</h3>
                                                            <p className="text-sm text-gray-300">{connection.mentor_id?.current_position} at {connection.mentor_id?.company}</p>
                                                            <p className="text-xs text-gray-400">Connected since {connection.created_at ? new Date(connection.created_at).toLocaleDateString() : 'Unknown'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMentee(connection.mentor_id);
                                                                setMessageText(`Hi ${connection.mentor_id?.full_name}, I have a question about our mentorship.`);
                                                                setShowMessageModal(true);
                                                            }}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm hover:scale-105 transition-all duration-200"
                                                        >
                                                            Message
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>



                            {/* Section 5: Scheduled Sessions */}
                            <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-6 border border-[#3a3a45] relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl"></div>
                                <h2 className="text-2xl font-semibold mb-4 text-white relative z-10">My Sessions</h2>
                                {studentSessionsLoading ? (
                                    <div className="text-gray-300 relative z-10">Loading sessions...</div>
                                ) : studentSessions.length === 0 ? (
                                    <p className="text-gray-300 relative z-10">No scheduled sessions yet.</p>
                                ) : (
                                    <div className="space-y-4 relative z-10">
                                        {studentSessions.map((session) => (
                                            <div key={session._id} className="border border-[#3a3a45] rounded-lg p-4 bg-gradient-to-br from-[#1a1a23] to-[#15151a] hover:border-purple-500/50 transition-all duration-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={session.mentor?.profile_photo_url || '/default-avatar.png'}
                                                            alt={session.mentor?.full_name}
                                                            className="w-12 h-12 rounded-full mr-3"
                                                        />
                                                        <div>
                                                            <h3 className="font-semibold text-white">{session.mentor?.full_name}</h3>
                                                            <p className="text-sm text-gray-300">
                                                                {new Date(session.scheduled_date).toLocaleDateString()} at {session.scheduled_time}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{session.topic || 'General mentorship session'}</p>
                                                        </div>
                                                    </div>
                                                        <div className="flex gap-2">
                                                            {session.meeting_link && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (session.meeting_link) {
                                                                            window.open(session.meeting_link, '_blank');
                                                                        } else {
                                                                            alert('Meeting link not available for this session.');
                                                                        }
                                                                    }}
                                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm hover:scale-105 transition-all duration-200"
                                                                >
                                                                    Join Session
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => setShowMessageModal(true)}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm hover:scale-105 transition-all duration-200"
                                                            >
                                                                Message
                                                            </button>
                                                        </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Section 6: Mentorship Resources */}
                            <MentorshipResourcesSection user={user} />
                        </>
                    ) : (
                        // ALUMNI VIEW
                        <>
                            {/* Alumni Navigation Tabs */}
                            <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-4 border border-[#3a3a45] mb-6">
                                <div className="flex space-x-4">
                                    {[
                                        { id: 'overview', label: 'Overview' },
                                        { id: 'requests', label: 'Requests', count: mentorshipRequests.length },
                                        { id: 'mentees', label: 'My Mentees', count: connections.length },
                                        { id: 'history', label: 'History', count: mentorshipHistory.length },
                                        { id: 'sessions', label: 'Sessions', count: scheduledSessions.length },
                                        { id: 'resources', label: 'Resources' },
                                        { id: 'settings', label: 'Settings' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                activeTab === tab.id
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {tab.label} {tab.count !== undefined && `(${tab.count})`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg p-6 border border-[#3a3a45] text-center">
                                            <div className="text-2xl font-bold text-purple-400">{mentorshipRequests.length}</div>
                                            <div className="text-sm text-gray-300">Pending Requests</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg p-6 border border-[#3a3a45] text-center">
                                            <div className="text-2xl font-bold text-green-400">{connections.length}</div>
                                            <div className="text-sm text-gray-300">Active Mentees</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg p-6 border border-[#3a3a45] text-center">
                                            <div className="text-2xl font-bold text-blue-400">{mentorshipHistory.length}</div>
                                            <div className="text-sm text-gray-300">Completed Relationships</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg p-6 border border-[#3a3a45] text-center">
                                            <div className="text-2xl font-bold text-yellow-400">{scheduledSessions.length}</div>
                                            <div className="text-sm text-gray-300">Upcoming Sessions</div>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-6 border border-[#3a3a45]">
                                        <h2 className="text-2xl font-semibold mb-4 text-white">Recent Activity</h2>
                                        <div className="space-y-4">
                                            {mentorshipRequests.slice(0, 3).map(request => (
                                                <div key={request._id} className="flex items-center justify-between p-4 border border-[#3a3a45] rounded-lg">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={request.mentee_id?.profile_photo_url || '/default-avatar.png'}
                                                            alt={request.mentee_id?.full_name}
                                                            className="w-10 h-10 rounded-full mr-3"
                                                        />
                                                        <div>
                                                            <p className="text-white font-medium">{request.mentee_id?.full_name} requested mentorship</p>
                                                            <p className="text-sm text-gray-400">{new Date(request.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRespondToRequest(request._id, 'accept')}
                                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleRespondToRequest(request._id, 'decline')}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {mentorshipRequests.length === 0 && (
                                                <p className="text-gray-300 text-center py-4">No recent activity</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Requests Tab */}
                            {activeTab === 'requests' && (
                                <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-6 border border-[#3a3a45]">
                                    <h2 className="text-2xl font-semibold mb-4 text-white">Mentorship Requests</h2>
                                    {mentorshipRequests.length === 0 ? (
                                        <div className="text-center py-8">
                                            <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
                                            <p className="text-gray-500">No pending mentorship requests</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {mentorshipRequests.map(request => (
                                                <div key={request._id} className="border border-[#3a3a45] rounded-lg p-4">
                                                    <div className="flex items-start space-x-4">
                                                        <img
                                                            src={request.mentee_id?.profile_photo_url || '/default-avatar.png'}
                                                            alt={request.mentee_id?.full_name}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-white">
                                                                {request.mentee_id?.full_name}
                                                            </h3>
                                                            <p className="text-sm text-gray-300">
                                                                {request.mentee_id?.current_position} at {request.mentee_id?.company}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Requested on {new Date(request.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleRespondToRequest(request._id, 'accept')}
                                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRespondToRequest(request._id, 'decline')}
                                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Mentees Tab */}
                            {activeTab === 'mentees' && (
                                <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-6 border border-[#3a3a45]">
                                    <h2 className="text-2xl font-semibold mb-4 text-white">My Mentees</h2>
                                    {connections.length === 0 ? (
                                        <p className="text-gray-300">No active mentees yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {connections.map((connection) => (
                                                <div key={connection._id} className="border border-[#3a3a45] rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <img
                                                                src={connection.mentee_id?.profile_photo_url || '/default-avatar.png'}
                                                                alt={connection.mentee_id?.full_name}
                                                                className="w-12 h-12 rounded-full mr-3"
                                                            />
                                                            <div>
                                                                <h3 className="font-semibold text-white">{connection.mentee_id?.full_name}</h3>
                                                                <p className="text-sm text-gray-300">{connection.mentee_id?.current_position} at {connection.mentee_id?.company}</p>
                                                                <p className="text-xs text-gray-400">Connected since {connection.created_at ? new Date(connection.created_at).toLocaleDateString() : 'Unknown'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMentee(connection.mentee_id);
                                                                    setShowMessageModal(true);
                                                                }}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                                            >
                                                                Message
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMentee(connection.mentee_id);
                                                                    setShowScheduleModal(true);
                                                                }}
                                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                                                            >
                                                                Schedule Session
                                                            </button>
                                                            <button
                                                                onClick={() => handleCompleteMentorship(connection._id)}
                                                                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                                                            >
                                                                Complete Mentorship
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* History Tab */}
                            {activeTab === 'history' && (
                                <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-6 border border-[#3a3a45]">
                                    <h2 className="text-2xl font-semibold mb-4 text-white">Mentorship History</h2>
                                    {mentorshipHistory.length === 0 ? (
                                        <p className="text-gray-300">No mentorship history yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {mentorshipHistory.map((relationship) => (
                                                <div key={relationship._id} className="border border-[#3a3a45] rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <img
                                                                src={relationship.mentee.profile_photo_url || '/default-avatar.png'}
                                                                alt={relationship.mentee.full_name}
                                                                className="w-12 h-12 rounded-full mr-3"
                                                            />
                                                            <div>
                                                                <h3 className="font-semibold text-white">{relationship.mentee.full_name}</h3>
                                                                <p className="text-sm text-gray-300">{relationship.mentee.current_position} at {relationship.mentee.company}</p>
                                                                <p className="text-xs text-gray-400">
                                                                    Completed on {new Date(relationship.completed_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-green-400">Completed</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sessions Tab */}
                            {activeTab === 'sessions' && (
                                <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-6 border border-[#3a3a45]">
                                    <h2 className="text-2xl font-semibold mb-4 text-white">Scheduled Sessions</h2>
                                    {scheduledSessions.filter(session => session && session.mentee).length === 0 ? (
                                        <p className="text-gray-300">No scheduled sessions.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {scheduledSessions.filter(session => session && session.mentee).map((session) => (
                                                <div key={session._id} className="border border-[#3a3a45] rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <img
                                                                src={session.mentee.profile_photo_url || '/default-avatar.png'}
                                                                alt={session.mentee.full_name}
                                                                className="w-12 h-12 rounded-full mr-3"
                                                            />
                                                            <div>
                                                                <h3 className="font-semibold text-white">{session.mentee.full_name}</h3>
                                                                <p className="text-sm text-gray-300">
                                                                    {new Date(session.scheduled_date).toLocaleDateString()} at {session.scheduled_time}
                                                                </p>
                                                                <p className="text-xs text-gray-400">{session.topic || 'General mentorship session'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {session.meeting_link && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (session.meeting_link) {
                                                                            window.open(session.meeting_link, '_blank');
                                                                        } else {
                                                                            alert('Meeting link not available for this session.');
                                                                        }
                                                                    }}
                                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm hover:scale-105 transition-all duration-200"
                                                                >
                                                                    Join Session
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    // Handle reschedule
                                                                    setSelectedMentee(session.mentee);
                                                                    setSelectedSession(session);
                                                                    setShowScheduleModal(true);
                                                                }}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm hover:scale-105 transition-all duration-200"
                                                            >
                                                                Reschedule
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    // Handle cancel session
                                                                    if (window.confirm('Are you sure you want to cancel this session?')) {
                                                                        try {
                                                                            await mentorshipService.cancelMentorshipSession(session._id);
                                                                            alert('Session cancelled successfully!');
                                                                            fetchDashboardData(); // Refresh data
                                                                        } catch (err) {
                                                                            console.error('Error cancelling session:', err);
                                                                            alert('Failed to cancel session');
                                                                        }
                                                                    }
                                                                }}
                                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm hover:scale-105 transition-all duration-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Resources Tab */}
                            {activeTab === 'resources' && (
                                <MentorshipResourcesSection user={user} />
                            )}

                            {/* Settings Tab */}
                            {activeTab === 'settings' && (
                                <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-6 border border-[#3a3a45]">
                                    <h2 className="text-2xl font-semibold mb-4 text-white">Mentorship Preferences</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-white mb-3">Availability</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="availability"
                                                        value="weekly"
                                                        checked={mentorshipPreferences.availability === 'weekly'}
                                                        onChange={(e) => setMentorshipPreferences({...mentorshipPreferences, availability: e.target.value})}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-gray-300">Weekly</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="availability"
                                                        value="monthly"
                                                        checked={mentorshipPreferences.availability === 'monthly'}
                                                        onChange={(e) => setMentorshipPreferences({...mentorshipPreferences, availability: e.target.value})}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-gray-300">Monthly</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="availability"
                                                        value="quarterly"
                                                        checked={mentorshipPreferences.availability === 'quarterly'}
                                                        onChange={(e) => setMentorshipPreferences({...mentorshipPreferences, availability: e.target.value})}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-gray-300">Quarterly</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-white mb-3">Preferred Skills to Mentor</h3>
                                            <textarea
                                                value={mentorshipPreferences.skills || ''}
                                                onChange={(e) => setMentorshipPreferences({...mentorshipPreferences, skills: e.target.value})}
                                                placeholder="e.g., Python, Leadership, Data Science, Product Management"
                                                className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                                rows="3"
                                            />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-white mb-3">Maximum Mentees</h3>
                                            <select
                                                value={mentorshipPreferences.max_mentees || 3}
                                                onChange={(e) => setMentorshipPreferences({...mentorshipPreferences, max_mentees: parseInt(e.target.value)})}
                                                className="border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                            >
                                                <option value={1}>1 mentee</option>
                                                <option value={2}>2 mentees</option>
                                                <option value={3}>3 mentees</option>
                                                <option value={4}>4 mentees</option>
                                                <option value={5}>5 mentees</option>
                                            </select>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleUpdatePreferences(mentorshipPreferences)}
                                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800"
                                            >
                                                Save Preferences
                                            </button>
                                            <button
                                                onClick={() => setMentorshipPreferences({})}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Schedule Session Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#23232b] rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-white mb-6">Schedule Mentorship Session</h3>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const sessionData = {
                                ...sessionForm,
                                mentee_id: selectedMentee?._id,
                                mentor_id: user.id,
                                ...(selectedSession && { sessionId: selectedSession._id })
                            };
                            handleScheduleSession(sessionData);
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={sessionForm.scheduled_date}
                                    onChange={(e) => setSessionForm({...sessionForm, scheduled_date: e.target.value})}
                                    className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                                <input
                                    type="time"
                                    value={sessionForm.scheduled_time}
                                    onChange={(e) => setSessionForm({...sessionForm, scheduled_time: e.target.value})}
                                    className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                                <select
                                    value={sessionForm.duration}
                                    onChange={(e) => setSessionForm({...sessionForm, duration: parseInt(e.target.value)})}
                                    className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>60 minutes</option>
                                    <option value={90}>90 minutes</option>
                                    <option value={120}>120 minutes</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Mode</label>
                                <select
                                    value={sessionForm.mode}
                                    onChange={(e) => setSessionForm({...sessionForm, mode: e.target.value})}
                                    className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                >
                                    <option value="virtual">Virtual</option>
                                    <option value="in_person">In Person</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Topic</label>
                                <input
                                    type="text"
                                    value={sessionForm.topic}
                                    onChange={(e) => setSessionForm({...sessionForm, topic: e.target.value})}
                                    placeholder="e.g., Career guidance, Technical skills, Leadership"
                                    className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                />
                            </div>

                            {sessionForm.mode === 'virtual' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Link</label>
                                    <input
                                        type="url"
                                        value={sessionForm.meeting_link}
                                        onChange={(e) => setSessionForm({...sessionForm, meeting_link: e.target.value})}
                                        placeholder="https://zoom.us/..."
                                        className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                                >
                                    Schedule Session
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowScheduleModal(false);
                                        setSessionForm({
                                            scheduled_date: '',
                                            scheduled_time: '',
                                            duration: 60,
                                            mode: 'virtual',
                                            topic: '',
                                            meeting_link: ''
                                        });
                                    }}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMessageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#23232b] rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Send Message</h3>
                        <textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500 mb-4"
                            rows="4"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    if (!messageText.trim()) {
                                        alert('Please enter a message');
                                        return;
                                    }
                                    try {
                                        // First, create or get conversation
                                        const conversation = await mentorshipService.createOrGetConversation(selectedMentee?._id);
                                        // Then send the message
                                        await mentorshipService.sendMessage(conversation._id, messageText.trim());
                                        alert('Message sent successfully!');
                                        setMessageText('');
                                        setShowMessageModal(false);
                                    } catch (err) {
                                        console.error('Error sending message:', err);
                                        alert('Failed to send message');
                                    }
                                }}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded hover:from-purple-700 hover:to-purple-800"
                            >
                                Send
                            </button>
                            <button
                                onClick={() => {
                                    setShowMessageModal(false);
                                    setMessageText('');
                                }}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNotesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#23232b] rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Session Notes</h3>
                        <p className="text-gray-300 mb-4">Modal implementation needed</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowNotesModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPreferencesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#23232b] rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Update Preferences</h3>
                        <p className="text-gray-300 mb-4">Modal implementation needed</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowPreferencesModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default withSidebarToggle(MentorshipDashboard);
