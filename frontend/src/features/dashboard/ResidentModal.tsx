import type { FormEvent } from "react";
import type { House, Resident } from "../../lib/api";
import type { Role } from "./dashboardConfig.ts";
import { Modal } from "../../components/ui/Modal.tsx";

type ResidentModalProps = {
  open: boolean;
  resident: Resident | null;
  houses: House[];
  role: Role;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ResidentModal({
  open,
  resident,
  houses,
  role,
  isSaving,
  onClose,
  onSubmit,
}: ResidentModalProps) {
  if (!open) return null;

  return (
    <Modal
      titleId="modal-title"
      onClose={onClose}
      className="max-h-[calc(100vh_-_40px)] w-[min(560px,100%)] overflow-y-auto rounded-[10px] bg-white p-7 shadow-[0_20px_50px_#17382e24] [&_form]:grid [&_form]:gap-5 [&_label]:grid [&_label]:gap-2 [&_label]:text-[11px] [&_label]:font-bold [&_label]:text-[#68766f] [&_input]:rounded-[6px] [&_input]:border [&_input]:border-[#dce5df] [&_input]:bg-white [&_input]:p-3 [&_input]:text-[13px] [&_input]:outline-0 [&_input]:transition [&_input]:focus:border-[#236b4a] [&_select]:rounded-[6px] [&_select]:border [&_select]:border-[#dce5df] [&_select]:bg-white [&_select]:p-3 [&_select]:text-[13px] [&_select]:outline-0 [&_select]:focus:border-[#236b4a] [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-[6px] [&_textarea]:border [&_textarea]:border-[#dce5df] [&_textarea]:p-3 [&_textarea]:text-[13px] [&_textarea]:outline-0 [&_textarea]:focus:border-[#236b4a]"
    >
      <div className="mb-1 flex items-start justify-between border-b border-[#e1e7e2] pb-5">
        <div>
          <span className="font-mono text-[10px] font-bold leading-none tracking-[1.1px] text-[#236b4a]">
            DATABASE WARGA
          </span>
          <h2
            className="mt-2 text-[22px] font-semibold tracking-[-0.6px] text-[#172522]"
            id="modal-title"
          >
            {resident ? "Edit warga" : "Tambah warga"}
          </h2>
          <p className="mt-1.5 text-xs text-[#78847f]">
            {resident
              ? "Perbarui informasi warga dan penempatannya."
              : "Tambahkan identitas warga beserta rumahnya."}
          </p>
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
      <form onSubmit={onSubmit}>
        <div className="border-b border-[#edf1ee] pb-1">
          <p className="mb-3 font-mono text-[10px] font-bold tracking-[1px] text-[#93a19a]">
            IDENTITAS
          </p>
          <label>
            Nama lengkap
            <input
              required
              name="name"
              placeholder="Contoh: Budi Santoso"
              defaultValue={resident?.name ?? ""}
            />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
            <label>
              NIK
              <input
                name="nik"
                inputMode="numeric"
                placeholder="16 digit NIK"
                defaultValue={resident?.nik ?? ""}
              />
            </label>
            <label>
              No. KK
              <input
                name="no_kk"
                inputMode="numeric"
                placeholder="Nomor kartu keluarga"
                defaultValue={resident?.no_kk ?? ""}
              />
            </label>
          </div>
        </div>
        <div className="border-b border-[#edf1ee] pb-1">
          <p className="mb-3 font-mono text-[10px] font-bold tracking-[1px] text-[#93a19a]">
            DOMISILI
          </p>
          {!resident ? (
            <>
              <label>
                Alamat rumah
                <textarea
                  required
                  name="address"
                  rows={3}
                  placeholder="Contoh: Jl. Melati 2"
                />
              </label>
              <label className="mt-2">
                Nomor rumah
                <input required name="house_number" placeholder="Contoh: 12A" />
              </label>
            </>
          ) : (
            <label>
              No. rumah
              <select
                required
                name="house_id"
                defaultValue={resident?.house_id ?? ""}
              >
                <option value="" disabled>
                  Pilih rumah
                </option>
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    Rumah {house.number}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="mt-2">
            Status
            <select name="status" defaultValue={resident?.status ?? "Anggota"}>
              <option>Kepala Keluarga</option>
              <option>Anggota</option>
              <option>Tamu</option>
            </select>
          </label>
          <label className="mt-2">
            No. telepon
            <input
              name="phone"
              inputMode="tel"
              placeholder="08xx-xxxx-xxxx"
              defaultValue={resident?.phone ?? ""}
            />
          </label>
        </div>

        {!resident && role === "ketua" && (
          <fieldset className="grid gap-4 rounded-[8px] border border-[#cce3d4] bg-[#f5fbf7] p-5">
            <legend className="px-1 font-mono text-[10px] font-bold tracking-[1px] text-[#236b4a]">
              AKSES APLIKASI
            </legend>
            <p className="-mt-1 text-[11px] leading-5 text-[#68766f]">
              Opsional. Isi username, password, dan role jika warga ini perlu
              login.
            </p>
            <label>
              Username
              <input name="username" placeholder="contoh: bendahara.rt02" />
            </label>
            <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
              <label>
                Password
                <input
                  minLength={6}
                  name="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                />
              </label>
              <label>
                Hak akses
                <select name="account_role" defaultValue="">
                  <option value="">Pilih role</option>
                  <option value="bendahara">Bendahara</option>
                  <option value="sekretaris">Sekretaris</option>
                  <option value="wakil">Wakil RT</option>
                  <option value="warga">Warga</option>
                </select>
              </label>
            </div>
          </fieldset>
        )}
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            className="rounded-[6px] border border-[#d3ddd6] bg-transparent px-3.5 py-[11px] text-xs font-extrabold text-[#236b4a]"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving
              ? "Menyimpan..."
              : resident
                ? "Simpan perubahan"
                : "Simpan warga"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
