import { db } from "@/lib/db";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { BookingWidget } from "@/components/public/BookingWidget";

export const dynamic = "force-dynamic";

interface BookPageProps {
  searchParams: {
    doctorId?: string;
    serviceId?: string;
  };
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const clinic = await db.clinic.findFirst({
    where: { status: "ACTIVE" },
    include: {
      doctors: {
        where: { isActive: true },
        include: {
          user: { select: { fullName: true } },
        },
      },
      services: {
        where: { isActive: true, isPubliclyBookable: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!clinic) return null;

  const doctorOptions = clinic.doctors.map((d) => ({
    id: d.id,
    name: d.user.fullName,
    specialty: d.specialty,
    qualification: d.qualification,
    consultationFee: d.consultationFee,
  }));

  const serviceOptions = clinic.services.map((s) => ({
    id: s.id,
    name: s.name,
    durationMinutes: s.durationMinutes,
    price: s.price,
    category: s.category,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicNavbar
        clinicName={clinic.name}
        phone={clinic.primaryPhone}
        area={clinic.area || ""}
        city={clinic.city}
      />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Direct Online Scheduling
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Book Your Consultation with {clinic.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Real-time slot availability. No advance payment required; your slot is confirmed immediately and added to the doctor&apos;s queue.
            </p>
          </div>

          <BookingWidget
            clinicId={clinic.id}
            clinicName={clinic.name}
            doctors={doctorOptions}
            services={serviceOptions}
            initialDoctorId={searchParams.doctorId}
            initialServiceId={searchParams.serviceId}
          />
        </div>
      </main>

      <PublicFooter
        clinicName={clinic.name}
        phone={clinic.primaryPhone}
        email={clinic.email}
        address={clinic.address || ""}
        city={clinic.city}
      />
    </div>
  );
}
