import type { Metadata } from "next";
import "./globals.css";
import { FloatingContactWidget } from "@/components/public/FloatingContactWidget";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"),
  title: "Apex Dental & Aesthetic Lounge | Best Dentist & Skin Doctor in Pune",
  description:
    "Top-rated dental surgery and clinical aesthetic dermatology in Somwar Peth & Baner, Pune. Led by Dr. Ananya Kulkarni (MDS) and Dr. Rohan Deshmukh (MD). Painless single-sitting root canals, invisible clear aligners, dental implants, and acne scar treatments.",
  keywords: [
    "Dentist in Pune",
    "Best Dentist in Somwar Peth",
    "Skin Doctor in Pune",
    "Dermatologist in Pune",
    "Dr Ananya Kulkarni MDS",
    "Dr Rohan Deshmukh MD",
    "Apex Dental Clinic Pune",
    "Painless Root Canal Treatment Pune",
    "Invisible Clear Aligners Pune",
    "Dental Implants Somwar Peth",
    "HydraFacial Skin Clinic Pune",
    "Dental Hospital Near Me Pune",
  ],
  authors: [
    { name: "Dr. Ananya Kulkarni, BDS, MDS" },
    { name: "Dr. Rohan Deshmukh, MBBS, MD" },
  ],
  creator: "Apex Dental & Aesthetic Lounge",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Apex Dental & Aesthetic Lounge",
    title: "Apex Dental & Aesthetic Lounge | Best Dentist & Skin Doctor in Pune",
    description:
      "Consult Dr. Ananya Kulkarni (MDS Prosthodontist) & Dr. Rohan Deshmukh (MD Dermatologist). Painless root canals, clear aligners & clinical dermatology in Somwar Peth & Baner, Pune. Book appointment online.",
    images: [
      {
        url: "/images/reception-lounge.jpg",
        width: 1200,
        height: 630,
        alt: "Apex Dental & Aesthetic Lounge Pune - Reception Suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Dental & Aesthetic Lounge | Best Dentist & Skin Doctor in Pune",
    description:
      "Modern painless dental surgery and clinical skin aesthetics in Pune. Rated 4.9★ with zero waiting room delay.",
    images: ["/images/reception-lounge.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-token",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema.org MedicalBusiness / Dentist / Dermatology Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Dentist", "MedicalClinic"],
        "@id": "https://apexdental.in/#clinic",
        name: "Apex Dental & Aesthetic Lounge",
        url: "https://apexdental.in",
        telephone: "+91 91408 92818",
        priceRange: "₹₹",
        image: "https://apexdental.in/images/reception-lounge.jpg",
        medicalSpecialty: [
          "Prosthodontics",
          "Endodontics",
          "Implantology",
          "Dermatology",
          "Cosmetic Dentistry",
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: "Shop 12-14, Ground Floor, Royal Heritage Complex, Somwar Peth",
          addressLocality: "Pune",
          addressRegion: "Maharashtra",
          postalCode: "411011",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 18.5204,
          longitude: 73.8567,
        },
        hasMap: "https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "09:00",
            closes: "20:30",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Sunday"],
            opens: "10:00",
            closes: "14:00",
          },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "1240",
          bestRating: "5",
          worstRating: "1",
        },
        physician: [
          {
            "@type": "Physician",
            name: "Dr. Ananya Kulkarni",
            jobTitle: "Senior Prosthodontist & Oral Implantologist",
            medicalSpecialty: "Dentistry",
            identifier: "MDC Reg: A-28491",
            alumniOf: "Maharashtra University of Health Sciences",
          },
          {
            "@type": "Physician",
            name: "Dr. Rohan Deshmukh",
            jobTitle: "Consultant Dermatologist & Aesthetic Physician",
            medicalSpecialty: "Dermatology",
            identifier: "MMC Reg: 2012/05/1429",
            alumniOf: "KEM Hospital Mumbai",
          },
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900">
        {children}
        <FloatingContactWidget />
      </body>
    </html>
  );
}
