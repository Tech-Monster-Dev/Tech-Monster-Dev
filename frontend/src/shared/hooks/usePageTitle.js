"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ROUTE_TITLES = [
    { match: /^\/admin\/reports\/activity\//i, title: "User Activity" },
    { match: /^\/admin\/students\/user-profile\//i, title: "Student Profile" },
    { match: /^\/admin\/students\/[^/]+/i, title: "Student Details" },
    { match: /^\/admin\/students$/i, title: "Manage Students" },
    { match: /^\/admin\/course-form$/i, title: "Edit Course Form" },
    { match: /^\/admin\/internships-form$/i, title: "Internship Form" },
    { match: /^\/admin\/certificates/i, title: "Certificate Approval" },
    { match: /^\/admin\/dashboard/i, title: "Admin Dashboard" },
    { match: /^\/admin\/reports/i, title: "Reports" },
    { match: /^\/admin\/tasks\/[^/]+/i, title: "Task Details" },
    { match: /^\/admin\/tasks/i, title: "Task Approval" },
    { match: /^\/admin\/feedback/i, title: "Feedback" },
    { match: /^\/admin\/notice/i, title: "Notice Management" },
    { match: /^\/admin\/notification/i, title: "Notifications" },
    { match: /^\/admin\/message/i, title: "Messages" },
    { match: /^\/admin\/support/i, title: "Support Inbox" },
    { match: /^\/admin\/settings/i, title: "Admin Settings" },
    { match: /^\/admin$/i, title: "Admin Dashboard" },
    { match: /^\/student\/lessons/i, title: "Lessons" },
    { match: /^\/student\/tasks/i, title: "Tasks" },
    { match: /^\/student\/attendance/i, title: "Attendance" },
    { match: /^\/student\/account/i, title: "Account" },
    { match: /^\/student\/certificate/i, title: "Certificates" },
    { match: /^\/student\/badges/i, title: "My Badges" },
    { match: /^\/student\/feedback/i, title: "Feedback" },
    { match: /^\/student\/settings/i, title: "Settings" },
    { match: /^\/student\/notification/i, title: "Notifications" },
    { match: /^\/student\/message/i, title: "Messages" },
    { match: /^\/student\/help&support/i, title: "Help & Support" },
    { match: /^\/student\/user-profile\//i, title: "User Profile" },
    { match: /^\/student\/dashboard/i, title: "Student Dashboard" },
    { match: /^\/student$/i, title: "Student Dashboard" },
    { match: /^\/auth\/admin-login/i, title: "Admin Sign In" },
    { match: /^\/auth\/login/i, title: "Sign In" },
    { match: /^\/auth\/signup/i, title: "Create Account" },
    { match: /^\/auth\/forgot-password/i, title: "Forgot Password" },
    { match: /^\/auth\/reset-password/i, title: "Reset Password" },
    { match: /^\/auth\/verify-reset-otp/i, title: "Verify Reset OTP" },
    { match: /^\/auth\/verify-signup-otp/i, title: "Verify Account" },
    { match: /^\/verify-certificate\//i, title: "Verify Certificate" },
    { match: /^\/contact/i, title: "Contact" },
    { match: /^\/learn-more/i, title: "Learn More" },
    { match: /^\/notice/i, title: "Notices" },
    { match: /^\/privacy-policy/i, title: "Privacy Policy" },
    { match: /^\/refund-and-cancellation/i, title: "Refund & Cancellation" },
    { match: /^\/terms-and-conditions/i, title: "Terms & Conditions" },
    { match: /^\/error_status\/unauthorized/i, title: "Unauthorized" },
    { match: /^\/error_status\/account-blocked/i, title: "Account Blocked" },
    { match: /^\/error_status\/session-expired/i, title: "Session Expired" },
    { match: /^\/error_status\/offline/i, title: "Offline" },
    { match: /^\/error_status\/404/i, title: "Page Not Found" },
    { match: /^\/error_status\/429/i, title: "Too Many Requests" },
    { match: /^\/error_status\/500/i, title: "Server Error" },
    { match: /^\/error_status\/503/i, title: "Service Unavailable" },
    { match: /^\/error_status/i, title: "Something Went Wrong" },
];

const DEFAULT_TITLE = "Tech Monster";

function resolveTitle(pathname) {
    if (pathname === "/") return "Home";

    return ROUTE_TITLES.find(({ match }) => match.test(pathname))?.title
        || "Page Not Found";
}

export default function usePageTitle() {
    const pathname = usePathname() || "/";

    useEffect(() => {
        const title = resolveTitle(pathname);
        const expectedTitle = `${title} | ${DEFAULT_TITLE}`;

        const enforceTitle = () => {
            if (document.title !== expectedTitle) {
                document.title = expectedTitle;
            }
        };

        // Set immediately when the route changes.
        enforceTitle();

        // Next.js may update or replace the title element after navigation.
        // Observe the entire head, not only the current title element.
        const observer = new MutationObserver(enforceTitle);

        if (document.head) {
            observer.observe(document.head, {
                childList: true,
                characterData: true,
                subtree: true,
            });
        }

        return () => observer.disconnect();
    }, [pathname]);
}
