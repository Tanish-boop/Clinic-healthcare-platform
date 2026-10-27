"use client";

import Link from "next/link";
import { useState } from "react";
import { Phone, Clock, MapPin, Calendar, Menu, X, Shield, User } from "lucide-react";

interface PublicNavbarProps {
  clinicName?: string;
  phone?: string;
  area?: string;
  city?: string;
  slug?: string;
}

export function PublicNavbar({
  clinicName = "Apex Dental & Aesthetic Lounge",
  phone = "+91 91408 92818",
  area = "Somwar Peth",
  city = "Pune",
  slug,
}: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const basePath = slug ? `/c/${slug}` : "";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Moving Top Announcement Ticker Bar (Continuous Horizontal Marquee) */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 border-b border-slate-800/80 overflow-hidden relative select-none">
        {/* Soft edge gradient fades */}
        <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer">
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="flex items-center gap-6 sm:gap-8 px-4 shrink-0 whitespace-nowrap">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-medium text-slate-200 hover:text-teal-300 transition underline decoration-teal-500/50"
                title="Open clinic on Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Baner-Pashan Link Road & Somwar Peth, Pune (Maps ↗)</span>
              </a>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Mon - Sat: 09:30 AM - 08:30 PM | Sun: 10:00 AM - 02:00 PM</span>
              </span>
              <span className="text-slate-700">•</span>
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-1.5 text-white hover:text-teal-400 transition font-medium"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Emergency Desk: {phone}</span>
              </a>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>Verified BDS, MDS Prosthodontist • NABH Certified Clinic</span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="text-amber-400 font-medium">
                ⭐ 4.9 ★ Rating (1,240+ Verified Pune Reviews)
              </span>
              <span className="text-slate-700">•</span>
              <span className="text-teal-300 font-medium">
                Class-B European Autoclave • 100% Sterile Six-Step Chain
              </span>
              <span className="text-slate-700">•</span>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-600/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition"
                title="Enter Clinic Management Floor"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span>Enter Inside Clinic 🏥</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        <Link href={basePath || "/"} className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight block">
              {clinicName}
            </span>
            <span className="text-xs text-teal-700 font-medium block">
              Multi-Specialty Clinical Practice • Verified Care
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link href={basePath || "/"} className="hover:text-teal-600 transition">
            Home
          </Link>
          <Link href={`${basePath}/about`} className="hover:text-teal-600 transition">
            About the Doctors
          </Link>
          <Link href={`${basePath}/services`} className="hover:text-teal-600 transition">
            Services & Fees
          </Link>
          <Link href={`${basePath}/contact`} className="hover:text-teal-600 transition">
            Timings & Directions
          </Link>
          <Link href={`${basePath}/policies`} className="hover:text-teal-600 transition">
            Patient Policies
          </Link>
          <Link
            href="/portal"
            className="text-teal-800 font-semibold hover:text-teal-950 transition flex items-center gap-1"
          >
            <span>Patient Portal</span>
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href={`${basePath}/book`}
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drop-down */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3">
          <Link
            href={basePath || "/"}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-800 font-medium py-2 hover:text-teal-600"
          >
            Home
          </Link>
          <Link
            href={`${basePath}/about`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-800 font-medium py-2 hover:text-teal-600"
          >
            About the Doctors
          </Link>
          <Link
            href={`${basePath}/services`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-800 font-medium py-2 hover:text-teal-600"
          >
            Services & Pricing
          </Link>
          <Link
            href={`${basePath}/contact`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-800 font-medium py-2 hover:text-teal-600"
          >
            Clinic Timings & Location
          </Link>
          <Link
            href={`${basePath}/policies`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-800 font-medium py-2 hover:text-teal-600"
          >
            Patient Policies & FAQ
          </Link>
          <Link
            href="/portal"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-teal-800 font-bold py-2 hover:text-teal-900"
          >
            Patient Portal (Slips & Rx)
          </Link>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href={`${basePath}/book`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-center bg-teal-700 text-white py-2.5 rounded-lg font-semibold text-sm"
            >
              Book Appointment
            </Link>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center border border-teal-600 bg-teal-50 text-teal-800 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-teal-700" />
              <span>Get Directions on Google Maps ↗</span>
            </a>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center border border-slate-300 text-slate-700 py-2.5 rounded-lg font-medium text-sm"
            >
              Sign In to Patient / Staff Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
