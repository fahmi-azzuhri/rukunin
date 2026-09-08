import { useEffect, useState, type FormEvent } from "react";
import {
  assignRtToRw,
  createManagedRWAccount,
  createManagedRT,
  getManagedAreas,
  getRws,
  updateRwLimit,
  type Area,
  type Rw,
} from "../../lib/api";
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
    rw_chair_name: "",
    rw_username: "",
    rt_name: "",
    chair_name: "",
    username: "",
    province: "",
    regency: "",
    district: "",
    village: "",
    postal_code: "",
    max_rts: "",
  });
  const [provinces, setProvinces] = useState<RegionOption[]>([]);
  const [regencies, setRegencies] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [villages, setVillages] = useState<RegionOption[]>([]);
  const [regionError, setRegionError] = useState("");
  const [invite, setInvite] = useState("");
  const [rwInvite, setRwInvite] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"rt-only" | "rt-with-rw" | "rw-account">(
    "rt-only",
  );
  const [linkingRtId, setLinkingRtId] = useState<number | null>(null);
  const [linkRwId, setLinkRwId] = useState("");
  const [rws, setRws] = useState<Rw[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [rwLimits, setRwLimits] = useState<Record<number, string>>({});

  useEffect(() => {
    getProvinces()
      .then(setProvinces)
      .catch(() => setRegionError("Data provinsi gagal dimuat"));
  }, []);

  async function loadAreaData() {
    setIsLoadingAreas(true);
    try {
      const [nextRws, nextAreas] = await Promise.all([
        getRws(),
        getManagedAreas(),
      ]);
      setRws(nextRws);
      setRwLimits(
        Object.fromEntries(
          nextRws.map((rw) => [
            rw.id,
            rw.max_rts > 0 ? String(rw.max_rts) : "",
          ]),
        ),
      );
      setAreas(nextAreas);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Data wilayah gagal dimuat",
      );
    } finally {
      setIsLoadingAreas(false);
    }
  }

  useEffect(() => {
    const load = async () => {
      await loadAreaData();
    };
    void load();
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
      if (mode === "rw-account") {
        const result = await createManagedRWAccount({
          rw_name: form.rw_name,
          chair_name: form.rw_chair_name,
          username: form.rw_username,
          province: form.province,
          regency: form.regency,
          district: form.district,
          village: form.village,
          postal_code: form.postal_code,
        });
        setInvite("");
        setRwInvite(
          `${window.location.origin}/aktivasi?token=${result.invite_token}`,
        );
      } else {
        const result = await createManagedRT({
          ...form,
          max_rts: mode === "rt-with-rw" ? Number(form.max_rts) || 0 : 0,
          rw_mode: mode === "rt-only" ? "none" : "with_rw",
        });
        setInvite(
          `${window.location.origin}/aktivasi?token=${result.invite_token}`,
        );
        setRwInvite(
          result.rw_invite_token
            ? `${window.location.origin}/aktivasi?token=${result.rw_invite_token}`
            : "",
        );
      }
      setForm({
        rw_name: "",
        rw_chair_name: "",
        rw_username: "",
        rt_name: "",
        chair_name: "",
        username: "",
        province: "",
        regency: "",
        district: "",
        village: "",
        postal_code: "",
        max_rts: "",
      });
      await loadAreaData();
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

  async function handleLinkRt() {
    if (!linkingRtId || !linkRwId) return;
    setError("");
    try {
      await assignRtToRw(linkingRtId, Number(linkRwId));
      setLinkingRtId(null);
      setLinkRwId("");
      await loadAreaData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "RT gagal dihubungkan ke RW",
      );
    }
  }

  async function handleLimitSave(rwId: number) {
    const maxRts = Number(rwLimits[rwId] ?? 0);
    setError("");
    try {
      await updateRwLimit(rwId, Number.isFinite(maxRts) ? maxRts : 0);
      await loadAreaData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Batas RT gagal disimpan",
      );
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
        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            ["RW terdaftar", rws.length],
            ["RT terkelola", areas.length],
            ["RT sudah terhubung", areas.filter((area) => area.rw).length],
          ].map(([label, value]) => (
            <div
              className="rounded-[9px] border border-[#e1e7e2] bg-white p-5"
              key={label}
            >
              <div className="text-[10px] font-bold uppercase tracking-[1px] text-[#93a19a]">
                {label}
              </div>
              <div className="mt-2 text-3xl tracking-[-1px] text-[#236b4a]">
                {value}
              </div>
            </div>
          ))}
        </section>
        <section className="mb-6 rounded-[9px] border border-[#e1e7e2] bg-white p-7">
          <div className="flex items-start justify-between gap-4 max-[600px]:flex-col">
            <div>
              <span className="font-mono text-[10px] tracking-[1.1px] text-[#93a19a]">
                STRUKTUR WILAYAH
              </span>
              <h2 className="mt-2 text-lg">Kelola RW dan RT</h2>
              <p className="mt-2 text-xs leading-5 text-[#78847f]">
                RW ditentukan saat membuat RT. Sistem akan membuat akun Ketua RW
                jika wilayah tersebut belum memilikinya.
              </p>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto border-t border-[#e1e7e2] pt-4">
            {isLoadingAreas ? (
              <p className="py-4 text-xs text-[#78847f]">
                Memuat struktur wilayah...
              </p>
            ) : areas.length === 0 ? (
              <p className="py-4 text-xs text-[#78847f]">
                Belum ada RT terdaftar.
              </p>
            ) : (
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="text-[10px] uppercase tracking-[1px] text-[#93a19a]">
                  <tr>
                    <th className="pb-3 font-bold">RT</th>
                    <th className="pb-3 font-bold">Ketua</th>
                    <th className="pb-3 font-bold">RW induk</th>
                    <th className="pb-3 font-bold">Lokasi RW</th>
                    <th className="pb-3 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.map((area) => (
                    <tr className="border-t border-[#eef2ee]" key={area.id}>
                      <td className="py-3 font-bold">{area.name}</td>
                      <td className="py-3 text-[#68766f]">
                        {area.chair || "-"}
                      </td>
                      <td className="py-3 text-[#68766f]">
                        {area.rw?.name || "-"}
                      </td>
                      <td className="py-3 text-[#68766f]">
                        {area.rw
                          ? `${area.rw.name}, ${area.rw.district}, ${area.rw.village}`
                          : "Belum terhubung"}
                      </td>
                      <td className="py-3">
                        {linkingRtId === area.id ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              className="rounded-[6px] border border-[#d3ddd6] bg-white px-2 py-1.5 text-xs"
                              value={linkRwId}
                              onChange={(event) =>
                                setLinkRwId(event.target.value)
                              }
                            >
                              <option value="">Pilih RW</option>
                              {rws.map((rw) => (
                                <option key={rw.id} value={rw.id}>
                                  {rw.name} - {rw.district}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="rounded-[6px] bg-[#236b4a] px-2 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                              disabled={!linkRwId}
                              onClick={() => void handleLinkRt()}
                            >
                              Hubungkan
                            </button>
                            <button
                              type="button"
                              className="rounded-[6px] border border-[#d3ddd6] px-2 py-1.5 text-xs"
                              onClick={() => {
                                setLinkingRtId(null);
                                setLinkRwId("");
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="rounded-[6px] border border-[#236b4a] px-2 py-1.5 text-xs font-bold text-[#236b4a]"
                            onClick={() => setLinkingRtId(area.id)}
                          >
                            {area.rw ? "Ubah RW" : "Hubungkan ke RW"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {rws.length > 0 && (
            <div className="mt-6 border-t border-[#e1e7e2] pt-5">
              <h3 className="text-sm font-bold">Batas RT per RW</h3>
              <p className="mt-1 text-xs text-[#78847f]">
                Kosongkan batas untuk mengizinkan RT tanpa batas.
              </p>
              <div className="mt-3 grid gap-2">
                {rws.map((rw) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-[7px] border border-[#eef2ee] px-3 py-2"
                    key={rw.id}
                  >
                    <span className="text-xs font-bold">
                      {rw.name}{" "}
                      <span className="font-normal text-[#78847f]">
                        ({rw.district})
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        className="w-20 rounded-[6px] border border-[#d3ddd6] px-2 py-1.5 text-xs"
                        type="number"
                        min="0"
                        placeholder="Tanpa batas"
                        value={rwLimits[rw.id] ?? ""}
                        onChange={(event) =>
                          setRwLimits({
                            ...rwLimits,
                            [rw.id]: event.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        className="rounded-[6px] bg-[#236b4a] px-2 py-1.5 text-xs font-bold text-white"
                        onClick={() => void handleLimitSave(rw.id)}
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        <section className="rounded-[9px] border border-[#e1e7e2] bg-white p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg">
              {mode === "rt-only"
                ? "Daftarkan RT saja"
                : mode === "rw-account"
                  ? "Buat akun Ketua RW"
                  : "Daftarkan RT di bawah RW"}
            </h2>
            <div className="flex gap-2">
              {(["rt-only", "rt-with-rw", "rw-account"] as const).map(
                (nextMode) => (
                  <button
                    key={nextMode}
                    type="button"
                    className={`rounded-[6px] border px-3 py-2 text-xs font-bold ${
                      mode === nextMode
                        ? "border-[#236b4a] bg-[#236b4a] text-white"
                        : "border-[#d3ddd6] text-[#236b4a]"
                    }`}
                    onClick={() => {
                      setMode(nextMode);
                      setInvite("");
                      setRwInvite("");
                      setError("");
                    }}
                  >
                    {nextMode === "rt-only"
                      ? "RT saja"
                      : nextMode === "rt-with-rw"
                        ? "RT + RW"
                        : "Akun RW"}
                  </button>
                ),
              )}
            </div>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#78847f]">
            {mode === "rt-only"
              ? "Buat RT tanpa mengaktifkan RW. RT bisa dihubungkan ke RW nanti."
              : mode === "rw-account"
                ? "Tautkan akun Ketua RW ke RW yang sudah ada tanpa membuat RT baru."
                : "Buat RT sekaligus RW dan akun Ketua RW jika diperlukan."}
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
            {mode === "rt-only" ? "Provinsi RT" : "Provinsi RW"}
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
            {mode === "rt-only" ? "Kabupaten / Kota RT" : "Kabupaten / Kota RW"}
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
          <label className="mt-2 grid gap-2 text-[11px] font-bold text-[#68766f]">
            {mode === "rt-only" ? "Kecamatan RT" : "Kecamatan RW"}
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
            {mode === "rt-only" ? "Kelurahan / Desa RT" : "Kelurahan / Desa RW"}
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
            {mode === "rt-only" ? "Kode pos RT" : "Kode pos RW"}
            <input
              required
              readOnly
              value={form.postal_code}
              placeholder="Terisi otomatis dari kelurahan"
              className="rounded-[7px] border border-[#d3ddd6] bg-[#f7f9f6] px-3.5 py-3 text-[13px]"
            />
          </label>
          {mode === "rt-with-rw" && (
            <label className="mt-2 grid gap-2 text-[11px] font-bold text-[#68766f]">
              Batas jumlah RT untuk RW ini
              <input
                type="number"
                min="0"
                placeholder="Kosongkan untuk tanpa batas"
                className="rounded-[7px] border border-[#d3ddd6] px-3.5 py-3 text-[13px]"
                value={form.max_rts}
                onChange={(event) =>
                  setForm({ ...form, max_rts: event.target.value })
                }
              />
            </label>
          )}
          <form className="mt-2 grid gap-4" onSubmit={handleSubmit}>
            {(
              [
                "rw_name",
                "rw_chair_name",
                "rw_username",
                "rt_name",
                "chair_name",
                "username",
              ] as const
            )
              .filter(
                (name) =>
                  mode === "rt-with-rw" ||
                  (mode === "rt-only" && !name.startsWith("rw_")) ||
                  (mode === "rw-account" && name.startsWith("rw_")),
              )
              .map((name) => (
                <label
                  className="grid gap-2 text-[11px] font-bold text-[#68766f]"
                  key={name}
                >
                  {name === "rw_name"
                    ? "Identitas RW (nomor/nama wilayah)"
                    : name === "rw_chair_name"
                      ? "Nama Ketua RW (jika akun belum ada)"
                      : name === "rw_username"
                        ? "Username Ketua RW (jika akun belum ada)"
                        : name === "rt_name"
                          ? "Identitas RT (nomor/nama wilayah)"
                          : name === "chair_name"
                            ? "Nama Ketua RT (orang)"
                            : "Username login Ketua RT"}
                  <input
                    required={
                      mode === "rw-account"
                        ? name === "rw_name" ||
                          name === "rw_chair_name" ||
                          name === "rw_username"
                        : name === "rt_name" ||
                          name === "chair_name" ||
                          name === "username" ||
                          name === "rw_name"
                    }
                    placeholder={
                      name === "rw_name"
                        ? "Contoh: RW 03"
                        : name === "rw_chair_name"
                          ? "Contoh: Siti Aminah"
                          : name === "rw_username"
                            ? "Contoh: ketua.rw03"
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
              ))}

            <button
              className="mt-2 rounded-[6px] bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving
                ? "Membuat undangan..."
                : mode === "rw-account"
                  ? "Buat akun RW dan undangan"
                  : "Buat RT dan undangan"}
            </button>
          </form>
          {(invite || rwInvite) && (
            <div className="mt-6 border-t border-[#e1e7e2] pt-5">
              {invite && (
                <>
                  <strong className="text-sm">
                    {mode === "rw-account"
                      ? "Tautan undangan Ketua RW"
                      : "Tautan undangan Ketua RT"}
                  </strong>
                  <textarea
                    readOnly
                    className="mt-3 min-h-[90px] w-full rounded-[6px] border border-[#d3ddd6] p-3 text-xs"
                    value={invite}
                  />
                </>
              )}
              {rwInvite && (
                <>
                  <strong className="mt-5 block text-sm">
                    Tautan undangan Ketua RW
                  </strong>
                  <textarea
                    readOnly
                    className="mt-3 min-h-[90px] w-full rounded-[6px] border border-[#d3ddd6] p-3 text-xs"
                    value={rwInvite}
                  />
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
