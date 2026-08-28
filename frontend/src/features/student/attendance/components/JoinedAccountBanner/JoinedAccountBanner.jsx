import "./JoinedAccountBanner.css";
export default function JoinedAccountBanner({
  dateLabel,
  timeLabel
}) {
  return (
    <div className="joined-account-banner">
      <div className="joined-account-emoji">
        🚀
      </div>

      <div className="joined-account-content">
        <strong>
          Your Tech Monster journey started here
        </strong>

        <span>
          Joined {dateLabel} · {timeLabel}
        </span>
      </div>
    </div>
  );
}
