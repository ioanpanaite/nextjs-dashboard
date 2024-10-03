import React, { ReactNode } from "react";
import InfoTooltip from "./InfoTooltip";

function TileHeader({
  infoTooltipContent,
  children,
}: {
  infoTooltipContent?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <div className="grow text-base md:text-lg text-gray-light">
        {children}
      </div>
      {infoTooltipContent && <InfoTooltip>{infoTooltipContent}</InfoTooltip>}
    </div>
  );
}

export default TileHeader;
