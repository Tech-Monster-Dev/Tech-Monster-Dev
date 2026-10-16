"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../../shared/hooks/useAuth";
import DashboardLayout from "../../layouts/Dashboard/DashboardLayout";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const { isAuthenticated, user, authInitialized } = useAuth();

    useEffect(() => {
        if (authInitialized === false) return;

        if (!isAuthenticated) {
            router.replace("/auth/admin-login");
            return;
        }

        if (user?.role && user.role !== "admin") {
            router.replace("/error_status/unauthorized");
        }
    }, [authInitialized, isAuthenticated, user, router]);

    if (authInitialized === false || !isAuthenticated || user?.role !== "admin") {
        return null;
    }

    return (
        <DashboardLayout role="admin">
            {children}
        </DashboardLayout>
    );
}
