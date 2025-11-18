// frontend/src/pages/StudentDirectory.jsx

import React, { useState, useEffect, useCallback } from 'react';
import withSidebarToggle from '../hocs/withSidebarToggle';
import Navbar from '../components/Navbar';
import StudentFilterBar from '../components/StudentDirectory/StudentFilterBar';
import StudentCard from '../components/StudentDirectory/StudentCard';
import { getStudentDirectory } from '../services/api';

// Define the base URL for the backend API
const API_BASE_URL = 'https://stualum.onrender.com';

const StudentDirectory = ({ onSidebarToggle }) => {
    const [studentData, setStudentData] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const LIMIT = 20;

    const [filters, setFilters] = useState({
        nameOrKeyword: '', branch: '', yearOfGraduation: '', skills: '',
    });

    const fetchStudents = useCallback(async () => {
        setLoading(true);
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
            const response = await getStudentDirectory(queryParams);
            const data = response.data;
            setStudentData(data.students || []);
            setTotalResults(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setStudentData([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleFilterChange = (newFilters) => {
        setPage(1);
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    };

    const currentPageEnd = Math.min(page * LIMIT, totalResults);
    const currentPageStart = totalResults > 0 ? (page - 1) * LIMIT + 1 : 0;

    return (
        <>
            <Navbar onSidebarToggle={onSidebarToggle} />
            <main className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white">
                <h1 className="text-3xl font-bold mb-6">Student Directory</h1>

                {/* Filter and Search Bar */}
                <StudentFilterBar filters={filters} onFilterChange={handleFilterChange} />

                <div className="student-results my-6">
                    <h2 className="text-xl font-semibold mb-4 text-white">
                        Student Results
                    </h2>

                    {totalResults > 0 && (
                        <p className="text-sm text-gray-300 mb-4">
                            Showing {currentPageStart}-{currentPageEnd} of {totalResults} results
                        </p>
                    )}

                    {/* Student Grid */}
                    {loading ? (
                        <p className="text-white">Loading...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {studentData.map(student => (
                                <StudentCard key={student.id} student={student} />
                            ))}

                            {studentData.length === 0 && (
                                <p className="text-gray-400">No students found matching your criteria.</p>
                            )}
                        </div>
                    )}

                    {/* Pagination Controls (Placeholder for future implementation) */}
                    {totalResults > LIMIT && (
                        <div className="flex justify-center mt-6 space-x-4">
                            <button disabled={page === 1} className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700">Previous</button>
                            <span className="py-2 text-white">Page {page}</span>
                            <button disabled={page * LIMIT >= totalResults} className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700">Next</button>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
};

export default withSidebarToggle(StudentDirectory);
