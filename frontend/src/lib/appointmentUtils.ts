import type { Appointment } from "./api";

export const appointmentStatusLabels: Record<
  Appointment["status"],
  { label: string; bgColor: string; textColor: string }
> = {
  pending: {
    label: "Menunggu",
    bgColor: "bg-[#f2e6b8]",
    textColor: "text-[#6d5c1a]",
  },
  approved: {
    label: "Disetujui",
    bgColor: "bg-[#dcefe3]",
    textColor: "text-[#236b4a]",
  },
  rescheduled: {
    label: "Diusulkan hari lain",
    bgColor: "bg-[#dfe5ff]",
    textColor: "text-[#364a84]",
  },
  rejected: {
    label: "Ditolak",
    bgColor: "bg-[#f3d9d9]",
    textColor: "text-[#8d3d3d]",
  },
};

export const assignedToLabels: Record<string, string> = {
  ketua: "Ketua RT",
  wakil: "Wakil RT",
};

export const appointmentPurposes = [
  { value: "surat_pengantar", label: "Surat pengantar" },
  { value: "surat_domisili", label: "Surat domisili" },
  { value: "surat_keterangan_usaha", label: "Surat keterangan usaha" },
  {
    value: "surat_keterangan_tidak_mampu",
    label: "Surat keterangan tidak mampu",
  },
  { value: "izin_acara", label: "Izin acara/kegiatan" },
  { value: "izin_renovasi", label: "Izin renovasi/perbaikan rumah" },
  { value: "konsultasi_administrasi", label: "Konsultasi administrasi" },
  { value: "laporan_masalah", label: "Laporan masalah/keluhan" },
  { value: "permohonan_bantuan", label: "Permohonan bantuan" },
  { value: "lainnya", label: "Lainnya" },
];

export function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...options,
    });
  } catch {
    return dateString;
  }
}

export function formatTimestamp(
  timestamp: number,
  includeTime: boolean = true,
): string {
  try {
    return new Date(timestamp * 1000).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(includeTime && {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  } catch {
    return new Date(timestamp).toLocaleDateString("id-ID");
  }
}

export function getAppointmentStatusSummary(appointment: Appointment): string {
  switch (appointment.status) {
    case "pending":
      return "Menunggu tanggapan dari RT";
    case "approved":
      return `Disetujui pada ${formatTimestamp(appointment.updated_at, false)}`;
    case "rescheduled":
      return `Diusulkan ulang pada ${formatTimestamp(appointment.updated_at, false)}`;
    case "rejected":
      return `Ditolak pada ${formatTimestamp(appointment.updated_at, false)}`;
    default:
      return "";
  }
}

export function getPurposeLabel(purposeValue: string): string {
  const purpose = appointmentPurposes.find((p) => p.value === purposeValue);
  return purpose ? purpose.label : purposeValue;
}
