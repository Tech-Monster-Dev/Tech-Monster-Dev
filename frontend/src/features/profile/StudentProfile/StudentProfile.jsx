import {
  useCallback,
  useEffect,
  useState
} from "react";
import { useParams } from "react-router-dom";

import ProfileHeader from "../../student/profile/ProfileHeader";
import ProfileActions from "../../student/profile/ProfileActions";
import ProfileCards from "../../student/profile/ProfileCards";
import ProfileSkeleton from "../../student/profile/ProfileSkeleton";
import useSkeletonScrollLock from "../../../shared/hooks/useSkeletonScrollLock";

import {
  getUserProfile
} from "../../../services/api/profileService";

import {
  followUser,
  unfollowUser
} from "../../../services/api/follow.service";

import "./StudentProfile.css";

export default function StudentProfile() {

  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [internships, setInternships] = useState([]);
  const [courses, setCourses] = useState([]);
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // =================================
  // FETCH USER PROFILE
  // =================================


  const fetchProfile = useCallback(async () => {

    try {

      const response = await getUserProfile(userId);
      const data = response.data;

      setUser(data.user);
      setIsFollowing(!!data.isFollowing);

      setFollowersCount(data.followersCount ?? 0);
      setFollowingCount(data.followingCount ?? 0);

      setInternships(data.internships || []);
      setCourses(data.courses || []);
      setBadges(data.badges || []);
      setCertificates(data.certificates || []);

    } catch (error) {

      console.error(
        "Failed to fetch user profile:",
        error
      );

    } finally {

      setLoading(false);

    }
  }, [userId]);

  useEffect(() => {

    if (!userId) return;

    queueMicrotask(() => {
      setLoading(true);
      fetchProfile();
    });

  }, [fetchProfile, userId]);

  // =================================
  // FOLLOW / UNFOLLOW
  // =================================

  const handleFollowToggle = async () => {

    if (!userId || actionLoading) {
      return;
    }

    setActionLoading(true);

    try {

      if (isFollowing) {

        await unfollowUser(userId);

      } else {

        await followUser(userId);

      }

      // MongoDB ru latest data ana
      await fetchProfile();

    } catch (error) {

      console.error(
        "Follow action failed:",
        error
      );

    } finally {

      setActionLoading(false);

    }
  };

  useSkeletonScrollLock(loading);

  if (loading) {

    return <ProfileSkeleton />;

  }

  if (!user) {

    return (
      <div className="profile-container">
        <p className="empty-text">
          User profile not found.
        </p>
      </div>
    );

  }

  return (

    <div className="profile-container">

      <ProfileHeader
        user={user}
        followersCount={followersCount}
        followingCount={followingCount}
      />

      <ProfileActions
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
        actionLoading={actionLoading}
      />

      <ProfileCards
        internships={internships}
        courses={courses}
        badges={badges}
        certificates={certificates}
      />

    </div>
  );
}
