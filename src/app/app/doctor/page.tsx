import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DoctorCockpit } from "@/components/app/DoctorCockpit";

export const dynamic = "force-dynamic";

interface DoctorPageProps {
  searchParams: {
    appointmentId?: string;
  };
}

export default async function DoctorPage({ searchParams }: DoctorPageProps) {
  const session = await getSession();
  const clinicId = session?.clinicId || (await db.clinic.findFirst())?.id;

  if (!clinicId) return <div>No clinic found</div>;

  // Find attending doctor profile
  let doctor = null;
  if (session?.doctorId) {
    doctor = await db.doctorProfile.findUnique({
      where: { id: session.doctorId },
      include: { user: { select: { fullName: true } } },
    });
  }

  if (!doctor && session?.userId) {
    doctor = await db.doctorProfile.findUnique({
      where: { userId: session.userId },
      include: { user: { select: { fullName: true } } },
    });
  }

  // Fallback for clinic owners / admins previewing the clinical cockpit
  if (!doctor) {
    doctor = await db.doctorProfile.findFirst({
      where: { clinicId },
      include: { user: { select: { fullName: true } } },
    });
  }

  if (!doctor) {
    return <div>No doctor profile found in this clinic</div>;
  }

  // Fetch active queue appointments strictly for this doctor
  const queueAppointments = await db.appointment.findMany({
    where: {
      clinicId,
      doctorId: doctor.id,
      status: { notIn: ["CANCELLED"] },
    },
    include: {
      patient: true,
      service: true,
    },
    orderBy: { startTime: "asc" },
    take: 20,
  });

  return (
    <DoctorCockpit
      clinicId={clinicId}
      doctorId={doctor.id}
      doctorName={doctor.user.fullName}
      doctorSpecialty={doctor.specialty}
      doctorQualification={doctor.qualification}
      doctorRegNumber={doctor.regNumber}
      queueAppointments={queueAppointments}
      initialAppointmentId={searchParams.appointmentId}
    />
  );
}
