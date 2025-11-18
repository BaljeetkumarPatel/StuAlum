// frontend/src/services/api.js

import axios from 'axios';

// 1. Define the base URL for your backend server
const API_URL = 'https://stualum.onrender.com/api'; // Assuming your backend runs on port 5000 and uses /api prefix

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Add an interceptor to include the JWT token on every request
api.interceptors.request.use(
    (config) => {
        // Get the token from local storage or wherever you store it after login
        const token = localStorage.getItem('token');

        if (token) {
            // Set the Authorization header with Bearer token as required by your backend auth.js middleware
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Alumni Directory API functions
export const getAlumniDirectory = (queryParams) => api.get(`/alumni/directory?${queryParams}`);
export const inviteAlumni = (emails) => api.post('/alumni/invite', { emails });
export const getStudentDirectory = (queryParams) => api.get(`/student/directory?${queryParams}`);
export const getStudentProfileById = (id) => api.get(`/student/profile/${id}`);
export const exportAlumniToCSV = (queryParams) => api.get(`/alumni/export?${queryParams}`, { responseType: 'blob' });

export default api;
