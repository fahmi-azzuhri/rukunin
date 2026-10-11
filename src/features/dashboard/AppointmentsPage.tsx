import { useState } from "react";
import type { Appointment, AppointmentStatus, Role } from "../../lib/api";
import {
  appointmentStatusLabels,
  assignedToLabels,
  formatDate,
  formatTimestamp,
  getAppointmentStatusSummary,
  getPurposeLabel,
} from "../../lib/appointmentUtils";

type AppointmentsPageProps = {
  appointments: Appointment[];
  rtName: string;
  canManage: boolean;
  role: Role;
  onCreate: () => void;
  onReview: (appointment: Appointment) => void;
};

type FilterStatus = "all" | AppointmentStatus;

export function AppointmentsPage({
  appointments,
  rtName,
  canManage,
  role,
  onCreate,
  onReview,
}: AppointmentsPageProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  const filteredAppointments =
    activeFilter === "all"
      ? appointments
      : appointments.filter((apt) => apt.status === activeFilter);

  const filterCounts = {
    all: appointments.length,
    pending: appointments.filter((apt) => apt.status === "pending").length,
    approved: appointments.filter((apt) => apt.status === "approved").length,
    rescheduled: appointments.filter((apt) => apt.status === "rescheduled")
      .length,
    rejected: appointments.filter((apt) => apt.status === "rejected").length,
  };

  return (
    <section className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white">
      <div className="flex items-center justify-between border-b border-[#e1e7e2] px-[23px] pb-[18px] pt-[22px] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-[15px]">
        <div>
          <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
            PELAYANAN {rtName}
          </span>
          <h2 className="mt-2 text-lg tracking-[-0.5px]">Janji temu</h2>
        </div>
        {role === "warga" && (
          <button
            className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white shadow-[0_5px_12px_#236b4a22] hover:bg-[#18563a]"
            onClick={onCreate}
            type="button"
          >
            <span>+</span> Ajukan janji temu
          </button>
        )}
      </div>

      {appointments.length > 0 && (
        <div className="flex gap-2 border-b border-[#e1e7e2] px-[23px] py-[15px] overflow-x-auto">
          <FilterButton
            label="Semua"
            count={filterCounts.all}
            isActive={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          <FilterButton
            label="Menunggu"
            count={filterCounts.pending}
            isActive={activeFilter === "pending"}
            onClick={() => setActiveFilter("pending")}
          />
          <FilterButton
            label="Disetujui"
            count={filterCounts.approved}
            isActive={activeFilter === "approved"}
            onClick={() => setActiveFilter("approved")}
          />
          <FilterButton
            label="Hari lain"
            count={filterCounts.rescheduled}
            isActive={activeFilter === "rescheduled"}
            onClick={() => setActiveFilter("rescheduled")}
          />
          <FilterButton
            label="Ditolak"
            count={filterCounts.rejected}
            isActive={activeFilter === "rejected"}
            onClick={() => setActiveFilter("rejected")}
          />
        </div>
      )}

      <div className="grid gap-0">
        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <p className="text-sm font-medium text-[#78847f]">
              {appointments.length === 0
                ? role === "warga"
                  ? "Belum ada janji temu yang diajukan"
                  : "Belum ada permohonan janji temu"
                : "Tidak ada janji temu dengan status ini"}
            </p>
            {appointments.length === 0 && role === "warga" && (
              <p className="text-xs text-[#93a19a]">
                Ajukan janji temu untuk keperluan surat atau pelayanan RT
              </p>
            )}
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <article
              className="border-b border-[#e1e7e2] px-[23px] py-[22px] last:border-b-0"
              key={appointment.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-[9px] text-[11px] text-[#78847f]">
                    <span className="rounded bg-[#dcefe3] px-2 py-1 text-[10px] font-bold text-[#236b4a]">
                      {appointment.requester_name || "Warga"}
                    </span>
                    <span>
                      {appointment.preferred_date
                        ? formatDate(appointment.preferred_date)
                        : "Tanggal belum ditentukan"}
                    </span>
                    {appointment.preferred_time && (
                      <span>
                        <span className="mx-1.5 text-[#b8c5bd]">•</span>
                        {appointment.preferred_time}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1.5 mt-[11px] text-base text-[#172522]">
                    {getPurposeLabel(appointment.purpose)}
                  </h3>
                  <div className="mt-1 text-[10px] text-[#93a19a]">
                    Diajukan {formatTimestamp(appointment.created_at)}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${appointmentStatusLabels[appointment.status].bgColor} ${appointmentStatusLabels[appointment.status].textColor}`}
                >
                  {appointmentStatusLabels[appointment.status].label}
                </span>
              </div>

              <p className="mb-2.5 whitespace-pre-wrap text-xs leading-[1.7] text-[#65736c]">
                {appointment.details || "Tidak ada detail tambahan."}
              </p>

              <div className="mb-3 grid gap-2 text-[11px] text-[#68766f] sm:grid-cols-2">
                <div>
                  <strong>Waktu yang diusulkan:</strong>{" "}
                  {appointment.preferred_time}
                </div>
                <div>
                  <strong>Penanggung jawab:</strong>{" "}
                  {assignedToLabels[appointment.assigned_to || "ketua"] ||
                    "Ketua RT"}
                </div>
              </div>

              {appointment.status !== "pending" && (
                <div className="mb-3 text-[10px] text-[#93a19a]">
                  {getAppointmentStatusSummary(appointment)}
                </div>
              )}

              {appointment.proposed_date && (
                <p className="mb-3 text-[11px] text-[#4a5a54]">
                  <strong>Usulan tanggal lain:</strong>{" "}
                  {appointment.proposed_date} {appointment.proposed_time}
                </p>
              )}

              {appointment.decision_note && (
                <p className="mb-3 rounded bg-[#f5f7f5] px-2.5 py-2 text-[11px] text-[#55645f]">
                  {appointment.decision_note}
                </p>
              )}

              {canManage && (
                <button
                  className="rounded-[6px] border border-[#d3ddd6] bg-transparent px-3 py-[9px] text-[11px] font-extrabold text-[#236b4a]"
                  onClick={() => onReview(appointment)}
                  type="button"
                >
                  {role === "warga" ? "Lihat status" : "Tinjau permohonan"}
                </button>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function FilterButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
        isActive
          ? "bg-[#236b4a] text-white"
          : "bg-[#f5f7f5] text-[#68766f] hover:bg-[#e8ede9]"
      }`}
    >
      {label} <span className="ml-1 font-normal">({count})</span>
    </button>
  );
}
