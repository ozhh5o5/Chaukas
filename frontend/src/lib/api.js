/**
 * API Configuration for Chaukas
 * Handles both local development and production deployment
 */

// Get base API URL from environment or default to /api for production
const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    
    // In production (Vercel), use relative /api path
    // In development, use localhost:8000 if specified
    if (!envUrl || envUrl === '/api') {
        return '/api';
    }
    
    // Remove trailing slash
    return envUrl.replace(/\/$/, '');
};

export const API_BASE_URL = getApiUrl();

/**
 * Build full API endpoint URL
 * @param {string} endpoint - API endpoint path (e.g., '/crisis/active')
 * @returns {string} Full URL
 */
export const getApiEndpoint = (endpoint) => {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.replace(/^\//, '');
    
    // If API_BASE_URL starts with http, use it directly
    if (API_BASE_URL.startsWith('http')) {
        return `${API_BASE_URL}/${cleanEndpoint}`;
    }
    
    // Otherwise, use relative path (for production)
    return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * Fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} Response data
 */
export const apiFetch = async (endpoint, options = {}) => {
    const url = getApiEndpoint(endpoint);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API Fetch Error (${endpoint}):`, error);
        throw error;
    }
};

// Export for debugging
console.log('API Configuration:', {
    baseUrl: API_BASE_URL,
    environment: import.meta.env.MODE,
    isProduction: import.meta.env.PROD
});
