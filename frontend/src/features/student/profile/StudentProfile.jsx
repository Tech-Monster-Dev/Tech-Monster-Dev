import "./StudentProfile.css";
import {
  useCallback,
  useEffect,
  useState
} from "react";

import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../../../services/socket/socket";

import ProfileHeader from "./components/ProfileHeader";
import ProfileActions from "./components/ProfileActions";
import ProfileCards from "./components/ProfileCards";
import ProfileSkeleton from "./components/ProfileSkeleton";

import useSkeletonScrollLock from "../../../shared/hooks/useSkeletonScrollLock";

import { tokenStorage } from "../../../services/auth/tokenStorage";
import {getUserProfile} from "../../../services/api/profileService";
import {followUser, unfollowUser} from "../../../services/api/follow.service";

export default function StudentProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const loginUser = tokenStorage.getUser();
  const isOwnProfile = String(loginUser?._id || loginUser?.id || "") === String(userId);

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
  // REALTIME FOLLOW COUNT UPDATE
  // =================================
  useEffect(() => {
    const handleFollowUpdate = (payload) => {
      if (payload == null) return;
      const followerId = payload.followerId;
      const followingId = payload.followingId;

      if (
        String(followerId) !== String(userId) &&
        String(followingId) !== String(userId)
      ) {
        return;
      }
      fetchProfile();
    };
    socket.on("chatUsersUpdated", handleFollowUpdate);

    return () => {
      socket.off("chatUsersUpdated", handleFollowUpdate);
    };
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

  const handleMessage = () => {
    if (!userId) {
      return;
    }

    navigate("/student/message", {
      state: {
        notificationUserId: String(userId)
      }
    });
  };

  useSkeletonScrollLock(loading);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="student-profile-container">
        <p className="student-profile-empty">
          User profile not found.
        </p>
      </div>
    );
  }

  return (
    <div className="student-profile-container">
      <ProfileHeader
        user={user}
        latestBadge={badges?.[0]?.badge || null}
        followersCount={followersCount}
        followingCount={followingCount}
      />

      {!isOwnProfile && (
        <ProfileActions
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
          onMessage={handleMessage}
          actionLoading={actionLoading}
        />
      )}

      <ProfileCards
        internships={internships}
        courses={courses}
        badges={badges}
        certificates={certificates}
      />
    </div>
  );
}