"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Phone,
  MessageCircle,
  MapPin,
  Star,
  ShieldCheck,
  Award,
  Sparkles,
  Clock,
  ExternalLink,
} from "lucide-react";
import { MobileDoctorSlideInfo } from "./MobileStickyBottomBar";

interface MobileHeroShowcaseProps {
  clinicName: string;
  phone: string;
  area: string;
  city: string;
}

export const CLINIC_SLIDES: (MobileDoctorSlideInfo & {
  label: string;
  title: string;
  subtitle: string;
  tagline: string;
  image: string;
  reg: string;
  statusBadge: string;
  feeNote: string;
  whatsappText: string;
})[] = [
  {
    id: "doctor-ananya",
    label: "👩‍⚕️ Dr. Ananya (MDS)",
    name: "Dr. Ananya Kulkarni, BDS, MDS",
    title: "Dr. Ananya Kulkarni, BDS, MDS",
    shortName: "Dr. Ananya Kulkarni (MDS)",
    nameSnippet: "Ananya",
    subtitle: "Chief Dental Surgeon & Oral Implantologist",
    tagline: "MUHS Gold Medalist • 14+ Years Clinical Experience",
    image: "/images/doctor-ananya.jpg",
    avatar: "/images/doctor-ananya.jpg",
    reg: "MDC Reg: A-28491",
    specialty: "Painless Root Canals & Cosmetic Dentistry",
    statusBadge: "Consulting In-Clinic Today",
    status: "Available In-Clinic Today",
    rating: "⭐ 4.9 (1,240+)",
    fee: "₹1,000",
    feeNote: "(Incl. RVG Digital X-Rays)",
    actionText: "Book Dr. Ananya",
    phone: "+91 97655 39107",
    whatsappText:
      "Hello Dr. Ananya / Apex Dental, I would like to book a dental consultation with you in Pune.",
  },
  {
    id: "operatory",
    label: "🏥 Zeiss Operatory",
    name: "Carl Zeiss Microscopic Operatory",
    title: "Carl Zeiss Microscopic Operatory",
    shortName: "Zeiss Operatory & Suite",
    nameSnippet: "Operatory",
    subtitle: "Sub-Millimeter Surgical Restorative Suite",
    tagline: "Painless Rotary Endodontics & Digital Intraoral 3D Scanning",
    image: "/images/clinic-operatory.jpg",
    avatar: "/images/clinic-operatory.jpg",
    reg: "ISO 9001:2015 Verified",
    specialty: "Precision Microscope & Zero Pain Protocols",
    statusBadge: "Next Slot: 04:30 PM Today",
    status: "Active & Sanitized Today",
    rating: "⭐ 4.9 (Micro-Endo)",
    fee: "₹1,000",
    feeNote: "(Zero Waiting Protocol)",
    actionText: "Book Operatory Slot",
    phone: "+91 97655 39107",
    whatsappText:
      "Hello Apex Lounge, I would like to inquire about Carl Zeiss microscopic treatment availability.",
  },
  {
    id: "doctor-rohan",
    label: "👨‍⚕️ Dr. Rohan (MD)",
    name: "Dr. Rohan Deshmukh, MBBS, MD",
    title: "Dr. Rohan Deshmukh, MBBS, MD",
    shortName: "Dr. Rohan Deshmukh (MD Derm)",
    nameSnippet: "Rohan",
    subtitle: "Consultant Dermatologist & Aesthetic Physician",
    tagline: "Ex-KEM Mumbai • MMC Reg: 2012/05/1429",
    image: "/images/doctor-rohan.jpg",
    avatar: "/images/doctor-rohan.jpg",
    reg: "MMC Reg: 2012/05/1429",
    specialty: "Clinical Dermatology & Medical HydraFacials",
    statusBadge: "Consulting Today (Slots Available)",
    status: "Available Today (Slots Open)",
    rating: "⭐ 4.9 (980+)",
    fee: "₹1,200",
    feeNote: "(Incl. Dermoscopy Exam)",
    actionText: "Book Dr. Rohan",
    phone: "+91 82083 17142",
    whatsappText:
      "Hello Dr. Rohan / Apex Lounge, I would like to book a clinical dermatology & skin consultation in Pune.",
  },
  {
    id: "sterilization",
    label: "🔬 Sterile Suite",
    name: "European Class-B Sterilization",
    title: "European Class-B Sterilization",
    shortName: "Melag Sterile Suite",
    nameSnippet: "Sterile",
    subtitle: "Melag Vacuum Autoclave & Six-Step Chain",
    tagline: "100% Sterile Pouches Opened In Front of Every Patient",
    image: "/images/sterilization-suite.jpg",
    avatar: "/images/sterilization-suite.jpg",
    reg: "NABH Protocol Compliant",
    specialty: "Zero Cross-Infection Guarantee",
    statusBadge: "Hospital-Grade Sterilization Active",
    status: "134°C Vacuum Protocol Active",
    rating: "⭐ 5.0 (Bio-Log)",
    fee: "₹1,000",
    feeNote: "(Hospital-Grade Sterility)",
    actionText: "Book Consultation",
    phone: "+91 97655 39107",
    whatsappText:
      "Hello Apex Lounge, I would like to book a safe, sterile consultation in Pune.",
  },
  {
    id: "lounge",
    label: "✨ Patient Lounge",
    name: "Executive Waiting & Consult Lounge",
    title: "Executive Waiting & Consult Lounge",
    shortName: "Apex Executive Lounge",
    nameSnippet: "Lounge",
    subtitle: "Boutique Healthcare Lounge in Pune",
    tagline: "Unhurried, Private & Zero Crowded Waiting Delays",
    image: "/images/reception-lounge.jpg",
    avatar: "/images/reception-lounge.jpg",
    reg: "Somwar Peth & Baner",
    specialty: "Warm Hospitality & Instant Check-ins",
    statusBadge: "Zero Waiting Room Delay",
    status: "Open 09:00 AM - 08:30 PM",
    rating: "⭐ 4.9 (1,240+)",
    fee: "₹1,000",
    feeNote: "(Guaranteed Direct Entry)",
    actionText: "Reserve Priority Pass",
    phone: "+91 97655 39107",
    whatsappText:
      "Hello Apex Lounge, I want to reserve an executive clinic consultation.",
  },
];

