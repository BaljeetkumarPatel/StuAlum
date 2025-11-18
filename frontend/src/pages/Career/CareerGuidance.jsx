// frontend/src/pages/Career/CareerGuidance.jsx (UPDATED WORKING VERSION)

import React, { useState, useEffect } from 'react';
import withSidebarToggle from '../../hocs/withSidebarToggle';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import ResumeUploadModal from '../../components/Career/ResumeUploadModal';

// --- UPDATED STATIC DATA WITH REAL URLs ---
const STATIC_RESOURCES = {
    prepResources: [
        {
            _id: 'p-1',
            title: 'Interview Prep Kit',
            description: 'Question bank, frameworks, mock scripts',
            url: 'https://www.hackerrank.com/interview/interview-preparation-kit',
            type: 'Kit'
        },
        {
            _id: 'p-2',
            title: 'Behavioral Videos',
            description: 'STAR answers with examples',
            url: 'https://www.youtube.com/watch?v=sq3pyauZRhI&list=PLePbzYpjlB26uX9QFkjXmrKJ1legeHqQg&index=1',
            type: 'Video'
        },
        {
            _id: 'p-3',
            title: 'Career Blog',
            description: 'Articles from alumni & coaches',
            url: 'https://detailed.com/career-blogs/',
            type: 'Article'
        },
        {
            _id: 'p-4',
            title: 'Resume Templates',
            description: 'ATS-friendly designs',
            url: 'https://www.resume-now.com/lp/rnarsmsm121?utm_source=bing&utm_medium=sem&utm_campaign=568035454&utm_term=resume%20templates&network=o&device=c&adposition=&adgroupid=1187474304589902&msclkid=dde313b48c841c3b535a7aae5d509ee4&utm_content=resume%20templates',
            type: 'Template'
        },
    ],
    articlesAndVideos: [
        {
            _id: 'a-1',
            title: 'Acing Behavioral Interviews',
            duration_text: '5 min read',
            source_type: 'Article',
            content_url: 'https://www.themuse.com/advice/behavioral-interview-questions-answers-examples'
        },
        {
            _id: 'a-2',
            title: 'Resume Mistakes to Avoid in 2025',
            duration_text: 'Video • 8 min',
            source_type: 'Video',
            content_url: 'https://www.youtube.com/watch?v=pjqi_M3SPwY'
        },
    ]
};

// Tabs
const TABS = [{ label: 'Resources', key: 'resources' }];

const CareerGuidance = ({ onSidebarToggle }) => {
    const [activeTab, setActiveTab] = useState('resources');
    const [loading, setLoading] = useState(true);

    const [prepResources, setPrepResources] = useState([]);
    const [articlesAndVideos, setArticlesAndVideos] = useState([]);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const navigate = useNavigate();

    // Static data load
    useEffect(() => {
        if (activeTab !== 'resources') return;

        setLoading(true);

        const timer = setTimeout(() => {
            setPrepResources(STATIC_RESOURCES.prepResources);
            setArticlesAndVideos(STATIC_RESOURCES.articlesAndVideos);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [activeTab]);

    const handleUploadSuccess = (reviewSessionId) => {
        setIsUploadModalOpen(false);
        window.open(`/career-guidance/ai-chat?sessionId=${reviewSessionId}`, '_blank');
    };

    // COMPONENT — Prep Resource Card
    const PrepResourceCard = ({ title, description, link_url }) => (
        <div className="bg-[#3A1869] p-4 rounded-lg flex flex-col justify-between border border-purple-700/50 hover:border-purple-400 transition min-h-[120px]">
            <div className="flex-grow">
                <div className="text-xl mb-2 text-purple-300">
                    {title.includes('Interview') && '📝'}
                    {title.includes('Behavioral') && '🎥'}
                    {title.includes('Blog') && '📰'}
                    {title.includes('Template') && '📄'}
                </div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs text-gray-400 mt-1">{description}</p>
            </div>

            <div className="mt-3 self-end">
                <button
                    onClick={() => window.open(link_url, '_blank', 'noopener,noreferrer')}
                    className="px-3 py-1 text-sm rounded-lg font-semibold transition bg-blue-600 text-white hover:bg-blue-700"
                >
                    {title.includes('Interview')
                        ? 'Open'
                        : title.includes('Template')
                        ? 'Browse'
                        : title.includes('Blog')
                        ? 'Read'
                        : 'Watch'}
                </button>
            </div>
        </div>
    );

    // COMPONENT — Article/Video Item
    const ArticleVideoCard = ({ title, duration_text, source_type, content_url }) => (
        <div className="flex justify-between items-center p-3 hover:bg-[#3A1869]/70 rounded-lg transition border-b border-gray-700">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-600 rounded mr-3 flex-shrink-0"></div>
                <div>
                    <p className="text-sm text-white line-clamp-1">{title}</p>
                    <p className="text-xs text-gray-400">{duration_text} • {source_type}</p>
                </div>
            </div>

            <button
                onClick={() => window.open(content_url, '_blank', 'noopener,noreferrer')}
                className="px-3 py-1 text-xs rounded-full bg-purple-600 text-white hover:bg-purple-700"
            >
                {source_type === 'Video' ? 'Watch' : 'Read'}
            </button>
        </div>
    );

    return (
        <>
            <Navbar onSidebarToggle={onSidebarToggle} />

            <main className="flex-1 overflow-y-auto pt-[60px] px-10 py-5 bg-[#2a0e4d] min-h-screen">
                <h1 className="text-3xl font-bold text-white mb-6">Career Guidance</h1>

                {/* Tabs */}
                <div className="flex space-x-6 border-b border-purple-700 mb-6">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-2 text-lg font-semibold transition-colors
                                ${activeTab === tab.key
                                    ? 'text-purple-400 border-b-2 border-purple-400'
                                    : 'text-gray-400 hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="pb-10">
                    {activeTab === 'resources' && (
                        <>
                            <div className="w-full space-y-8">
                                <h2 className="text-xl font-bold text-white">Prep Resources</h2>

                                {loading ? (
                                    <p className="text-purple-300">Loading resources...</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {prepResources.map((item) => (
                                            <PrepResourceCard
                                                key={item._id}
                                                title={item.title}
                                                description={item.description}
                                                link_url={item.url}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Articles & Videos */}
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold text-white mb-4">Career Articles & Videos</h3>

                                    {loading ? (
                                        <p className="text-purple-300">Loading articles...</p>
                                    ) : (
                                        <div className="bg-[#3A1869] p-4 rounded-xl shadow-lg divide-y divide-gray-700">
                                            {articlesAndVideos.map(item => (
                                                <ArticleVideoCard
                                                    key={item._id}
                                                    title={item.title}
                                                    duration_text={item.duration_text}
                                                    source_type={item.source_type}
                                                    content_url={item.content_url}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <ResumeUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </>
    );
};

export default withSidebarToggle(CareerGuidance);
