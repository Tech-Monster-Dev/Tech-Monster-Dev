import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SettingsSection from '../../dashboard/common/Setting/SettingsSection';
import './Setting.css';

export default function Setting() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#messages") {
      requestAnimationFrame(() => {
        document.getElementById("messages")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    }
  }, [pathname]);

  return (
    <div className="settings-page-wrapper">
      <SettingsSection />
    </div>
  );
}
