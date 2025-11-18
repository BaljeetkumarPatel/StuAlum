import React, { useState, useEffect } from 'react';
import mentorshipService from '../services/mentorshipService';

const MentorshipResourcesSection = ({ user }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        resource_type: 'document',
        file: null,
        file_url: '',
        tags: ''
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const data = await mentorshipService.getMentorshipResources();
            setResources(data);
        } catch (err) {
            console.error('Error fetching resources:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadResource = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', uploadForm.title);
            formData.append('description', uploadForm.description);
            formData.append('resource_type', uploadForm.resource_type);

            if (uploadForm.resource_type === 'link') {
                formData.append('file_url', uploadForm.file_url);
            } else {
                formData.append('file', uploadForm.file);
            }

            formData.append('tags', uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag));

            await mentorshipService.uploadMentorshipResource(formData);
            alert('Resource uploaded successfully!');
            setShowUploadModal(false);
            setUploadForm({
                title: '',
                description: '',
                resource_type: 'document',
                file: null,
                file_url: '',
                tags: ''
            });
            fetchResources(); // Refresh resources
        } catch (err) {
            console.error('Error uploading resource:', err);
            alert('Failed to upload resource');
        }
    };

    return (
        <>
            <div className="bg-gradient-to-br from-[#23232b] to-[#1a1a23] rounded-lg shadow-md p-6 border border-[#3a3a45] relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <h2 className="text-2xl font-semibold text-white">Mentorship Resources</h2>
                    {user.role === 'alumni' && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded hover:from-purple-700 hover:to-purple-800 hover:scale-105 transition-all duration-200"
                        >
                            Upload Resource
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-gray-300 relative z-10">Loading resources...</div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-8 relative z-10">
                        <p className="text-gray-300">No resources available yet.</p>
                        {user.role === 'alumni' && (
                            <p className="text-sm text-gray-400 mt-2">Be the first to upload a mentorship resource!</p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                        {resources.map((resource) => (
                            <div key={resource._id} className="border border-[#3a3a45] rounded-lg p-4 bg-gradient-to-br from-[#1a1a23] to-[#15151a] hover:border-purple-500/50 transition-all duration-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-2 text-white">{resource.title}</h3>
                                        <p className="text-sm text-gray-300 mb-2">{resource.description}</p>
                                        <div className="flex items-center mb-2">
                                            <span className="text-xs bg-purple-100/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                                                {resource.type}
                                            </span>
                                            {resource.uploaded_by && (
                                                <span className="text-xs text-gray-400 ml-2">
                                                    by {resource.uploaded_by.full_name}
                                                </span>
                                            )}
                                        </div>
                                        {resource.tags && resource.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {resource.tags.map((tag, index) => (
                                                    <span key={index} className="text-xs bg-gray-100/20 text-gray-300 px-2 py-1 rounded">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {resource.type === 'link' ? (
                                        <button
                                            onClick={() => window.open(resource.url, '_blank')}
                                            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded text-sm hover:from-purple-700 hover:to-purple-800 hover:scale-105 transition-all duration-200"
                                        >
                                            Open Link
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => window.open(`https://stualum.onrender.com/${resource.url}`, '_blank')}
                                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded text-sm hover:from-purple-700 hover:to-purple-800 hover:scale-105 transition-all duration-200"
                                            >
                                                View Resource
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = `https://stualum.onrender.com/${resource.url}`;
                                                    link.download = resource.title;
                                                    link.click();
                                                }}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm hover:scale-105 transition-all duration-200"
                                            >
                                                Download
                                            </button>
                                        </>
                                    )}
                                    {user.role === 'alumni' && resource.created_by && resource.created_by._id === user.id && (
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to delete this resource?')) {
                                                    try {
                                                        await mentorshipService.deleteMentorshipResource(resource._id);
                                                        alert('Resource deleted successfully!');
                                                        fetchResources(); // Refresh resources
                                                    } catch (err) {
                                                        console.error('Error deleting resource:', err);
                                                        alert('Failed to delete resource');
                                                    }
                                                }
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm hover:scale-105 transition-all duration-200"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Resource Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#23232b] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-white mb-6">Upload Mentorship Resource</h3>

                            <form onSubmit={handleUploadResource} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={uploadForm.title}
                                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                                        className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                        placeholder="Resource title"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={uploadForm.description}
                                        onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                                        className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                        placeholder="Brief description of the resource"
                                        rows="2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Resource Type</label>
                                    <select
                                        value={uploadForm.resource_type}
                                        onChange={(e) => setUploadForm({...uploadForm, resource_type: e.target.value})}
                                        className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                    >
                                        <option value="document">Document</option>
                                        <option value="video">Video</option>
                                        <option value="link">Link</option>
                                        <option value="template">Template</option>
                                        <option value="guide">Guide</option>
                                    </select>
                                </div>

                                {uploadForm.resource_type === 'link' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Resource URL</label>
                                        <input
                                            type="url"
                                            value={uploadForm.file_url}
                                            onChange={(e) => setUploadForm({...uploadForm, file_url: e.target.value})}
                                            className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                            placeholder="https://example.com/resource"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Upload File</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif"
                                            onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                                            className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white file:bg-purple-600 file:text-white file:border-none file:rounded file:px-3 file:py-1 file:mr-3 file:hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Supported formats: PDF, DOC, PPT, Video files, Images</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={uploadForm.tags}
                                        onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                                        className="w-full border border-[#3a3a45] rounded-lg px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
                                        placeholder="career, leadership, resume"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                                    >
                                        Upload Resource
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setUploadForm({
                                                title: '',
                                                description: '',
                                                resource_type: 'document',
                                                file: null,
                                                file_url: '',
                                                tags: ''
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
                </div>
            )}
        </>
    );
};

export default MentorshipResourcesSection;
