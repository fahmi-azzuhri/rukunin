import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  createHouse,
  createContribution,
  createExpense,
  createResident,
  getContributions,
  getExpenses,
  getHouses,
  getResidents,
} from "./lib/api";
import type { Contribution, Expense, House, Resident } from "./lib/api";
import "./App.css";

const rtId = 1;

function Dashboard() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHouseFormOpen, setIsHouseFormOpen] = useState(false);
  const [isContributionFormOpen, setIsContributionFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const activePage = location.pathname.replace("/", "") || "warga";

  async function loadData() {
    setIsLoading(true);
    setError("");
    const results = await Promise.allSettled([
      getResidents(rtId),
      getHouses(rtId),
      getContributions(rtId),
      getExpenses(rtId),
    ]);

    const [residentResult, houseResult, contributionResult, expenseResult] =
      results;
    const failedModules: string[] = [];

    if (residentResult.status === "fulfilled")
      setResidents(residentResult.value);
    else failedModules.push("warga");
    if (houseResult.status === "fulfilled") setHouses(houseResult.value);
    else failedModules.push("rumah");
    if (contributionResult.status === "fulfilled")
      setContributions(contributionResult.value);
    else failedModules.push("iuran");
    if (expenseResult.status === "fulfilled") setExpenses(expenseResult.value);
    else failedModules.push("kas");

    if (failedModules.length > 0) {
      setError(`Data ${failedModules.join(", ")} belum dapat dimuat.`);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
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
      formElement.reset();
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
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const houseNumber = String(form.get("number") ?? "")
      .trim()
      .toUpperCase();
    const isDuplicate = houses.some(
      (house) => house.number.trim().toUpperCase() === houseNumber,
    );
    if (isDuplicate) {
      setError(`Nomor rumah ${houseNumber} sudah terdaftar di RT 01.`);
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const newHouse = await createHouse(rtId, houseNumber);
      setHouses((currentHouses) => [...currentHouses, newHouse]);
      formElement.reset();
      setIsHouseFormOpen(false);
      void loadData();
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
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setIsSaving(true);
    setError("");
    try {
      await createContribution(rtId, {
        resident_id: Number(form.get("resident_id")),
        month: Number(form.get("month")),
        year: Number(form.get("year")),
        amount: Number(form.get("amount")),
      });
      formElement.reset();
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

  async function handleExpenseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setIsSaving(true);
    setError("");
    try {
      await createExpense(rtId, {
        description: String(form.get("description") ?? ""),
        category: String(form.get("category") ?? "Lainnya"),
        amount: Number(form.get("amount")),
        date: Date.now(),
        created_by: "Budi Santoso",
      });
      formElement.reset();
      setIsExpenseFormOpen(false);
      await loadData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Pengeluaran gagal disimpan",
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
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );
  const currentBalance = totalContributions - totalExpenses;

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
          <NavLink
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            to="/warga"
          >
            <span>01</span> Warga
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            to="/iuran"
          >
            <span>02</span> Iuran
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            to="/kas"
          >
            <span>03</span> Kas RT
          </NavLink>
          <span className="nav-item disabled">
            <span>04</span> Pengumuman
          </span>
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
            <h1>
              {activePage === "warga"
                ? "Data warga"
                : activePage === "iuran"
                  ? "Iuran warga"
                  : "Kas RT"}
            </h1>
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
        {activePage === "warga" && (
          <div className="page-content">
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
                <strong>Gagal memproses permintaan.</strong> {error}{" "}
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
                            <span className="house-tag">
                              #{resident.house_id}
                            </span>
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
          </div>
        )}

        {activePage === "iuran" && (
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
                        <td>
                          Rp {contribution.amount.toLocaleString("id-ID")}
                        </td>
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
        )}

        {activePage === "kas" && (
          <section className="contribution-section" id="kas">
            <div className="section-heading">
              <div>
                <span className="eyebrow">KEUANGAN RT 01</span>
                <h2>Kas RT</h2>
              </div>
              <button
                className="primary-button"
                onClick={() => setIsExpenseFormOpen(true)}
              >
                <span>+</span> Catat pengeluaran
              </button>
            </div>
            <div className="contribution-summary">
              <div>
                <span className="stat-label">SALDO BERJALAN</span>
                <strong
                  className={currentBalance < 0 ? "negative-balance" : ""}
                >
                  Rp {currentBalance.toLocaleString("id-ID")}
                </strong>
              </div>
              <div>
                <span className="stat-label">TOTAL PENGELUARAN</span>
                <strong>Rp {totalExpenses.toLocaleString("id-ID")}</strong>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>KETERANGAN</th>
                    <th>KATEGORI</th>
                    <th>NOMINAL</th>
                    <th>TANGGAL</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-state">
                        Belum ada pengeluaran.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>
                          <strong>{expense.description}</strong>
                        </td>
                        <td>
                          <span className="house-tag">
                            {expense.category || "Lainnya"}
                          </span>
                        </td>
                        <td>Rp {expense.amount.toLocaleString("id-ID")}</td>
                        <td>
                          {expense.date
                            ? new Date(expense.date).toLocaleDateString("id-ID")
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
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

      {isExpenseFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">KAS RT 01</span>
                <h2 id="expense-modal-title">Catat pengeluaran</h2>
              </div>
              <button
                className="close-button"
                onClick={() => setIsExpenseFormOpen(false)}
                aria-label="Tutup"
              >
                x
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit}>
              <label>
                Keterangan
                <input
                  required
                  name="description"
                  placeholder="Contoh: Perbaikan lampu jalan"
                />
              </label>
              <div className="form-row">
                <label>
                  Kategori
                  <select name="category" defaultValue="Maintenance">
                    <option>Maintenance</option>
                    <option>Security</option>
                    <option>Cleaning</option>
                    <option>Kegiatan</option>
                    <option>Lainnya</option>
                  </select>
                </label>
                <label>
                  Nominal
                  <input
                    required
                    name="amount"
                    type="number"
                    min="1"
                    placeholder="Contoh: 150000"
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsExpenseFormOpen(false)}
                >
                  Batal
                </button>
                <button className="primary-button" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan pengeluaran"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/warga" replace />} />
        <Route path="/warga" element={<Dashboard />} />
        <Route path="/iuran" element={<Dashboard />} />
        <Route path="/kas" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/warga" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
