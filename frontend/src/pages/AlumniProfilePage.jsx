// frontend/src/pages/AlumniProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://stualum.onrender.com'; 
const DEFAULT_PROFILE_IMAGE = '/path/to/default/image.png';

const AlumniProfilePage = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    const getFullImageUrl = (relativePath) => 
        relativePath ? `${API_BASE_URL}${relativePath}` : DEFAULT_PROFILE_IMAGE;

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/alumni/${id}`);
                setProfile(response.data);
            } catch (err) {
                console.error("Error fetching profile:", err.response ? err.response.data : err.message);
                setError("Failed to load alumni profile. Check server console for details."); 
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-xl">Loading alumni profile...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>; 
    if (!profile) return <div className="p-8 text-center text-gray-500">Profile not found.</div>;

    // Helper function to render array details (used for skills and contributions)
    const renderArrayDetails = (arr) => 
        (Array.isArray(arr) && arr.length > 0) 
            ? arr.map((item, index) => (
                <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mr-2 mb-2">
                    {item}
                </span>
              ))
            : <span className="text-gray-500 italic text-sm">N/A</span>;
    
    // --- Render Component ---

    return (
        <div className="alumni-profile-page p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white p-8 shadow-2xl rounded-xl">
                
                {/* 1. Header and Contact */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b">
                    <div className="flex items-center space-x-6">
                        <img 
                            src={getFullImageUrl(profile.profile_photo_url)} 
                            alt={profile.full_name} 
                            className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 shadow-md"
                        />
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900">{profile.full_name}</h1>
                            <p className="text-xl text-blue-600 font-semibold mt-1">{profile.current_position} at {profile.company}</p>
                            <p className="text-md text-gray-500 flex items-center mt-1">
                                <i className="fas fa-map-marker-alt mr-2"></i> {profile.location} &bull; Graduated: {profile.graduation_year}
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 text-right">
                        <p className="text-gray-700"><strong>Contact:</strong> {profile.contact_number || 'N/A'}</p>
                        <p className="text-gray-700"><strong>Email:</strong> {profile.email}</p>
                        <p className={`text-sm font-medium ${profile.is_verified ? 'text-green-600' : 'text-red-500'}`}>
                            {profile.is_verified ? '✅ Verified Alumnus' : '⚠️ Unverified'}
                        </p>
                    </div>
                </div>

                {/* 2. About Me / Summary */}
                {profile.about_me && (
                    <div className="mb-8 p-4 bg-gray-100 rounded-lg">
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">About Me</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{profile.about_me}</p>
                    </div>
                )}
                
                {/* 3. Professional and Academic Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8">
                    {/* Column 1: Professional */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Professional & Career</h2>
                        <DetailItem label="Industry" value={profile.industry} />
                        <DetailItem label="Total Experience" value={`${profile.years_of_experience || 0} years`} />
                        <DetailItem label="Current Position" value={profile.current_position} />
                        <DetailItem label="Professional Achievements" value={profile.professional_achievements} multiline={true} />
                        <DetailItem label="Prospect Type" value={profile.prospect_type} />
                    </div>

                    {/* Column 2: Academic & Links */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Academic & Verification</h2>
                        <DetailItem label="Degree" value={profile.degree} />
                        <DetailItem label="Graduation Year" value={profile.graduation_year} />
                        <DetailItem label="College ID" value={profile.college_id} />
                        {/* Removed: <DetailItem label="Preferred Communication" /> */}
                        <DetailItem label="Verification File" value={profile.verificationFile ? 'Uploaded' : 'None'} />
                    </div>
                </div>
                
                {/* 4. Skills and Contributions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Skills & Contribution</h2>
                    <div className="mb-4">
                        <p className="font-semibold text-lg mb-2">Technical Skills:</p>
                        {renderArrayDetails(profile.skills)}
                    </div>
                    <div>
                        <p className="font-semibold text-lg mb-2">Contribution Preferences:</p>
                        {renderArrayDetails(profile.contribution_preferences)}
                    </div>
                </div>

                {/* 5. Social Links */}
                <div className="border-t pt-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Social & Portfolios</h2>
                    <div className="flex flex-wrap gap-4">
                        <SocialLink url={profile.linkedin_url} icon="fab fa-linkedin" label="LinkedIn" />
                        <SocialLink url={profile.github_url} icon="fab fa-github" label="GitHub" />
                        <SocialLink url={profile.leetcode_url} icon="fas fa-code" label="LeetCode" />
                        <SocialLink url={profile.portfolio} icon="fas fa-globe" label="Portfolio" />
                    </div>
                </div>
                
            </div>
        </div>
    );
};

// Reusable Sub-Component for a detail row
const DetailItem = ({ label, value, multiline = false, rawHtml = false }) => (
    <div className={`mb-3 ${multiline ? 'block' : 'flex items-start'}`}>
        <p className={`font-semibold w-40 flex-shrink-0 ${multiline ? 'mb-1' : 'mr-3'}`}>{label}:</p>
        <div className="flex-grow">
            {rawHtml ? (
                <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: value }}></div>
            ) : (
                <p className="text-gray-700">{value || 'N/A'}</p>
            )}
        </div>
    </div>
);

// Reusable Sub-Component for social links (remains unchanged)
const SocialLink = ({ url, icon, label }) => {
    if (!url) return null;
    return (
        <a 
            href={url.startsWith('http') ? url : `https://${url}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg"
        >
            <i className={icon}></i>
            <span className="font-medium">{label}</span>
        </a>
    );
};


export default AlumniProfilePage;