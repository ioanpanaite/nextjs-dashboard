import { formatCurrency } from "@/lib/utils";
import React, { memo, useEffect, useMemo, useState } from "react";

function InfoTile({
  title,
  value,
  isCurrency = false,
}: {
  title: string;
  value: number | undefined;
  isCurrency?: boolean;
}) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  const formattedValue = useMemo(() => {
    if (!value) return;
    return isCurrency ? formatCurrency(value, 2, true) : `${value.toFixed(2)}%`;
  }, [value, isCurrency]);

  return (
    <div className="p-6 pb-7 flex flex-col items-center justify-between">
      <div className="text-xs md:text-base font-medium mb-5 text-center">
        {title}
      </div>
      <div className="font-semibold text-xl md:text-2xl">
        {isClient && formattedValue}
      </div>
    </div>
  );
}

export default memo(InfoTile);
