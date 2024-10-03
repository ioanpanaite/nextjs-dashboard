import React, { memo } from "react";
import telegramSvg from "@/public/svg/telegram.svg";
import Image from "next/image";
import LocalTime from "../shared/LocalTime";
import UTCTime from "../shared/UTCTime";
import RSSFeed from "../shared/RSSFeed";
import { useSession } from "next-auth/react";

function Footer() {
  const { data: session } = useSession();

  return (
    <footer className="border-t border-gray-regular flex justify-between items-center gap-13 px-7 py-2">
      <div className="max-md:hidden">
      <a href="https://t.me/ForfliesGOLD" className="max-sm:hidden flex items-center gap-7" target="_blank" rel="noreferrer" >
          <div className="block w-[25px]">
            <Image alt="Telegram icon" src={telegramSvg} className="w-full" />
          </div>
          <span className="text-sm font-medium text-gray-light whitespace-nowrap">
            Join Forflies Gold
          </span>
        </a>
        <div className="flex gap-7 mt-2 text-sm font-medium whitespace-nowrap">
          <div className="text-gray-light">UTC&nbsp;&nbsp; time:</div>
          <div>
            <UTCTime />
          </div>
        </div>
        <div className="flex gap-7 text-sm font-medium whitespace-nowrap">
          <div className="text-gray-light">Local time:</div>
          <div className="text-gray-light">
            <LocalTime />
          </div>
        </div>
      </div>
      <div className="grow">
        {session && <RSSFeed />}
      </div>
    </footer>
  );
}

export default memo(Footer);
