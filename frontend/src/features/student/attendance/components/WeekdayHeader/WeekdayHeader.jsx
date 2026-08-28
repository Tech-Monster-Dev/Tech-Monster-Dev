import "./WeekdayHeader.css";
const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat"
];

export default function WeekdayHeader() {
  return (
    <div className="weekdays-grid">
      {WEEKDAYS.map(day => (
        <div key={day}>{day}</div>
      ))}
    </div>
  );
}
