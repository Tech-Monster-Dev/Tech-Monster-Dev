import { Routes, Route } from 'react-router-dom';
// Errors page

import AuthenticationRequired from "../pages/status/AuthenticationRequired";
import Unauthorized from "../pages/status/Unauthorized";
import NotFound from "../pages/status/NotFound";
import TooManyRequests from "../pages/status/TooManyRequests";
import ServerError from "../pages/status/ServerError";
import Maintenance from "../pages/status/Maintenance";
import SessionExpired from "../pages/status/SessionExpired";
import AccountBlocked from "../pages/status/AccountBlocked";
import SomethingWentWrong from "../pages/status/SomethingWentWrong";
import Offline from "../pages/status/Offline";

import Landing from "../pages/landing/Landing";
import LearnMore from "../pages/landing/LearnMore";

import Contact from "../pages/landing/Contact";

import TermsAndConditions from "../components/common/TermsAndConditions";

import Login from '../features/auth/pages/Login';
import Signup from '../features/auth/pages/Signup';
import AdminLogin from '../features/auth/pages/AdminLogin';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ResetPassword from '../features/auth/pages/ResetPassword';


import DashboardLayout from '../layouts/Dashboard';
import ProtectedRoute from './ProtectedRoute';


import VerifySignupOTP from '../features/auth/pages/VerifySignupOTP';
import VerifyResetOTP from '../features/auth/pages/VerifyResetOTP';

// Student Dashboard
import StudentHome from '../features/student/home';
import StudentDashboard from '../features/student/dashboard';
import Lessons from '../features/student/lessons';
import StudentTask from '../features/student/tasks';
import StudentAttendance from '../features/student/attendance';
import StudentBadges from '../features/student/badges';
import StudentAccount from '../features/student/account';
import StudentCertificate from '../features/student/certificate';
import StudentSetting from '../features/student/settings';

import StudentProfile from '../features/profile/StudentProfile';



import Notification from '../features/dashboard/common/Notification';
import Message from '../features/messaging/Message';
import HelpSupport from '../features/dashboard/common/HelpSupport';

// Admin Dashboard
import Overview from '../features/admin/overview';
import Students from '../features/admin/students';
import StudentDetails from "../features/admin/students/StudentDetails";
import Reports from '../features/admin/reports';
import Internships from '../features/admin/internships';
import Course from '../features/admin/courses';
import CourseForm from '../features/admin/courses/components/CoursesForm';
import TaskApproval from '../features/admin/tasks';
import TaskApprovalDetails from "../features/admin/tasks/TaskApprovalDetails";
import CertificateApproval from '../features/admin/certificates';
import InternshipsForm from '../features/admin/internships/components/InternshipsForm';






function AppRoutes() {
    return (
        <>
            <Routes>

                {/* Public Routes */}
                <Route path='/' element={<Landing />} />
                <Route path='/learn-more' element={<LearnMore />} />
                <Route path='/contact' element={<Contact />} />

                <Route path='/login' element={<Login />} />
                <Route path='/admin_login' element={<AdminLogin />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path="/verify-signup-otp" element={<VerifySignupOTP />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />


                {/* Status Pages */}
                <Route path="/auth-required" element={<AuthenticationRequired />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="/429" element={<TooManyRequests />} />
                <Route path="/500" element={<ServerError />} />
                <Route path="/503" element={<Maintenance />} />
                <Route path="/session-expired" element={<SessionExpired />} />
                <Route path="/account-blocked" element={<AccountBlocked />} />
                <Route path="/something-went-wrong" element={<SomethingWentWrong />} />
                <Route path="/offline" element={<Offline />} />



                {/* Student Dashboard Routes (Protected) */}
                <Route
                    path="/student"
                    element={
                        <ProtectedRoute role="student">
                            <DashboardLayout role="student" />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<StudentHome />} />

                    <Route
                        path="dashboard"
                        element={<StudentDashboard />}
                    />

                    {/* Lessons Routes */}
                    <Route
                        path="lessons"
                        element={<Lessons />}
                    />

                    <Route
                        path="lessons/:type/:slug"
                        element={<Lessons />}
                    />

                    <Route path="tasks" element={<StudentTask />} />
                    <Route
                        path="tasks/:type/:slug"
                        element={<StudentTask />}
                    />
                    <Route path="attendance" element={<StudentAttendance />} />
                    <Route path="badges" element={<StudentBadges />} />
                    <Route path="account" element={<StudentAccount />} />
                    <Route
                        path="user-profile/:userId"
                        element={<StudentProfile />}
                    />
                    <Route
                        path="certificate"
                        element={<StudentCertificate />}
                    />
                    <Route
                        path="settings"
                        element={<StudentSetting />}
                    />
                    <Route
                        path="notification"
                        element={<Notification />}
                    />
                    <Route
                        path="message"
                        element={<Message />}
                    />
                    <Route
                        path="help&support"
                        element={<HelpSupport />}
                    />
                </Route>



                {/* Admin Dashboard Routes (Protected) */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <DashboardLayout role="admin" />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Overview />} />
                    <Route path='students' element={<Students />} />
                    <Route path="students/:id" element={<StudentDetails />} />
                    <Route path='internships' element={<Internships />} />
                    <Route path='internships-form' element={<InternshipsForm />} />

                    <Route path='courses' element={<Course />} />
                    <Route path='course-form' element={<CourseForm />} />

                    <Route path='tasks' element={<TaskApproval />} />
                    <Route
                        path="tasks/:id"
                        element={<TaskApprovalDetails />}
                    />
                    <Route path='reports' element={<Reports />} />
                    <Route path='certificates' element={<CertificateApproval />} />
                    <Route path='settings' element={<StudentSetting />} />
                    <Route
                        path="notification"
                        element={<Notification />}
                    />
                    <Route
                        path="message"
                        element={<Message />}
                    />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<NotFound />} />

            </Routes>
        </>
    )
}

export default AppRoutes;
