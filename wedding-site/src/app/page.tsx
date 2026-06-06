"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Cormorant_Garamond,
  Dancing_Script,
  Playfair_Display,
} from "next/font/google";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const WEDDING_DATE = new Date("2026-12-12T15:00:00+02:00").getTime();
const TOTAL_CHURCH_SEATS = 100;

type FamilyMember = {
  name: string;
  checked: boolean;
};

type RSVPRecord = {
  familyMembers: FamilyMember[];
  churchAttending: boolean;
  churchCount: number;
};

type RSVPStep = "surname" | "loading" | "family" | "success";

const FIRST_NAMES = [
  "Amina",
  "Daniel",
  "Grace",
  "Isaac",
  "Maya",
  "Samuel",
  "Naomi",
  "David",
  "Sarah",
  "Joshua",
  "Talia",
  "Michael",
  "Esther",
  "Joseph",
  "Ruth",
];

function normalizeSurname(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function titleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getFamilyStorageKey(surname: string) {
  return `rsvp-family-${normalizeSurname(surname)}`;
}

function getChurchReservations(): Record<string, number> {
  if (typeof window === "undefined") return {};

  const stored = window.localStorage.getItem("rsvp-church-reservations");

  if (!stored) return {};

  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function getChurchSeatsAvailable() {
  const reservations = getChurchReservations();
  const usedSeats = Object.values(reservations).reduce(
    (total, count) => total + count,
    0
  );

  return Math.max(TOTAL_CHURCH_SEATS - usedSeats, 0);
}

function saveChurchReservation(surnameKey: string, count: number) {
  const reservations = getChurchReservations();

  if (count <= 0) {
    delete reservations[surnameKey];
  } else {
    reservations[surnameKey] = count;
  }

  window.localStorage.setItem(
    "rsvp-church-reservations",
    JSON.stringify(reservations)
  );
}

function generateFamilyMembers(surname: string): FamilyMember[] {
  const cleanSurname = titleCase(surname);
  const seed = normalizeSurname(surname)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return Array.from({ length: 5 }).map((_, index) => {
    const firstName = FIRST_NAMES[(seed + index * 3) % FIRST_NAMES.length];

    return {
      name: `${firstName} ${cleanSurname}`,
      checked: true,
    };
  });
}

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

function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  function fadeTo(audio: HTMLAudioElement, targetVolume: number) {
    const step = targetVolume > audio.volume ? 0.01 : -0.01;

    const interval = window.setInterval(() => {
      const nextVolume = audio.volume + step;

      if (
        (step > 0 && nextVolume >= targetVolume) ||
        (step < 0 && nextVolume <= targetVolume)
      ) {
        audio.volume = targetVolume;
        window.clearInterval(interval);
        return;
      }

      audio.volume = Math.max(0, Math.min(0.25, nextVolume));
    }, 70);
  }

  async function startMusic() {
    const audio = audioRef.current;

    if (!audio || started) return;

    try {
      audio.volume = 0;
      await audio.play();
      fadeTo(audio, 0.25);
      setStarted(true);
      setIsPlaying(true);
    } catch (error) {
      console.log("Audio could not start yet:", error);
    }
  }

  async function toggleMusic() {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (isPlaying) {
        fadeTo(audio, 0);

        window.setTimeout(() => {
          audio.pause();
          setIsPlaying(false);
        }, 700);

        return;
      }

      audio.volume = 0;
      await audio.play();
      fadeTo(audio, 0.25);
      setStarted(true);
      setIsPlaying(true);
    } catch (error) {
      console.log("Audio could not start:", error);
    }
  }

  useEffect(() => {
    const handleFirstScroll = () => {
      startMusic();
    };

    window.addEventListener("scroll", handleFirstScroll, { once: true });
    window.addEventListener("wheel", handleFirstScroll, { once: true });
    window.addEventListener("touchmove", handleFirstScroll, { once: true });

    return () => {
      window.removeEventListener("scroll", handleFirstScroll);
      window.removeEventListener("wheel", handleFirstScroll);
      window.removeEventListener("touchmove", handleFirstScroll);
    };
  }, [started]);

  return (
    <>
      <audio ref={audioRef} src="/audio/amen.mp3" loop preload="auto" />

      <motion.button
        type="button"
        onClick={toggleMusic}
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        className={`${playfair.className} fixed left-3 top-14 z-[110] rounded-full border border-[#c9a76b]/70 bg-[#f8efe2] px-4 py-2.5 text-[0.58rem] font-black uppercase tracking-[0.2em] text-[#a77b34] shadow-[0_16px_50px_rgba(36,59,90,0.12)] transition hover:border-[#b88a3d] hover:bg-[#fff8ed] sm:left-8 sm:top-20 sm:px-7 sm:py-3 sm:text-xs`}
      >
        {isPlaying ? "Music On" : "Play Music"}
      </motion.button>
    </>
  );
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
          ? "grid grid-cols-4 gap-1.5 rounded-full border border-[#c9a76b]/20 bg-[#fff8ed]/90 px-3 py-2.5 shadow-[0_22px_80px_rgba(36,59,90,0.13)] backdrop-blur-md sm:gap-3 sm:px-6 sm:py-4"
          : "mt-8 grid grid-cols-4 gap-2 rounded-full border border-[#c9a76b]/30 bg-[#f8efe2]/75 px-4 py-3 shadow-[0_24px_90px_rgba(36,59,90,0.13)] backdrop-blur sm:mt-10 sm:gap-3 sm:px-5 sm:py-4 md:mt-12 md:gap-8 md:px-10"
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
    <div className="flex min-w-7 flex-col items-center text-[#243b5a] sm:min-w-10">
      <span
        className={`${cormorant.className} ${
          compact
            ? "text-base sm:text-xl md:text-2xl"
            : "text-2xl sm:text-3xl md:text-5xl"
        } font-medium leading-none`}
      >
        {value.toString().padStart(2, "0")}
      </span>

      <span
        className={
          compact
            ? "mt-1 text-[6px] uppercase tracking-[0.14em] text-[#7b6f64] sm:mt-2 sm:text-[8px] sm:tracking-[0.2em]"
            : "mt-2 text-[8px] uppercase tracking-[0.22em] text-[#6f7f96] sm:text-[10px] sm:tracking-[0.28em]"
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
          className="animate-dust absolute h-1 w-1 rounded-full bg-[#c9a76b]/40 shadow-[0_0_16px_rgba(201,167,107,0.45)]"
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
        <path
          d="M91 244C93 184 82 123 42 45"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M72 194C47 187 33 169 20 147C47 153 65 168 72 194Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M78 160C49 145 38 121 31 94C60 108 76 130 78 160Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M63 116C41 101 31 80 27 56C52 68 64 88 63 116Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M93 204C123 191 141 168 154 138C122 145 101 168 93 204Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M88 169C119 151 133 124 140 94C108 111 91 136 88 169Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M73 125C101 103 111 76 112 47C86 67 74 93 73 125Z"
          stroke="currentColor"
          strokeWidth="2"
        />
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
      className={`absolute h-[168px] w-[134px] cursor-pointer bg-white p-2 pb-8 shadow-[0_18px_38px_rgba(36,59,90,0.16)] min-[390px]:h-[188px] min-[390px]:w-[150px] sm:h-[260px] sm:w-[210px] sm:p-3 sm:pb-12 md:h-[295px] md:w-[240px] md:pb-14 ${
        isHovered ? "shadow-[0_45px_120px_rgba(36,59,90,0.35)]" : ""
      } ${className}`}
    >
      <div className="h-full w-full rounded-[2px] bg-gradient-to-br from-[#c8c8c8] via-[#dddddd] to-[#f1f1f1]" />

      <div
        className={`absolute left-1/2 h-5 w-12 -translate-x-1/2 bg-[#d8c3a5]/70 shadow-sm sm:h-7 sm:w-16 md:h-8 md:w-20 ${
          tapePosition === "top" ? "-top-2 sm:-top-3" : "-bottom-2 sm:-bottom-3"
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
    <div className="relative h-[370px] w-[300px] max-w-[92vw] min-[390px]:h-[410px] min-[390px]:w-[335px] sm:h-[620px] sm:w-[620px] md:h-[650px] md:w-[760px]">
      <BotanicalLine className="-left-20 top-28 hidden -rotate-[18deg] sm:block" />
      <BotanicalLine className="-right-28 top-48 hidden rotate-[34deg] sm:block" />

      <Polaroid
        id="our"
        className="left-[12px] top-[20px] min-[390px]:left-[14px] min-[390px]:top-[24px] sm:left-[70px] sm:top-[45px] md:left-[95px]"
        rotate={-4}
        hoveredFrame={hoveredFrame}
        setHoveredFrame={setHoveredFrame}
      />

      <Polaroid
        id="journey"
        className="right-[12px] top-[48px] min-[390px]:right-[14px] min-[390px]:top-[58px] sm:right-[70px] sm:top-[80px] md:right-[95px]"
        rotate={7}
        hoveredFrame={hoveredFrame}
        setHoveredFrame={setHoveredFrame}
      />

      <Polaroid
        id="thus"
        className="bottom-[44px] left-[12px] min-[390px]:bottom-[48px] min-[390px]:left-[14px] sm:bottom-[0px] sm:left-[70px] md:left-[95px]"
        rotate={4}
        hoveredFrame={hoveredFrame}
        setHoveredFrame={setHoveredFrame}
      />

      <Polaroid
        id="far"
        className="bottom-[20px] right-[12px] min-[390px]:bottom-[22px] min-[390px]:right-[14px] sm:bottom-[-20px] sm:right-[85px] md:right-[110px]"
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
            className="h-full w-[100dvw] shrink-0 bg-gradient-to-br from-[#c9c9c9] via-[#dedede] to-[#f2f2f2] sm:w-[50dvw] md:w-[calc(100dvw/3)]"
          />
        ))}
      </motion.div>
    </div>
  );
}

function RootsWrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-6xl px-3 py-14 sm:px-6 sm:py-20">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-[#b88a3d]/65"
        viewBox="0 0 1000 760"
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          d="M500 0 C500 95 500 130 500 185 C500 255 425 282 300 295 C158 310 82 395 122 512 C162 625 318 656 500 626 C682 656 838 625 878 512 C918 395 842 310 700 295 C575 282 500 255 500 185"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
        />

        <motion.path
          d="M500 215 C430 278 405 348 428 445"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1.4, delay: 0.45, ease: "easeInOut" }}
        />

        <motion.path
          d="M500 215 C570 278 595 348 572 445"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1.4, delay: 0.55, ease: "easeInOut" }}
        />

        <motion.path
          d="M428 445 C360 490 330 555 350 650"
          stroke="currentColor"
          strokeWidth="1.05"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1.3, delay: 0.8, ease: "easeInOut" }}
        />

        <motion.path
          d="M572 445 C640 490 670 555 650 650"
          stroke="currentColor"
          strokeWidth="1.05"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1.3, delay: 0.95, ease: "easeInOut" }}
        />
      </svg>

      <div className="relative z-10">{children}</div>
    </div>
  );
}

function DressCodeSection() {
  return (
    <RootsWrap>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-2 text-xs uppercase tracking-[0.42em] text-[#9c8261]"
        >
          Wedding Style
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className={`${playfair.className} mb-8 text-4xl font-black text-[#243b5a] sm:text-6xl`}
        >
          Color & Dress Code
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="grid w-full gap-5 md:grid-cols-2"
        >
          <div className="rounded-[2rem] border border-[#c9a76b]/35 bg-[#fff8ed]/85 p-6 shadow-[0_24px_80px_rgba(36,59,90,0.1)] backdrop-blur">
            <p className="mb-2 text-xs uppercase tracking-[0.38em] text-[#9c8261]">
              Color Code
            </p>

            <h3
              className={`${playfair.className} mb-5 text-3xl font-black text-[#243b5a] sm:text-4xl`}
            >
              Champagne, Beige & a Touch of Blue
            </h3>

            <div className="mb-5 flex flex-wrap justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <span className="h-12 w-12 rounded-full border border-[#c9a76b]/50 bg-[#f4dfbd] shadow-inner" />
                <span className="text-xs uppercase tracking-[0.2em] text-[#6f7f96]">
                  Champagne
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="h-12 w-12 rounded-full border border-[#c9a76b]/50 bg-[#e7d2b5] shadow-inner" />
                <span className="text-xs uppercase tracking-[0.2em] text-[#6f7f96]">
                  Beige
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="h-12 w-12 rounded-full border border-[#9fb5cf]/70 bg-[#b9cce2] shadow-inner" />
                <span className="text-xs uppercase tracking-[0.2em] text-[#6f7f96]">
                  Touch of Blue
                </span>
              </div>
            </div>

            <p className="text-sm leading-6 text-[#4d5f78]">
              Please keep the blue as a subtle accent only.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#c9a76b]/35 bg-[#fff8ed]/85 p-6 shadow-[0_24px_80px_rgba(36,59,90,0.1)] backdrop-blur">
            <p className="mb-2 text-xs uppercase tracking-[0.38em] text-[#9c8261]">
              Dress Code
            </p>

            <h3
              className={`${playfair.className} mb-5 text-3xl font-black text-[#243b5a] sm:text-4xl`}
            >
              Formal
            </h3>

            <p className="text-base leading-7 text-[#4d5f78]">
              Formal attire is requested. Guests are also welcome to wear{" "}
              <span className="font-bold text-[#243b5a]">
                gele or fascinators
              </span>{" "}
              for an elegant celebratory touch.
            </p>
          </div>
        </motion.div>
      </div>
    </RootsWrap>
  );
}

function OrderOfDaySection() {
  const events = [
    ["11:00 AM", "Church Ceremony"],
    ["14:00", "Cocktail Hour & Photography"],
    ["15:00", "Reception"],
    ["19:00", "End of Reception"],
  ];

  return (
    <RootsWrap>
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-2 text-xs uppercase tracking-[0.42em] text-[#9c8261]"
        >
          The Day
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className={`${playfair.className} mb-10 text-4xl font-black text-[#243b5a] sm:text-6xl`}
        >
          Order of Events
        </motion.h2>

        <div className="relative w-full">
          <motion.div
            className="absolute left-5 top-0 hidden h-full w-px bg-[#b88a3d]/60 sm:block"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ transformOrigin: "top" }}
          />

          <div className="space-y-6">
            {events.map(([time, title], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: index * 0.1 }}
                className="relative rounded-[1.7rem] border border-[#c9a76b]/35 bg-[#fff8ed]/85 p-5 text-left shadow-[0_18px_60px_rgba(36,59,90,0.09)] backdrop-blur sm:ml-14"
              >
                <span className="absolute -left-[3.65rem] top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full border border-[#b88a3d] bg-[#d8c3a5] shadow-[0_0_0_6px_rgba(248,239,226,0.95)] sm:block" />

                <p
                  className={`${playfair.className} text-3xl font-black text-[#243b5a]`}
                >
                  {time}
                </p>

                <div className="my-2 h-px w-40 bg-gradient-to-r from-[#b88a3d]/80 to-transparent" />

                <p className="text-lg uppercase tracking-[0.16em] text-[#4d5f78]">
                  {title}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mt-10 rounded-[2rem] border border-[#c9a76b]/35 bg-[#fff8ed]/85 p-6 text-center shadow-[0_24px_80px_rgba(36,59,90,0.1)] backdrop-blur"
        >
          <p className="mb-4 text-base leading-7 text-[#4d5f78]">
            <span className="font-black text-[#243b5a]">
              Do not extend this invitation, as it is for invited guests only.
            </span>
          </p>

          <p className="text-base leading-7 text-[#4d5f78]">
            We love and adore your little ones, but we kindly ask that this
            remains an adults-only celebration.
          </p>
        </motion.div>
      </div>
    </RootsWrap>
  );
}

function RegistryButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={{
        scale: [1, 1.03, 1],
        boxShadow: [
          "0 16px 50px rgba(36,59,90,0.12)",
          "0 20px 70px rgba(201,167,107,0.25)",
          "0 16px 50px rgba(36,59,90,0.12)",
        ],
      }}
      transition={{
        duration: 5.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`${playfair.className} fixed left-3 top-3 z-[110] rounded-full border border-[#c9a76b]/70 bg-[#f8efe2] px-4 py-2.5 text-[0.58rem] font-black uppercase tracking-[0.2em] text-[#a77b34] shadow-[0_16px_50px_rgba(36,59,90,0.12)] transition hover:border-[#b88a3d] hover:bg-[#fff8ed] sm:left-8 sm:top-8 sm:px-7 sm:py-3 sm:text-xs sm:tracking-[0.24em]`}
    >
      Registry
    </motion.button>
  );
}

function RSVPButton({ onClick }: { onClick: () => void }) {
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
      <div className="absolute h-20 w-64 rounded-full bg-[#c9a76b]/25 blur-2xl sm:h-24 sm:w-80" />

      <div className="flex items-center gap-2 sm:gap-6">
        <span className="h-[2px] w-7 bg-gradient-to-r from-transparent via-[#c9a76b] to-[#c9a76b] sm:w-28" />

        <motion.button
          type="button"
          onClick={onClick}
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.97 }}
          className={`${playfair.className} group relative overflow-hidden rounded-full border-2 border-[#c9a76b] bg-[#f8efe2] px-8 py-3.5 text-xs font-black uppercase tracking-[0.32em] text-[#b88a3d] shadow-[0_28px_85px_rgba(36,59,90,0.18)] transition-all duration-300 hover:border-[#d6b06d] hover:shadow-[0_32px_100px_rgba(201,167,107,0.28)] sm:px-16 sm:py-5 sm:text-base sm:tracking-[0.42em]`}
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

        <span className="h-[2px] w-7 bg-gradient-to-l from-transparent via-[#c9a76b] to-[#c9a76b] sm:w-28" />
      </div>
    </motion.div>
  );
}

