"use client";

import { ArrowRight } from "lucide-react";
import { CLINIC_SLIDES } from "./MobileHeroShowcase";

interface DoctorSelectButtonProps {
  doctorSnippet: "Ananya" | "Rohan";
  label: string;
  className?: string;
}

export function DoctorSelectButton({
  doctorSnippet,
  label,
  className = "",
}: DoctorSelectButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const slide = CLINIC_SLIDES.find((s) => s.nameSnippet === doctorSnippet);
    if (slide && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("apex-doctor-change", { detail: slide })
      );
      window.dispatchEvent(
        new CustomEvent("apex-select-booking-doctor", {
          detail: {
            id: slide.id,
            nameSnippet: slide.nameSnippet,
            name: slide.shortName,
          },
        })
      );
    }
    const el = document.getElementById("booking-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`text-xs font-bold text-teal-700 hover:text-teal-800 underline inline-flex items-center gap-1 ${className}`}
    >
      <span>{label}</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
}
