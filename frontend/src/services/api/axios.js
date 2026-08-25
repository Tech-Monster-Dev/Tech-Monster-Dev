import axios from "axios";

const serverSideURI = "https://tech-monster-dev.onrender.com/api";
const testing = false;

const api = axios.create({
    baseURL: `${testing ? "http://localhost:8001/api" : serverSideURI || import.meta.env.VITE_API_URL}`,
    withCredentials: true,
    timeout: 30000, // Increased timeout to 60s for slow email sending / cold starts
    headers: {
        "Content-Type": "application/json"
    }
});

// ==============================================
// Request Interceptor
// ==============================================
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("adminAccessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==============================================
// Response Interceptor
// ==============================================
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const status = error.response?.status;
        const url = error.config?.url || "";

        // Auth endpoint request check
        const isAuthRequest =
            url.includes("/auth/signup") ||
            url.includes("/auth/login") ||
            url.includes("/auth/verify-otp") ||
            url.includes("/auth/resend-otp") ||
            url.includes("/auth/forgot-password") ||
            url.includes("/auth/reset-password");

        // Bypass full-page redirects for Auth requests so UI can show proper error messages
        if (isAuthRequest) {
            return Promise.reject(error);
        }

        switch (status) {
            case 401:
                localStorage.removeItem("accessToken");
                localStorage.removeItem("adminAccessToken");
                localStorage.removeItem("user");
                localStorage.removeItem("admin");

                if (window.location.pathname !== "/session-expired") {
                    window.location.href = "/session-expired";
                }
                break;

            case 403:
                if (error.response?.data?.message === "Your account has been blocked.") {
                    window.location.href = "/account-blocked";
                } else {
                    window.location.href = "/unauthorized";
                }
                break;

            case 429:
                window.location.href = "/429";
                break;

            case 503:
                window.location.href = "/503";
                break;

            default:
                break;
        }

        return Promise.reject(error);
    }
);

export default api;