import { useEffect, useState, type FormEvent } from "react";
import { createRtForMyRw, getMyRw, type Rw } from "../../lib/api";
import {
  getDistricts,
  getPostalCode,
  getProvinces,
  getRegencies,
  getVillages,
  type RegionOption,
} from "../../lib/indonesiaRegions";

export function RwDashboardPage({ onLogout }: { onLogout: () => void }) {
  const [rw, setRw] = useState<
    (Rw & { rts: { id: number; name: string; chair: string }[] }) | null
  >(null);
  const [error, setError] = useState("");
  const [invite, setInvite] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
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

  useEffect(() => {
    getProvinces()
      .then(setProvinces)
      .catch(() => setError("Data provinsi gagal dimuat"));
    getMyRw()
      .then(setRw)
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Data RW gagal dimuat",
        );
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const result = await createRtForMyRw(form);
      setInvite(
        `${window.location.origin}/aktivasi?token=${result.invite_token}`,
      );
      setForm({
        rt_name: "",
        chair_name: "",
        username: "",
        province: "",
        regency: "",
        district: "",
        village: "",
        postal_code: "",
      });
      const refreshed = await getMyRw();
      setRw(refreshed);
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

  async function changeProvince(code: string, name: string) {
    setForm({
      ...form,
      province: name,
      regency: "",
      district: "",
      village: "",
      postal_code: "",
    });
    setRegencies(await getRegencies(code));
    setDistricts([]);
    setVillages([]);
  }

  async function changeRegency(code: string, name: string) {
    setForm({
      ...form,
      regency: name,
      district: "",
      village: "",
      postal_code: "",
    });
    setDistricts(await getDistricts(code));
    setVillages([]);
  }

  async function changeDistrict(code: string, name: string) {
    setForm({ ...form, district: name, village: "", postal_code: "" });
    setVillages(await getVillages(code));
  }

  async function changeVillage(name: string) {
    const nextForm = { ...form, village: name, postal_code: "" };
    setForm(nextForm);
    const postalCode = await getPostalCode(
      name,
      nextForm.district,
      nextForm.regency,
      nextForm.province,
    );
    setForm({ ...nextForm, postal_code: postalCode });
  }

  return (
    <main className="min-h-screen bg-[#f7f9f6] p-8 font-sans text-[#172522] max-[600px]:p-5">
      <div className="mx-auto max-w-[720px]">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] tracking-[1.1px] text-[#93a19a]">
              ADMINISTRASI RW
            </span>
            <h1 className="mt-2 text-3xl tracking-[-1px]">
              {rw?.name ?? "Dashboard Ketua RW"}
            </h1>
          </div>
          <button
            className="rounded-[6px] border border-[#d3ddd6] px-3 py-2 text-xs font-bold text-[#236b4a]"
            onClick={onLogout}
          >
            Keluar
          </button>
        </header>
        {error && (
          <div className="mb-5 rounded-[6px] border border-[#f0d6a8] bg-[#fff6e7] px-[15px] py-3 text-xs text-[#825e2d]">
            {error}
          </div>
        )}
        {rw && (
          <>
            <section className="rounded-[9px] border border-[#e1e7e2] bg-white p-7">
              <p className="text-xs text-[#78847f]">
                {rw.province}, {rw.regency}, {rw.district}, {rw.village} ·{" "}
                {rw.postal_code}
              </p>
              <h2 className="mt-7 text-lg">RT di bawah {rw.name}</h2>
              <div className="mt-4 divide-y divide-[#eef2ee]">
                {rw.rts.length === 0 ? (
                  <p className="py-4 text-xs text-[#78847f]">
                    Belum ada RT terhubung.
                  </p>
                ) : (
                  rw.rts.map((rt) => (
                    <div
                      className="flex items-center justify-between py-4"
                      key={rt.id}
                    >
                      <strong className="text-sm">{rt.name}</strong>
                      <span className="text-xs text-[#78847f]">
                        {rt.chair || "Ketua belum diisi"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
            <section className="mt-6 rounded-[9px] border border-[#e1e7e2] bg-white p-7">
              <h2 className="text-lg">Tambah RT dan Ketua RT</h2>
              <p className="mt-2 text-xs text-[#78847f]">
                RT baru akan langsung berada di bawah {rw.name}.
              </p>
              <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
                <input
                  required
                  placeholder="Contoh: RT 03"
                  className="rounded-[7px] border border-[#d3ddd6] px-3.5 py-3 text-[13px]"
                  value={form.rt_name}
                  onChange={(event) =>
                    setForm({ ...form, rt_name: event.target.value })
                  }
                />
                <input
                  required
                  placeholder="Nama Ketua RT"
                  className="rounded-[7px] border border-[#d3ddd6] px-3.5 py-3 text-[13px]"
                  value={form.chair_name}
                  onChange={(event) =>
                    setForm({ ...form, chair_name: event.target.value })
                  }
                />
                <input
                  required
                  placeholder="Username Ketua RT"
                  className="rounded-[7px] border border-[#d3ddd6] px-3.5 py-3 text-[13px]"
                  value={form.username}
                  onChange={(event) =>
                    setForm({ ...form, username: event.target.value })
                  }
                />
                <select
                  required
                  className="rounded-[7px] border border-[#d3ddd6] px-3.5 py-3 text-[13px]"
                  value={form.province}
                  onChange={(event) => {
                    const option = provinces.find(
                      (item) => item.name === event.target.value,
                    );
                    if (option) void changeProvince(option.code, option.name);
                  }}
                >
                  <option value="">Pilih provinsi</option>
                  {provinces.map((option) => (
                    <option key={option.code} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <select
                  required
                  disabled={!regencies.length}
                  className="rounded-[7px] border border-[#d3ddd6] px-3.5 py-3 text-[13px]"
                  value={form.regency}
                  onChange={(event) => {
                    const option = regencies.find(
                      (item) => item.name === event.target.value,
                    );
                    if (option) void changeRegency(option.code, option.name);
                  }}
                >
                  <option value="">Pilih kabupaten/kota</option>
                  {regencies.map((option) => (
                    <option key={option.code} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <select
                  required
                  disabled={!districts.length}
                  className="rounded-[7px] border border-[#d3ddd6] px-3.5 py-3 text-[13px]"
                  value={form.district}
                  onChange={(event) => {
                    const option = districts.find(
                      (item) => item.name === event.target.value,
                    );
                    if (option) void changeDistrict(option.code, option.name);
                  }}
                >
                  <option value="">Pilih kecamatan</option>
                  {districts.map((option) => (
                    <option key={option.code} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <select
                  required
                  disabled={!villages.length}
                  className="rounded-[7px] border border-[#d3ddd6] px-3.5 py-3 text-[13px]"
                  value={form.village}
                  onChange={(event) => void changeVillage(event.target.value)}
                >
                  <option value="">Pilih kelurahan/desa</option>
                  {villages.map((option) => (
                    <option key={option.code} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <input
                  required
                  inputMode="numeric"
                  maxLength={5}
                  pattern="[0-9]{5}"
                  placeholder="Terisi otomatis, atau tulis manual"
                  className="rounded-[7px] border border-[#d3ddd6] px-3.5 py-3 text-[13px]"
                  value={form.postal_code}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      postal_code: event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 5),
                    })
                  }
                />
                <button
                  disabled={isSaving}
                  className="rounded-[6px] bg-[#236b4a] px-4 py-3 text-xs font-extrabold text-white disabled:opacity-50"
                >
                  {isSaving ? "Membuat undangan..." : "Buat RT dan undangan"}
                </button>
              </form>
              {invite && (
                <textarea
                  readOnly
                  className="mt-4 min-h-[90px] w-full rounded-[6px] border border-[#d3ddd6] p-3 text-xs"
                  value={invite}
                />
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
