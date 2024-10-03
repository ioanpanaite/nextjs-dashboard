import classNames from "classnames";
import React, { memo, ReactNode, useCallback, useEffect, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";

function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  return (
    <div
      className={classNames(
        "overflow-hidden min-h-screen md:h-screen flex flex-col justify-center"
      )}
    >
      <Header isMenuOpen={isMenuOpen} onMenuToggle={handleMenuToggle} />
      <main className="grow md:overflow-y-scroll">{children}</main>
      <Footer />
      {isMenuOpen && (
        <div className="pr-1.5 absolute inset-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[0.25fr_0.75fr]">
          <div className="bg-black sm:border-r sm:border-gray-regular"></div>
          <div className="max-sm:hidden ff-menu-backdrop"></div>
        </div>
      )}
    </div>
  );
}

export default memo(Layout);
