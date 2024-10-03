import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";

function RSSFeed() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const runningTextRef = useRef<HTMLDivElement>(null);
  const [feed, setFeed] = useState([]);
  const [runningFeedSeconds, setRunningFeedSeconds] = useState(0);

  useEffect(() => {
    axios.get("/api/rss").then(({ data }) => {
      setFeed(data)
    }).catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (feed.length) {
      if (
        runningTextRef.current?.offsetWidth &&
        wrapperRef.current?.offsetWidth
      ) {
        const seconds =
          (isMobile ? 10 : 20) *
          Math.round(
            runningTextRef.current?.offsetWidth /
              wrapperRef.current?.offsetWidth
          );

        setRunningFeedSeconds(seconds);
      }
    }
  }, [feed]);

  return (
    <div
      ref={wrapperRef}
      className="h-8 text-sm font-medium text-blue relative overflow-hidden"
    >
      <div className="translate-x-full h-full">
        <div
          ref={runningTextRef}
          className="absolute pr-[105%] ff-running-text h-full whitespace-nowrap flex items-center justify-stretch gap-12 overflow-hidden"
          style={{
            animationDuration: `${runningFeedSeconds}s`,
            animationDelay: isMobile ? "-20s" : "0s",
          }}
        >
          {feed.map(({ title, link }, idx) => (
            <div key={idx} className="text-center">
              <a href={link} target="_blank" rel="noreferrer">
                {title}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="fx-bg-gradient-black w-24 absolute top-0 bottom-0 right-0"></div>
    </div>
  );
}

export default RSSFeed;
