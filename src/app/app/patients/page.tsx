import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PatientDirectory } from "@/components/app/PatientDirectory";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const session = await getSession();
  const clinicId = session?.clinicId || (await db.clinic.findFirst())?.id;

  if (!clinicId) return <div>No clinic found</div>;

  const patients = await db.patient.findMany({
    where: { clinicId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          appointments: true,
          encounters: true,
          invoices: true,
        },
      },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Patient Directory & Electronic Medical Records
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive patient registry, visit frequencies, demographic records, and drug allergy alerts
        </p>
      </div>

      <PatientDirectory initialPatients={patients} clinicId={clinicId} />
    </div>
  );
}
