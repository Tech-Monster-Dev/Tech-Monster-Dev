import axios from "axios";

const isLocalhost = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
const serverSideURI = process.env.NEXT_PUBLIC_API_URL || "https://tech-monster-dev.onrender.com/api";

const api = axios.create({
    baseURL: isLocalhost ? "http://localhost:8001/api" : serverSideURI,
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
            case 401: {
                const hasAccessToken =
                    Boolean(localStorage.getItem("accessToken")) ||
                    Boolean(localStorage.getItem("adminAccessToken"));

                const isAuthTransition =
                    sessionStorage.getItem("accountDeletionInProgress") === "true" ||
                    sessionStorage.getItem("logoutInProgress") === "true";

                if (!hasAccessToken || isAuthTransition) {
                    return Promise.reject(error);
                }

                localStorage.removeItem("accessToken");
                localStorage.removeItem("adminAccessToken");
                localStorage.removeItem("user");
                localStorage.removeItem("admin");

                if (window.location.pathname !== "/error_status/session-expired") {
                    window.location.href = "/error_status/session-expired";
                }

                break;
            }

            case 403:
                if (error.response?.data?.message === "Your account has been blocked.") {
                    window.location.href = "/error_status/account-blocked";
                } else {
                    window.location.href = "/error_status/unauthorized";
                }
                break;

            case 429:
                window.location.href = "/error_status/429";
                break;

            case 503:
                window.location.href = "/error_status/503";
                break;

            default:
                break;
        }

        return Promise.reject(error);
    }
);

export default api;
