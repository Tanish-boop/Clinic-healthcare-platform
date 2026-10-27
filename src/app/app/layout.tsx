import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ClinicCommandNav } from "@/components/app/ClinicCommandNav";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Patients belong in /portal
  if (session.role === "PATIENT" && !session.isSuperAdmin) {
    redirect("/portal");
  }

  // Find clinic context
  let clinic = null;
  if (session.clinicId) {
    clinic = await db.clinic.findUnique({
      where: { id: session.clinicId },
      select: { id: true, name: true, slug: true },
    });
  }

  // If user has no specific clinic (e.g. Super Admin), fallback to first clinic
  if (!clinic) {
    clinic = await db.clinic.findFirst({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, slug: true },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased">
      <ClinicCommandNav
        userName={session.fullName}
        userRole={session.role || "STAFF"}
        isSuperAdmin={session.isSuperAdmin}
        clinicId={clinic?.id}
        clinicSlug={clinic?.slug}
        clinicName={clinic?.name || "Apex Dental & Aesthetic Lounge"}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
