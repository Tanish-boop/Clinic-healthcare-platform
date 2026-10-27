import { db } from "@/lib/db";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ShieldCheck, Award, Stethoscope, GraduationCap, HeartHandshake } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const clinic = await db.clinic.findFirst({
    where: { status: "ACTIVE" },
    include: {
      doctors: {
        include: {
          user: { select: { fullName: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!clinic) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicNavbar
        clinicName={clinic.name}
        phone={clinic.primaryPhone}
        area={clinic.area || ""}
        city={clinic.city}
      />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Clinical Qualifications & Integrity
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              About Our Doctors & Clinical Philosophy
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Our clinical practice is built on honest diagnoses, verified medical qualifications, and transparent communication. We never fabricate clinical experience or recommend unwarranted procedures.
            </p>
          </div>
        </section>

        {/* Doctors Detailed Profiles */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-12">
            {clinic.doctors.map((doctor, idx) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
              >
                <div className="md:col-span-4 bg-slate-50 rounded-xl p-5 border border-slate-200 text-center space-y-3">
                  {doctor.user.avatarUrl ? (
                    <img
                      src={doctor.user.avatarUrl}
                      alt={doctor.user.fullName}
                      className="w-28 h-28 rounded-2xl object-cover mx-auto border-2 border-teal-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto border-2 border-teal-200">
                      {doctor.user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{doctor.user.fullName}</h3>
                    <p className="text-xs text-teal-700 font-semibold">{doctor.specialty}</p>
                  </div>
                  <div className="text-xs text-slate-600 border-t border-slate-200 pt-3 space-y-1.5 text-left font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">Degrees:</span>
                      <span>{doctor.qualification}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">Council Reg No:</span>
                      <span className="text-teal-900">{doctor.regNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">Experience:</span>
                      <span>{doctor.experienceYears} Years Clinical Practice</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-8 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-teal-600" />
                    <span>Background & Clinical Practice</span>
                  </h4>
                  <p>{doctor.bio}</p>

                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 pt-2">
                    <Stethoscope className="w-5 h-5 text-teal-600" />
                    <span>Specialized Areas of Focus</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                    {idx === 0 ? (
                      <>
                        <li>Aesthetic smile redesign using precision lithium disilicate & zirconia restorations</li>
                        <li>Single-visit rotary endodontic root canal treatments under rubber dam isolation</li>
                        <li>Implant-supported prosthetics and full-mouth occlusal rehabilitation</li>
                        <li>Conservative, tooth-preserving composite bonded restorations</li>
                      </>
                    ) : (
                      <>
                        <li>Evidence-based medical acne staging and targeted dermatological peel regimens</li>
                        <li>Post-inflammatory hyperpigmentation, melasma, and photoprotection counseling</li>
                        <li>Clinical trichology: evaluation of androgenetic alopecia and telogen effluvium</li>
                        <li>Minor skin surgeries: radiofrequency mole ablation and skin lesion biopsying</li>
                      </>
                    )}
                  </ul>

                  <div className="pt-4 flex gap-4">
                    <Link
                      href="/book"
                      className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
                    >
                      Book Consultation with {doctor.user.fullName.split(" ")[1]}
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Philosophy Box */}
            <div className="bg-slate-900 text-slate-200 rounded-xl p-8 space-y-4">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4" />
                <span>Our Clinical Promise</span>
              </div>
              <h3 className="text-xl font-bold text-white">Ethical, Conservative Care</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We believe healthcare should be guided strictly by evidence, diagnosis, and what is in the patient&apos;s best interest. We will never rush you into expensive surgical or cosmetic options without thoroughly presenting conservative alternatives. You will always receive itemized pricing upfront before any procedure is scheduled.
              </p>
            </div>
          </div>
        </section>
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
