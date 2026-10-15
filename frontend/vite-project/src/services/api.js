import axios from 'axios';

// In production (Vercel), VITE_API_URL is set in the Vercel dashboard.
// In local dev, it falls back to localhost:8082.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8082',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
