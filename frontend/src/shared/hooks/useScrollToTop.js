import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useScrollToTop() {
    const location = useLocation();

    useLayoutEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto",
        });

        const dashboardContent = document.querySelector(".dashboard-content");

        if (dashboardContent) {
            dashboardContent.scrollTop = 0;
            dashboardContent.scrollLeft = 0;
        }
    }, [location.pathname]);

}
