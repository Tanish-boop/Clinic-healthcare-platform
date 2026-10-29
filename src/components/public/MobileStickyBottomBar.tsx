"use client";

import { useState, useEffect } from "react";
import { Calendar, Phone, MapPin, ExternalLink, Star } from "lucide-react";

export interface MobileDoctorSlideInfo {
  id: string;
  name?: string;
  shortName: string;
  specialty: string;
  avatar: string;
  fee: string;
  rating: string;
  status: string;
  phone: string;
  actionText: string;
  nameSnippet: string;
}

const DEFAULT_DOCTOR: MobileDoctorSlideInfo = {
  id: "doctor-ananya",
  name: "Dr. Ananya Kulkarni, BDS, MDS",
  shortName: "Dr. Ananya Kulkarni (MDS)",
  specialty: "Chief Dental Surgeon & Implantologist",
  avatar: "/images/doctor-ananya.jpg",
  fee: "₹1,000",
  rating: "4.9 (1,240+)",
  status: "Available Today",
  phone: "+91 97655 39107",
  actionText: "Book Dr. Ananya",
  nameSnippet: "Ananya",
};

interface MobileStickyBottomBarProps {
  phone: string;
  doctorName?: string;
}

export function MobileStickyBottomBar({
  phone: defaultPhone,
}: MobileStickyBottomBarProps) {
  const [currentDoctor, setCurrentDoctor] = useState<MobileDoctorSlideInfo>(DEFAULT_DOCTOR);

  useEffect(() => {
    function handleDoctorChange(e: Event) {
      const customEvent = e as CustomEvent<MobileDoctorSlideInfo>;
      if (customEvent.detail && customEvent.detail.shortName) {
        setCurrentDoctor(customEvent.detail);
      }
    }

    window.addEventListener("apex-doctor-change", handleDoctorChange);
    return () => {
      window.removeEventListener("apex-doctor-change", handleDoctorChange);
    };
  }, []);

  const activePhone = (currentDoctor.phone || defaultPhone).replace(/[^0-9+]/g, "");

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("apex-select-booking-doctor", {
          detail: {
            id: currentDoctor.id,
            nameSnippet: currentDoctor.nameSnippet,
            name: currentDoctor.shortName,
          },
        })
      );
      const bookingEl = document.getElementById("booking-section");
      if (bookingEl) {
        bookingEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      data-testid="mobile-sticky-dock"
      className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3.5 py-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] transition-all duration-300"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
        {/* Dynamic Doctor Micro Profile */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={currentDoctor.avatar}
              alt={currentDoctor.shortName}
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-600 shadow-2xs transition-all duration-300"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">
              {currentDoctor.shortName}
            </div>
            <div className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 truncate">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
              <span>{currentDoctor.rating.replace(/^⭐\s*/, "")}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-normal truncate">
                {currentDoctor.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Synchronized with Active Doctor */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Call Desk */}
          <a
            href={`tel:${activePhone}`}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-300 shadow-2xs active:scale-95 transition"
            aria-label={`Call ${currentDoctor.shortName} reception desk`}
            title="Direct Phone Call"
          >
            <Phone className="w-4 h-4 text-teal-700" />
          </a>

          {/* Dynamic Booking Button */}
          <button
            type="button"
            onClick={handleBookClick}
            className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[110px]">
              {currentDoctor.nameSnippet === "Rohan"
                ? "Book Dr. Rohan"
                : currentDoctor.nameSnippet === "Ananya"
                ? "Book Dr. Ananya"
                : "Book Slot"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
