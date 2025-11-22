import axios from 'axios';
import { getSessionToken } from './get-session-token';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
});

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

export default apiClient;


