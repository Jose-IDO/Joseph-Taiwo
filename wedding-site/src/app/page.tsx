"use client";

import { useEffect, useRef, useState } from "react";
import { Cormorant_Garamond, Dancing_Script } from "next/font/google";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const WEDDING_DATE = new Date("2026-12-12T15:00:00+02:00").getTime();

function getTimeLeft() {
  const difference = WEDDING_DATE - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function CountdownTimer({ compact = false }: { compact?: boolean }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setTimeLeft(getTimeLeft());

    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className={
        compact
          ? "grid grid-cols-4 gap-3 rounded-full border border-[#c9a76b]/20 bg-[#fff8ed]/80 px-6 py-4 shadow-[0_22px_80px_rgba(36,59,90,0.13)] backdrop-blur-md"
          : "mt-12 grid grid-cols-4 gap-3 rounded-full border border-[#c9a76b]/30 bg-[#f8efe2]/65 px-5 py-4 shadow-[0_24px_90px_rgba(36,59,90,0.13)] backdrop-blur md:gap-8 md:px-10"
      }
    >
      <TimeBlock value={timeLeft.days} label="Days" compact={compact} />
      <TimeBlock value={timeLeft.hours} label="Hours" compact={compact} />
      <TimeBlock value={timeLeft.minutes} label="Mins" compact={compact} />
      <TimeBlock value={timeLeft.seconds} label="Secs" compact={compact} />
    </div>
  );
}

function TimeBlock({
  value,
  label,
  compact = false,
}: {
  value: number;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className="flex min-w-10 flex-col items-center text-[#243b5a]">
      <span
        className={`${cormorant.className} ${
          compact ? "text-xl md:text-2xl" : "text-3xl md:text-5xl"
        } font-medium leading-none`}
      >
        {value.toString().padStart(2, "0")}
      </span>

      <span
        className={
          compact
            ? "mt-2 text-[8px] uppercase tracking-[0.2em] text-[#7b6f64]"
            : "mt-2 text-[10px] uppercase tracking-[0.28em] text-[#6f7f96]"
        }
      >
        {label}
      </span>
    </div>
  );
}

function FloatingDust() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 22 }).map((_, index) => (
        <span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-[#c9a76b]/40 shadow-[0_0_16px_rgba(201,167,107,0.45)] animate-dust"
          style={{
            left: `${8 + ((index * 17) % 86)}%`,
            top: `${10 + ((index * 23) % 78)}%`,
            animationDelay: `${index * 0.8}s`,
            animationDuration: `${7 + (index % 5)}s`,
          }}
        />
      ))}
    </div>
  );
}

