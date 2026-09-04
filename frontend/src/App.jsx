import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Loader from "./components/ui/Loader";
import AppRoutes from "./routes/AppRoutes";
import api from "./services/api/axios";
import usePageTitle from "./shared/hooks/usePageTitle";
import useScrollToTop from "./shared/hooks/useScrollToTop";

function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Dynamically update the browser tab title on every route change.
  usePageTitle();
  useScrollToTop();

  useEffect(() => {

    const checkServer = async () => {
      if (window.location.pathname === "/503") {
        return;
      }

      try {

        await api.get("/health");

      } catch (err) {

        if (err.response?.status === 503) {

          navigate("/503", {
            replace: true
          });

        }

      }

    };

    checkServer();

    const handleOffline = () => {
      navigate("/offline");
    };

    const handleOnline = () => {
      if (window.location.pathname === "/offline") {
        navigate("/");
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };

  }, [navigate]);

  return (
    <>
      {loading ? (
        <Loader finish={setLoading} />
      ) : (
        <div className="cyber-page">
          <div className="cyber-bg">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <AppRoutes />
        </div>
      )}
    </>
  );
}

export default App;