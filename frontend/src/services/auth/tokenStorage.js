const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export const tokenStorage = {
    getToken() {
        return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    },

    setToken(token) {
        if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken() {
        if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
    },

    getUser() {
        if (typeof window === "undefined") return null;
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    setUser(user) {
        if (typeof window !== "undefined") localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    removeUser() {
        if (typeof window !== "undefined") localStorage.removeItem(USER_KEY);
    },

    clear() {
        if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
        if (typeof window !== "undefined") localStorage.removeItem(USER_KEY);
    }
};