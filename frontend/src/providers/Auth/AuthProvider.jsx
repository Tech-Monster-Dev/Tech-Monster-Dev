import { useState, useCallback } from "react";
import AuthContext from "./AuthContext";
import * as authService from "../../services/api/authService";
import { tokenStorage } from "../../services/auth/tokenStorage";
import { socket } from '../../services/socket/socket';

function AuthProvider({ children }) {

    const [initialAuth] = useState(() => {
        try {
            return {
                token: tokenStorage.getToken(),
                user: tokenStorage.getUser(),
            };
        } catch (error) {
            console.error("Failed to initialize authentication:", error);
            tokenStorage.clear();
            return { token: null, user: null };
        }
    });
    const [token, setToken] = useState(initialAuth.token);
    const [user, setUser] = useState(initialAuth.user);
    const [authInitialized] = useState(true);


    // =========================
    // LOGIN
    // =========================

    const login = ({ token, user }) => {

        tokenStorage.setToken(token);
        tokenStorage.setUser(user);

        setToken(token);
        setUser(user);

    };


    // =========================
    // UPDATE USER
    // =========================

    const updateUser = (updatedUser) => {

        tokenStorage.setUser(updatedUser);

        setUser(updatedUser);

    };


    // =========================
    // LOGOUT
    // =========================

    const logout = useCallback(async () => {

        sessionStorage.setItem("logoutInProgress", "true");

        try {

            await authService.logout();

        } catch (err) {

            console.error(err);

        } finally {

            socket.disconnect();

            tokenStorage.clear();

            setToken(null);
            setUser(null);

        }

    }, []);


    return (

        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated: !!token,
                authInitialized,

                login,
                logout,

                updateUser
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}

export { AuthProvider };