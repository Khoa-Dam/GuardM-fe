import axios from 'axios';

/**
 * A robustly typed mapping for Axios API errors without utilizing 'any'.
 * Eliminates ESLint explicit-any constraints while allowing nested JSON data access.
 */
export function handleApiError(error: unknown, defaultMessage: string): never {
    let errorMessage = defaultMessage;
    
    if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as Record<string, unknown> | string | undefined;
        if (typeof errorData === 'object' && errorData !== null) {
            const responseMessage = errorData.message;
            if (typeof responseMessage === 'string') {
                errorMessage = responseMessage;
            } else if (Array.isArray(responseMessage)) {
                const messages = [...new Set(responseMessage.filter(
                    (message): message is string => typeof message === 'string',
                ))];
                if (messages.length > 0) errorMessage = messages.join('. ');
            }

            if (errorMessage === defaultMessage && typeof errorData.error === 'string') {
                errorMessage = errorData.error;
            }
        } else if (typeof errorData === 'string') {
            errorMessage = errorData;
        }

        if (errorMessage === defaultMessage) {
            errorMessage = error.message || defaultMessage;
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    
    throw new Error(errorMessage);
}
