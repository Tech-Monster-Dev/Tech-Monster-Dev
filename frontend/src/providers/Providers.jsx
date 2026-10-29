"use client";


import { AuthProvider } from "./Auth/AuthProvider.jsx";
import NotificationProvider from "./Notification/NotificationProvider.jsx";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary.jsx";
import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";

const ToastContainer = dynamic(
  () => import("react-toastify").then((module) => module.ToastContainer),
  { ssr: false }
);

export default function Providers({ children }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          {children}
          <ToastContainer
            position="bottom-left"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            pauseOnHover
            draggable
            theme="dark"
          />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
