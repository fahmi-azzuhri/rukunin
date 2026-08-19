import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  createHouse,
  createContribution,
  createResident,
  getContributions,
  getHouses,
  getResidents,
} from "./lib/api";
import type { Contribution, House, Resident } from "./lib/api";
import "./App.css";

const rtId = 1;

function App() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHouseFormOpen, setIsHouseFormOpen] = useState(false);
  const [isContributionFormOpen, setIsContributionFormOpen] = useState(false);
  const [search, setSearch] = useState("");

  async function loadData() {
    setIsLoading(true);
    setError("");
    try {
      const [residentData, houseData, contributionData] = await Promise.all([
        getResidents(rtId),
        getHouses(rtId),
        getContributions(rtId),
      ]);
      setResidents(residentData);
      setHouses(houseData);
      setContributions(contributionData);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Data belum tersedia",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSaving(true);
    setError("");
    try {
      await createResident(rtId, {
        name: String(form.get("name") ?? ""),
        nik: String(form.get("nik") ?? ""),
        no_kk: String(form.get("no_kk") ?? ""),
        phone: String(form.get("phone") ?? ""),
        status: String(form.get("status") ?? "Anggota"),
        house_id: Number(form.get("house_id")),
      });
      event.currentTarget.reset();
      setIsFormOpen(false);
      await loadData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Warga gagal ditambahkan",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleHouseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSaving(true);
    setError("");
    try {
      await createHouse(rtId, String(form.get("number") ?? ""));
      event.currentTarget.reset();
      setIsHouseFormOpen(false);
      await loadData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Rumah gagal ditambahkan",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleContributionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSaving(true);
    setError("");
    try {
      await createContribution(rtId, {
        resident_id: Number(form.get("resident_id")),
        month: Number(form.get("month")),
        year: Number(form.get("year")),
        amount: Number(form.get("amount")),
      });
      event.currentTarget.reset();
      setIsContributionFormOpen(false);
      await loadData();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Iuran gagal disimpan",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const residentName = new Map(
    residents.map((resident) => [resident.id, resident.name]),
  );
  const totalContributions = contributions.reduce(
    (total, contribution) => total + contribution.amount,
    0,
  );

  const filteredResidents = residents.filter((resident) =>
    `${resident.name} ${resident.nik} ${resident.phone}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">R</span>
          <span>rukunin</span>
        </div>
        <div className="workspace-label">AREA KERJA</div>
        <div className="area-switcher">
          <span className="status-dot" /> RT 01{" "}
          <span className="chevron">v</span>
          <small>RW 01</small>
        </div>
        <nav className="nav-list" aria-label="Navigasi utama">
          <a className="nav-item active" href="#warga">
            <span>01</span> Warga
          </a>
          <a className="nav-item" href="#iuran">
            <span>02</span> Iuran
          </a>
          <a className="nav-item" href="#kas">
            <span>03</span> Kas RT
          </a>
          <a className="nav-item" href="#pengumuman">
            <span>04</span> Pengumuman
          </a>
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">BS</div>
          <div>
            <strong>Budi Santoso</strong>
            <small>Ketua RT</small>
          </div>
          <span className="more">...</span>
        </div>
      </aside>

      <section className="content" id="warga">
        <header className="topbar">
          <div>
            <span className="eyebrow">SELASA, 19 AGUSTUS 2026</span>
            <h1>Data warga</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifikasi">
              !
            </button>
            <div className="user-chip">
              <span className="avatar small">BS</span>
              <span>RT 01</span>
            </div>
          </div>
        </header>
        <div className="intro-row">
          <p>Kelola data warga dan rumah di lingkungan RT 01.</p>
          <div className="intro-actions">
            <button
              className="secondary-button"
              onClick={() => setIsHouseFormOpen(true)}
            >
              <span>+</span> Tambah rumah
            </button>
            <button
              className="primary-button"
              onClick={() => setIsFormOpen(true)}
            >
              <span>+</span> Tambah warga
            </button>
          </div>
        </div>
        {error && (
          <div className="notice">
            <strong>Belum terhubung ke API.</strong> {error}{" "}
            <button onClick={() => void loadData()}>Coba lagi</button>
          </div>
        )}
        <section className="stats-grid" aria-label="Ringkasan data">
          <article className="stat-card accent">
            <span className="stat-label">TOTAL WARGA</span>
            <strong>{isLoading ? "--" : residents.length}</strong>
            <span className="stat-note">terdata di RT 01</span>
          </article>
          <article className="stat-card">
            <span className="stat-label">TOTAL RUMAH</span>
            <strong>{isLoading ? "--" : houses.length}</strong>
            <span className="stat-note">rumah terdaftar</span>
          </article>
          <article className="stat-card">
            <span className="stat-label">KEPALA KELUARGA</span>
            <strong>
              {isLoading
                ? "--"
                : residents.filter(
                    (resident) => resident.status === "Kepala Keluarga",
                  ).length}
            </strong>
            <span className="stat-note">dari total warga</span>
          </article>
        </section>
        <section className="table-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">DATABASE RT 01</span>
              <h2>Daftar warga</h2>
            </div>
            <div className="table-tools">
              <label className="search-box">
                <span>/</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama atau NIK..."
                />
              </label>
              <button className="filter-button">
                Filter <span>v</span>
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>WARGA</th>
                  <th>NIK</th>
                  <th>NO. RUMAH</th>
                  <th>STATUS</th>
                  <th>TELEPON</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      Memuat data warga...
                    </td>
                  </tr>
                ) : filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      Belum ada data warga.
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map((resident) => (
                    <tr key={resident.id}>
                      <td>
                        <div className="person">
                          <span className="person-avatar">
                            {resident.name.slice(0, 1).toUpperCase()}
                          </span>
                          <strong>{resident.name}</strong>
                        </div>
                      </td>
                      <td>{resident.nik || "-"}</td>
                      <td>
                        <span className="house-tag">#{resident.house_id}</span>
                      </td>
                      <td>
                        <span className="role-tag">
                          {resident.status || "Anggota"}
                        </span>
                      </td>
                      <td>{resident.phone || "-"}</td>
                      <td>
                        <button
                          className="row-menu"
                          aria-label={`Opsi ${resident.name}`}
                        >
                          ...
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="contribution-section" id="iuran">
          <div className="section-heading">
            <div>
              <span className="eyebrow">KEUANGAN RT 01</span>
              <h2>Iuran warga</h2>
            </div>
            <button
              className="primary-button"
              onClick={() => setIsContributionFormOpen(true)}
            >
              <span>+</span> Catat pembayaran
            </button>
          </div>
          <div className="contribution-summary">
            <div>
              <span className="stat-label">TOTAL TERCATAT</span>
              <strong>Rp {totalContributions.toLocaleString("id-ID")}</strong>
            </div>
            <div>
              <span className="stat-label">PEMBAYARAN</span>
              <strong>{contributions.length}</strong>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>WARGA</th>
                  <th>PERIODE</th>
                  <th>NOMINAL</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {contributions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      Belum ada pembayaran iuran.
                    </td>
                  </tr>
                ) : (
                  contributions.map((contribution) => (
                    <tr key={contribution.id}>
                      <td>
                        <strong>
                          {residentName.get(contribution.resident_id) ??
                            `Warga #${contribution.resident_id}`}
                        </strong>
                      </td>
                      <td>
                        {String(contribution.month).padStart(2, "0")}/
                        {contribution.year}
                      </td>
                      <td>Rp {contribution.amount.toLocaleString("id-ID")}</td>
                      <td>
                        <span className="role-tag">
                          {contribution.status || "Paid"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">DATA BARU</span>
                <h2 id="modal-title">Tambah warga</h2>
              </div>
              <button
                className="close-button"
                onClick={() => setIsFormOpen(false)}
                aria-label="Tutup"
              >
                x
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label>
                Nama lengkap
                <input
                  required
                  name="name"
                  placeholder="Contoh: Budi Santoso"
                />
              </label>
              <label>
                NIK
                <input
                  name="nik"
                  inputMode="numeric"
                  placeholder="16 digit NIK"
                />
              </label>
              <div className="form-row">
                <label>
                  No. rumah
                  <select required name="house_id" defaultValue="">
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
                <label>
                  Status
                  <select name="status" defaultValue="Anggota">
                    <option>Kepala Keluarga</option>
                    <option>Anggota</option>
                    <option>Tamu</option>
                  </select>
                </label>
              </div>
              <label>
                No. telepon
                <input
                  name="phone"
                  inputMode="tel"
                  placeholder="08xx-xxxx-xxxx"
                />
              </label>
              <label>
                No. KK
                <input
                  name="no_kk"
                  inputMode="numeric"
                  placeholder="Nomor kartu keluarga"
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsFormOpen(false)}
                >
                  Batal
                </button>
                <button className="primary-button" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan warga"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isHouseFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal modal-small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="house-modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">DATA RUMAH</span>
                <h2 id="house-modal-title">Tambah rumah</h2>
              </div>
              <button
                className="close-button"
                onClick={() => setIsHouseFormOpen(false)}
                aria-label="Tutup"
              >
                x
              </button>
            </div>
            <form onSubmit={handleHouseSubmit}>
              <label>
                Nomor rumah
                <input
                  required
                  name="number"
                  placeholder="Contoh: A-01"
                  autoFocus
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsHouseFormOpen(false)}
                >
                  Batal
                </button>
                <button className="primary-button" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan rumah"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isContributionFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contribution-modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">KEUANGAN RT 01</span>
                <h2 id="contribution-modal-title">Catat pembayaran</h2>
              </div>
              <button
                className="close-button"
                onClick={() => setIsContributionFormOpen(false)}
                aria-label="Tutup"
              >
                x
              </button>
            </div>
            <form onSubmit={handleContributionSubmit}>
              <label>
                Warga
                <select required name="resident_id" defaultValue="">
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
              <div className="form-row">
                <label>
                  Bulan
                  <select
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
                <label>
                  Tahun
                  <input
                    required
                    name="year"
                    type="number"
                    defaultValue={new Date().getFullYear()}
                  />
                </label>
              </div>
              <label>
                Nominal
                <input
                  required
                  name="amount"
                  type="number"
                  min="1"
                  placeholder="Contoh: 50000"
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsContributionFormOpen(false)}
                >
                  Batal
                </button>
                <button className="primary-button" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan pembayaran"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
