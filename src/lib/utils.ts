import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency into Indian Rupees format e.g. ₹1,500
 */
export function formatCurrency(amount: number, includeDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₹0";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Format date into standard Indian clinical date format: 21 Oct 2026
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format date and time e.g. 21 Oct 2026, 10:30 AM
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Clean phone numbers to Indian 10-digit format with +91 where appropriate
 */
export function formatIndianPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Strips duplicate or nested "Dr." / "Dr" / "Doctor" prefixes and canonicalizes to "Dr. <Name>"
 * e.g. "Dr. Dr. Ananya Kulkarni" -> "Dr. Ananya Kulkarni"
 *      "Dr. Ananya Kulkarni"     -> "Dr. Ananya Kulkarni"
 *      "Ananya Kulkarni"         -> "Dr. Ananya Kulkarni"
 */
export function formatDoctorName(name?: string | null): string {
  if (!name) return "Dr. Specialist";
  const cleaned = name.trim().replace(/^((dr|doctor)\.?\s*)+/i, "").trim();
  return cleaned ? `Dr. ${cleaned}` : "Dr. Specialist";
}

/**
 * Strips any "Dr." / "Doctor" prefix and returns the bare name only
 * e.g. "Dr. Dr. Ananya Kulkarni" -> "Ananya Kulkarni"
 */
export function cleanDoctorNameOnly(name?: string | null): string {
  if (!name) return "";
  return name.trim().replace(/^((dr|doctor)\.?\s*)+/i, "").trim();
}
