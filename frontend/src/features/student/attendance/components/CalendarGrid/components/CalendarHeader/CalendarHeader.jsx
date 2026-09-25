import "./CalendarHeader.css";

export default function CalendarHeader({
  visibleYear,
  visibleMonth,
  getMonthLabel,
  goPreviousMonth,
  goNextMonth,
  presentCount,
  absentCount,
  accountCreationDate,
  accountCreatedLabel
}) {
  const monthLabel = getMonthLabel(
    visibleYear,
    visibleMonth
  );

  return (
    <div className="calendar-top-section">
      <div className="attendance-legend">
        <div title="Present">
          <span className="legend-dot present-dot" />
          <span className="legend-label">Present</span>
        </div>

        <div title="Absent">
          <span className="legend-dot absent-dot" />
          <span className="legend-label">Absent</span>
        </div>

        <div title="Enrolled">
          <span className="legend-dot enrollment-dot" />
          <span className="legend-label">Enrolled</span>
        </div>

        <div title="Account Created">
          <span className="legend-dot account-dot" />
          <span className="legend-label">Account Created</span>
        </div>

        <div title="Before Account">
          <span className="legend-dot muted-dot" />
          <span className="legend-label">Before Account</span>
        </div>
      </div>

      <div className="month-navigation">
        <button
          type="button"
          className="month-nav-button"
          onClick={goPreviousMonth}
          aria-label="Previous month"
        >
          ‹
        </button>

        <h2>{monthLabel}</h2>

        <button
          type="button"
          className="month-nav-button"
          onClick={goNextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="month-summary">
        <h3>
          {monthLabel}{" "}
          Summary
        </h3>

        <div className="month-summary-values">
          <div>
            <span>Present</span>
            <strong className="summary-present">
              {presentCount}
            </strong>
          </div>

          <div>
            <span>Absent</span>
            <strong className="summary-absent">
              {absentCount}
            </strong>
          </div>

          <div>
            <span>Total Days</span>
            <strong>
              {presentCount + absentCount}
            </strong>
          </div>
        </div>

        {accountCreationDate && (
          <small>
            Tracking from{" "}
            {accountCreatedLabel}
          </small>
        )}
      </div>
    </div>
  );
}