// frontend/src/components/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUserIdFromToken, getCurrentUserRole } from '../utils/authUtils';

// 🚨 NEW MENU ITEM FOR ADMINS
const adminMenuItem = {
    label: 'Report Dashboard',
    route: '/admin/reports',
    icon: (
        <svg className="w-6 h-6 mr-4" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7" />
            <path d="M14 18l-2 2-2-2" />
            <path d="M14 14l-2-2-2 2" />
            <path d="M18 13h4" />
        </svg>
    ),
};


const menuItems = [
    // --- START OF MENU DATA (YOUR EXISTING ITEMS) ---
    {
        label: 'Dashboard',
        route: '/',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M3 13h7v8H3z" />
                <path d="M14 3h7v18h-7z" />
            </svg>
        ),
    },
    {
        label: 'Forums',
        route: '/forums',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h12" />
                <path d="M6 12h8" />
            </svg>
        ),
    },
    {
        label: 'Mentorship',
        route: '/mentorship',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <circle cx="8" cy="7" r="3" />
                <circle cx="16" cy="7" r="3" />
                <path d="M2 21v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2" />
                <path d="M14 21v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2" />
            </svg>
        ),
    },
    {
        label: 'Career Guidance',
        route: '/career-guidance',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <rect x="1" y="7" width="22" height="13" rx="2" />
                <path d="M16 3a4 4 0 0 0-8 0" />
            </svg>
        ),
    },
    {
        label: 'Events',
        route: '/events',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
            </svg>
        ),
    },
    {
        label: 'Alumni Directory',
        route: '/alumni-directory',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <circle cx="12" cy="7" r="4" />
                <path d="M2 21v-2a7 7 0 0 1 7-7h6a7 7 0 0 1 7 7v2" />
            </svg>
        ),
    },
    {
        label: 'Student Directory',
        route: '/student-directory',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <path d="M12 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4z" />
                <path d="M4 20c0-4 8-4 8-4s8 0 8 4v1H4v-1z" />
            </svg>
        ),
    },
    {
        label: 'AI Tools',
        route: '/ai-tools',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
            </svg>
        ),
    },
    {
        label: 'Messages',
        route: '/messages',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M22 5l-10 7L2 5" />
            </svg>
        ),
        badge: 'unreadCount', // Dynamic badge for unread messages
    },
    {
        label: 'Badges/Points',
        route: '/badges-points',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <circle cx="12" cy="8" r="5" />
                <path d="M17 21v-2a5 5 0 0 0-10 0v2" />
            </svg>
        ),
    },
    {
        label: 'Analytics',
        route: '/placement-dashboard',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <rect x="3" y="12" width="4" height="8" />
                <rect x="10" y="8" width="4" height="12" />
                <rect x="17" y="4" width="4" height="16" />
            </svg>
        ),
    },
    {
        label: 'Settings',
        route: '/settings',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 4.3l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15.4 9c.09.47.33.9.68 1.24l.06.06A1.65 1.65 0 0 0 19.4 15Z" />
            </svg>
        ),
    },
    {
        label: 'Help & Support',
        route: '/help-support',
        icon: (
            <svg
                className="w-6 h-6 mr-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 6" />
                <circle cx="12" cy="17" r="1" />
            </svg>
        ),
    },
    // --- END OF MENU DATA ---
];


const Sidebar = ({ onLogoClick, isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    // 🚨 FETCH USER ROLE: Using actual auth utility
    const userRole = getCurrentUserRole();
    const isAdmin = userRole === 'admin';

    // Remove Mentorship for Admins
    const filteredMenuItems = isAdmin
        ? menuItems.filter((item) => item.label !== "Mentorship")
        : menuItems;

    

    const sidebarClasses = `
        fixed top-0 z-50 h-screen w-60 bg-[#1A1D26] text-white flex flex-col shadow-lg
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    const handleNavigation = (route) => {
        navigate(route);
        onClose();
    };

    const isMenuItemActive = (route) => {
        return location.pathname === route ? 'bg-purple-700 font-semibold' : 'font-normal';
    };

    // Fetch unread message count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!getCurrentUserIdFromToken()) return;

            try {
                const response = await axios.get('http://localhost:5000/api/messages/conversations', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const totalUnread = response.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
                setUnreadCount(totalUnread);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        fetchUnreadCount();
        // Poll every 30 seconds for updates
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* 1. Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-40"
                    onClick={onClose}
                />
            )}

            {/* 2. Sidebar Panel */}
            <aside className={sidebarClasses}>
                <div
                    className="py-4 pl-8 flex items-center cursor-pointer select-none"
                    onClick={() => { onLogoClick(); onClose(); }}
                >
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto mr-3" />
                    <span className="text-xl font-bold tracking-wide text-purple-400">StuAlum</span>
                </div>

                <nav className="flex-1 overflow-y-auto">
                    <ul className="list-none p-0 m-0">
                        {/* 1. STANDARD USER LINKS */}
                        {/* {menuItems.map((item) => ( */}
                        {filteredMenuItems.map((item) => (
                            <li
                                key={item.label}
                                onClick={() => handleNavigation(item.route)}
                                className={`flex items-center pl-8 py-4 cursor-pointer hover:bg-white/10 transition relative ${isMenuItemActive(item.route)}`}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') handleNavigation(item.route);
                                }}
                                role="button"
                                aria-label={`Maps to ${item.label}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {item.badge && unreadCount > 0 && (
                                    <span className="bg-red-600 text-white rounded-full w-5 h-5 text-xs text-center absolute right-5 flex items-center justify-center">
                                        {item.label === 'Messages' ? (unreadCount > 99 ? '99+' : unreadCount) : item.badge}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* 🚨 2. CONDITIONAL ADMIN TOOLS SECTION */}
                    {isAdmin && (
                        <div className="admin-links mt-8 pt-4 border-t border-gray-700">
                            <p className="text-gray-400 text-sm pl-8 mb-2 font-semibold">ADMINISTRATION</p>
                            <ul className="list-none p-0 m-0">
                                <li
                                    key={adminMenuItem.label}
                                    onClick={() => handleNavigation(adminMenuItem.route)}
                                    className={`flex items-center pl-8 py-4 cursor-pointer hover:bg-white/10 transition relative ${isMenuItemActive(adminMenuItem.route)}`}
                                >
                                    {adminMenuItem.icon}
                                    <span>{adminMenuItem.label}</span>
                                </li>
                            </ul>
                        </div>
                    )}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
