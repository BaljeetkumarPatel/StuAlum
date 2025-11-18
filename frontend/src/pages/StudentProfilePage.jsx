// frontend/src/pages/StudentProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import withSidebarToggle from '../hocs/withSidebarToggle';
import Navbar from '../components/Navbar';
import { getStudentProfileById } from '../services/api';

// Define the base URL for the backend API
const API_BASE_URL = 'https://stualum.onrender.com';

const StudentProfilePage = ({ onSidebarToggle }) => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const response = await getStudentProfileById(id);
                setStudent(response.data);
            } catch (err) {
                console.error('Error fetching student profile:', err);
                setError('Failed to load student profile');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStudentProfile();
        }
    }, [id]);

    if (loading) {
        return (
            <>
                <Navbar onSidebarToggle={onSidebarToggle} />
                <main className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white">
                    <div className="flex justify-center items-center h-64">
                        <p className="text-white">Loading...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error || !student) {
        return (
            <>
                <Navbar onSidebarToggle={onSidebarToggle} />
                <main className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white">
                    <div className="flex justify-center items-center h-64">
                        <p className="text-red-400">{error || 'Student not found'}</p>
                    </div>
                </main>
            </>
        );
    }

    const imageSource = student.photo
        ? `${API_BASE_URL}${student.photo}`
        : '/path/to/default/image.png';

    return (
        <>
            <Navbar onSidebarToggle={onSidebarToggle} />
            <main className="min-h-screen overflow-y-auto pt-[60px] px-10 py-5 bg-[#111019] text-white">
                <div className="max-w-4xl mx-auto bg-[#1a1a2e] rounded-lg p-8 shadow-lg">
                    {/* Header Section */}
                    <div className="flex items-start mb-8">
                        <img
                            src={imageSource}
                            alt={student.full_name || 'Student Profile'}
                            className="w-24 h-24 rounded-full object-cover mr-6"
                        />
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{student.full_name}</h1>
                            <p className="text-lg text-gray-300 mb-1">{student.branch} - Graduating {student.year_of_graduation}</p>
                            <p className="text-sm text-gray-400">Enrollment: {student.enrollment_number}</p>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-purple-400">Basic Information</h2>
                            <div className="space-y-2">
                                <p><span className="font-medium">Email:</span> {student.email}</p>
                                {student.contact_number && <p><span className="font-medium">Phone:</span> {student.contact_number}</p>}
                                {student.address && <p><span className="font-medium">Address:</span> {student.address}</p>}
                                <p><span className="font-medium">Year of Admission:</span> {student.year_of_admission}</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-purple-400">Career & Goals</h2>
                            <div className="space-y-2">
                                {student.career_goals && <p><span className="font-medium">Career Goals:</span> {student.career_goals}</p>}
                                {student.discovery_insights && <p><span className="font-medium">Discovery Insights:</span> {student.discovery_insights}</p>}
                                {student.preferences && <p><span className="font-medium">Preferences:</span> {student.preferences}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Skills & Interests */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-purple-400">Skills & Interests</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {student.skills && student.skills.length > 0 && (
                                <div>
                                    <h3 className="font-medium mb-2">Skills:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {student.skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {student.interests && student.interests.length > 0 && (
                                <div>
                                    <h3 className="font-medium mb-2">Interests:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {student.interests.map((interest, index) => (
                                            <span key={index} className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Projects Section */}
                    {student.projects && student.projects.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4 text-purple-400">Projects</h2>
                            <div className="space-y-4">
                                {student.projects.map((project, index) => (
                                    <div key={index} className="bg-[#2a2a3e] p-4 rounded-lg">
                                        <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                                        <p className="text-gray-300">{project.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-purple-400">Additional Information</h2>
                            <div className="space-y-2">
                                {student.extracurricular && <p><span className="font-medium">Extracurricular:</span> {student.extracurricular}</p>}
                                {student.mentorship_area && <p><span className="font-medium">Mentorship Area:</span> {student.mentorship_area}</p>}
                                {student.mentor_type && <p><span className="font-medium">Mentor Type:</span> {student.mentor_type}</p>}
                                {student.hear_about && <p><span className="font-medium">How did you hear about us:</span> {student.hear_about}</p>}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-purple-400">Links</h2>
                            <div className="space-y-2">
                                {student.linkedin && (
                                    <p>
                                        <span className="font-medium">LinkedIn:</span>{' '}
                                        <a href={student.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                            {student.linkedin}
                                        </a>
                                    </p>
                                )}
                                {student.github && (
                                    <p>
                                        <span className="font-medium">GitHub:</span>{' '}
                                        <a href={student.github} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                            {student.github}
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>



                    {/* Verification Status */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-purple-400">Verification Status</h2>
                        <span className={`px-3 py-1 rounded-full text-sm ${student.is_verified ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                            {student.is_verified ? 'Verified' : 'Not Verified'}
                        </span>
                    </div>
                </div>
            </main>
        </>
    );
};

export default withSidebarToggle(StudentProfilePage);
