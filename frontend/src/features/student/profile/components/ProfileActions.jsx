import DashButton from "../../../../components/ui/Button/DashButton";

export default function ProfileActions({
  isFollowing,
  onFollowToggle,
  onMessage,
  actionLoading
}) {
  return (
    <div className="student-profile-actions">
      <DashButton
        onClick={onFollowToggle}
        disabled={actionLoading}
        loading={actionLoading}
        loadingText="Please wait..."
        variant={isFollowing ? "secondary" : "primary"}
        size="medium"
      >
        {isFollowing ? "Following" : "+ Follow"}
      </DashButton>

      {isFollowing && (
        <DashButton
          onClick={onMessage}
          disabled={actionLoading}
          variant="outline"
          size="medium"
        >
          Message
        </DashButton>
      )}
    </div>
  );
}