export function MobileHeroShowcase({
  clinicName,
  phone: defaultPhone,
  area,
  city,
}: MobileHeroShowcaseProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = CLINIC_SLIDES[activeSlide];

  // Broadcast change on mount and whenever slide changes
  const broadcastSlide = (idx: number) => {
    setActiveSlide(idx);
    const targetSlide = CLINIC_SLIDES[idx];
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("apex-doctor-change", {
          detail: targetSlide,
        })
      );
    }
  };

  useEffect(() => {
    // Prime initial slide
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("apex-doctor-change", {
          detail: CLINIC_SLIDES[0],
        })
      );
    }
  }, []);

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("apex-select-booking-doctor", {
          detail: {
            id: slide.id,
            nameSnippet: slide.nameSnippet,
            name: slide.shortName,
          },
        })
      );
      const bookingEl = document.getElementById("booking-section");
      if (bookingEl) {
        bookingEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const activePhone = (slide.phone || defaultPhone).replace(/[^0-9+]/g, "");

  return (
    <div className="w-full">
      {/* 1. Quick Pill Slide Switcher (Horizontal Scrollable Tabs) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 scrollbar-none text-xs -mx-1 px-1">
        {CLINIC_SLIDES.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => broadcastSlide(idx)}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all duration-150 shrink-0 text-[11px] flex items-center gap-1.5 ${
              activeSlide === idx
                ? "bg-teal-700 text-white shadow-sm ring-2 ring-teal-600/30 font-bold scale-[1.02]"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90 shadow-2xs"
            }`}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* 2. Visual Card with Crisp Healthcare Details & Micro-Badges */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 bg-slate-900 group">
        {/* Main Photo */}
        <div className="relative w-full h-[320px] sm:h-[380px] overflow-hidden bg-slate-950">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Subtle multi-stop gradient for readable text overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-900/20" />

          {/* Top-Left: Live Clinic Status Pill */}
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80 shadow-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">
              {slide.statusBadge}
            </span>
          </div>

          {/* Top-Right: Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200 shadow-md flex items-center gap-1">
            <div className="flex text-amber-500">
              <Star className="w-3 h-3 fill-amber-400" />
            </div>
            <span className="text-[11px] font-extrabold text-slate-900">
              {slide.rating.split(" ")[1] || "4.9"}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {slide.rating.split(" ")[2] || "(1,240+)"}
            </span>
          </div>

          {/* Bottom Overlay: Doctor / Facility Bio & Verified Reg */}
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800/90 text-white shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white truncate leading-tight">
                    {slide.title}
                  </h3>
                  <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-teal-300 font-semibold mt-0.5 truncate">
                  {slide.subtitle}
                </p>
                <p className="text-[10px] text-slate-300 mt-1 line-clamp-1 leading-snug">
                  {slide.tagline}
                </p>
              </div>
            </div>

            {/* Micro Details Row with Clickable Google Maps Link */}
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-300 font-mono">{slide.reg}</span>
              </span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-white font-medium flex items-center gap-1 underline decoration-teal-500/50"
                title="Open Somwar Peth & Baner clinic on Google Maps"
              >
                <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                <span>{area}, {city} (Map ↗)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 1-Tap Mobile Action Strip (Fully synchronized with active doctor) */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        {/* Book */}
        <button
          type="button"
          onClick={handleBook}
          className="col-span-2 flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition"
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="truncate">{slide.actionText}</span>
        </button>

        {/* Call */}
        <a
          href={`tel:${activePhone}`}
          className="flex items-center justify-center gap-1 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border border-slate-300 py-2.5 px-2 rounded-xl font-semibold text-xs shadow-2xs transition"
          title={`Call ${slide.shortName}`}
        >
          <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span>Call Desk</span>
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/919765539107?text=${encodeURIComponent(slide.whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-2 rounded-xl font-bold text-xs shadow-md transition"
          title="Direct WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>WhatsApp</span>
        </a>
      </div>

      {/* 4. Professional Trust & Pricing Strip */}
      <div className="mt-2.5 bg-teal-50/80 border border-teal-200/80 rounded-xl px-3 py-2 flex items-center justify-between text-[11px] text-teal-950 font-medium">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span>Zero Waiting Time Guarantee</span>
        </div>
        <div className="flex items-center gap-1 text-teal-800 font-bold">
          <span>Fee: {slide.fee}</span>
          <span className="text-[9px] text-teal-600 font-normal">{slide.feeNote}</span>
        </div>
      </div>
    </div>
  );
}
