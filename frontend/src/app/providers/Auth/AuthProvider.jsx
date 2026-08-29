import { useState, useCallback } from "react";
import AuthContext from "./AuthContext";
import * as authService from "../../../services/api/authService";
import { tokenStorage } from "../../../services/auth/tokenStorage";
import { socket } from '../../../services/socket/socket';

function AuthProvider({ children }) {

    const [token, setToken] = useState(tokenStorage.getToken());

    const [user, setUser] = useState(
        tokenStorage.getUser()
    );


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