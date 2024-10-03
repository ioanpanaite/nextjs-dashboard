import classNames from "classnames";
import React, { ReactNode } from "react";

function TileWrapper({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={classNames("h-full bg-lightGray rounded-[4px]", className)}>
      {children}
    </div>
  );
}

export default TileWrapper;
