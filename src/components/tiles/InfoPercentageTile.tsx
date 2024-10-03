import classNames from "classnames";
import React, { memo, useMemo } from "react";

function InfoPercentageTile({
  title,
  value,
}: {
  title: string;
  value: number | undefined;
}) {
  const valueFormatted = useMemo(() => {
    if (value === undefined) return;
    return value.toFixed(2);
  }, [value]);

  return (
    <div className="p-6 pb-7 flex flex-col items-center justify-between">
      <div className="text-xs md:text-base font-medium mb-5 text-center">
        {title}
      </div>
      {value !== undefined && (
        <div
          className={classNames(
            "font-semibold text-xl sm:text-2xl",
            value < 0 ? "text-orange" : "text-green"
          )}
        >
          {valueFormatted}%
        </div>
      )}
    </div>
  );
}

export default memo(InfoPercentageTile);
