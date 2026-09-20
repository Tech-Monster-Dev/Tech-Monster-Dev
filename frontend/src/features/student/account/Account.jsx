import "./Account.css";
import { useEffect, useState } from "react";
import useScrollToTop from "../../../shared/hooks/useScrollToTop";
import useAuth from "../../../shared/hooks/useAuth";

import AccountForm from "./components/AccountForm";
import ProfileView from "./components/ProfileView";

import {
  getProfile
} from "../../../services/api/profileService";


import { toast } from "react-toastify";
import Spinner from "../../dashboard/common/LoaderPage/Spinner/Spinner";


export default function Account() {

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { updateUser } = useAuth();

  const handleProfileUpdate = (updatedUser) => {
    setUserData(updatedUser);
    updateUser(updatedUser);
  };

  useScrollToTop(isSubmitted);
  
  // ==============================
  // LOAD PROFILE
  // ==============================
  const loadProfile = async () => {
    try {
      const res = await getProfile();
      const user = res.data.user;
      setUserData({
        ...user,
        profileStats: res.data.stats
      });
      setIsSubmitted(
        user.profileCompleted
      );
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, []);

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <Spinner
        message="Loading your profile..."
        size={60}
      />
    );
  }

  // ==============================
  // PAGE
  // ==============================
  return (
    <div className="account-page-wrapper">

      {isSubmitted ? (
        <ProfileView
          userData={userData}
          onUpdateData={handleProfileUpdate}
          onEdit={() =>
            setIsSubmitted(false)
          }
        />

      ) : (
        <AccountForm
          editData={userData}
          initialEmail={
            userData?.email
          }
          onSubmitForm={(data) => {
            setUserData(data);
            setIsSubmitted(true);
          }}
        />
      )}
    </div>
  );
}