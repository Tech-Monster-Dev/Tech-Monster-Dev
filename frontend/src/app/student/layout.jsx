"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../../shared/hooks/useAuth";
import DashboardLayout from "../../layouts/Dashboard/DashboardLayout";

export default function StudentLayout({ children }) {
    const router = useRouter();
    const { isAuthenticated, user, authInitialized } = useAuth();

    useEffect(() => {
        if (authInitialized === false) return;

        if (isAuthenticated === false) {
            router.replace("/auth/login");
            return;
        }

        if (user?.role && user.role !== "student") {
            router.replace("/error_status/unauthorized");
        }
    }, [authInitialized, isAuthenticated, user, router]);

    if (authInitialized === false || isAuthenticated === false || user?.role !== "student") {
        return null;
    }

    return (
        <DashboardLayout role="student">
            {children}
        </DashboardLayout>
    );
}