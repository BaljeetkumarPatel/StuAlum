// frontend/src/pages/AlumniDirectory.jsx

import React, { useState, useEffect, useCallback } from 'react';
import withSidebarToggle from '../hocs/withSidebarToggle';
import Navbar from '../components/Navbar';
import AlumniFilterBar from '../components/AlumniDirectory/AlumniFilterBar';
import AlumniCard from '../components/AlumniDirectory/AlumniCard';
import InviteModal from '../components/InviteModal';
import api from '../services/api';
import { getCurrentUserRole } from '../utils/authUtils';

// Define the base URL for the backend API
const API_BASE_URL = 'https://stualum.onrender.com';

const AlumniDirectory = ({ onSidebarToggle }) => {
    const [alumniData, setAlumniData] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const userRole = getCurrentUserRole();

    const [page, setPage] = useState(1);
    const LIMIT = 20;

    const [filters, setFilters] = useState({
        nameOrKeyword: '', gradYear: '', company: '', industry: '',
        remoteFriendly: false, hiring: false, mentorReady: false, classOf: '', 
    });

    const fetchAlumni = useCallback(async () => {
        setLoading(true);
        // ... (fetch logic remains the same)
        try {
            const params = {};
            for (const key in filters) {
                const value = filters[key];
                if (value !== '' && value !== null && value !== false) {
                    params[key] = value;
                }
            }
            params.limit = LIMIT;
            params.skip = (page - 1) * LIMIT;
            const queryParams = new URLSearchParams(params).toString();
            const response = await api.get(`/alumni/directory?${queryParams}`);
            const data = response.data;
            setAlumniData(data.alumni || []);
            setTotalResults(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch alumni:', error);
            setAlumniData([]); 
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        fetchAlumni();
    }, [fetchAlumni]);

    const handleFilterChange = (newFilters) => {
        setPage(1);
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    };

    const handleExport = () => {
        const params = {};
        for (const key in filters) {
            const value = filters[key];
            if (value !== '' && value !== null && value !== false) {
                params[key] = value;
            }
        }
        const queryParams = new URLSearchParams(params).toString();
        const exportUrl = `${API_BASE_URL}/api/alumni/export?${queryParams}`;
        window.open(exportUrl, '_self');
    };

    // 🛑 NEW FUNCTION: Handles the invite button click and modal submission
    const handleInviteSubmit = async (emailListString) => {
        const emails = emailListString.split(',').map(e => e.trim()).filter(e => e.length > 0);
        try {
            const response = await api.post('/alumni/invite', { emails });
            setIsInviteModalOpen(false); // Close modal on success
            alert(response.data.message);
        } catch (error) {
            console.error('Error sending invitations:', error);
            // Use the error message from the backend if available
            const errorMessage = error.response?.data?.message || 'Failed to send invitations. Please try again.';
            alert(errorMessage);
        }
    };


    const currentPageEnd = Math.min(page * LIMIT, totalResults);
    const currentPageStart = totalResults > 0 ? (page - 1) * LIMIT + 1 : 0;


    return (
        <>
            <Navbar onSidebarToggle={onSidebarToggle} />
            <main className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Alumni Directory
                    </h1>

                    {/* Filter and Search Bar */}
                    <div className="mb-8">
                        <AlumniFilterBar filters={filters} onFilterChange={handleFilterChange} />
                    </div>

                    <div className="alumni-results">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-white">
                                Alumni Results
                            </h2>

                            {/* Action buttons */}
                            <div className="flex space-x-4">
                                <button
                                    className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 flex items-center space-x-2"
                                    onClick={handleExport}
                                >
                                    <i className="fas fa-download"></i>
                                    <span>Export</span>
                                </button>
                                {userRole === 'admin' && (
                                    <button
                                        onClick={() => setIsInviteModalOpen(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                    >
                                        <i className="fas fa-user-plus"></i>
                                        <span>Invite Alumni</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {totalResults > 0 && (
                            <p className="text-sm text-gray-400 mb-6 text-center">
                                Showing {currentPageStart}-{currentPageEnd} of {totalResults} results
                            </p>
                        )}

                        {/* Alumni Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {alumniData.map(alumnus => (
                                    <AlumniCard key={alumnus.id} alumnus={alumnus} />
                                ))}

                                {alumniData.length === 0 && (
                                    <div className="col-span-full text-center py-20">
                                        <i className="fas fa-users text-6xl text-gray-600 mb-4"></i>
                                        <p className="text-xl text-gray-400">No alumni found matching your criteria.</p>
                                        <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {totalResults > LIMIT && (
                            <div className="flex justify-center mt-12 space-x-6">
                                <button
                                    disabled={page === 1}
                                    className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                    <span>Previous</span>
                                </button>
                                <div className="flex items-center px-4 py-3 bg-[#1a1a2e] rounded-lg border border-gray-600">
                                    <span className="text-white font-medium">Page {page}</span>
                                </div>
                                <button
                                    disabled={page * LIMIT >= totalResults}
                                    className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <span>Next</span>
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {isInviteModalOpen && (
                <InviteModal
                    onClose={() => setIsInviteModalOpen(false)}
                    onSubmit={handleInviteSubmit}
                />
            )}
        </>
    );
};

export default withSidebarToggle(AlumniDirectory);
