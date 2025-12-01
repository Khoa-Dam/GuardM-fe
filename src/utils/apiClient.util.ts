import axios from 'axios';
import { getSessionToken } from './get-session-token';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
});

// Request interceptor - attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        const token = await getSessionToken();
        if (token) {
            config.headers = config.headers ?? {};
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor - handle 401 Unauthorized errors (token expired)
// This is mainly a fallback - the primary token refresh happens in JWT callback (server-side)
apiClient.interceptors.response.use(
    (response) => {
        // Return successful responses as-is
        return response;
    },
    async (error) => {
        // Check if error is 401 Unauthorized (token expired)
        // This could happen if:
        // 1. Both access token AND refresh token are expired
        // 2. Server-side refresh failed
        // 3. Race condition before server-side refresh completes
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            console.warn('[apiClient] 401 Unauthorized - Token expired, signing out...');
            
            // Sign out the user and redirect to login page
            // Server-side JWT callback will have already tried to refresh
            // If we're here, it means refresh failed or tokens are fully expired
            const { signOut } = await import('next-auth/react');
            await signOut({ 
                callbackUrl: '/login',
                redirect: true 
            });
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
