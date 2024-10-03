import React, { useEffect, useState } from "react";

function LocalTime() {
  const [time, setTime] = useState<string>();

  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date()
      const localTime = date.toLocaleString([], { hour12: false })
      const localTimeHours = localTime.split(' ')[1]
      setTime(localTimeHours);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div className=" min-w-[60px]">{time}</div>;
}

export default LocalTime;
