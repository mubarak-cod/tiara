"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

type PhotoSlide = {
  src: string;
  caption: string;
  note: string;
  glow: string;
};

type VideoMemory = {
  title: string;
  year: string;
  description: string;
  poster: string; // legacy gradient or color fallback
  src?: string; // local video source
  posterImage?: string; // optional poster image path
};

type TimelineEvent = {
  title: string;
  text: string;
  side: "left" | "right";
};

type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

type CursorMode = "default" | "button" | "memory" | "video" | "letter" | "interactive";

const cursorMessages = [
  "You are loved ❤️",
  "Happy Birthday Tiara ✨",
  "Kamal loves you ❤️",
  "My favorite person.",
];

const gallerySlides: PhotoSlide[] = [
  {
    src: "/protrait.jpg",
    caption: "Her smile that started it all.",
    note: "The first frame of forever.",
    glow: "rgba(255, 111, 181, 0.45)",
  },
  {
    src: "/two.jpg",
    caption: "The prettiest girl in every room.",
    note: "She changes the energy in seconds.",
    glow: "rgba(201, 182, 255, 0.44)",
  },
  {
    src: "/three.jpg",
    caption: "My favorite notification.",
    note: "A message from her always felt like light.",
    glow: "rgba(230, 184, 122, 0.38)",
  },
  {
    src: "/four.jpg",
    caption: "The reason today feels special.",
    note: "Everything becomes softer when she’s around.",
    glow: "rgba(255, 255, 255, 0.24)",
  },
];

const reasons = [
  "Your smile changes the weather.",
  "Your kindness feels rare and real.",
  "Your laugh makes silence feel jealous.",
  "Your strength is quietly unstoppable.",
  "Your heart makes people stay.",
  "Your energy makes ordinary days glow.",
  "Your voice can calm a whole storm.",
  "Your presence feels like home.",
  "Your honesty makes love deeper.",
  "You make Kamal feel lucky every day.",
];

const videoMemories: VideoMemory[] = [
  {
    title: "Sunset Calls",
    year: "2025",
    description: "The kind of calls that stretch late into the night.",
    poster: "linear-gradient(135deg, rgba(255,111,181,0.30), rgba(73,34,115,0.88))",
    src: "/vid1.mp4",
    posterImage: "/three.jpg",
  },
  {
    title: "Quiet Laughs",
    year: "2025",
    description: "Little moments that felt like the whole world paused.",
    poster: "linear-gradient(135deg, rgba(201,182,255,0.34), rgba(20,12,34,0.88))",
    src: "/vid2.mp4",
    posterImage: "/two.jpg",
  },
  {
    title: "Soft Sundays",
    year: "2026",
    description: "The memories that always come back warm.",
    poster: "linear-gradient(135deg, rgba(230,184,122,0.35), rgba(44,18,59,0.9))",
    src: "/vid3.mp4",
    posterImage: "/four.jpg",
  },
];

const timeline: TimelineEvent[] = [
  { title: "First Conversation", text: "The first spark. The first reason to smile more.", side: "left" },
  { title: "First Call", text: "A voice that turned into comfort.", side: "right" },
  { title: "First Date", text: "A memory with enough warmth to replay forever.", side: "left" },
  { title: "Favorite Memory", text: "The moment Kamal realized this was real.", side: "right" },
  { title: "Today ❤️", text: "Still here. Still grateful. Still in love.", side: "left" },
];

const letters = [
  { title: "I still smile thinking about that day.", message: "Every time I remember us, it feels like a soft movie scene I never want to end." },
  { title: "You make life easier.", message: "Not because life is simple, but because you make love feel steady." },
  { title: "Thank you for being you.", message: "You don’t have to try to be magical. You already are." },
];

const adventures = [
  { icon: "✈️", title: "Travel Together", text: "Collect cities, sunsets, and stories." },
  { icon: "🌅", title: "Watch More Sunsets", text: "Because every sky looks better with you in it." },
  { icon: "🍕", title: "More Food Dates", text: "Late-night bites, sweet laughs, and shared plates." },
  { icon: "🎂", title: "More Birthdays", text: "One celebration after another, together." },
];

const surpriseLines = [
  "Tiara",
  "I don't know what tomorrow brings...",
  "But I know I want more tomorrows with you.",
  "Happy Birthday ❤️",
];

const wishWords = ["Beautiful.", "Amazing.", "Kind.", "Strong.", "Funny.", "Smart.", "Lovely."];

const COUNTDOWN_STORAGE_KEY = "tiara-birthday-countdown-target";

function getNextJuneEleventh(now = new Date()) {
  const target = new Date(now.getFullYear(), 5, 11, 0, 0, 0, 0);

  if (now > target) {
    return new Date(now.getFullYear() + 1, 5, 11, 0, 0, 0, 0);
  }

  return target;
}

