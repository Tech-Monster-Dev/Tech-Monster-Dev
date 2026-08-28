import "./CalendarHeader.css";
export default function CalendarHeader({
  monthName
}) {
  return (
    <div className="calendar-header">
      <h3>{monthName}</h3>
    </div>
  );
}