function ModalShell({
  open,
  onClose,
  children,
  maxWidth = "max-w-xl",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#243b5a]/20 px-3 py-4 backdrop-blur-[5px] sm:px-4 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`relative my-auto max-h-[94dvh] w-full ${maxWidth} overflow-y-auto rounded-[1.6rem] border border-[#c9a76b]/45 bg-[#f8efe2] px-4 py-6 text-center shadow-[0_40px_140px_rgba(36,59,90,0.32)] [scrollbar-width:none] sm:rounded-[2rem] sm:px-10 sm:py-10 [&::-webkit-scrollbar]:hidden`}
          >
            <div className="absolute -left-24 -top-24 h-48 w-48 rounded-full bg-[#d8c3a5]/40 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-[#b9cce2]/45 blur-3xl" />

            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.92 }}
              className="absolute right-4 top-4 z-20 rounded-full border border-[#c9a76b]/50 bg-[#fff8ed]/90 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#9c8261] shadow-[0_10px_30px_rgba(36,59,90,0.1)] transition hover:bg-[#fff8ed] sm:right-5 sm:top-5 sm:text-xs sm:tracking-[0.2em]"
            >
              Close
            </motion.button>

            <div className="relative z-10">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RegistryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="mb-3 text-xs uppercase tracking-[0.42em] text-[#9c8261]">
          Wedding Registry
        </p>

        <h2
          className={`${playfair.className} mb-4 text-3xl font-black text-[#243b5a] sm:text-5xl`}
        >
          Your presence is the gift
        </h2>

        <p className="mx-auto mb-5 max-w-xl text-sm leading-6 text-[#4d5f78] sm:mb-7 sm:text-base sm:leading-7">
          We are so grateful to celebrate this special day with you. If you would
          like to bless us with a gift, we would kindly prefer a financial
          contribution toward our new life together rather than physical gifts.
          Your love, support, and prayers mean the world to us.
        </p>

        <div className="grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-[1.4rem] border border-[#c9a76b]/35 bg-[#fff8ed]/80 p-4 shadow-[0_14px_42px_rgba(36,59,90,0.08)]">
            <h3
              className={`${playfair.className} mb-3 text-xl font-black text-[#243b5a]`}
            >
              TymeBank
            </h3>

            <div className="space-y-1.5 text-sm text-[#4d5f78]">
              <p>
                <span className="font-bold text-[#243b5a]">
                  Account Holder:
                </span>{" "}
                Funso Joseph Idowu
              </p>
              <p>
                <span className="font-bold text-[#243b5a]">Bank Name:</span>{" "}
                TymeBank
              </p>
              <p>
                <span className="font-bold text-[#243b5a]">Branch Code:</span>{" "}
                678910
              </p>
              <p>
                <span className="font-bold text-[#243b5a]">
                  Account Number:
                </span>{" "}
                51052587164
              </p>
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-[#c9a76b]/35 bg-[#fff8ed]/80 p-4 shadow-[0_14px_42px_rgba(36,59,90,0.08)]">
            <h3
              className={`${playfair.className} mb-3 text-xl font-black text-[#243b5a]`}
            >
              Capitec
            </h3>

            <div className="space-y-1.5 text-sm text-[#4d5f78]">
              <p>
                <span className="font-bold text-[#243b5a]">
                  Account Number:
                </span>{" "}
                2529873840
              </p>
              <p>
                <span className="font-bold text-[#243b5a]">Branch Code:</span>{" "}
                470010
              </p>
              <p>
                <span className="font-bold text-[#243b5a]">Swift Code:</span>{" "}
                CABLZAJJ
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-md rounded-full border border-[#c9a76b]/45 bg-[#fff8ed]/90 px-5 py-3 text-center shadow-[0_14px_42px_rgba(36,59,90,0.08)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[#9c8261]">
            PayShap
          </p>
          <p
            className={`${playfair.className} text-xl font-black text-[#243b5a]`}
          >
            0740841686
          </p>
        </div>
      </motion.div>
    </ModalShell>
  );
}

function RSVPModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<RSVPStep>("surname");
  const [surname, setSurname] = useState("");
  const [submittedSurname, setSubmittedSurname] = useState("");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [churchAttending, setChurchAttending] = useState(false);
  const [churchCount, setChurchCount] = useState(0);
  const [churchSeatsAvailable, setChurchSeatsAvailable] =
    useState(TOTAL_CHURCH_SEATS);

  const surnameKey = useMemo(
    () => normalizeSurname(submittedSurname || surname),
    [submittedSurname, surname]
  );

  const weddingGuestCount = familyMembers.filter(
    (member) => member.checked
  ).length;

  const existingChurchReservation =
    surnameKey && typeof window !== "undefined"
      ? getChurchReservations()[surnameKey] ?? 0
      : 0;

  const seatsAvailableForThisFamily =
    churchSeatsAvailable + existingChurchReservation;

  const maxChurchForThisFamily = Math.min(
    familyMembers.length,
    seatsAvailableForThisFamily
  );

  useEffect(() => {
    if (open) {
      setChurchSeatsAvailable(getChurchSeatsAvailable());
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("surname");
        setSurname("");
        setSubmittedSurname("");
        setFamilyMembers([]);
        setChurchAttending(false);
        setChurchCount(0);
      }, 250);
    }
  }, [open]);

  function handleSurnameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanSurname = surname.trim();

    if (!cleanSurname) return;

    setSubmittedSurname(cleanSurname);
    setStep("loading");

    window.setTimeout(() => {
      const key = getFamilyStorageKey(cleanSurname);
      const stored = window.localStorage.getItem(key);

      if (stored) {
        const parsed: RSVPRecord | FamilyMember[] = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setFamilyMembers(parsed);
          setChurchAttending(false);
          setChurchCount(0);
        } else {
          setFamilyMembers(parsed.familyMembers);
          setChurchAttending(parsed.churchAttending);
          setChurchCount(parsed.churchCount);
        }
      } else {
        const generated = generateFamilyMembers(cleanSurname);
        setFamilyMembers(generated);
        setChurchAttending(false);
        setChurchCount(0);

        const initialRecord: RSVPRecord = {
          familyMembers: generated,
          churchAttending: false,
          churchCount: 0,
        };

        window.localStorage.setItem(key, JSON.stringify(initialRecord));
      }

      setChurchSeatsAvailable(getChurchSeatsAvailable());
      setStep("family");
    }, 850);
  }

  function toggleMember(index: number) {
    setFamilyMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, checked: !member.checked } : member
      )
    );
  }

  function handleChurchCountChange(value: string) {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      setChurchCount(0);
      return;
    }

    const nextValue = Math.max(
      0,
      Math.min(numericValue, maxChurchForThisFamily)
    );
    setChurchCount(nextValue);

    if (nextValue > 0) {
      setChurchAttending(true);
    }
  }

  function handleChurchToggle(value: boolean) {
    setChurchAttending(value);

    if (!value) {
      setChurchCount(0);
    } else if (churchCount === 0) {
      setChurchCount(Math.min(1, maxChurchForThisFamily));
    }
  }

  function handleFamilySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const finalChurchCount = churchAttending
      ? Math.min(churchCount, maxChurchForThisFamily)
      : 0;

    const record: RSVPRecord = {
      familyMembers,
      churchAttending,
      churchCount: finalChurchCount,
    };

    window.localStorage.setItem(
      getFamilyStorageKey(submittedSurname),
      JSON.stringify(record)
    );

    saveChurchReservation(surnameKey, finalChurchCount);
    setChurchSeatsAvailable(getChurchSeatsAvailable());
    setChurchCount(finalChurchCount);
    setStep("success");
  }

  return (
    <ModalShell open={open} onClose={onClose}>
      <AnimatePresence mode="wait">
        {step === "surname" && (
          <motion.form
            key="surname"
            onSubmit={handleSurnameSubmit}
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
            transition={{ duration: 0.35 }}
          >
            <p className="mb-2 text-[0.65rem] uppercase tracking-[0.34em] text-[#9c8261] sm:mb-3 sm:text-xs sm:tracking-[0.42em]">
              Wedding RSVP
            </p>

            <h2
              className={`${playfair.className} mb-3 text-3xl font-black text-[#243b5a] sm:mb-4 sm:text-5xl`}
            >
              Welcome
            </h2>

            <p className="mx-auto mb-5 max-w-sm text-sm leading-6 text-[#4d5f78] sm:mb-8 sm:text-base sm:leading-7">
              Please enter your family surname so we can find your party.
            </p>

            <input
              value={surname}
              onChange={(event) => setSurname(event.target.value)}
              placeholder="Enter surname"
              className={`${playfair.className} mb-5 w-full rounded-full border border-[#c9a76b]/45 bg-[#fff8ed] px-5 py-3.5 text-center text-lg font-bold text-[#243b5a] outline-none shadow-inner placeholder:text-[#9c8261]/55 focus:border-[#b88a3d] sm:mb-6 sm:px-6 sm:py-4 sm:text-xl`}
            />

            <motion.button
              type="submit"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`${playfair.className} rounded-full border-2 border-[#c9a76b] bg-[#243b5a] px-9 py-3.5 text-xs font-black uppercase tracking-[0.28em] text-[#fff8ed] shadow-[0_22px_70px_rgba(36,59,90,0.22)] sm:px-10 sm:py-4 sm:text-sm sm:tracking-[0.32em]`}
            >
              Submit
            </motion.button>
          </motion.form>
        )}

        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
            transition={{ duration: 0.35 }}
            className="py-10 sm:py-12"
          >
            <h2
              className={`${playfair.className} mb-8 text-2xl font-black text-[#243b5a] sm:text-4xl`}
            >
              Fetching family names...
            </h2>

            <div className="mx-auto h-3 max-w-sm overflow-hidden rounded-full bg-[#d8c3a5]/35">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#b88a3d] via-[#e2c27d] to-[#b88a3d]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {step === "family" && (
          <motion.form
            key="family"
            onSubmit={handleFamilySubmit}
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
            transition={{ duration: 0.35 }}
          >
            <p className="mb-2 text-[0.62rem] uppercase tracking-[0.32em] text-[#9c8261] sm:mb-3 sm:text-xs sm:tracking-[0.42em]">
              {titleCase(submittedSurname)} Family
            </p>

            <h2
              className={`${playfair.className} mb-4 text-2xl font-black text-[#243b5a] sm:mb-5 sm:text-4xl`}
            >
              Who will be attending?
            </h2>

            <div className="mb-4 grid grid-cols-1 gap-2 text-left sm:mb-5 sm:gap-3">
              {familyMembers.map((member, index) => (
                <label
                  key={member.name}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#c9a76b]/30 bg-[#fff8ed]/70 px-4 py-2.5 shadow-[0_12px_40px_rgba(36,59,90,0.08)] transition hover:border-[#c9a76b]/70 sm:gap-4 sm:px-5 sm:py-3"
                >
                  <input
                    type="checkbox"
                    checked={member.checked}
                    onChange={() => toggleMember(index)}
                    className="h-4 w-4 accent-[#b88a3d] sm:h-5 sm:w-5"
                  />

                  <span
                    className={`${playfair.className} text-base font-bold text-[#243b5a] sm:text-lg`}
                  >
                    {member.name}
                  </span>
                </label>
              ))}
            </div>

            <div className="mb-5 rounded-[1.4rem] border border-[#c9a76b]/40 bg-[#fff8ed]/75 p-4 text-left shadow-[0_16px_50px_rgba(36,59,90,0.08)] sm:rounded-[1.6rem] sm:p-5">
              <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p
                    className={`${playfair.className} text-lg font-black text-[#243b5a] sm:text-xl`}
                  >
                    Church ceremony
                  </p>
                  <p className="text-xs leading-5 text-[#4d5f78] sm:text-sm sm:leading-6">
                    Will your family attend the morning church ceremony?
                  </p>
                </div>

                <div className="rounded-full border border-[#c9a76b]/40 bg-[#f8efe2] px-3 py-1.5 text-center text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#a77b34] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.2em]">
                  {churchSeatsAvailable} seats left
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleChurchToggle(true)}
                  className={`${playfair.className} rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] transition sm:px-5 sm:py-3 sm:text-sm sm:tracking-[0.22em] ${
                    churchAttending
                      ? "border-[#b88a3d] bg-[#243b5a] text-[#fff8ed]"
                      : "border-[#c9a76b]/40 bg-[#fff8ed] text-[#9c8261]"
                  }`}
                >
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => handleChurchToggle(false)}
                  className={`${playfair.className} rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] transition sm:px-5 sm:py-3 sm:text-sm sm:tracking-[0.22em] ${
                    !churchAttending
                      ? "border-[#b88a3d] bg-[#243b5a] text-[#fff8ed]"
                      : "border-[#c9a76b]/40 bg-[#fff8ed] text-[#9c8261]"
                  }`}
                >
                  No
                </button>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-[#4d5f78] sm:text-sm">
                  How many family members will attend the church ceremony?
                </span>

                <input
                  type="number"
                  min={0}
                  max={maxChurchForThisFamily}
                  disabled={!churchAttending}
                  value={churchCount}
                  onChange={(event) =>
                    handleChurchCountChange(event.target.value)
                  }
                  className={`${playfair.className} w-full rounded-full border border-[#c9a76b]/45 bg-[#fff8ed] px-5 py-3 text-center text-lg font-black text-[#243b5a] outline-none disabled:cursor-not-allowed disabled:opacity-45 sm:px-6 sm:py-4 sm:text-xl`}
                />
              </label>

              <p className="mt-2 text-center text-[0.68rem] leading-4 text-[#6f7f96] sm:mt-3 sm:text-xs sm:leading-5">
                Family limit: {familyMembers.length}. Wedding attendees
                selected: {weddingGuestCount}. Church seats available to this
                family: {maxChurchForThisFamily}.
              </p>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`${playfair.className} rounded-full border-2 border-[#c9a76b] bg-[#f8efe2] px-9 py-3.5 text-xs font-black uppercase tracking-[0.28em] text-[#b88a3d] shadow-[0_22px_70px_rgba(36,59,90,0.16)] sm:px-10 sm:py-4 sm:text-sm sm:tracking-[0.32em]`}
            >
              Submit RSVP
            </motion.button>
          </motion.form>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
            transition={{ duration: 0.35 }}
            className="py-8 sm:py-10"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#c9a76b] bg-[#fff8ed] text-3xl text-[#b88a3d] shadow-[0_20px_70px_rgba(201,167,107,0.28)] sm:mb-8 sm:h-20 sm:w-20 sm:text-4xl"
            >
              ✓
            </motion.div>

            <h2
              className={`${playfair.className} mb-4 text-3xl font-black text-[#243b5a] sm:text-5xl`}
            >
              RSVP submitted
            </h2>

            <p className="text-lg text-[#4d5f78] sm:text-xl">See you soon!</p>

            <p className="mt-5 text-sm text-[#6f7f96]">
              Church seats remaining: {churchSeatsAvailable}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalShell>
  );
}

