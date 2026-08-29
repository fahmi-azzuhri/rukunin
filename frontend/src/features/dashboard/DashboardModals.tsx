import type { FormEvent, ReactNode } from "react";
import type { Appointment, Area, House, Resident } from "../../lib/api";
import type { Role } from "./dashboardConfig.ts";
import {
  appointmentPurposes,
  getPurposeLabel,
} from "../../lib/appointmentUtils";
import { Modal } from "../../components/ui/Modal.tsx";
import { ResidentModal } from "./ResidentModal.tsx";

type DashboardModalsProps = {
  residentOpen: boolean;
  resident: Resident | null;
  houseOpen: boolean;
  house: House | null;
  contributionOpen: boolean;
  expenseOpen: boolean;
  announcementOpen: boolean;
  appointmentOpen: boolean;
  appointmentReviewOpen: boolean;
  selectedAppointment: Appointment | null;
  userOpen: boolean;
  areaOpen: boolean;
  houses: House[];
  residents: Resident[];
  area: Area | null;
  role: Role;
  isSaving: boolean;
  onResidentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onHouseSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onContributionSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onExpenseSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAnnouncementSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAppointmentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAppointmentReviewSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUserSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAreaSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCloseResident: () => void;
  onCloseHouse: () => void;
  onCloseContribution: () => void;
  onCloseExpense: () => void;
  onCloseAnnouncement: () => void;
  onCloseAppointment: () => void;
  onCloseAppointmentReview: () => void;
  onCloseUser: () => void;
  onCloseArea: () => void;
};

const fieldClass =
  "rounded-[7px] border border-[#d3ddd6] bg-white px-3.5 py-3 text-[13px] text-[#172522] outline-0 transition focus:border-[#236b4a] focus:ring-4 focus:ring-[#236b4a]/10";
const formClass = "grid gap-5 p-7 max-[500px]:p-5";

