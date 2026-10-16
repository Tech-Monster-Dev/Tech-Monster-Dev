import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export default function useScrollToTop(trigger) {
    const pathname = usePathname();

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
    }, [pathname, trigger]);
}