function HeroSection() {
  const heroScrollRef = useRef<HTMLDivElement | null>(null);
  const [hoveredFrame, setHoveredFrame] = useState<string | null>(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [registryOpen, setRegistryOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: heroScrollRef,
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

  const namesY = useTransform(progress, [0, 0.42], [0, -135]);
  const namesScale = useTransform(progress, [0, 0.42], [1, 0.78]);

  const detailsY = useTransform(progress, [0, 0.42], [0, 300]);
  const detailsScale = useTransform(progress, [0, 0.42], [1, 1.08]);

  const heroTimerOpacity = useTransform(progress, [0, 0.16], [1, 0]);
  const fixedTimerOpacity = useTransform(progress, [0.18, 0.34], [0, 1]);

  const polaroidOpacity = useTransform(
    progress,
    [0.16, 0.34, 0.56, 0.66],
    [0, 1, 1, 0]
  );
  const polaroidY = useTransform(progress, [0.16, 0.42, 0.66], [90, 55, -70]);
  const polaroidScale = useTransform(
    progress,
    [0.16, 0.42, 0.66],
    [0.84, 0.9, 0.84]
  );

  const carouselOpacity = useTransform(
    progress,
    [0.58, 0.64, 0.88, 0.96],
    [0, 1, 1, 0]
  );
  const carouselX = useTransform(progress, [0.58, 0.64], ["100vw", "0vw"]);

  const rsvpOpacity = useTransform(
    progress,
    [0.64, 0.74, 0.88, 0.96],
    [0, 1, 1, 0]
  );
  const rsvpY = useTransform(progress, [0.64, 0.74], [48, 0]);
  const rsvpScale = useTransform(progress, [0.64, 0.74], [0.92, 1]);

  return (
    <>
      <AudioPlayer />

      <RegistryButton onClick={() => setRegistryOpen(true)} />
      <RegistryModal
        open={registryOpen}
        onClose={() => setRegistryOpen(false)}
      />
      <RSVPModal open={rsvpOpen} onClose={() => setRsvpOpen(false)} />

      <section className={`${cormorant.className} relative bg-[#f3e7d6]`}>
        <div ref={heroScrollRef} className="relative min-h-[340vh]">
          <motion.div
            style={{ opacity: fixedTimerOpacity }}
            className="fixed right-3 top-14 z-[100] sm:right-4 sm:top-4 md:right-10 md:top-8"
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
              style={{ opacity: carouselOpacity, x: carouselX }}
              className="fixed left-0 right-0 top-1/2 z-30 h-[320px] w-[100dvw] max-w-none -translate-y-1/2 overflow-hidden sm:h-[430px] md:h-[460px]"
            >
              <ImageCarousel />
            </motion.div>

            <motion.div
              style={{ opacity: rsvpOpacity, y: rsvpY, scale: rsvpScale }}
              className="fixed bottom-[132px] left-1/2 z-[80] -translate-x-1/2 sm:bottom-[155px]"
            >
              <RSVPButton onClick={() => setRsvpOpen(true)} />
            </motion.div>

            <div className="relative z-40 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 text-center sm:px-6">
              <motion.p
                style={{ opacity: introOpacity }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="mb-4 text-[0.56rem] uppercase tracking-[0.32em] text-[#5f6f86] sm:mb-6 sm:text-xs sm:tracking-[0.5em]"
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
                  className={`${dancingScript.className} text-[3.35rem] font-semibold leading-[1.16] tracking-normal min-[390px]:text-[3.85rem] sm:text-8xl md:text-9xl`}
                >
                  <span className="luxury-name-glow text-[#243b5a]">
                    Joseph
                    <span className="mx-2 text-[#9c8261] sm:mx-4">&</span>
                    Taiwo
                  </span>
                </h1>
              </motion.div>

              <motion.div
                style={{ opacity: dividerOpacity }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1.2, delay: 0.35 }}
                className="mt-5 h-px w-36 origin-center bg-gradient-to-r from-transparent via-[#c9a76b] to-transparent sm:mt-7 sm:w-48"
              />

              <motion.p
                style={{ opacity: inviteOpacity }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.45 }}
                className="mt-6 text-lg font-medium text-[#4d5f78] sm:mt-8 sm:text-2xl md:text-3xl"
              >
                Invite you to celebrate their wedding
              </motion.p>

              <motion.div
                style={{
                  opacity: polaroidOpacity,
                  y: polaroidY,
                  scale: polaroidScale,
                }}
                className="absolute left-1/2 top-[58%] z-50 -translate-x-1/2 -translate-y-1/2 sm:top-[55%] md:top-[54%]"
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
                className="mt-5 flex origin-center flex-col items-center gap-2 sm:gap-3"
              >
                <p className="text-[0.65rem] uppercase tracking-[0.32em] text-[#314a6d] sm:text-base sm:tracking-[0.5em] md:text-xl">
                  12 December 2026
                </p>

                <p className="max-w-[92vw] text-sm tracking-[0.1em] text-[#243b5a] min-[390px]:text-base sm:text-xl sm:tracking-[0.2em] md:text-3xl">
                  St Hilda Parish Church × Silver Lakes Farm Hotel · Pretoria
                </p>

                <div className="mt-3 flex items-center gap-3 text-[#c9a76b] sm:mt-5 sm:gap-4">
                  <span className="h-px w-12 bg-[#c9a76b]/60 sm:w-20" />
                  <span className="text-lg sm:text-xl">❦</span>
                  <span className="h-px w-12 bg-[#c9a76b]/60 sm:w-20" />
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
        </div>

        <section className="relative z-50 bg-[#f3e7d6] px-4 pb-10 pt-8 sm:pt-14">
          <DressCodeSection />
        </section>

        <section className="relative z-50 bg-[#f3e7d6] px-4 py-12 sm:py-20">
          <OrderOfDaySection />
        </section>
      </section>
    </>
  );
}

export default function Home() {
  return <HeroSection />;
}