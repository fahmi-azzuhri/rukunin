import { useEffect, useState, type FormEvent } from "react";
import { createManagedRT } from "../../lib/api";
import {
  getDistricts,
  getPostalCode,
  getProvinces,
  getRegencies,
  getVillages,
  type RegionOption,
} from "../../lib/indonesiaRegions";

export function SuperadminPage({ onLogout }: { onLogout: () => void }) {
  const [form, setForm] = useState({
    rw_name: "",
    rt_name: "",
    chair_name: "",
    username: "",
    province: "",
    regency: "",
    district: "",
    village: "",
    postal_code: "",
  });
  const [provinces, setProvinces] = useState<RegionOption[]>([]);
  const [regencies, setRegencies] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [villages, setVillages] = useState<RegionOption[]>([]);
  const [regionError, setRegionError] = useState("");
  const [invite, setInvite] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getProvinces()
      .then(setProvinces)
      .catch(() => setRegionError("Data provinsi gagal dimuat"));
  }, []);

  async function handleProvinceChange(code: string, name: string) {
    setForm({
      ...form,
      province: name,
      regency: "",
      district: "",
      village: "",
      postal_code: "",
    });
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    try {
      setRegencies(await getRegencies(code));
    } catch {
      setRegionError("Data kabupaten/kota gagal dimuat");
    }
  }

  async function handleRegencyChange(code: string, name: string) {
    setForm({
      ...form,
      regency: name,
      district: "",
      village: "",
      postal_code: "",
    });
    setDistricts([]);
    setVillages([]);
    try {
      setDistricts(await getDistricts(code));
    } catch {
      setRegionError("Data kecamatan gagal dimuat");
    }
  }

  async function handleDistrictChange(code: string, name: string) {
    setForm({ ...form, district: name, village: "", postal_code: "" });
    setVillages([]);
    try {
      setVillages(await getVillages(code));
    } catch {
      setRegionError("Data kelurahan gagal dimuat");
    }
  }

  async function handleVillageChange(name: string) {
    const nextForm = { ...form, village: name, postal_code: "" };
    setForm(nextForm);
    try {
      const postalCode = await getPostalCode(
        name,
        nextForm.district,
        nextForm.regency,
        nextForm.province,
      );
      setForm({ ...nextForm, postal_code: postalCode });
    } catch {
      setRegionError("Kode pos gagal dimuat");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const result = await createManagedRT(form);
      setInvite(
        `${window.location.origin}/aktivasi?token=${result.invite_token}`,
      );
      setForm({
        rw_name: "",
        rt_name: "",
        chair_name: "",
        username: "",
        province: "",
        regency: "",
        district: "",
        village: "",
        postal_code: "",
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "RT gagal dibuat",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f9f6] p-8 font-sans text-[#172522] max-[600px]:p-5">
      <div className="mx-auto max-w-[720px]">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] tracking-[1.1px] text-[#93a19a]">
              ADMINISTRASI PLATFORM
            </span>
            <h1 className="mt-2 text-3xl tracking-[-1px]">Buat wilayah RT</h1>
          </div>
          <button
            className="rounded-[6px] border border-[#d3ddd6] px-3 py-2 text-xs font-bold text-[#236b4a]"
            onClick={onLogout}
          >
            Keluar
          </button>
        </header>
        <section className="rounded-[9px] border border-[#e1e7e2] bg-white p-7">
          <h2 className="text-lg">Daftarkan RT dan undang ketuanya</h2>
          <p className="mt-2 text-xs leading-5 text-[#78847f]">
            Isi identitas wilayah terlebih dahulu. Ketua RT akan membuat
            password sendiri melalui tautan undangan.
          </p>
          {error && (
            <div className="mt-5 rounded-[6px] border border-[#f0d6a8] bg-[#fff6e7] px-[15px] py-3 text-xs text-[#825e2d]">
              {error}
            </div>
          )}
          {regionError && (
            <div className="mt-5 rounded-[6px] border border-[#f0d6a8] bg-[#fff6e7] px-[15px] py-3 text-xs text-[#825e2d]">
              {regionError}
            </div>
          )}
          <label className="mt-6 grid gap-2 text-[11px] font-bold text-[#68766f]">
            Provinsi
            <select
              required
              className="rounded-[7px] border border-[#d3ddd6] bg-white px-3.5 py-3 text-[13px]"
              value={form.province}
              onChange={(event) => {
                const option = provinces.find(
                  (item) => item.name === event.target.value,
                );
                if (option) void handleProvinceChange(option.code, option.name);
              }}
            >
              <option value="">Pilih provinsi</option>
              {provinces.map((option) => (
                <option key={option.code} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-2 grid gap-2 text-[11px] font-bold text-[#68766f]">
            Kabupaten / Kota
            <select
              required
              disabled={!regencies.length}
              className="rounded-[7px] border border-[#d3ddd6] bg-white px-3.5 py-3 text-[13px] disabled:bg-[#f7f9f6]"
              value={form.regency}
              onChange={(event) => {
                const option = regencies.find(
                  (item) => item.name === event.target.value,
                );
                if (option) void handleRegencyChange(option.code, option.name);
              }}
            >
              <option value="">Pilih kabupaten / kota</option>
              {regencies.map((option) => (
                <option key={option.code} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
            Kecamatan
            <select
              required
              disabled={!districts.length}
              className="rounded-[7px] border border-[#d3ddd6] bg-white px-3.5 py-3 text-[13px] disabled:bg-[#f7f9f6]"
              value={form.district}
              onChange={(event) => {
                const option = districts.find(
                  (item) => item.name === event.target.value,
                );
                if (option) void handleDistrictChange(option.code, option.name);
              }}
            >
              <option value="">Pilih kecamatan</option>
              {districts.map((option) => (
                <option key={option.code} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-2 grid gap-2 text-[11px] font-bold text-[#68766f]">
            Kelurahan / Desa
            <select
              required
              disabled={!villages.length}
              className="rounded-[7px] border border-[#d3ddd6] bg-white px-3.5 py-3 text-[13px] disabled:bg-[#f7f9f6]"
              value={form.village}
              onChange={(event) => void handleVillageChange(event.target.value)}
            >
              <option value="">Pilih kelurahan / desa</option>
              {villages.map((option) => (
                <option key={option.code} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-2 grid gap-2 text-[11px] font-bold text-[#68766f]">
            Kode pos
            <input
              required
              readOnly
              value={form.postal_code}
              placeholder="Terisi otomatis dari kelurahan"
              className="rounded-[7px] border border-[#d3ddd6] bg-[#f7f9f6] px-3.5 py-3 text-[13px]"
            />
          </label>
          <form className="mt-2 grid gap-4" onSubmit={handleSubmit}>
            {(["rw_name", "rt_name", "chair_name", "username"] as const).map(
              (name) => (
                <label
                  className="grid gap-2 text-[11px] font-bold text-[#68766f]"
                  key={name}
                >
                  {name === "rw_name"
                    ? "Identitas RW (nomor/nama wilayah)"
                    : name === "rt_name"
                      ? "Identitas RT (nomor/nama wilayah)"
                      : name === "chair_name"
                        ? "Nama Ketua RT (orang)"
                        : "Username login Ketua RT"}
                  <input
                    required
                    placeholder={
                      name === "rw_name"
                        ? "Contoh: RW 03"
                        : name === "rt_name"
                          ? "Contoh: RT 05"
                          : name === "chair_name"
                            ? "Contoh: Budi Santoso"
                            : "Contoh: ketua.rt05"
                    }
                    className="rounded-[7px] border border-[#d3ddd6] px-3.5 py-3 text-[13px]"
                    value={form[name]}
                    onChange={(event) =>
                      setForm({ ...form, [name]: event.target.value })
                    }
                  />
                </label>
              ),
            )}

            <button
              className="mt-2 rounded-[6px] bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? "Membuat undangan..." : "Buat RT dan undangan"}
            </button>
          </form>
          {invite && (
            <div className="mt-6 border-t border-[#e1e7e2] pt-5">
              <strong className="text-sm">
                Tautan undangan siap dibagikan
              </strong>
              <textarea
                readOnly
                className="mt-3 min-h-[90px] w-full rounded-[6px] border border-[#d3ddd6] p-3 text-xs"
                value={invite}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
