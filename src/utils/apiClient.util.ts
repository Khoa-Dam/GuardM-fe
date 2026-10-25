import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getSessionToken } from './get-session-token';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    authRefreshRetried?: boolean;
};

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

// The session endpoint performs the server-side refresh. If a request still gets
// a 401, fetch the session once more and retry only when it returned a new token.
apiClient.interceptors.response.use(
    (response) => {
        // Return successful responses as-is
        return response;
    },
    async (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            const config = error.config as RetriableRequestConfig | undefined;
            const requestUrl = config?.url ?? '';
            const isAuthEndpoint = /\/auth\/(login|signup|refresh|logout|google)(\?|$)/.test(requestUrl);

            if (config && !config.authRefreshRetried && !isAuthEndpoint) {
                config.authRefreshRetried = true;
                const { getSession } = await import('next-auth/react');
                const session = await getSession();
                const freshToken = session?.accessToken;
                const authorization = config.headers?.Authorization;
                const sentToken = typeof authorization === 'string'
                    ? authorization.replace(/^Bearer\s+/i, '')
                    : undefined;

                if (freshToken && freshToken !== sentToken) {
                    config.headers.Authorization = `Bearer ${freshToken}`;
                    return apiClient.request(config);
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
