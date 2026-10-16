import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Map route path segments to a display title (without the brand prefix).
const ROUTE_TITLES = [
    { match: /^\/student\/lessons/i, title: "Lessons" },
    { match: /^\/student\/dashboard/i, title: "Student Dashboard" },
    { match: /^\/student\/tasks/i, title: "Tasks" },
    { match: /^\/student\/attendance/i, title: "Attendance" },
    { match: /^\/student\/account/i, title: "Student Account" },
    { match: /^\/admin\/(?:dashboard|overview)/i, title: "Admin Dashboard" },
    { match: /^\/admin/i, title: "Admin" },
    { match: /^\/login/i, title: "Login" },
    { match: /^\/signup/i, title: "Sign Up" },
    { match: /^\/student$/i, title: "Student Dashboard" },
];

const DEFAULT_TITLE = "Tech Monster";

// Resolve the display title for a given path ("" => use the bare brand name).
const resolveTitle = (pathname) => {
    if (pathname === "/") return "Home";

    const matched = ROUTE_TITLES.find(({ match }) => match.test(pathname));
    return matched ? matched.title : "";
};

/**
 * Dynamically updates `document.title` on every route transition based on the
 * current `pathname`. Falls back to "Tech Monster" for unknown routes.
 */
export default function usePageTitle() {
    const pathname = usePathname() || "/";

    useEffect(() => {
        const title = resolveTitle(pathname);

        document.title = title ? `${DEFAULT_TITLE} | ${title}` : DEFAULT_TITLE;
    }, [pathname]);
}