function formatCountdown(targetTime: number): CountdownParts {
  const distance = Math.max(0, targetTime - Date.now());
  const totalSeconds = Math.floor(distance / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

function SectionTitle({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-3xl">
      <div className="text-[11px] uppercase tracking-[0.5em] text-white/45">{kicker}</div>
      <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">{subtitle}</p>
    </div>
  );
}

function Sparkles({ seed = 0 }: { seed?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 12 }).map((_, index) => {
        const left = (seed * 17 + index * 13) % 100;
        const top = (seed * 23 + index * 9) % 100;
        const size = 5 + (index % 3) * 2;
        return <span key={`${seed}-${index}`} className="sparkle" style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${index * 0.12}s` }} />;
      })}
      {Array.from({ length: 6 }).map((_, index) => (
        <span key={`heart-${seed}-${index}`} className="absolute heart heart-floating opacity-70" style={{ left: `${10 + index * 15}%`, top: `${15 + (index % 2) * 16}%`, animationDelay: `${index * 0.15}s` }} />
      ))}
    </div>
  );
}

function GradientFallback({ slide }: { slide: PhotoSlide }) {
  return (
    <div
      className="absolute inset-0 flex flex-col justify-end overflow-hidden rounded-[2rem]"
      style={{ background: `radial-gradient(circle at top left, ${slide.glow}, transparent 42%), linear-gradient(135deg, rgba(20,10,30,0.95), rgba(67,21,94,0.85))` }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_25%)]" />
      <div className="absolute inset-0 border border-white/10" />
      <div className="relative z-10 p-6 sm:p-7">
        <div className="text-[11px] uppercase tracking-[0.45em] text-white/50">memory frame</div>
        <div className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">{slide.caption}</div>
        <div className="mt-3 max-w-md text-sm text-white/75 sm:text-base">{slide.note}</div>
      </div>
    </div>
  );
}

function SlideFrame({ slide, broken, onError }: { slide: PhotoSlide; broken: boolean; onError: () => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
      {!broken ? (
        <Image src={slide.src} alt={slide.caption} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" onError={onError} priority={false} />
      ) : (
        <GradientFallback slide={slide} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#120816] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_38%)]" />
    </div>
  );
}

function PremiumLoveCursor() {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const cursorX = useMotionValue(-120);
  const cursorY = useMotionValue(-120);
  const cursorScale = useSpring(1, { stiffness: 260, damping: 24, mass: 0.35 });
  const cursorRotation = useSpring(0, { stiffness: 220, damping: 28, mass: 0.3 });
  const [mode, setMode] = useState<CursorMode>("default");
  const [label, setLabel] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [clickPulse, setClickPulse] = useState(0);
  const [visible, setVisible] = useState(false);
  const stillTimer = useRef<number | null>(null);
  const hideMessageTimer = useRef<number | null>(null);
  const lastMode = useRef<CursorMode>("default");
  const modeRef = useRef<CursorMode>("default");
  const lastSpawn = useRef(0);
  const lastPosition = useRef({ x: 0, y: 0 });
  const particleId = useRef(0);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;

    const body = document.body;
    body.classList.add("love-cursor-enabled");

    const interactiveSelector =
      "button, a, [role='button'], [data-love-cursor], [data-love-reactive]";
    const identityMap: Array<[string, CursorMode, string]> = [
      ["button", "button", "Open"],
      ["memory", "memory", "View Memory"],
      ["video", "video", "Play Memory"],
      ["letter", "letter", "Open"],
      ["interactive", "interactive", "Open"],
    ];

    const clearTimers = () => {
      if (stillTimer.current) window.clearTimeout(stillTimer.current);
      if (hideMessageTimer.current) window.clearTimeout(hideMessageTimer.current);
    };

    const spawnParticle = (x: number, y: number, kind: "heart" | "sparkle" | "star", strength = 1) => {
      const layer = layerRef.current;
      if (!layer) return;

      const particle = document.createElement("span");
      const id = particleId.current + 1;
      particleId.current = id;

      const size = kind === "heart" ? 9 + Math.random() * 6 : kind === "sparkle" ? 5 + Math.random() * 4 : 4 + Math.random() * 3;
      const driftX = (Math.random() - 0.5) * 64 * strength;
      const driftY = -18 - Math.random() * 48 * strength;
      const rotation = (Math.random() - 0.5) * 50;
      const symbol = kind === "heart" ? "❤" : kind === "sparkle" ? "✦" : "⋆";

      particle.className = `love-cursor-particle love-cursor-${kind}`;
      particle.textContent = symbol;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.setProperty("--drift-x", `${driftX}px`);
      particle.style.setProperty("--drift-y", `${driftY}px`);
      particle.style.setProperty("--spin", `${rotation}deg`);
      particle.style.animationDelay = `${Math.random() * 60}ms`;
      layer.appendChild(particle);

      window.setTimeout(() => particle.remove(), 1200);
    };

    const burst = (x: number, y: number, kind: CursorMode, intensity = 1) => {
      const palette: Array<"heart" | "sparkle" | "star"> = kind === "video" ? ["sparkle", "star", "sparkle"] : kind === "letter" ? ["heart", "sparkle", "heart"] : ["heart", "sparkle", "star"];
      palette.forEach((particleKind, index) => {
        window.setTimeout(() => spawnParticle(x, y, particleKind, intensity), index * 20);
      });
    };

    const updateReactiveElements = (x: number, y: number) => {
      const elements = document.querySelectorAll<HTMLElement>("[data-love-reactive]");
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance > 150) {
          gsap.to(element, { x: 0, y: 0, scale: 1, duration: 0.7, ease: "power3.out" });
          return;
        }

        const pull = (1 - distance / 150) * 9;
        gsap.to(element, {
          x: deltaX * 0.04,
          y: deltaY * 0.04,
          scale: 1 + pull * 0.007,
          duration: 0.45,
          ease: "power3.out",
        });
      });
    };

    const setCursorMode = (nextMode: CursorMode, nextLabel: string | null, x: number, y: number) => {
      setVisible(true);
      setMode(nextMode);
      setLabel(nextLabel);

      if (nextMode !== lastMode.current) {
        if (nextMode === "button") {
          cursorScale.set(1.16);
          burst(x, y, nextMode, 1);
        }
        if (nextMode === "memory" || nextMode === "video" || nextMode === "letter") {
          burst(x, y, nextMode, 1.2);
        }
        lastMode.current = nextMode;
        modeRef.current = nextMode;
      }
    };

    const onMove = (event: MouseEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      const now = performance.now();

      cursorX.set(x);
      cursorY.set(y);
      cursorRotation.set(Math.max(-10, Math.min(10, (x - lastPosition.current.x) * 0.08)));
      setVisible(true);
      updateReactiveElements(x, y);

      if (now - lastSpawn.current > 54) {
        const distance = Math.hypot(x - lastPosition.current.x, y - lastPosition.current.y);
        const kind = distance > 26 ? (Math.random() > 0.55 ? "sparkle" : Math.random() > 0.5 ? "heart" : "star") : "sparkle";
        spawnParticle(x, y, kind, 1);
        lastSpawn.current = now;
      }

      lastPosition.current = { x, y };

      const target = document.elementFromPoint(x, y)?.closest(interactiveSelector) as HTMLElement | null;
      if (target) {
        const explicitMode = target.getAttribute("data-love-cursor");
        const cursorEntry = identityMap.find(([token]) => explicitMode === token) ?? ["interactive", "interactive", "Open"];
        const nextMode = cursorEntry[1];
        const nextLabel = cursorEntry[2];
        setCursorMode(nextMode, nextLabel, x, y);
      } else {
        setCursorMode("default", null, x, y);
      }

      clearTimers();
      stillTimer.current = window.setTimeout(() => {
        const chosen = cursorMessages[Math.floor(Math.random() * cursorMessages.length)];
        setMessage(chosen);
        hideMessageTimer.current = window.setTimeout(() => setMessage(null), 2600);
      }, 3000);
    };

    const onDown = () => {
      cursorScale.set(1.24);
      setClickPulse((value) => value + 1);
      burst(lastPosition.current.x, lastPosition.current.y, modeRef.current, 1.25);
    };

    const onUp = () => {
      cursorScale.set(mode === "button" ? 1.12 : 1);
    };

    const onLeave = () => {
      setVisible(false);
      setLabel(null);
      setMessage(null);
      setMode("default");
      lastMode.current = "default";
      modeRef.current = "default";
      cursorScale.set(1);
      cursorRotation.set(0);
      document.querySelectorAll<HTMLElement>("[data-love-reactive]").forEach((element) => {
        gsap.to(element, { x: 0, y: 0, scale: 1, duration: 0.7, ease: "power3.out" });
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseleave", onLeave);
      body.classList.remove("love-cursor-enabled");
      clearTimers();
      document.querySelectorAll<HTMLElement>("[data-love-reactive]").forEach((element) => {
        gsap.killTweensOf(element);
        element.style.transform = "";
      });
    };
  }, [cursorRotation, cursorScale]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] hidden md:block">
      <motion.div
        className="love-cursor-shell"
        style={{ x: cursorX, y: cursorY, scale: cursorScale, rotate: cursorRotation, opacity: visible ? 1 : 0 }}
      >
        <div className={`love-cursor-core ${mode === "video" ? "love-cursor-core-video" : mode === "letter" ? "love-cursor-core-letter" : mode === "memory" ? "love-cursor-core-memory" : mode === "button" ? "love-cursor-core-button" : ""}`}>
          <motion.span
            key={`ring-${clickPulse}`}
            className="love-cursor-ring"
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.span
            key={`${mode}-${clickPulse}`}
            className="love-cursor-heart-glyph"
            initial={{ scale: 0.92, opacity: 0.9 }}
            animate={mode === "button" ? { scale: [1, 1.18, 1], opacity: [0.94, 1, 0.94] } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {mode === "video" ? "▶" : mode === "letter" ? "✉" : "❤"}
          </motion.span>
          <span className="love-cursor-glow" />
        </div>

        <AnimatePresence>
          {label ? (
            <motion.span
              initial={{ opacity: 0, x: 10, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.96 }}
              className="love-cursor-label"
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {message ? (
            <motion.span
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              className="love-cursor-message"
            >
              {message}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <div ref={layerRef} className="love-cursor-particles" />
    </div>
  );
}

export default function Journey() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroCardRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentMemory, setCurrentMemory] = useState(0);
  const [slideErrors, setSlideErrors] = useState<boolean[]>(() => gallerySlides.map(() => false));
  const [showLoveNote, setShowLoveNote] = useState(false);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [openLetter, setOpenLetter] = useState<number | null>(null);
  const [surpriseStep, setSurpriseStep] = useState(0);
  const [confettiSeed, setConfettiSeed] = useState(0);
  const [countdown, setCountdown] = useState<CountdownParts>({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  const [isBirthdayToday, setIsBirthdayToday] = useState(false);
  const activeSlide = gallerySlides[currentSlide];

  const memoryCaption = useMemo(() => gallerySlides[currentMemory].caption, [currentMemory]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTarget = window.localStorage.getItem(COUNTDOWN_STORAGE_KEY);
    const parsedTarget = storedTarget ? Number(storedTarget) : Number.NaN;
    const nextJuneEleventh = getNextJuneEleventh().getTime();
    const targetTime = Number.isFinite(parsedTarget) && parsedTarget > Date.now() ? parsedTarget : nextJuneEleventh;
    const birthdayDate = new Date(targetTime);

    window.localStorage.setItem(COUNTDOWN_STORAGE_KEY, String(targetTime));

    const syncCountdown = () => {
      const now = new Date();
      const isSameBirthdayMonth = now.getMonth() === birthdayDate.getMonth();
      const isSameBirthdayDay = now.getDate() === birthdayDate.getDate();
      const isBirthday = isSameBirthdayMonth && isSameBirthdayDay;

      setIsBirthdayToday(isBirthday);

      if (isBirthday) {
        setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      setCountdown(formatCountdown(targetTime));
    };

    syncCountdown();

    const timer = window.setInterval(() => {
      syncCountdown();
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const LenisCtor = Lenis as unknown as new (options: { duration: number; wheelMultiplier: number; smoothWheel?: boolean }) => { raf: (time: number) => void; destroy: () => void };
    const lenis = new LenisCtor({ duration: 1.1, wheelMultiplier: 1.1, smoothWheel: true });
    let frameId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((value) => (value + 1) % gallerySlides.length);
      setCurrentMemory((value) => (value + 1) % gallerySlides.length);
      setConfettiSeed((value) => value + 1);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 80, opacity: 0, filter: "blur(14px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 82%",
              end: "bottom 60%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.to(".timeline-line", {
        scaleY: 1,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: {
          trigger: "#timeline-section",
          start: "top center",
          end: "bottom center",
          scrub: 1,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const heroCard = heroCardRef.current;
    if (!heroCard) return;

    const handleMove = (event: MouseEvent) => {
      const rect = heroCard.getBoundingClientRect();
      const px = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const py = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      gsap.to(heroCard, { rotationY: px * 8, rotationX: -py * 7, duration: 0.55, ease: "power3.out" });
    };

    const reset = () => gsap.to(heroCard, { rotationX: 0, rotationY: 0, duration: 0.8, ease: "power3.out" });

    heroCard.addEventListener("mousemove", handleMove);
    heroCard.addEventListener("mouseleave", reset);
    return () => {
      heroCard.removeEventListener("mousemove", handleMove);
      heroCard.removeEventListener("mouseleave", reset);
    };
  }, []);

  useEffect(() => {
    if (!showLoveNote) return;
    const timer = window.setInterval(() => setSurpriseStep((value) => (value + 1) % surpriseLines.length), 2600);
    const timeout = window.setTimeout(() => setShowLoveNote(false), 6500);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(timeout);
    };
  }, [showLoveNote]);

  const handleRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    circle.className = "ripple-dot";
    circle.style.width = `${diameter}px`;
    circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top}px`;
    const existing = button.getElementsByClassName("ripple-dot")[0];
    if (existing) existing.remove();
    button.appendChild(circle);
  };

  const launchConfetti = () => {
    const container = document.createElement("div");
    container.className = "confetti-container";
    const parent = rootRef.current ?? document.body;
    for (let index = 0; index < 42; index += 1) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * 0.6}s`;
      piece.style.background = ["#ff6fb5", "#c9b6ff", "#ffd6e8", "#e6b87a", "#ffffff"][index % 5];
      container.appendChild(piece);
    }
    parent.appendChild(container);
    window.setTimeout(() => container.remove(), 4600);
  };

  const startSurprise = async () => {
    setShowLoveNote(true);
    setConfettiSeed((value) => value + 1);
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.currentTime = 0;
        await audio.play();
        setIsPlayingSong(true);
      } catch {
        setIsPlayingSong(false);
      }
    }
    launchConfetti();
    document.getElementById("surprise-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleSong = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlayingSong) {
      audio.pause();
      setIsPlayingSong(false);
      return;
    }
    try {
      await audio.play();
      setIsPlayingSong(true);
    } catch {
      setIsPlayingSong(false);
    }
  };

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-hidden bg-[#140716] text-white">
      <PremiumLoveCursor />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,111,181,0.2),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(201,182,255,0.18),transparent_28%),linear-gradient(180deg,#16051c_0%,#100410_100%)]" />
      <div className="absolute inset-0 noise" />

      <main className="relative z-10">
        <section className="min-h-screen px-6 pb-24 pt-8 sm:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 lg:flex-row lg:items-center lg:gap-10">
            <div className="flex-1" data-reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.45em] text-white/65 backdrop-blur-md">
                Tiara’s birthday story
              </div>

              <div className="mt-8 max-w-3xl space-y-5">
                <p className="text-lg uppercase tracking-[0.45em] text-white/55">Happy Birthday Beautiful ❤️</p>
                <h1 className="text-6xl font-semibold leading-[0.9] tracking-[-0.06em] sm:text-7xl lg:text-8xl xl:text-[8.5rem]">
                  <span className="block text-white/95">TIARA</span>
                  <span className="block bg-gradient-to-r from-[#ff8fc8] via-[#c9b6ff] to-white bg-clip-text text-transparent">The story Kamal keeps replaying.</span>
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/75 sm:text-lg">Out of billions of people, somehow you became my favorite place, favorite smile, favorite everything. This is not a webpage. It is a journey through the moments, the love, and the future I keep imagining with you.</p>
                <p className="text-sm uppercase tracking-[0.35em] text-white/50">— Love, Kamal</p>
              </div>

              <div className="mt-10 flex flex-wrap gap-4" data-reveal>
                <motion.button data-love-cursor="button" data-love-reactive onClick={startSurprise} onMouseDown={handleRipple} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.98 }} className="btn-white-premium ripple relative inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-medium shadow-2xl">
                  <span className="btn-border-animate" aria-hidden="true" />
                  Open Your Surprise ✨
                </motion.button>

                <motion.button data-love-cursor="button" data-love-reactive onClick={toggleSong} onMouseDown={handleRipple} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.98 }} className="btn-white-premium ripple relative inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-medium shadow-2xl">
                  <span className="btn-border-animate" aria-hidden="true" />
                  {isPlayingSong ? "Pause Our Song ⏸" : "Play Our Song 🎵"}
                </motion.button>

                <audio ref={audioRef} src="/our-song.mp3" preload="metadata" playsInline crossOrigin="anonymous" onEnded={() => setIsPlayingSong(false)} />
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:grid-cols-4" data-reveal>
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Minutes", value: countdown.minutes },
                  { label: "Seconds", value: countdown.seconds },
                ].map((item) => (
                  <div key={item.label} data-love-reactive className="rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-4 text-center">
                    <div className="text-3xl font-semibold text-white">{item.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.32em] text-white/55">{item.label}</div>
                  </div>
                ))}
              </div>

              {isBirthdayToday && (
                <div className="mt-4 rounded-[1.5rem] border border-[#ff8fc8]/30 bg-white/10 px-5 py-4 text-sm text-white/85 backdrop-blur-md">
                  Happy Birthday Tiara. Today is yours.
                </div>
              )}
            </div>

            <div className="flex-1 lg:max-w-2xl" data-reveal>
              <div ref={heroCardRef} data-love-cursor="memory" data-love-reactive className="relative mx-auto w-full max-w-2xl rounded-[2.25rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl transform-gpu">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.85rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: currentSlide % 2 === 0 ? 54 : -54, scale: 1.05, filter: "blur(12px)", rotate: currentSlide % 2 === 0 ? 2 : -2 }}
                      animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)", rotate: 0 }}
                      exit={{ opacity: 0, x: currentSlide % 2 === 0 ? -54 : 54, scale: 1.05, filter: "blur(16px)", rotate: currentSlide % 2 === 0 ? -2 : 2 }}
                      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      <SlideFrame slide={activeSlide} broken={slideErrors[currentSlide]} onError={() => setSlideErrors((value) => value.map((item, itemIndex) => (itemIndex === currentSlide ? true : item)))} />
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_20%,rgba(10,4,18,0.75)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-7">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.45em] text-white/55">Memory {currentSlide + 1}</div>
                        <motion.p key={`${currentSlide}-caption`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="mt-3 max-w-md text-2xl font-semibold leading-tight text-white sm:text-3xl">
                          {activeSlide.caption}
                        </motion.p>
                        <p className="mt-2 max-w-md text-sm text-white/75">{activeSlide.note}</p>
                      </div>
                      <div className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70 backdrop-blur-md">
                        {String(currentSlide + 1).padStart(2, "0")} / {gallerySlides.length}
                      </div>
                    </div>

                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div key={currentSlide} initial={{ width: "0%" }} animate={{ width: `${((currentSlide + 1) / gallerySlides.length) * 100}%` }} transition={{ duration: 3.7, ease: "linear" }} className="h-full rounded-full bg-gradient-to-r from-[#ff6fb5] via-[#c9b6ff] to-white" />
                    </div>
                  </div>

                  <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] opacity-70 blur-3xl transition-all duration-1000" style={{ boxShadow: `0 0 180px 50px ${activeSlide.glow}` }} />
                  <Sparkles seed={confettiSeed + currentSlide} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2" data-reveal>
                {gallerySlides.map((slide, index) => (
                  <button key={slide.caption} data-love-cursor="memory" data-love-reactive onClick={() => setCurrentSlide(index)} className={`group relative h-1.5 overflow-hidden rounded-full transition-all ${index === currentSlide ? "bg-white/85" : "bg-white/10"}`} aria-label={`Go to photo ${index + 1}`}>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#ff6fb5] via-[#c9b6ff] to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md" data-reveal>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.4em] text-white/45">Now showing</div>
                  <div className="mt-2 text-lg font-medium text-white">{memoryCaption}</div>
                </div>
                <div className="max-w-sm text-right text-sm text-white/70">The frame changes every 4 seconds, like Kamal is turning pages in the most personal story he knows.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 lg:px-16" data-reveal>
          <div className="mx-auto max-w-7xl">
            <SectionTitle kicker="Why she matters" title="Reasons why you're special" subtitle="Ten floating reasons, each one a small truth Kamal never gets tired of saying." />
            <div className="relative mt-12 rounded-[2.25rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,111,181,0.14),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(201,182,255,0.12),transparent_25%)]" />
              <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {reasons.map((reason, index) => (
                    <motion.div key={reason} data-love-reactive whileHover={{ y: -8, rotate: index % 2 === 0 ? 1.5 : -1.5, scale: 1.02 }} className="float-parallax group rounded-[1.5rem] border border-white/10 bg-black/20 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-md">
                    <div className="text-[11px] uppercase tracking-[0.45em] text-white/40">{String(index + 1).padStart(2, "0")}</div>
                    <p className="mt-4 text-lg leading-7 text-white/88">{reason}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 lg:px-16" data-reveal>
          <div className="mx-auto max-w-7xl">
            <SectionTitle kicker="Video memories" title="Moments I'll Never Forget" subtitle="Every memory here means something to me. Click any card and it opens like a little cinema window." />
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {videoMemories.map((memory, index) => (
                <motion.button key={memory.title} data-love-cursor="video" data-love-reactive onClick={() => setActiveVideo(index)} whileHover={{ y: -10, rotate: index % 2 === 0 ? 1 : -1 }} className="group relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/5 text-left shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={ memory.posterImage ? { background: `url(${memory.posterImage}) center/cover no-repeat` } : { background: memory.poster }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_25%),linear-gradient(180deg,transparent,rgba(5,3,8,0.9))]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="grid h-18 w-18 place-items-center rounded-full border border-white/30 bg-white/10 text-2xl text-white shadow-[0_0_30px_rgba(255,255,255,0.15)]">▶</motion.div>
                    </div>
                    <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.4em] text-white/75 backdrop-blur-md">{memory.year}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-white">{memory.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/70">{memory.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <section id="timeline-section" className="px-6 py-24 sm:px-10 lg:px-16" data-reveal>
          <div className="mx-auto max-w-6xl">
            <SectionTitle kicker="Timeline" title="Timeline of us" subtitle="A vertical line of memories that catches the light as it grows." />
            <div className="relative mt-16">
              <div className="timeline-line absolute left-1/2 top-0 h-full w-px origin-top scale-y-0 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
              <div className="space-y-10">
                {timeline.map((entry, index) => (
                  <div key={entry.title} className={`grid items-center gap-6 lg:grid-cols-2 ${entry.side === "left" ? "" : "lg:[&>div:first-child]:order-2"}`}>
                    <div className={`${entry.side === "left" ? "lg:pr-12" : "lg:pl-12 lg:order-2"}`}>
                      <motion.div data-love-reactive whileHover={{ scale: 1.01 }} className={`relative rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${index % 2 === 0 ? "lg:ml-auto" : ""}`}>
                        <div className="absolute -left-3 top-8 h-6 w-6 rounded-full border border-white/40 bg-[#ff6fb5] shadow-[0_0_24px_rgba(255,111,181,0.45)] lg:left-auto lg:-right-3" />
                        <div className="text-[11px] uppercase tracking-[0.45em] text-white/40">{String(index + 1).padStart(2, "0")}</div>
                        <h3 className="mt-4 text-2xl font-semibold text-white">{entry.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-white/72">{entry.text}</p>
                      </motion.div>
                    </div>
                    <div className="hidden lg:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 lg:px-16" data-reveal>
          <div className="mx-auto max-w-7xl">
            <SectionTitle kicker="Love letters" title="Floating love letters" subtitle="Click any envelope. The letter unfolds like a secret that wanted to be found." />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {letters.map((letter, index) => (
                <motion.button key={letter.title} data-love-cursor="letter" data-love-reactive whileHover={{ y: -8, rotate: index % 2 === 0 ? 1.5 : -1.5 }} onClick={() => setOpenLetter(openLetter === index ? null : index)} className="group relative min-h-[340px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-left backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.14),transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.18))]" />
                  <div className="absolute inset-x-8 top-8 h-28 rounded-[1.2rem] bg-gradient-to-r from-white/15 via-white/20 to-white/10 shadow-inner transition-transform duration-700 group-hover:-translate-y-1" />
                  <div className="relative z-10 mt-24 rounded-[1.35rem] border border-white/10 bg-[#f8ecff]/95 p-5 text-black shadow-[0_20px_70px_rgba(0,0,0,0.35)] transition-all duration-700">
                    <div className="text-[11px] uppercase tracking-[0.45em] text-black/40">Envelope {String(index + 1).padStart(2, "0")}</div>
                    <h3 className="mt-4 text-xl font-semibold">{letter.title}</h3>
                    <AnimatePresence>
                      {openLetter === index && (
                        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-4 text-sm leading-7 text-black/72">{letter.message}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative z-10 mt-5 text-xs uppercase tracking-[0.45em] text-white/55">Click to open</div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 lg:px-16" data-reveal>
          <div className="mx-auto max-w-7xl">
            <SectionTitle kicker="Words in motion" title="Birthday wishes wall" subtitle="Typography that feels like it is breathing. Some words drift, some rotate, some scale up as the scroll gets closer." />
            <div className="relative mt-12 overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,111,181,0.15),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(201,182,255,0.18),transparent_25%)]" />
              <div className="relative flex min-h-[420px] flex-wrap items-center justify-center gap-5 sm:gap-8">
                {wishWords.map((word, index) => (
                  <motion.span key={word} initial={{ opacity: 0, y: 40, rotate: index % 2 === 0 ? -8 : 8 }} whileInView={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? 4 : -4 }} viewport={{ once: false, amount: 0.6 }} transition={{ duration: 0.9, delay: index * 0.08 }} className={`text-4xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl ${index % 3 === 0 ? "text-white" : index % 3 === 1 ? "text-[#ffd6e8]" : "text-[#c9b6ff]"}`}>
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10 lg:px-16" data-reveal>
          <div className="mx-auto max-w-7xl">
            <SectionTitle kicker="Future" title="Future adventures" subtitle="Dream cards that feel like plans already waiting to happen." />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {adventures.map((item, index) => (
                <motion.div key={item.title} data-love-cursor="interactive" data-love-reactive whileHover={{ y: -10, scale: 1.02, rotateY: index % 2 === 0 ? 8 : -8 }} className="float-parallax transform-gpu rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                  <div className="text-4xl">{item.icon}</div>
                  <h3 className="mt-5 text-2xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/72">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="surprise-section" className="relative px-6 py-32 sm:px-10 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07),transparent_28%),linear-gradient(180deg,#09070d_0%,#050309_100%)]" />
          <div className="absolute inset-0 opacity-70">
            <Sparkles seed={confettiSeed + surpriseStep} />
          </div>
          <div className="relative mx-auto flex min-h-[540px] max-w-5xl flex-col items-center justify-center text-center">
            <div className="mb-8 h-px w-40 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <AnimatePresence mode="wait">
              <motion.h2 key={surpriseStep} initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1.1 }} className={`text-6xl font-semibold tracking-[-0.06em] sm:text-7xl lg:text-8xl ${surpriseStep === 0 ? "text-white" : "text-[#fff2fb]"}`}>
                {surpriseLines[surpriseStep]}
              </motion.h2>
            </AnimatePresence>
            <p className="mt-10 max-w-2xl text-lg leading-8 text-white/70">Slow, cinematic, and quiet on purpose. The kind of moment that asks the heart to pay attention.</p>
          </div>
        </section>

        <section className="relative min-h-screen px-6 pb-28 pt-24 sm:px-10 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,111,181,0.18),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(201,182,255,0.18),transparent_30%),linear-gradient(180deg,#0d0712_0%,#09060c_100%)]" />
          <div className="absolute inset-0 opacity-90">
            <Sparkles seed={confettiSeed + 30} />
          </div>
          <div className="relative mx-auto flex min-h-[760px] max-w-6xl flex-col items-center justify-center text-center">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="text-[11px] uppercase tracking-[0.5em] text-white/40">The ending that never ends</motion.div>
            <motion.h2 animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="mt-6 text-5xl font-semibold tracking-[-0.06em] text-white sm:text-7xl lg:text-[6.75rem]">Kamal <span className="text-[#ff8fc8]">❤️</span> Tiara</motion.h2>
            <p className="mt-6 text-xl text-white/75 sm:text-2xl">Forever my favorite person.</p>
            <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="mt-16 flex h-44 w-44 items-center justify-center rounded-full border border-white/15 bg-white/5 shadow-[0_0_120px_rgba(255,111,181,0.28)] backdrop-blur-2xl">
              <div className="heart relative h-10 w-10" />
            </motion.div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showLoveNote && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLoveNote(false)} />
            <motion.div initial={{ y: 18, scale: 0.98 }} animate={{ y: 0, scale: 1 }} className="relative z-10 max-w-xl rounded-[2rem] border border-white/10 bg-[#fffaf6] p-8 text-black shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
              <div className="text-[11px] uppercase tracking-[0.45em] text-black/40">Hidden love note</div>
              <h3 className="mt-4 text-3xl font-semibold">To my Tiara ❤️</h3>
              <AnimatePresence mode="wait">
                <motion.p key={surpriseStep} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5 text-lg leading-8 text-black/75">
                  {surpriseLines[surpriseStep] === "Tiara" ? "Tiara, you make ordinary days feel special. Thank you for existing. Happy Birthday, my love. — Kamal ❤️" : surpriseLines[surpriseStep]}
                </motion.p>
              </AnimatePresence>
              <div className="mt-7 flex justify-end">
                <button onClick={() => setShowLoveNote(false)} className="rounded-full bg-black px-5 py-3 text-sm text-white">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeVideo !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setActiveVideo(null)} />
            <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 10 }} className="relative z-10 w-[min(92vw,960px)] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0916] shadow-[0_40px_140px_rgba(0,0,0,0.65)]">
              <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative aspect-[16/10] bg-black">
                  <div className="relative h-full w-full">
                    {videoMemories[activeVideo].src ? (
                      <video
                        src={videoMemories[activeVideo].src}
                        className="h-full w-full object-cover"
                        playsInline
                        muted
                        autoPlay
                        controls
                        preload="metadata"
                        controlsList="nodownload noremoteplayback"
                        disablePictureInPicture
                      />
                    ) : (
                      <div className="relative h-full w-full" style={{ background: videoMemories[activeVideo].poster }}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_34%)]" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.4, repeat: Infinity }} className="grid h-20 w-20 place-items-center rounded-full border border-white/30 bg-white/10 text-3xl text-white">▶</motion.div>
                          <p className="mt-6 text-sm uppercase tracking-[0.45em] text-white/65">Video preview coming alive</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-between p-7 sm:p-9">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.45em] text-white/35">Moments I&apos;ll Never Forget</div>
                    <h3 className="mt-4 text-3xl font-semibold text-white">{videoMemories[activeVideo].title}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/70">{videoMemories[activeVideo].description}</p>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={() => setActiveVideo(null)} className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white">Close</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
