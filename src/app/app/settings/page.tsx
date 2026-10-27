import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsManager } from "@/components/app/SettingsManager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  const clinicId = session?.clinicId || (await db.clinic.findFirst())?.id;

  if (!clinicId) return <div>No clinic found</div>;

  const clinic = await db.clinic.findUnique({
    where: { id: clinicId },
    include: {
      cmsSections: true,
    },
  });

  if (!clinic) return <div>Clinic not found</div>;

  const heroCms = clinic.cmsSections.find((s) => s.sectionKey === "hero");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Clinic Administration & Website CMS
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure clinical parameters, operational hours, buffers, and public website branding
        </p>
      </div>

      <SettingsManager clinic={clinic} heroCms={heroCms} />
    </div>
  );
}
