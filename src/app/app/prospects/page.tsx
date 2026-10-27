import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProspectManager } from "@/components/app/ProspectManager";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const session = await getSession();

  const prospects = await db.clinicProspect.findMany({
    orderBy: { leadId: "asc" },
  });

  return (
    <div className="space-y-6">
      <ProspectManager initialProspects={prospects} />
    </div>
  );
}
