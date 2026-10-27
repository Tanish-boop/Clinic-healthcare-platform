"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Upload,
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Building,
  AlertCircle,
  Phone,
  MapPin,
} from "lucide-react";

interface ProspectItem {
  id: string;
  leadId: string;
  city: string;
  specialty: string;
  practiceName: string;
  area?: string | null;
  publicPhone?: string | null;
  websiteStatus?: string | null;
  websiteUrl?: string | null;
  mapsUrl?: string | null;
  priority?: string | null;
  nextAction?: string | null;
  doctorContact?: string | null;
  isImported: boolean;
  importedClinicId?: string | null;
}

interface ProspectManagerProps {
  initialProspects: ProspectItem[];
}

export function ProspectManager({ initialProspects }: ProspectManagerProps) {
  const [prospects, setProspects] = useState<ProspectItem[]>(initialProspects);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [specialtyFilter, setSpecialtyFilter] = useState("ALL");
  const [provisioningId, setProvisioningId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [provisionedSlug, setProvisionedSlug] = useState<string | null>(null);

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const filtered = prospects.filter((p) => {
    if (cityFilter !== "ALL" && p.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (specialtyFilter !== "ALL" && p.specialty.toLowerCase() !== specialtyFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.practiceName.toLowerCase().includes(q) ||
        p.leadId.toLowerCase().includes(q) ||
        (p.area && p.area.toLowerCase().includes(q)) ||
        (p.publicPhone && p.publicPhone.includes(q))
      );
    }
    return true;
  });

  async function handleProvision(prospect: ProspectItem) {
    setProvisioningId(prospect.id);
    setSuccessMessage(null);
    setProvisionedSlug(null);

    try {
      const res = await fetch("/api/prospects/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: prospect.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to provision clinic website");
      }

      setProspects((prev) =>
        prev.map((item) =>
          item.id === prospect.id
            ? { ...item, isImported: true, importedClinicId: data.clinic.id }
            : item
        )
      );

      setSuccessMessage(
        `Successfully initialized draft clinic website for "${data.clinic.name}"!`
      );
      setProvisionedSlug(data.clinic.slug);
    } catch (err: any) {
      alert(err.message || "Failed to provision clinic");
    } finally {
      setProvisioningId(null);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/prospects/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      alert(`Successfully imported ${data.parsedCount} clinic prospect rows!`);
      window.location.reload();
    } catch (err: any) {
      setUploadError(err.message || "Failed to parse upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel-Driven Clinic Customization Pipeline</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pune & Mumbai Clinic Prospects Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Ingest practice prospect sheets, review verified clinic business contacts, and generate customized, isolated clinic websites with 1 click.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition">
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Ingesting..." : "Import Excel (.xlsx) / CSV"}</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {successMessage && provisionedSlug && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <Link
            href={`/c/${provisionedSlug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold shadow-sm transition text-xs whitespace-nowrap"
          >
            <span>Open Generated Clinic Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search clinic name, area, or lead ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">All Cities</option>
            <option value="Pune">Pune</option>
            <option value="Mumbai">Mumbai</option>
          </select>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">All Specialties</option>
            <option value="Dental">Dental</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Physiotherapy">Physiotherapy</option>
          </select>
        </div>
      </div>

      {/* Prospects Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>
            Showing <strong>{filtered.length}</strong> clinic prospects
          </span>
          <span className="text-teal-700 font-semibold">
            {filtered.filter((p) => p.isImported).length} Provisioned as Live / Draft Sites
          </span>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No clinic prospects found matching filters.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Practice Name</th>
                  <th className="py-3 px-4">City & Locality</th>
                  <th className="py-3 px-4">Specialty</th>
                  <th className="py-3 px-4">Public Clinic Phone</th>
                  <th className="py-3 px-4">Digital Status</th>
                  <th className="py-3 px-4 text-right">Website Provisioner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                      {p.leadId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{p.practiceName}</div>
                      {p.priority && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Priority: {p.priority}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{p.city}</div>
                      {p.area && <div className="text-[10px] text-slate-400">{p.area}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {p.specialty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 max-w-xs truncate">
                      {p.publicPhone || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="text-[11px] truncate max-w-xs">{p.websiteStatus || "Unknown"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.isImported ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Site Initialized</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={provisioningId === p.id}
                          onClick={() => handleProvision(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold shadow-sm transition disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{provisioningId === p.id ? "Creating..." : "Provision Website"}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
