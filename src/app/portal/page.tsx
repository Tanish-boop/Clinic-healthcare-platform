import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PatientPortalClient } from "@/components/portal/PatientPortalClient";

export const dynamic = "force-dynamic";

interface PortalPageProps {
  searchParams: {
    bookingRef?: string;
    phone?: string;
  };
}

export default async function PatientPortalPage({ searchParams }: PortalPageProps) {
  const session = await getSession();

  let initialPatient = null;
  let initialAppointments: any[] = [];
  let initialPrescriptions: any[] = [];
  let initialInvoices: any[] = [];

  // Case 1: Authenticated Patient User
  if (session?.userId) {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        patientProfile: {
          include: {
            appointments: {
              include: {
                doctor: {
                  include: { user: { select: { fullName: true } } },
                },
                service: true,
              },
              orderBy: { appointmentDate: "desc" },
            },
            prescriptions: {
              where: { isAuthorizedForPatient: true },
              include: {
                doctor: {
                  include: { user: { select: { fullName: true } } },
                },
                items: true,
              },
              orderBy: { prescriptionDate: "desc" },
            },
            invoices: {
              include: {
                items: true,
                payments: true,
              },
              orderBy: { invoiceDate: "desc" },
            },
          },
        },
      },
    });

    if (user?.patientProfile) {
      const p = user.patientProfile;
      initialPatient = {
        id: p.id,
        fullName: p.fullName,
        phone: p.phone,
        email: p.email || user.email || "",
        age: p.age,
        gender: p.gender,
        patientIdNumber: p.patientIdNumber,
        bloodGroup: p.bloodGroup || "O+",
        address: p.address || "",
        area: p.area || "",
        city: p.city || "Pune",
        emergencyContactName: p.emergencyContactName || "",
        emergencyContactPhone: p.emergencyContactPhone || "",
        allergies: p.allergies || "",
        medicalConditions: p.medicalConditions || "",
        currentMedications: p.currentMedications || "",
        notes: p.notes || "",
      };

      initialAppointments = p.appointments.map((a) => ({
        id: a.id,
        bookingReference: a.bookingReference,
        appointmentDate: a.appointmentDate,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        type: a.type,
        doctorName: a.doctor.user.fullName,
        doctorSpecialty: a.doctor.specialty,
        doctorQualification: a.doctor.qualification,
        doctorRegNumber: a.doctor.regNumber,
        serviceName: a.service?.name,
        price: a.service?.price,
      }));

      initialPrescriptions = p.prescriptions.map((rx) => ({
        id: rx.id,
        prescriptionDate: rx.prescriptionDate,
        doctorName: rx.doctor.user.fullName,
        doctorSpecialty: rx.doctor.specialty,
        doctorQualification: rx.doctor.qualification,
        doctorRegNumber: rx.doctor.regNumber,
        generalAdvice: rx.generalAdvice,
        items: rx.items.map((i) => ({
          medicineName: i.medicineName,
          dosage: i.dosage,
          frequency: i.frequency,
          timing: i.timing,
          durationDays: i.durationDays,
          instructions: i.instructions || "",
        })),
      }));

      initialInvoices = p.invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        balanceDue: inv.balanceDue,
        status: inv.status,
        items: inv.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
        })),
        payments: inv.payments.map((pm) => ({
          receiptNumber: pm.receiptNumber,
          amount: pm.amount,
          paymentMethod: pm.paymentMethod,
          paymentDate: pm.paymentDate,
        })),
      }));
    }
  }

  // Case 2: If not logged in, but searchParams has bookingRef
  if (!initialPatient && (searchParams.bookingRef || searchParams.phone)) {
    const q = searchParams.bookingRef || searchParams.phone;
    let appointment = null;
    let patient = null;

    if (searchParams.bookingRef) {
      appointment = await db.appointment.findFirst({
        where: { bookingReference: searchParams.bookingRef },
        include: { patient: true },
      });
      if (appointment) patient = appointment.patient;
    }

    if (!patient && searchParams.phone) {
      patient = await db.patient.findFirst({
        where: { phone: { contains: searchParams.phone.slice(-10) } },
      });
    }

    if (patient) {
      initialPatient = {
        id: patient.id,
        fullName: patient.fullName,
        phone: patient.phone,
        email: patient.email || "",
        age: patient.age,
        gender: patient.gender,
        patientIdNumber: patient.patientIdNumber,
        bloodGroup: patient.bloodGroup || "O+",
        address: patient.address || "",
        area: patient.area || "",
        city: patient.city || "Pune",
        emergencyContactName: patient.emergencyContactName || "",
        emergencyContactPhone: patient.emergencyContactPhone || "",
        allergies: patient.allergies || "",
        medicalConditions: patient.medicalConditions || "",
        currentMedications: patient.currentMedications || "",
        notes: patient.notes || "",
      };

      const [apts, rxs, invs] = await Promise.all([
        db.appointment.findMany({
          where: { patientId: patient.id },
          include: {
            doctor: { include: { user: { select: { fullName: true } } } },
            service: true,
          },
          orderBy: { appointmentDate: "desc" },
        }),
        db.prescription.findMany({
          where: { patientId: patient.id, isAuthorizedForPatient: true },
          include: {
            doctor: { include: { user: { select: { fullName: true } } } },
            items: true,
          },
          orderBy: { prescriptionDate: "desc" },
        }),
        db.invoice.findMany({
          where: { patientId: patient.id },
          include: { items: true, payments: true },
          orderBy: { invoiceDate: "desc" },
        }),
      ]);

      initialAppointments = apts.map((a) => ({
        id: a.id,
        bookingReference: a.bookingReference,
        appointmentDate: a.appointmentDate,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        type: a.type,
        doctorName: a.doctor.user.fullName,
        doctorSpecialty: a.doctor.specialty,
        doctorQualification: a.doctor.qualification,
        doctorRegNumber: a.doctor.regNumber,
        serviceName: a.service?.name,
        price: a.service?.price,
      }));

      initialPrescriptions = rxs.map((rx) => ({
        id: rx.id,
        prescriptionDate: rx.prescriptionDate,
        doctorName: rx.doctor.user.fullName,
        doctorSpecialty: rx.doctor.specialty,
        doctorQualification: rx.doctor.qualification,
        doctorRegNumber: rx.doctor.regNumber,
        generalAdvice: rx.generalAdvice,
        items: rx.items.map((i) => ({
          medicineName: i.medicineName,
          dosage: i.dosage,
          frequency: i.frequency,
          timing: i.timing,
          durationDays: i.durationDays,
          instructions: i.instructions || "",
        })),
      }));

      initialInvoices = invs.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        balanceDue: inv.balanceDue,
        status: inv.status,
        items: inv.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
        })),
        payments: inv.payments.map((pm) => ({
          receiptNumber: pm.receiptNumber,
          amount: pm.amount,
          paymentMethod: pm.paymentMethod,
          paymentDate: pm.paymentDate,
        })),
      }));
    }
  }

  // Case 3: Default fallback if not logged in and no search params:
  // Pre-load default seeded patient Rajesh Sharma so the portal opens immediately in demo mode with rich sample data!
  if (!initialPatient && !session) {
    const demoPatient = await db.patient.findFirst({
      where: { fullName: { contains: "Rajesh Sharma" } },
      include: {
        appointments: {
          include: {
            doctor: { include: { user: { select: { fullName: true } } } },
            service: true,
          },
          orderBy: { appointmentDate: "desc" },
        },
        prescriptions: {
          where: { isAuthorizedForPatient: true },
          include: {
            doctor: { include: { user: { select: { fullName: true } } } },
            items: true,
          },
          orderBy: { prescriptionDate: "desc" },
        },
        invoices: {
          include: { items: true, payments: true },
          orderBy: { invoiceDate: "desc" },
        },
      },
    });

    if (demoPatient) {
      initialPatient = {
        id: demoPatient.id,
        fullName: demoPatient.fullName,
        phone: demoPatient.phone,
        age: demoPatient.age,
        gender: demoPatient.gender,
        patientIdNumber: demoPatient.patientIdNumber,
      };

      initialAppointments = demoPatient.appointments.map((a) => ({
        id: a.id,
        bookingReference: a.bookingReference,
        appointmentDate: a.appointmentDate,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        type: a.type,
        doctorName: a.doctor.user.fullName,
        doctorSpecialty: a.doctor.specialty,
        doctorQualification: a.doctor.qualification,
        doctorRegNumber: a.doctor.regNumber,
        serviceName: a.service?.name,
        price: a.service?.price,
      }));

      initialPrescriptions = demoPatient.prescriptions.map((rx) => ({
        id: rx.id,
        prescriptionDate: rx.prescriptionDate,
        doctorName: rx.doctor.user.fullName,
        doctorSpecialty: rx.doctor.specialty,
        doctorQualification: rx.doctor.qualification,
        doctorRegNumber: rx.doctor.regNumber,
        generalAdvice: rx.generalAdvice,
        items: rx.items.map((i) => ({
          medicineName: i.medicineName,
          dosage: i.dosage,
          frequency: i.frequency,
          timing: i.timing,
          durationDays: i.durationDays,
          instructions: i.instructions || "",
        })),
      }));

      initialInvoices = demoPatient.invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        balanceDue: inv.balanceDue,
        status: inv.status,
        items: inv.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
        })),
        payments: inv.payments.map((pm) => ({
          receiptNumber: pm.receiptNumber,
          amount: pm.amount,
          paymentMethod: pm.paymentMethod,
          paymentDate: pm.paymentDate,
        })),
      }));
    }
  }

  return (
    <PatientPortalClient
      initialPatient={initialPatient}
      initialAppointments={initialAppointments}
      initialPrescriptions={initialPrescriptions}
      initialInvoices={initialInvoices}
      isAuthenticated={Boolean(session?.userId)}
    />
  );
}
