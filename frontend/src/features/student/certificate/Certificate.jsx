import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import './Certificate.css';

import CertificateView from './components/CertificateView';
import Congratulations from './components/Congratulations';

import useAttendanceData from '../attendance/hooks/useAttendanceData';




export default function Certificate() {

  const navigate = useNavigate();
  const location = useLocation();

  const {dashboard} = useAttendanceData();
  const user = dashboard?.user;
  const rawUserName = user?.username;
  const userName = rawUserName ? rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1) : "Username";

  const courseType = location.state?.courseTitle || 'Certificate Program';

  const programId = location.state?.programId || null;
  const programType = location.state?.programType || 'internship';

  // Route guard: the certificate is only accessible once ALL internship
  // tasks have been approved. Otherwise redirect to the tasks page.
  useEffect(() => {
    const readAllCompleted = () => {
      try {
        return localStorage.getItem('all_tasks_completed') === 'true';
      } catch {
        return false;
      }
    };

    if (!readAllCompleted()) {
      toast.warning(`Complete all ${courseType} tasks to unlock your certificate!`);
      navigate('/student/tasks', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="certificate-page-wrapper">

      <Congratulations
        courseType={courseType}
        userName={userName}
      />

      <CertificateView
        courseType={courseType}
        userName={userName}
        programId={programId}
        programType={programType}
      />
    </div>
  );
}