export function DashboardModals(props: DashboardModalsProps) {
  return (
    <>
      <ResidentModal
        open={props.residentOpen}
        resident={props.resident}
        houses={props.houses}
        role={props.role}
        isSaving={props.isSaving}
        onClose={props.onCloseResident}
        onSubmit={props.onResidentSubmit}
      />
      <SimpleModal
        open={props.houseOpen}
        titleId="house-modal-title"
        eyebrow="DATA RUMAH"
        title={props.house ? "Edit rumah" : "Tambah rumah"}
        onClose={props.onCloseHouse}
      >
        <form className={formClass} onSubmit={props.onHouseSubmit}>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Nomor rumah
            <input
              required
              className={`h-12 ${fieldClass} text-base font-bold`}
              name="number"
              placeholder="Contoh: A-01"
              autoFocus
              defaultValue={props.house?.number ?? ""}
            />
          </label>
          <FormActions
            isSaving={props.isSaving}
            submit={props.house ? "Simpan perubahan" : "Simpan rumah"}
            onCancel={props.onCloseHouse}
          />
        </form>
      </SimpleModal>
      <SimpleModal
        open={props.contributionOpen}
        titleId="contribution-modal-title"
        eyebrow="KEUANGAN"
        title="Catat pembayaran"
        description="Catat pembayaran iuran warga untuk periode yang dipilih."
        onClose={props.onCloseContribution}
      >
        <form className={formClass} onSubmit={props.onContributionSubmit}>
          <ResidentSelect residents={props.residents} />
          <div className="grid grid-cols-2 gap-4 max-[500px]:grid-cols-1">
            <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
              Bulan
              <select
                className={fieldClass}
                name="month"
                defaultValue={String(new Date().getMonth() + 1)}
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {String(index + 1).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
              Tahun
              <input
                required
                className={fieldClass}
                name="year"
                type="number"
                defaultValue={new Date().getFullYear()}
              />
            </label>
          </div>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Nominal
            <input
              required
              className={`h-12 ${fieldClass} text-base font-bold`}
              name="amount"
              type="number"
              min="1"
              placeholder="Contoh: 50000"
            />
          </label>
          <FormActions
            isSaving={props.isSaving}
            submit="Simpan pembayaran"
            onCancel={props.onCloseContribution}
          />
        </form>
      </SimpleModal>
      <SimpleModal
        open={props.expenseOpen}
        titleId="expense-modal-title"
        eyebrow="KAS"
        title="Catat pengeluaran"
        description="Simpan transaksi kas RT dengan keterangan dan nominal yang jelas."
        onClose={props.onCloseExpense}
      >
        <form className={formClass} onSubmit={props.onExpenseSubmit}>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Keterangan
            <input
              required
              className={fieldClass}
              name="description"
              placeholder="Contoh: Perbaikan lampu jalan"
            />
          </label>
          <div className="grid grid-cols-2 gap-4 max-[500px]:grid-cols-1">
            <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
              Kategori
              <select
                className={fieldClass}
                name="category"
                defaultValue="Maintenance"
              >
                <option>Maintenance</option>
                <option>Security</option>
                <option>Cleaning</option>
                <option>Kegiatan</option>
                <option>Lainnya</option>
              </select>
            </label>
            <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
              Nominal
              <input
                required
                className={`h-12 ${fieldClass} text-base font-bold`}
                name="amount"
                type="number"
                min="1"
                placeholder="Contoh: 150000"
              />
            </label>
          </div>
          <FormActions
            isSaving={props.isSaving}
            submit="Simpan pengeluaran"
            onCancel={props.onCloseExpense}
          />
        </form>
      </SimpleModal>
      <SimpleModal
        open={props.announcementOpen}
        titleId="announcement-modal-title"
        eyebrow="KOMUNIKASI"
        title="Buat pengumuman"
        onClose={props.onCloseAnnouncement}
      >
        <form className={formClass} onSubmit={props.onAnnouncementSubmit}>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Judul
            <input
              required
              className={fieldClass}
              name="title"
              placeholder="Contoh: Kerja bakti hari Minggu"
            />
          </label>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Isi pengumuman
            <textarea
              required
              className={`min-h-[150px] ${fieldClass} leading-6`}
              name="content"
              rows={5}
              placeholder="Tulis informasi untuk warga..."
            />
          </label>
          <FormActions
            isSaving={props.isSaving}
            submit="Terbitkan pengumuman"
            onCancel={props.onCloseAnnouncement}
          />
        </form>
      </SimpleModal>
      <SimpleModal
        open={props.appointmentOpen}
        titleId="appointment-modal-title"
        eyebrow="PELAYANAN RT"
        title="Ajukan janji temu"
        description="Ajukan kebutuhan surat pengantar atau keperluan ke RT. Ketua RT akan menilai dan memberi opsi lain bila perlu."
        onClose={props.onCloseAppointment}
      >
        <form className={formClass} onSubmit={props.onAppointmentSubmit}>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Nama pemohon
            <input
              className={fieldClass}
              name="requester_name"
              placeholder="Contoh: Budi Santoso"
            />
          </label>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Keperluan
            <select
              required
              className={fieldClass}
              name="purpose"
              defaultValue=""
            >
              <option value="">Pilih keperluan Anda</option>
              {appointmentPurposes.map((purpose) => (
                <option key={purpose.value} value={purpose.value}>
                  {purpose.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Detail kebutuhan
            <textarea
              className={`min-h-[120px] ${fieldClass} leading-6`}
              name="details"
              placeholder="Jelaskan kebutuhan Anda, misalnya surat pengantar untuk dokumen, izin, atau kegiatan RT."
            />
          </label>
          <div className="grid grid-cols-2 gap-4 max-[500px]:grid-cols-1">
            <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
              Tanggal usulan
              <input
                required
                className={fieldClass}
                name="preferred_date"
                type="date"
              />
            </label>
            <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
              Jam usulan
              <input
                required
                className={fieldClass}
                name="preferred_time"
                type="time"
              />
            </label>
          </div>
          <FormActions
            isSaving={props.isSaving}
            submit="Ajukan janji temu"
            onCancel={props.onCloseAppointment}
          />
        </form>
      </SimpleModal>
      <SimpleModal
        open={props.appointmentReviewOpen && !!props.selectedAppointment}
        titleId="appointment-review-modal-title"
        eyebrow={
          props.role === "warga" ? "STATUS PERMOHONAN" : "TINJAU PERMOHONAN"
        }
        title={
          props.role === "warga"
            ? "Status janji temu Anda"
            : "Tinjau janji temu"
        }
        description={
          props.role === "warga"
            ? "Lihat status permohonan janji temu Anda dari Ketua atau Wakil RT."
            : "Ketua RT dapat menyetujui, menolak, atau mengusulkan hari lain. Wakil RT dapat mengusulkan penugasan dan jadwal alternatif."
        }
        onClose={props.onCloseAppointmentReview}
      >
        {props.selectedAppointment && (
          <form
            className={formClass}
            onSubmit={props.onAppointmentReviewSubmit}
          >
            <div className="rounded-[10px] bg-[#f5f7f5] p-4 text-[12px] text-[#51615d]">
              <div>
                <strong>Nama:</strong>{" "}
                {props.selectedAppointment.requester_name}
              </div>
              <div>
                <strong>Keperluan:</strong>{" "}
                {getPurposeLabel(props.selectedAppointment.purpose)}
              </div>
              <div>
                <strong>Detail:</strong>{" "}
                {props.selectedAppointment.details || "(Tidak ada)"}
              </div>
              <div>
                <strong>Usulan awal:</strong>{" "}
                {props.selectedAppointment.preferred_date}{" "}
                {props.selectedAppointment.preferred_time}
              </div>
            </div>
            {props.role !== "warga" && (
              <>
                <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
                  Status
                  <select
                    className={fieldClass}
                    name="status"
                    defaultValue={props.selectedAppointment.status}
                  >
                    <option value="approved">Disetujui</option>
                    <option value="rescheduled">Diusulkan hari lain</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-4 max-[500px]:grid-cols-1">
                  <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
                    Tanggal alternatif
                    <input
                      className={fieldClass}
                      name="proposed_date"
                      type="date"
                      defaultValue={
                        props.selectedAppointment.proposed_date ?? ""
                      }
                    />
                  </label>
                  <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
                    Jam alternatif
                    <input
                      className={fieldClass}
                      name="proposed_time"
                      type="time"
                      defaultValue={
                        props.selectedAppointment.proposed_time ?? ""
                      }
                    />
                  </label>
                </div>
                <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
                  Penanggung jawab
                  <select
                    className={fieldClass}
                    name="assigned_to"
                    defaultValue={
                      props.selectedAppointment.assigned_to ?? "ketua"
                    }
                  >
                    <option value="ketua">Ketua RT</option>
                    <option value="wakil">Wakil RT</option>
                  </select>
                </label>
              </>
            )}
            {props.selectedAppointment.decision_note && (
              <div className="rounded-[10px] bg-[#f5f7f5] p-4 text-[12px] text-[#51615d]">
                <strong>Catatan dari RT:</strong>
                <p className="mt-2 whitespace-pre-wrap text-[11px]">
                  {props.selectedAppointment.decision_note}
                </p>
              </div>
            )}
            {props.selectedAppointment.proposed_date && (
              <div className="rounded-[10px] bg-[#dfe5ff] p-4 text-[12px] text-[#364a84]">
                <strong>Jadwal yang diusulkan:</strong>
                <p className="mt-2">
                  {props.selectedAppointment.proposed_date}{" "}
                  {props.selectedAppointment.proposed_time}
                </p>
              </div>
            )}
            <FormActions
              isSaving={props.isSaving}
              submit={props.role === "warga" ? "Tutup" : "Simpan keputusan"}
              onCancel={props.onCloseAppointmentReview}
            />
          </form>
        )}
      </SimpleModal>
      <SimpleModal
        open={props.userOpen}
        titleId="user-modal-title"
        eyebrow="AKUN PENGGUNA"
        title="Buat akun warga"
        description="Pilih warga yang sudah terdaftar, lalu tentukan akses loginnya."
        onClose={props.onCloseUser}
      >
        <form className={formClass} onSubmit={props.onUserSubmit}>
          <ResidentSelect residents={props.residents} />
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Username
            <input required className={fieldClass} name="username" />
          </label>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Password
            <input
              required
              minLength={6}
              className={fieldClass}
              name="password"
              type="password"
            />
          </label>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Hak akses
            <select
              required
              className={fieldClass}
              name="role"
              defaultValue="warga"
            >
              <option value="bendahara">Bendahara</option>
              <option value="sekretaris">Sekretaris</option>
              <option value="wakil">Wakil RT</option>
              <option value="warga">Warga</option>
            </select>
          </label>
          <FormActions
            isSaving={props.isSaving}
            submit="Buat akun"
            onCancel={props.onCloseUser}
          />
        </form>
      </SimpleModal>
      <SimpleModal
        open={props.areaOpen}
        titleId="area-modal-title"
        eyebrow="KONFIGURASI AREA"
        title="Pengaturan RT"
        description="Nama ini akan dipakai di seluruh dashboard dan laporan RT."
        onClose={props.onCloseArea}
      >
        <form className={formClass} onSubmit={props.onAreaSubmit}>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Nama RT
            <input
              required
              className={fieldClass}
              name="name"
              defaultValue={props.area?.name ?? ""}
              placeholder="Contoh: RT 01"
            />
          </label>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Nama Ketua RT
            <input
              className={fieldClass}
              name="chair"
              defaultValue={props.area?.chair ?? ""}
              placeholder="Contoh: Budi Santoso"
            />
          </label>
          <FormActions
            isSaving={props.isSaving}
            submit="Simpan area"
            onCancel={props.onCloseArea}
          />
        </form>
      </SimpleModal>
    </>
  );
}

function ResidentSelect({ residents }: { residents: Resident[] }) {
  return (
    <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
      Warga
      <select
        required
        className={fieldClass}
        name="resident_id"
        defaultValue=""
      >
        <option value="" disabled>
          Pilih warga
        </option>
        {residents.map((resident) => (
          <option key={resident.id} value={resident.id}>
            {resident.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormActions({
  isSaving,
  submit,
  onCancel,
}: {
  isSaving: boolean;
  submit: string;
  onCancel: () => void;
}) {
  return (
    <div className="mt-1 flex justify-end gap-2.5 border-t border-[#e1e7e2] pt-5">
      <button
        type="button"
        className="rounded-[6px] border border-[#d3ddd6] bg-transparent px-3.5 py-[11px] text-xs font-extrabold text-[#236b4a]"
        onClick={onCancel}
      >
        Batal
      </button>
      <button
        className="rounded-[6px] bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
        disabled={isSaving}
      >
        {isSaving ? "Menyimpan..." : submit}
      </button>
    </div>
  );
}

function SimpleModal({
  open,
  titleId,
  eyebrow,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  titleId: string;
  eyebrow: string;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <Modal
      titleId={titleId}
      onClose={onClose}
      className="max-h-[calc(100vh_-_40px)] w-[min(520px,100%)] overflow-y-auto rounded-[14px] bg-white shadow-[0_24px_70px_#17382e30]"
    >
      <div className="flex items-start justify-between border-b border-[#e1e7e2] bg-[#fbfcfa] px-7 pb-5 pt-6 max-[500px]:px-5">
        <div>
          <span className="font-mono text-[10px] font-medium tracking-[1.1px] text-[#93a19a]">
            {eyebrow}
          </span>
          <h2 className="mt-2 text-lg tracking-[-0.5px]" id={titleId}>
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#78847f]">
              {description}
            </p>
          )}
        </div>
        <button
          className="border-0 bg-transparent text-lg text-[#78847f]"
          onClick={onClose}
          aria-label="Tutup"
          type="button"
        >
          x
        </button>
      </div>
      {children}
    </Modal>
  );
}
