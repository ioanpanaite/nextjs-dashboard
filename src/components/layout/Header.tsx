import Image from "next/image";
import React, { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import logo from "@/public/logo.png";
import youtubeSvg from "@/public/svg/youtube.svg";
import twitterSvg from "@/public/svg/twitter.svg";
import instagramSvg from "@/public/svg/instagram.svg";
import chevronSvg from "@/public/svg/chevron.svg";
import { UIContext } from '@/components/context/UIContextProvider';
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { IAdvertisement } from '@/constants/database';

const socialMedia = [
  {
    name: "Youtube",
    logo: youtubeSvg,
    href: "https://www.youtube.com/forflies",
  },
  {
    name: "Instagram",
    logo: instagramSvg,
    href: "https://bit.ly/instagram_samiloyal_",
  },
  {
    name: "Twitter",
    logo: twitterSvg,
    href: "https://bit.ly/twitterSamiloyal_",
  },
];

function Header({
  isMenuOpen,
  onMenuToggle,
}: {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}) {

  const [isShow, setShow] = useState(false);
  const { data: session } = useSession();
  const logoRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const { navData, loading } = useContext(UIContext);

  const slidesCount = 4;
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slides: {
      perView: 1,
    },
    breakpoints: {
      "(min-width: 460px)": {
        loop: slidesCount > 1,
        slides: { perView: 1 },
      },
      "(min-width: 1024px)": {
        loop: slidesCount > 2,
        slides: { perView: 2 },
      },
      "(min-width: 1280px)": {
        loop: slidesCount > 3,
        slides: { perView: 3 },
      },
      "(min-width: 1440px)": {
        loop: slidesCount > 4,
        slides: { perView: 4 },
      },
    },
  });
  const [slides, setSlides] = useState<IAdvertisement[] | undefined>([])

  const handleLogo = (e: any) => {
    if (session && !isShow) setShow(true)
    if (!logoRef.current?.contains(e.target) && !controlRef.current?.contains(e.target)) {
      setShow(false)
    }
  }

  const directLogo = (e: any) => {
    window.location.href = "/"
  }

  const handleSignout = () => {
    signOut();
  }

  useEffect(() => {
    document.addEventListener("click", handleLogo, true)
    return () => {
      document.removeEventListener("click", handleLogo, true)
    }
  }, [])


  useEffect(() => {
    setSlides(navData.advertise);
  }, [navData])


  const handlePrevSlide = useCallback(() => {
    instanceRef.current?.prev();
  }, [instanceRef]);

  const handleNextSlide = useCallback(() => {
    instanceRef.current?.next();
  }, [instanceRef]);

  return (
    <header className="md:mr-1.5 border-b-2 border-gray-lightest grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[0.25fr_0.75fr] items-strech">
      <div className="grid grid-cols-[auto_auto_1fr] max-sm:border-b sm:border-r border-gray-regular">
        <div className="min-w-[69px] sm:min-w-[86px] py-4.5 sm:py-6 flex justify-center items-center bg-gray-dark/10 border-r border-gray-regular">
          <div ref={logoRef}>
            <Image alt="Logo" src={logo} className="w-[33px] sm:w-[38px]" onClick={directLogo} />
            {
              session &&
              <div className="absolute top-15 left-8" onClick={handleLogo}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-light">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            }
          </div>
          {
            isShow &&
            <div ref={controlRef} className="absolute left-2 top-[90px] rounded text-white border-rounded border-gray-light border drop-shadow-xl hover:drop-shadow-2xl bg-black z-10">
              <div className="py-1 border-b border-gray-light px-3">
                <Link href={"/"}>Dashboard</Link>
              </div>
              <div className="py-1 border-b border-gray-light px-3">
                <Link href={"/profile"}>My Profile</Link>
              </div>
              <div onClick={handleSignout} className="cursor-pointer py-1 px-3">Sign Out</div>
            </div>
          }
        </div>
        <div className="px-6 lg:px-4 flex gap-6 lg:gap-2 items-center">
          {socialMedia.map(({ name, logo, href }) => (
            <a key={name} href={href} target="_blank" rel="noreferrer">
              <Image alt={`${name} logo`} src={logo} className="w-[36px]" />
            </a>
          ))}
        </div>
        {/* <div className="px-6 lg:px-4 flex gap-6 lg:gap-2 items-center">{navData ? navData?.site?.site_title : ""}</div> */}
      </div>
      {(!loading && slides && slides?.length > 0) ?
        <div ref={sliderRef} className="keen-slider relative max-sm:h-[92px] max-md:w-[92px]">
          {
            slides?.map((value: any, idx: number) =>
              <div key={value._id} className={`keen-slider__slide number-slide${idx}`}>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={value.link}
                >
                  <div className="h-full pl-6 sm:pr-6 max-sm:mr-14 flex items-center gap-6 lg:border-r border-gray-regular">
                    <div className="relative cursor-pointer">
                      <Image alt="video" src={value.image} width={224} height={126} className="w-28" />
                    </div>
                    <div
                      className="line-clamp-2"
                      title="Subscribe to Forflies Youtube Channel"
                    >
                      {value.title}
                    </div>
                  </div>
                </a>
              </div>)
          }

          <div className="lg:hidden absolute z-30 top-1/2 right-0 -translate-y-1/2 flex">
            <div className="p-2 pr-0.5 cursor-pointer" onClick={handlePrevSlide}>
              <Image alt="Chevron left" src={chevronSvg} className="rotate-180" />
            </div>
            <div className="p-2 pl-0.5 cursor-pointer" onClick={handleNextSlide}>
              <Image alt="Chevron right" src={chevronSvg} />
            </div>
          </div>
        </div>
        :
        null
      }
    </header>
  );
}

export default memo(Header);
