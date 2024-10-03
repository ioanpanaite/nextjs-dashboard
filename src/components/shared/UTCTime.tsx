import React, { useEffect, useState } from "react";

function UTCTime() {
  const [time, setTime] = useState<string>();

  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date()
      const utcTime = date.toUTCString()
      const timeFinal = utcTime.split(' ').slice(-2, -1).toString()
      setTime(timeFinal);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div className=" min-w-[60px]">{time}</div>;
}

export default UTCTime;
