import { useEffect, useState } from "react";
import "./SystemBar.css";

const SystemBar = ({user = "DEB"}) => {

  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  return (
    <div className="system-bar">

      {/* Left Side */}
      <div className="hostname">
        HOST : {user}-SERVER
      </div>


      {/* Center */}
      <div className="system-status">

        <span className="blink-dot"></span>

        SYSTEM ONLINE

      </div>


      {/* Right Side */}
      <div className="datetime">

        {dateTime.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })}

        &nbsp; | &nbsp;

        {dateTime.toLocaleTimeString("en-IN")}

      </div>


    </div>
  );
};


export default SystemBar;