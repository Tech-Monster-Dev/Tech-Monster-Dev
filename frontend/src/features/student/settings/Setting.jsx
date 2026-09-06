import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SettingsSection from '../../dashboard/common/Setting/SettingsSection';
import './Setting.css';

export default function Setting() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#messages") {
      requestAnimationFrame(() => {
        document.getElementById("messages")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    }
  }, [location.hash]);

  return (
    <div className="settings-page-wrapper">
      <SettingsSection />
    </div>
  );
}