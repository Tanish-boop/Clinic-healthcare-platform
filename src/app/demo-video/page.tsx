"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  ExternalLink,
  Sparkles,
  Shield,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface TourScene {
  id: number;
  title: string;
  badge: string;
  url: string;
  displayUrl: string;
  timing: string;
  narration: string;
  personalizationPoints: string[];
}

export default function DemoVideoPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [viewMode, setViewMode] = useState<"MOBILE" | "DESKTOP">("DESKTOP");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const scenes: TourScene[] = [
    {
      id: 0,
      title: "Clinic Homepage & Brand Identity",
      badge: "Real Website Overview",
      url: "/",
      displayUrl: "https://yourclinicname.com",
      timing: "00:00 - 00:30",
      narration:
        "Hello Doctor! Welcome to your clinic's modern digital website. When patients visit your website on their phone or laptop, they see your clinic branding, your photos, your degrees, and transparent patient reviews. Everything you see here is customized for your clinic: your logo, your Somwar Peth address, consultation hours, and your direct WhatsApp helpline.",
      personalizationPoints: [
        "Your Clinic Name & Logo",
        "Your Doctor Photos & Degrees (BDS, MDS, MBBS, MD)",
        "Clinic Address, GPS Google Maps & Timings",
        "Direct WhatsApp & Helpline Number",
      ],
    },
    {
      id: 1,
      title: "30-Second Online Appointment Booking",
      badge: "Live Booking Wizard",
      url: "/book",
      displayUrl: "https://yourclinicname.com/book",
      timing: "00:30 - 01:00",
      narration:
        "Booking an appointment is completely friction-free and takes only thirty seconds. Patients pick your name, choose their dental or skin treatment, and pick an available date and time slot. When they confirm, the system generates an official hospital pass and token number, eliminating waiting room confusion.",
      personalizationPoints: [
        "Your Available Working Days & Time Slots",
        "Your Consultation Fees (e.g. ₹500 - ₹1,500)",
        "Your Specific Dental & Dermatology Treatments",
        "Instant Token Reference Code for Patients",
      ],
    },
    {
      id: 2,
      title: "Doctor & Staff Workspace Login (with Demos)",
      badge: "Fast-Fill Demo Profiles",
      url: "/login",
      displayUrl: "https://yourclinicname.com/login",
      timing: "01:00 - 01:30",
      narration:
        "For your clinic operations, this is the secure workspace portal. You and your staff can log in with a single tap using the dark Demo Profiles box to test immediately, or sign in to your real clinic account. Doctors see only their own clinical queue, while receptionists see the entire front-desk token queue.",
      personalizationPoints: [
        "Private Accounts for Each Doctor & Receptionist",
        "Role-based Access Control (Doctors only see their patients)",
        "Single-click Test Profiles for Instant Staff Training",
      ],
    },
    {
      id: 3,
      title: "Patient Digital Portal & Prescriptions",
      badge: "Patient Self-Service",
      url: "/portal",
      displayUrl: "https://yourclinicname.com/portal",
      timing: "01:30 - 02:00",
      narration:
        "Patients also get their own digital health portal. They can view upcoming consultations, download their past digital prescriptions, review their doctor's dietary advice, and re-book follow-ups online without calling your front desk repeatedly.",
      personalizationPoints: [
        "Digitally Signed Doctor Prescriptions (PDF & Print)",
        "Official Clinic Stamp & NMC License Registration",
        "Zero Paperwork & Effortless Patient Records",
      ],
    },
    {
      id: 4,
      title: "Local Google SEO Specialist Landing Pages",
      badge: "Google Search Ranking",
      url: "/dentist-in-pune",
      displayUrl: "https://yourclinicname.com/dentist-in-pune",
      timing: "02:00 - 02:30",
      narration:
        "To bring new patients to your clinic, we have built-in dedicated local Google SEO pages. When patients in Pune search for 'Best Dentist in Somwar Peth' or 'Painless Root Canal', these optimized pages help your clinic rank on Google search and Google Maps without paying for expensive ads.",
      personalizationPoints: [
        "Rank for 'Dentist in [Your Area]' & 'Skin Doctor in [Your Area]'",
        "Google Maps GPS Coordinates Embedded",
        "Schema.org Medical Verification for Google Trust",
      ],
    },
    {
      id: 5,
      title: "Clinic Policies, Hygiene & Pricing Transparency",
      badge: "Patient Trust & Policies",
      url: "/policies",
      displayUrl: "https://yourclinicname.com/policies",
      timing: "02:30 - 03:00",
      narration:
        "Finally, your website builds deep clinical trust. It clearly showcases your Class-B sterilization protocols, transparent pricing, cancellation policies, and patient privacy standards. This reassures patients before they even step into your operatory suite.",
      personalizationPoints: [
        "Your Clinic Hygiene & Autoclave Protocols",
        "Transparent Consultation Fee Schedules",
        "Custom Domain Name (e.g. www.apexdental.in)",
      ],
    },
  ];

  // Load and filter human female voices
  useEffect(() => {
    function loadVoices() {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const allVoices = window.speechSynthesis.getVoices();

      // Find natural female English voices
      const femaleVoices = allVoices.filter((v) => {
        const name = v.name.toLowerCase();
        const isEng = v.lang.startsWith("en");
        const isFemale =
          name.includes("female") ||
          name.includes("zira") ||
          name.includes("samantha") ||
          name.includes("victoria") ||
          name.includes("karen") ||
          name.includes("jenny") ||
          name.includes("sonia") ||
          name.includes("natural") ||
          name.includes("google uk english female") ||
          name.includes("google us english");
        return isEng && (isFemale || true);
      });

      const list = femaleVoices.length > 0 ? femaleVoices : allVoices.filter((v) => v.lang.startsWith("en"));
      setAvailableVoices(list);

      // Select default female voice
      const preferred = list.find((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes("female") ||
          name.includes("zira") ||
          name.includes("samantha") ||
          name.includes("natural")
        );
      });
      if (preferred) {
        setSelectedVoiceName(preferred.name);
      } else if (list[0]) {
        setSelectedVoiceName(list[0].name);
      }
    }

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Voice narration function (Humanized Female Voice)
  function speakCurrentScene(sceneIndex: number) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (isMuted) return;

    const scene = scenes[sceneIndex];
    const utterance = new SpeechSynthesisUtterance(scene.narration);
    
    // Humanized female speech parameters: warm pitch & calm, natural cadence
    utterance.rate = 0.93;
    utterance.pitch = 1.08;

    if (selectedVoiceName) {
      const voice = availableVoices.find((v) => v.name === selectedVoiceName);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-advance scene if in continuous playback mode
      if (isPlaying && sceneIndex < scenes.length - 1) {
        setTimeout(() => {
          if (isPlaying) {
            const nextIdx = sceneIndex + 1;
            setCurrentScene(nextIdx);
            speakCurrentScene(nextIdx);
          }
        }, 1200);
      } else if (sceneIndex >= scenes.length - 1) {
        setIsPlaying(false);
      }
    };

    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  function togglePlay() {
    if (isPlaying) {
      setIsPlaying(false);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } else {
      setIsPlaying(true);
      speakCurrentScene(currentScene);
    }
  }

  function handleSelectScene(idx: number) {
    setCurrentScene(idx);
    if (isPlaying) {
      speakCurrentScene(idx);
    }
  }

  function handleNext() {
    if (currentScene < scenes.length - 1) {
      const nextIdx = currentScene + 1;
      setCurrentScene(nextIdx);
      if (isPlaying) speakCurrentScene(nextIdx);
    }
  }

  function handlePrev() {
    if (currentScene > 0) {
      const prevIdx = currentScene - 1;
      setCurrentScene(prevIdx);
      if (isPlaying) speakCurrentScene(prevIdx);
    }
  }

  function toggleMute() {
    if (isMuted) {
      setIsMuted(false);
      if (isPlaying) speakCurrentScene(currentScene);
    } else {
      setIsMuted(true);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  }

  const activeScene = scenes[currentScene];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & VIDEO CONTROLS                                */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-teal-400 hover:text-teal-300 font-extrabold text-sm transition">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline text-white">Apex Dental & Aesthetic Lounge</span>
          </Link>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-emerald-400 animate-ping" : "bg-teal-500"}`} />
              <span>{isSpeaking ? "Narrator: Speaking (Female Voice)" : "Doctor Video Walkthrough"}</span>
            </span>
          </div>
        </div>

        {/* Voice Selector & Device Switcher */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Female Voice Selector Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Voice:</span>
            <select
              value={selectedVoiceName}
              onChange={(e) => {
                setSelectedVoiceName(e.target.value);
                if (isPlaying) {
                  window.speechSynthesis.cancel();
                  setTimeout(() => speakCurrentScene(currentScene), 200);
                }
              }}
              className="bg-transparent text-teal-300 text-xs font-semibold outline-none cursor-pointer max-w-[180px] truncate"
            >
              {availableVoices.map((v) => (
                <option key={v.name} value={v.name} className="bg-slate-900 text-white">
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle (Mobile Screen vs Laptop Screen) */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("DESKTOP")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === "DESKTOP" ? "bg-teal-700 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Laptop View</span>
            </button>
            <button
              onClick={() => setViewMode("MOBILE")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === "MOBILE" ? "bg-teal-700 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone</span>
            </button>
          </div>

          {/* Direct Live Website Link */}
          <a
            href={activeScene.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition"
            title="Open this real page in full tab"
          >
            <span>Open Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
          </a>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN SPLIT STAGE: REAL LIVE WEBSITE + VOICE NARRATOR PANEL */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left: The Real Live Deployed Website (in Phone or Laptop Frame) */}
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
          
          {/* Simulated Browser Frame Bar */}
          <div
            className={`w-full transition-all duration-300 ${
              viewMode === "MOBILE" ? "max-w-[420px]" : "max-w-6xl"
            } bg-slate-900 border border-slate-800 rounded-t-2xl px-4 py-2 flex items-center justify-between text-xs`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-4 py-0.5 rounded-full text-slate-300 text-[11px] font-mono max-w-[260px] sm:max-w-md truncate">
              <span className="text-emerald-400">🔒</span>
              <span>{activeScene.displayUrl}</span>
            </div>

            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
              title="Refresh Page Preview"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* The Actual Real Deployed Website Iframe */}
          <div
            className={`w-full transition-all duration-300 ${
              viewMode === "MOBILE"
                ? "max-w-[420px] h-[640px] sm:h-[720px] border-4 border-slate-800 rounded-b-3xl shadow-2xl"
                : "max-w-6xl h-[620px] lg:h-[740px] border border-t-0 border-slate-800 rounded-b-2xl shadow-xl"
            } bg-white overflow-hidden relative`}
          >
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={activeScene.url}
              title={activeScene.title}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>

        {/* Right: Doctor Teaching & Personalization Guide Panel */}
        <aside className="w-full lg:w-[420px] bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 lg:p-6 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-5">
            {/* Scene Badge & Title */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-400 font-mono">
                  Scene {currentScene + 1} of {scenes.length}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {activeScene.timing}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1 leading-snug">
                {activeScene.title}
              </h2>
            </div>

            {/* Voiceover Captions Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 relative shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span>Female Narrator Voiceover</span>
                </span>
                {isSpeaking && (
                  <div className="flex items-end gap-1 h-3.5">
                    <span className="w-1 bg-teal-400 animate-bounce h-2 rounded-full" />
                    <span className="w-1 bg-teal-400 animate-bounce h-3.5 rounded-full [animation-delay:0.15s]" />
                    <span className="w-1 bg-teal-400 animate-bounce h-2.5 rounded-full [animation-delay:0.3s]" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                &ldquo;{activeScene.narration}&rdquo;
              </p>
            </div>

            {/* What Gets Personalized for Your Clinic */}
            <div className="bg-teal-950/40 border border-teal-800/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-teal-300 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>What We Personalize for You:</span>
              </div>
              <ul className="space-y-1.5">
                {activeScene.personalizationPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-200 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scene Selector Steps */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Jump to Scene:
              </span>
              <div className="space-y-1.5">
                {scenes.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectScene(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                      currentScene === idx
                        ? "bg-teal-700 text-white font-bold shadow-xs"
                        : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    }`}
                  >
                    <span className="truncate">
                      {idx + 1}. {s.title}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${currentScene === idx ? "text-white" : "text-slate-500"}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* 3. BOTTOM AUDIO & PLAYBACK CONTROLLER                       */}
          {/* ----------------------------------------------------------- */}
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handlePrev}
                disabled={currentScene === 0}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition cursor-pointer"
                title="Previous Scene"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? "Pause Tour" : "Play Guided Voice Tour"}</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentScene === scenes.length - 1}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition cursor-pointer"
                title="Next Scene"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={toggleMute}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title={isMuted ? "Unmute Voice" : "Mute Voice"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
              </button>
            </div>

            <div className="text-center">
              <p className="text-[11px] text-slate-400">
                You can click, scroll, and interact with the real website inside the screen while the voice speaks!
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
