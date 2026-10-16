"use client";

import { useEffect, useState } from "react";
import "./SystemBar.css";

const SystemBar = ({ user = "" }) => {
  const [mounted, setMounted] = useState(false);
  const [dateTime, setDateTime] = useState(null);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setMounted(true);
      setDateTime(new Date());
    }, 0);

    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(timer);
    };
  }, []);

  const formattedDate = dateTime
    ? dateTime.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "--";

  const formattedTime = dateTime
    ? dateTime.toLocaleTimeString("en-IN")
    : "--";

  return (
    <div className="system-bar">
      <div className="hostname">
        HOST : {mounted ? user : ""}-SERVER
      </div>

      <div className="system-status">
        <span className="blink-dot"></span>
        SYSTEM ONLINE
      </div>

      <div className="datetime">
        {formattedDate}
        &nbsp; | &nbsp;
        {formattedTime}
      </div>
    </div>
  );
};

export default SystemBar;
