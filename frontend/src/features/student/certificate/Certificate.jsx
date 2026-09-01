import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CertificateView from './components/CertificateView';
import './Certificate.css';

export default function Certificate() {
  const [courseType] = useState('Full Stack Web Development (React & Node)');
  const [userName] = useState('Debabrata');
  const navigate = useNavigate();
  const location = useLocation();

  const programId = location.state?.programId || null;
  const programType = location.state?.programType || 'internship';

  console.log("=== CERTIFICATE ROUTE DEBUG ===");
  console.log("location.state:", location.state);
  console.log("programId:", programId);
  console.log("programType:", programType);

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
      toast.warning('Complete all internship tasks to unlock your certificate!');
      navigate('/student/tasks', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="certificate-page-wrapper">
      <h2 className="certificate-main-title">Certificate</h2>
      <CertificateView
        courseType={courseType}
        userName={userName}
        programId={programId}
        programType={programType}
      />
    </div>
  );
}
