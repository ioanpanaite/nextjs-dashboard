import _ from "lodash";
import React, { memo, useMemo } from "react";
import InfoTooltip from "../shared/InfoTooltip";
import TileHeader from "../shared/TileHeader";
import TileWrapper from "../shared/TileWrapper";
import add from "date-fns/add";
import { isAfter } from "date-fns";
import compareAsc from "date-fns/compareAsc";

type UpcomingEvent = {
  eventTitle: string;
  eventInfo: string;
  eventDate: string;
  eventLink: string;
};

const getUpcomingEvents = (upEvents: any): UpcomingEvent[] => {
  const tomorrow = add(new Date(), { days: 1 });
  return _.chain(upEvents.events).sort((a, b) => {
    const compareA = a.eventDate;
    const compareB = b.eventDate;
    return compareAsc(new Date(compareA), new Date(compareB));
  }).value().filter(({ eventDate }) => {
    return isAfter(new Date(eventDate), tomorrow);
  });
};

function UpcomingEvents(upEvents: any) {

  const upcomingEvents = useMemo(() => getUpcomingEvents(upEvents), []);

  return (
    <TileWrapper>
      <div className="p-6 pb-7 relative flex flex-col">
        <TileHeader>Upcoming Events</TileHeader>
        <div className="mt-9 max-h-[264px] overflow-y-scroll">
          <div className="flex flex-col gap-9">
            {upcomingEvents.map((upcomingEvent, index) => (
              <a
                key={index}
                target="_blank"
                rel="noreferrer"
                href={upcomingEvent.eventLink ?? "#"}
              >
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <div className="text-2xl">{upcomingEvent.eventTitle}</div>
                    {upcomingEvent.eventInfo && (
                      <div>
                        <InfoTooltip>{upcomingEvent.eventInfo}</InfoTooltip>
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    {upcomingEvent.eventDate}{" "}
                    {/* {upcomingEvent.startDisplayTime && (
                      <span className="text-gray-light">
                        {upcomingEvent.startDisplayTime}
                      </span>
                    )}
                    {upcomingEvent.endDisplayDate && (
                      <span> - {upcomingEvent.endDisplayDate}</span>
                    )}{" "}
                    {upcomingEvent.endDisplayTime && (
                      <span className="text-gray-light">
                        {upcomingEvent.endDisplayTime}
                      </span>
                    )} */}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </TileWrapper>
  );
}

export default memo(UpcomingEvents);