function BotanicalLine({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute opacity-35 ${className}`}>
      <svg
        width="190"
        height="260"
        viewBox="0 0 190 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#d8b77e]"
      >
        <path d="M91 244C93 184 82 123 42 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M72 194C47 187 33 169 20 147C47 153 65 168 72 194Z" stroke="currentColor" strokeWidth="2" />
        <path d="M78 160C49 145 38 121 31 94C60 108 76 130 78 160Z" stroke="currentColor" strokeWidth="2" />
        <path d="M63 116C41 101 31 80 27 56C52 68 64 88 63 116Z" stroke="currentColor" strokeWidth="2" />
        <path d="M93 204C123 191 141 168 154 138C122 145 101 168 93 204Z" stroke="currentColor" strokeWidth="2" />
        <path d="M88 169C119 151 133 124 140 94C108 111 91 136 88 169Z" stroke="currentColor" strokeWidth="2" />
        <path d="M73 125C101 103 111 76 112 47C86 67 74 93 73 125Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}

function Polaroid({
  id,
  className,
  rotate,
  tapePosition = "top",
  hoveredFrame,
  setHoveredFrame,
}: {
  id: string;
  className?: string;
  rotate: number;
  tapePosition?: "top" | "bottom";
  hoveredFrame: string | null;
  setHoveredFrame: (id: string | null) => void;
}) {
  const isHovered = hoveredFrame === id;
  const isAnotherHovered = hoveredFrame !== null && !isHovered;

  return (
    <motion.div
      onMouseEnter={() => setHoveredFrame(id)}
      onMouseLeave={() => setHoveredFrame(null)}
      animate={{
        scale: isHovered ? 1.55 : 1,
        rotate: isHovered ? 0 : rotate,
        opacity: isAnotherHovered ? 0.65 : 1,
        zIndex:
          isHovered ? 120 : id === "journey" ? 70 : id === "thus" ? 50 : 40,
      }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className={`absolute h-[295px] w-[240px] cursor-pointer bg-white p-3 pb-14 shadow-[0_24px_50px_rgba(36,59,90,0.16)] ${
        isHovered ? "shadow-[0_45px_120px_rgba(36,59,90,0.35)]" : ""
      } ${className}`}
    >
      <div className="h-full w-full rounded-[2px] bg-gradient-to-br from-[#c8c8c8] via-[#dddddd] to-[#f1f1f1]" />

      <div
        className={`absolute left-1/2 h-8 w-20 -translate-x-1/2 bg-[#d8c3a5]/70 shadow-sm ${
          tapePosition === "top" ? "-top-3" : "-bottom-3"
        }`}
      />
    </motion.div>
  );
}

function PolaroidFrames({
  hoveredFrame,
  setHoveredFrame,
}: {
  hoveredFrame: string | null;
  setHoveredFrame: (id: string | null) => void;
}) {
  return (
    <div className="relative h-[650px] w-[760px] max-w-[92vw]">
      <BotanicalLine className="-left-20 top-28 -rotate-[18deg]" />
      <BotanicalLine className="-right-28 top-48 rotate-[34deg]" />

      <Polaroid
        id="our"
        className="left-[95px] top-[45px]"
        rotate={-4}
        hoveredFrame={hoveredFrame}
        setHoveredFrame={setHoveredFrame}
      />

      <Polaroid
        id="journey"
        className="right-[95px] top-[80px]"
        rotate={7}
        hoveredFrame={hoveredFrame}
        setHoveredFrame={setHoveredFrame}
      />

      <Polaroid
        id="thus"
        className="left-[95px] bottom-[0px]"
        rotate={4}
        hoveredFrame={hoveredFrame}
        setHoveredFrame={setHoveredFrame}
      />

      <Polaroid
        id="far"
        className="right-[110px] bottom-[-20px]"
        rotate={-3}
        tapePosition="bottom"
        hoveredFrame={hoveredFrame}
        setHoveredFrame={setHoveredFrame}
      />
    </div>
  );
}

function ImageCarousel() {
  const items = Array.from({ length: 6 });

  return (
    <div className="h-full w-[100dvw] overflow-hidden">
      <motion.div
        className="flex h-full w-max gap-0"
        animate={{ x: ["0vw", "-100vw"] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...items, ...items].map((_, index) => (
          <div
            key={index}
            className="h-full w-[calc(100dvw/3)] shrink-0 bg-gradient-to-br from-[#c9c9c9] via-[#dedede] to-[#f2f2f2]"
          />
        ))}
      </motion.div>
    </div>
  );
}

function RSVPButton() {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={{ scale: [1, 1.035, 1] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="absolute h-24 w-80 rounded-full bg-[#c9a76b]/25 blur-2xl" />

      <div className="flex items-center gap-6">
        <span className="h-[2px] w-28 bg-gradient-to-r from-transparent via-[#c9a76b] to-[#c9a76b]" />

        <motion.button
          type="button"
          whileHover={{
            scale: 1.08,
            y: -3,
          }}
          whileTap={{ scale: 0.97 }}
          className="group relative overflow-hidden rounded-full border-2 border-[#c9a76b] bg-[#f8efe2] px-16 py-5 text-base font-black uppercase tracking-[0.42em] text-[#b88a3d] shadow-[0_28px_85px_rgba(36,59,90,0.18)] transition-all duration-300 hover:border-[#d6b06d] hover:shadow-[0_32px_100px_rgba(201,167,107,0.28)]"
        >
          <span
            className="relative z-10 font-black"
            style={{
              textShadow: "0 1px 0 rgba(255,255,255,0.4)",
              fontWeight: 900,
            }}
          >
            RSVP
          </span>

          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/65 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        </motion.button>

        <span className="h-[2px] w-28 bg-gradient-to-l from-transparent via-[#c9a76b] to-[#c9a76b]" />
      </div>
    </motion.div>
  );
}

function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hoveredFrame, setHoveredFrame] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  });

  const introOpacity = useTransform(progress, [0, 0.18], [1, 0]);
  const inviteOpacity = useTransform(progress, [0, 0.18], [1, 0]);
  const dividerOpacity = useTransform(progress, [0, 0.18], [1, 0]);

  const namesY = useTransform(progress, [0, 0.42], [0, -165]);
  const namesScale = useTransform(progress, [0, 0.42], [1, 0.74]);

  const detailsY = useTransform(progress, [0, 0.42], [0, 335]);
  const detailsScale = useTransform(progress, [0, 0.42], [1, 1.12]);

  const heroTimerOpacity = useTransform(progress, [0, 0.16], [1, 0]);
  const fixedTimerOpacity = useTransform(progress, [0.18, 0.34], [0, 1]);

  const polaroidOpacity = useTransform(
    progress,
    [0.16, 0.34, 0.56, 0.66],
    [0, 1, 1, 0]
  );
  const polaroidY = useTransform(progress, [0.16, 0.42, 0.66], [115, 45, -80]);
  const polaroidScale = useTransform(
    progress,
    [0.16, 0.42, 0.66],
    [0.92, 1, 0.92]
  );

  const carouselOpacity = useTransform(progress, [0.58, 0.64], [0, 1]);
  const carouselX = useTransform(progress, [0.58, 0.64], ["100vw", "0vw"]);

  const rsvpOpacity = useTransform(progress, [0.64, 0.74], [0, 1]);
  const rsvpY = useTransform(progress, [0.64, 0.74], [48, 0]);
  const rsvpScale = useTransform(progress, [0.64, 0.74], [0.92, 1]);

  return (
    <section
      ref={sectionRef}
      className={`${cormorant.className} relative min-h-[320vh] bg-[#f3e7d6]`}
    >
      <motion.div
        style={{ opacity: fixedTimerOpacity }}
        className="fixed right-4 top-4 z-[100] md:right-10 md:top-8"
      >
        <CountdownTimer compact />
      </motion.div>

      <div className="sticky top-0 flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#fbf3e8_0%,#f3e7d6_42%,#d9e5f2_100%)]" />
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#b9cce2]/40 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#d8c3a5]/50 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#d9e5f2]/40 to-transparent" />

        <FloatingDust />

        <motion.div
          style={{
            opacity: carouselOpacity,
            x: carouselX,
          }}
          className="fixed left-0 right-0 top-1/2 z-30 hidden h-[460px] w-[100dvw] max-w-none -translate-y-1/2 overflow-hidden md:block"
        >
          <ImageCarousel />
        </motion.div>

        <motion.div
          style={{
            opacity: rsvpOpacity,
            y: rsvpY,
            scale: rsvpScale,
          }}
          className="fixed bottom-[155px] left-1/2 z-[80] hidden -translate-x-1/2 md:block"
        >
          <RSVPButton />
        </motion.div>

        <div className="relative z-40 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 text-center">
          <motion.p
            style={{ opacity: introOpacity }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-6 text-xs uppercase tracking-[0.5em] text-[#5f6f86]"
          >
            Together With Their Families
          </motion.p>

          <motion.div
            style={{ y: namesY, scale: namesScale }}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="relative z-[90] origin-center"
          >
            <h1
              className={`${dancingScript.className} text-7xl font-semibold tracking-normal leading-[1.18] md:text-9xl`}
            >
              <span className="luxury-name-glow text-[#243b5a]">
                Joseph
                <span className="mx-4 text-[#9c8261]">&</span>
                Taiwo
              </span>
            </h1>
          </motion.div>

          <motion.div
            style={{ opacity: dividerOpacity }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.35 }}
            className="mt-7 h-px w-48 origin-center bg-gradient-to-r from-transparent via-[#c9a76b] to-transparent"
          />

          <motion.p
            style={{ opacity: inviteOpacity }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.45 }}
            className="mt-8 text-2xl font-medium text-[#4d5f78] md:text-3xl"
          >
            Invite you to celebrate their wedding
          </motion.p>

          <motion.div
            style={{
              opacity: polaroidOpacity,
              y: polaroidY,
              scale: polaroidScale,
            }}
            className="absolute left-1/2 top-[54%] z-50 hidden -translate-x-1/2 -translate-y-1/2 md:block"
          >
            <PolaroidFrames
              hoveredFrame={hoveredFrame}
              setHoveredFrame={setHoveredFrame}
            />
          </motion.div>

          <motion.div
            style={{ y: detailsY, scale: detailsScale }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.55 }}
            className="mt-5 flex origin-center flex-col items-center gap-3"
          >
            <p className="text-base uppercase tracking-[0.5em] text-[#314a6d] md:text-xl">
              12 December 2026
            </p>

            <p className="text-xl tracking-[0.24em] text-[#243b5a] md:text-3xl">
              Silver Lakes Farm Hotel · Pretoria
            </p>

            <div className="mt-5 flex items-center gap-4 text-[#c9a76b]">
              <span className="h-px w-20 bg-[#c9a76b]/60" />
              <span className="text-xl">❦</span>
              <span className="h-px w-20 bg-[#c9a76b]/60" />
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: heroTimerOpacity }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.75 }}
          >
            <CountdownTimer />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return <HeroSection />;
}