import Image from "next/image";
import React, { ReactNode, useId, useRef } from "react";
import { Tooltip } from "react-tooltip";
import infoSvg from "@/public/svg/info.svg";

function InfoTooltip({ children }: { children: ReactNode }) {
  const tooltipId = useId();

  return (
    <div>
      <div
        className="p-1 cursor-pointer"
        data-tooltip-id={tooltipId}
        data-tooltip-delay-hide={500}
      >
        <Image alt="Info" src={infoSvg} className="w-4" />
      </div>
      <Tooltip id={tooltipId} className="max-w-[95vw] sm:max-w-[400px] z-50 text-sm">
        {children}
      </Tooltip>
    </div>
  );
}

export default InfoTooltip;
