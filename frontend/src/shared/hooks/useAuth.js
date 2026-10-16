
import { useContext } from "react";
import AuthContext from "../../providers/Auth/AuthContext";

export default function useAuth() {
    return useContext(AuthContext);
}