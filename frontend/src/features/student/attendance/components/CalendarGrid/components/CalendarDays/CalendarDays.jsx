import "./CalendarDays.css";

import CalendarDayCell from "./components/CalendarDayCell";

export default function CalendarDays({
  days,
  isCurrentMonth,
  today
}) {

  return (
    <div className="days-grid">
      {days.map((item, index) => {
        if (item.type === "empty") {
          return (
            <div
              key={`empty-${index}`}
              className="day-cell empty"
            />
          );
        }

        return (
          <CalendarDayCell
            key={item.day}
            day={item.day}
            activeMilliseconds={item.activeMilliseconds}
            today={isCurrentMonth ? today : null}
            isBeforeAccountCreation={item.isBeforeAccountCreation}
            isAccountCreatedDay={item.isAccountCreatedDay}
            isPresent={item.isPresent}
            isAbsent={item.isAbsent}
            enrollment={item.enrollment}
          />
        );
      })}
    </div>
  );
}