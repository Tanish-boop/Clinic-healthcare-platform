"use client";

import { useState } from "react";
import { Building, Settings, Globe, Shield, CheckCircle2, Clock } from "lucide-react";

interface SettingsManagerProps {
  clinic: any;
  heroCms?: any;
}

export function SettingsManager({ clinic, heroCms }: SettingsManagerProps) {
  const [name, setName] = useState(clinic.name || "");
  const [tagline, setTagline] = useState(clinic.tagline || "");
  const [primaryPhone, setPrimaryPhone] = useState(clinic.primaryPhone || "");
  const [secondaryPhone, setSecondaryPhone] = useState(clinic.secondaryPhone || "");
  const [email, setEmail] = useState(clinic.email || "");
  const [address, setAddress] = useState(clinic.address || "");
  const [area, setArea] = useState(clinic.area || "");
  const [city, setCity] = useState(clinic.city || "Pune");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(clinic.googleMapsUrl || "");

  const [bufferMinutes, setBufferMinutes] = useState(clinic.appointmentBufferMinutes || 10);
  const [cancellationHours, setCancellationHours] = useState(clinic.cancellationNoticeHours || 4);

  // CMS
  const [heroTitle, setHeroTitle] = useState(heroCms?.title || "");
  const [heroSubtitle, setHeroSubtitle] = useState(heroCms?.subtitle || "");

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);

    try {
      const res = await fetch("/api/clinic/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tagline,
          primaryPhone,
          secondaryPhone,
          email,
          address,
          area,
          city,
          googleMapsUrl,
          appointmentBufferMinutes: bufferMinutes,
          cancellationNoticeHours: cancellationHours,
          heroTitle,
          heroSubtitle,
        }),
      });

      if (res.ok) {
        setSuccessMsg(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Clinic settings and website content updated successfully!</span>
        </div>
      )}

      {/* Card 1: Clinic Identity & Location */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm">Clinic Identity & Contact Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinic Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary Phone</label>
            <input
              type="tel"
              required
              value={primaryPhone}
              onChange={(e) => setPrimaryPhone(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Secondary / Helpline Phone</label>
            <input
              type="tel"
              value={secondaryPhone}
              onChange={(e) => setSecondaryPhone(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Area / Locality</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Full Clinic Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Google Maps Direction URL</label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Scheduling Rules & Buffers */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm">Appointment Scheduling Engine Rules</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Buffer Between Appointments (Minutes)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Time allocated for room sanitization between patients.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Minimum Cancellation Notice Window (Hours)
            </label>
            <input
              type="number"
              min="1"
              max="48"
              value={cancellationHours}
              onChange={(e) => setCancellationHours(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Hours before appointment that patients can cancel online.
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Website CMS & Hero Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm">Public Website Content (CMS)</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Homepage Hero Title
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Homepage Hero Subtitle / Intro
            </label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          {isSaving ? "Saving Settings..." : "Save Configuration"}
        </button>
      </div>
    </form>
  );
}
