import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './SettingsSection.css';
import { toast } from 'react-toastify';
import Warning from '../../../../../components/ui/Warning';
import api from '../../../../../services/api/axios';
import { API } from '../../../../../services/api/endpoints';

export default function SettingsSection() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkModeGlow, setDarkModeGlow] = useState(true);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    toast.success('Password updated successfully!');
    setPasswords({ oldPassword: '', newPassword: '' });
  };

  const handleDeleteAccount = () => {
    setShowDeleteWarning(true);
  };

  const handleCancelDelete = () => {
    if (isDeleting === false) {
      setShowDeleteWarning(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (isDeleting === true) {
      return;
    }

    try {
      setIsDeleting(true);

      await api.delete(API.USER.DELETE_ACCOUNT);

      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("accountDeletionInProgress", "true");
      navigate("/");
    } catch (error) {
      sessionStorage.removeItem("accountDeletionInProgress");
      setIsDeleting(false);
      toast.error(error.response?.data?.message || "Account deletion failed. Please try again.");
    }
  };

  return (
    <>
      <Warning
        open={showDeleteWarning}
        title="Permanently Delete Account?"
        message="This action will permanently delete your student account and all related data from the database. Your data cannot be recovered or restored after deletion."
        confirmText={isDeleting ? "Deleting..." : "Confirm"}
        cancelText="Cancel"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
      {/* Appearance Settings */}
      <motion.div 
        className="settings-section-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3>Appearance & Theme</h3>
        <div className="settings-row">
          <div className="setting-info">
            <label>Neon Glow Accent</label>
            <p>Enhance futuristic dashboard borders and shadows</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={darkModeGlow} onChange={() => setDarkModeGlow(!darkModeGlow)} />
            <span className="slider"></span>
          </label>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div 
        className="settings-section-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3>Notifications</h3>
        <div className="settings-row">
          <div className="setting-info">
            <label>Push & Email Alerts</label>
            <p>Receive updates on task approvals and daily reminders</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
            <span className="slider"></span>
          </label>
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div 
        className="settings-section-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3>Security (Change Password)</h3>
        <form className="settings-form" onSubmit={handlePasswordChange}>
          <div className="settings-input-group">
            <label>Current Password</label>
            <input 
              type="password" 
              required 
              value={passwords.oldPassword} 
              onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} 
            />
          </div>
          <div className="settings-input-group">
            <label>New Password</label>
            <input 
              type="password" 
              required 
              value={passwords.newPassword} 
              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
            />
          </div>
          <button type="submit" className="settings-btn">Update Password</button>
        </form>
      </motion.div>

      {/* Danger Zone: Account Deletion */}
      <motion.div 
        className="settings-section-card danger-zone"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h3>Danger Zone</h3>
        <div className="settings-row">
          <div className="setting-info">
            <label>Delete Account</label>
            <p>Permanently remove your account and all data from database and logout</p>
          </div>
          <button className="delete-btn" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </motion.div>
    </>
  );
}