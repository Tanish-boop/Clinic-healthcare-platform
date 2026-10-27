import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppointmentManager } from "@/components/app/AppointmentManager";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const session = await getSession();
  const clinicId = session?.clinicId || (await db.clinic.findFirst())?.id;

  if (!clinicId) return <div>No clinic found</div>;

  const [appointments, doctors, services] = await Promise.all([
    db.appointment.findMany({
      where: { clinicId },
      include: {
        patient: {
          select: { id: true, fullName: true, phone: true, patientIdNumber: true },
        },
        doctor: {
          select: {
            id: true,
            user: { select: { fullName: true } },
            specialty: true,
          },
        },
        service: {
          select: { id: true, name: true, price: true },
        },
      },
      orderBy: [{ appointmentDate: "desc" }, { startTime: "asc" }],
      take: 100,
    }),
    db.doctorProfile.findMany({
      where: { clinicId, isActive: true },
      include: {
        user: { select: { fullName: true } },
      },
    }),
    db.clinicService.findMany({
      where: { clinicId, isActive: true },
      select: { id: true, name: true, price: true },
    }),
  ]);

  const doctorList = doctors.map((d) => ({
    id: d.id,
    name: d.user.fullName,
    specialty: d.specialty,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Appointment Schedule & Queue Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Receptionist calendar, live patient status changes, and walk-in registrations
          </p>
        </div>
      </div>

      <AppointmentManager
        initialAppointments={appointments}
        clinicId={clinicId}
        doctors={doctorList}
        services={services}
      />
    </div>
  );
}
