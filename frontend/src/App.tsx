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
  createAnnouncement,
  deleteResident,
  createResident,
  getAnnouncements,
  getContributions,
  getExpenses,
  getHouses,
  getResidents,
  deleteHouse,
  updateHouse,
  updateResident,
  createUser,
  getUsers,
  login,
  logout,
} from "./lib/api";
import type {
  Announcement,
  Contribution,
  Expense,
  House,
  Resident,
  AuthUser,
} from "./lib/api";
import "./App.css";

const rtId = 1;
type Role = AuthUser["role"];

const roleLabels: Record<Role, string> = {
  ketua: "Ketua RT",
  bendahara: "Bendahara",
  sekretaris: "Sekretaris",
  wakil: "Wakil RT",
  warga: "Warga",
};

function Dashboard({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHouseFormOpen, setIsHouseFormOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [isContributionFormOpen, setIsContributionFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isAnnouncementFormOpen, setIsAnnouncementFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const role = user.role;
  const location = useLocation();
  const activePage = location.pathname.replace("/", "") || "warga";
  const canManageFinance = role === "bendahara";
  const canManageAnnouncements = role === "ketua" || role === "wakil";
  const canManageResidents =
    role === "ketua" || role === "wakil" || role === "sekretaris";

  async function loadData() {
    setIsLoading(true);
    setError("");
    const results = await Promise.allSettled([
      getResidents(rtId),
      getHouses(rtId),
      getContributions(rtId),
      getExpenses(rtId),
      getAnnouncements(rtId),
    ]);

    const [
      residentResult,
      houseResult,
      contributionResult,
      expenseResult,
      announcementResult,
    ] = results;
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
    if (announcementResult.status === "fulfilled")
      setAnnouncements(announcementResult.value);
    else failedModules.push("pengumuman");
    if (role === "ketua") {
      try {
        setUsers(await getUsers());
      } catch {
        failedModules.push("akun");
      }
    }

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
      const residentData = {
        name: String(form.get("name") ?? ""),
        nik: String(form.get("nik") ?? ""),
        no_kk: String(form.get("no_kk") ?? ""),
        phone: String(form.get("phone") ?? ""),
        status: String(form.get("status") ?? "Anggota"),
        house_id: Number(form.get("house_id")),
      };
      if (editingResident) {
        await updateResident(rtId, editingResident.id, residentData);
      } else {
        await createResident(rtId, residentData);
      }
      formElement.reset();
      setIsFormOpen(false);
      setEditingResident(null);
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

  async function handleDeleteResident(resident: Resident) {
    if (!window.confirm(`Warga ${resident.name} akan dihapus. Lanjutkan?`))
      return;
    setError("");
    try {
      await deleteResident(rtId, resident.id);
      await loadData();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Warga gagal dihapus",
      );
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
      (house) =>
        house.id !== editingHouse?.id &&
        house.number.trim().toUpperCase() === houseNumber,
    );
    if (isDuplicate) {
      setError(`Nomor rumah ${houseNumber} sudah terdaftar di RT 01.`);
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      if (editingHouse) {
        const updatedHouse = await updateHouse(
          rtId,
          editingHouse.id,
          houseNumber,
        );
        setHouses((currentHouses) =>
          currentHouses.map((house) =>
            house.id === updatedHouse.id ? updatedHouse : house,
          ),
        );
      } else {
        const newHouse = await createHouse(rtId, houseNumber);
        setHouses((currentHouses) => [...currentHouses, newHouse]);
      }
      formElement.reset();
      setIsHouseFormOpen(false);
      setEditingHouse(null);
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

  async function handleDeleteHouse(house: House) {
    if (!window.confirm(`Rumah ${house.number} akan dihapus. Lanjutkan?`))
      return;
    setError("");
    try {
      await deleteHouse(rtId, house.id);
      setHouses((currentHouses) =>
        currentHouses.filter((item) => item.id !== house.id),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Rumah gagal dihapus",
      );
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

  async function handleAnnouncementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setIsSaving(true);
    setError("");
    try {
      const newAnnouncement = await createAnnouncement(rtId, {
        title: String(form.get("title") ?? ""),
        content: String(form.get("content") ?? ""),
        created_by: "Budi Santoso",
      });
      setAnnouncements((current) => [newAnnouncement, ...current]);
      formElement.reset();
      setIsAnnouncementFormOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Pengumuman gagal disimpan",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUserSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setIsSaving(true);
    setError("");
    try {
      const user = await createUser({
        username: String(form.get("username") ?? ""),
        password: String(form.get("password") ?? ""),
        name: String(form.get("name") ?? ""),
        role: String(form.get("role") ?? "warga") as Role,
        resident_id: Number(form.get("resident_id")) || undefined,
      });
      setUsers((current) => [...current, user]);
      formElement.reset();
      setIsUserFormOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Akun gagal dibuat",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const residentName = new Map(
    residents.map((resident) => [resident.id, resident.name]),
  );
  const houseNumber = new Map(houses.map((house) => [house.id, house.number]));
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
          <NavLink
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            to="/pengumuman"
          >
            <span>04</span> Pengumuman
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">BS</div>
          <div>
            <strong>{user.name}</strong>
            <small>{roleLabels[role]}</small>
          </div>
          <span className="more">...</span>
        </div>
        <button className="logout-button" onClick={onLogout}>
          Keluar
        </button>
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
                  : activePage === "kas"
                    ? "Kas RT"
                    : "Pengumuman"}
            </h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifikasi">
              !
            </button>
            <div className="user-chip">
              <span className="avatar small">BS</span>
              <span>{roleLabels[role]}</span>
            </div>
          </div>
        </header>
        {activePage === "pengumuman" && (
          <section className="contribution-section" id="pengumuman">
            <div className="section-heading">
              <div>
                <span className="eyebrow">KOMUNIKASI RT 01</span>
                <h2>Pengumuman</h2>
              </div>
              {canManageAnnouncements && (
                <button
                  className="primary-button"
                  onClick={() => setIsAnnouncementFormOpen(true)}
                >
                  <span>+</span> Buat pengumuman
                </button>
              )}
            </div>
            <div className="announcement-list">
              {announcements.length === 0 ? (
                <div className="empty-state">Belum ada pengumuman.</div>
              ) : (
                announcements.map((announcement) => (
                  <article className="announcement-item" key={announcement.id}>
                    <div className="announcement-meta">
                      <span className="role-tag">RT 01</span>
                      <span>
                        {announcement.created_at
                          ? new Date(
                              announcement.created_at * 1000,
                            ).toLocaleDateString("id-ID")
                          : "Baru saja"}
                      </span>
                    </div>
                    <h3>{announcement.title}</h3>
                    <p>{announcement.content}</p>
                    <small>
                      Oleh {announcement.created_by || "Pengurus RT"}
                    </small>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
        {activePage === "warga" && (
          <div className="page-content">
            <div className="intro-row">
              <p>Kelola data warga dan rumah di lingkungan RT 01.</p>
              <div className="intro-actions">
                {canManageResidents && (
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setEditingHouse(null);
                      setIsHouseFormOpen(true);
                    }}
                  >
                    <span>+</span> Tambah rumah
                  </button>
                )}
                {canManageResidents && (
                  <button
                    className="primary-button"
                    onClick={() => setIsFormOpen(true)}
                  >
                    <span>+</span> Tambah warga
                  </button>
                )}
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
                              {houseNumber.get(resident.house_id) ??
                                `#${resident.house_id}`}
                            </span>
                          </td>
                          <td>
                            <span className="role-tag">
                              {resident.status || "Anggota"}
                            </span>
                          </td>
                          <td>{resident.phone || "-"}</td>
                          <td>
                            {canManageResidents && (
                              <button
                                onClick={() => {
                                  setEditingResident(resident);
                                  setIsFormOpen(true);
                                }}
                                className="row-menu"
                                aria-label={`Opsi ${resident.name}`}
                              >
                                Edit
                              </button>
                            )}
                            {canManageResidents && (
                              <button
                                className="row-menu danger"
                                onClick={() =>
                                  void handleDeleteResident(resident)
                                }
                              >
                                Hapus
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="table-panel house-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">DATA PROPERTI RT 01</span>
                  <h2>Daftar rumah</h2>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>NOMOR RUMAH</th>
                      <th>JUMLAH WARGA</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {houses.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="empty-state">
                          Belum ada rumah.
                        </td>
                      </tr>
                    ) : (
                      houses.map((house) => (
                        <tr key={house.id}>
                          <td>
                            <span className="house-tag">{house.number}</span>
                          </td>
                          <td>
                            {house.residents?.length ??
                              residents.filter(
                                (resident) => resident.house_id === house.id,
                              ).length}{" "}
                            warga
                          </td>
                          <td>
                            {canManageResidents && (
                              <button
                                className="row-menu"
                                onClick={() => {
                                  setEditingHouse(house);
                                  setIsHouseFormOpen(true);
                                }}
                              >
                                Edit
                              </button>
                            )}
                            {canManageResidents && (
                              <button
                                className="row-menu danger"
                                onClick={() => void handleDeleteHouse(house)}
                              >
                                Hapus
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            {role === "ketua" && (
              <section className="table-panel house-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">PENGELOLA RT</span>
                    <h2>Akun akses</h2>
                  </div>
                  <button
                    className="primary-button"
                    onClick={() => setIsUserFormOpen(true)}
                  >
                    <span>+</span> Buat akun
                  </button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>NAMA</th>
                        <th>USERNAME</th>
                        <th>HAK AKSES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="empty-state">
                            Belum ada akun tambahan.
                          </td>
                        </tr>
                      ) : (
                        users.map((account) => (
                          <tr key={account.id}>
                            <td>
                              <strong>{account.name}</strong>
                            </td>
                            <td>{account.username}</td>
                            <td>
                              <span className="role-tag">
                                {roleLabels[account.role]}
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
          </div>
        )}

        {activePage === "iuran" && (
          <section className="contribution-section" id="iuran">
            <div className="section-heading">
              <div>
                <span className="eyebrow">KEUANGAN RT 01</span>
                <h2>Iuran warga</h2>
              </div>
              {canManageFinance && (
                <button
                  className="primary-button"
                  onClick={() => setIsContributionFormOpen(true)}
                >
                  <span>+</span> Catat pembayaran
                </button>
              )}
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
              {canManageFinance && (
                <button
                  className="primary-button"
                  onClick={() => setIsExpenseFormOpen(true)}
                >
                  <span>+</span> Catat pengeluaran
                </button>
              )}
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
                <h2 id="modal-title">
                  {editingResident ? "Edit warga" : "Tambah warga"}
                </h2>
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
                  defaultValue={editingResident?.name ?? ""}
                />
              </label>
              <label>
                NIK
                <input
                  name="nik"
                  inputMode="numeric"
                  placeholder="16 digit NIK"
                  defaultValue={editingResident?.nik ?? ""}
                />
              </label>
              <div className="form-row">
                <label>
                  No. rumah
                  <select
                    required
                    name="house_id"
                    defaultValue={editingResident?.house_id ?? ""}
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
                <label>
                  Status
                  <select
                    name="status"
                    defaultValue={editingResident?.status ?? "Anggota"}
                  >
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
                  defaultValue={editingResident?.phone ?? ""}
                />
              </label>
              <label>
                No. KK
                <input
                  name="no_kk"
                  inputMode="numeric"
                  placeholder="Nomor kartu keluarga"
                  defaultValue={editingResident?.no_kk ?? ""}
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingResident(null);
                  }}
                >
                  Batal
                </button>
                <button className="primary-button" disabled={isSaving}>
                  {isSaving
                    ? "Menyimpan..."
                    : editingResident
                      ? "Simpan perubahan"
                      : "Simpan warga"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isUserFormOpen && role === "ketua" && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">AKUN PENGGUNA</span>
                <h2 id="user-modal-title">Buat akun & role</h2>
              </div>
              <button
                className="close-button"
                onClick={() => setIsUserFormOpen(false)}
                aria-label="Tutup"
              >
                x
              </button>
            </div>
            <form onSubmit={handleUserSubmit}>
              <label>
                Nama pengguna
                <input required name="name" placeholder="Nama pemegang akun" />
              </label>
              <label>
                Username
                <input
                  required
                  name="username"
                  placeholder="contoh: bendahara.rt01"
                />
              </label>
              <label>
                Password
                <input
                  required
                  minLength={6}
                  name="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                />
              </label>
              <div className="form-row">
                <label>
                  Role
                  <select required name="role" defaultValue="warga">
                    <option value="bendahara">Bendahara</option>
                    <option value="sekretaris">Sekretaris</option>
                    <option value="wakil">Wakil RT</option>
                    <option value="warga">Warga</option>
                  </select>
                </label>
                <label>
                  Kaitkan warga
                  <select name="resident_id" defaultValue="">
                    <option value="">Tidak dikaitkan</option>
                    {residents.map((resident) => (
                      <option key={resident.id} value={resident.id}>
                        {resident.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsUserFormOpen(false)}
                >
                  Batal
                </button>
                <button className="primary-button" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Buat akun"}
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
                <h2 id="house-modal-title">
                  {editingHouse ? "Edit rumah" : "Tambah rumah"}
                </h2>
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
                  defaultValue={editingHouse?.number ?? ""}
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setIsHouseFormOpen(false);
                    setEditingHouse(null);
                  }}
                >
                  Batal
                </button>
                <button className="primary-button" disabled={isSaving}>
                  {isSaving
                    ? "Menyimpan..."
                    : editingHouse
                      ? "Simpan perubahan"
                      : "Simpan rumah"}
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

      {isAnnouncementFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">KOMUNIKASI RT 01</span>
                <h2 id="announcement-modal-title">Buat pengumuman</h2>
              </div>
              <button
                className="close-button"
                onClick={() => setIsAnnouncementFormOpen(false)}
                aria-label="Tutup"
              >
                x
              </button>
            </div>
            <form onSubmit={handleAnnouncementSubmit}>
              <label>
                Judul
                <input
                  required
                  name="title"
                  placeholder="Contoh: Kerja bakti hari Minggu"
                />
              </label>
              <label>
                Isi pengumuman
                <textarea
                  required
                  name="content"
                  rows={5}
                  placeholder="Tulis informasi untuk warga..."
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsAnnouncementFormOpen(false)}
                >
                  Batal
                </button>
                <button className="primary-button" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Terbitkan pengumuman"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function LoginPage({
  onLogin,
}: {
  onLogin: (user: AuthUser, token: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await login(username, password);
      onLogin(result.user, result.token);
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login gagal",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand">
          <span className="brand-mark">R</span>
          <span>rukunin</span>
        </div>
        <span className="eyebrow">AREA PENGELOLAAN RT</span>
        <h1>Masuk ke akun</h1>
        <p>Kelola data warga, iuran, kas, dan pengumuman RT.</p>
        {error && <div className="notice">{error}</div>}
        <form onSubmit={handleLogin}>
          <label>
            Username
            <input
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="primary-button login-button" disabled={isLoading}>
            {isLoading ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("rukunin_user");
    const token = localStorage.getItem("rukunin_token");
    return saved && token ? (JSON.parse(saved) as AuthUser) : null;
  });

  function handleLogin(nextUser: AuthUser, token: string) {
    localStorage.setItem("rukunin_token", token);
    localStorage.setItem("rukunin_user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function handleLogout() {
    logout();
    setUser(null);
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/warga" replace />} />
        <Route
          path="/warga"
          element={<Dashboard user={user} onLogout={handleLogout} />}
        />
        <Route
          path="/iuran"
          element={<Dashboard user={user} onLogout={handleLogout} />}
        />
        <Route
          path="/kas"
          element={<Dashboard user={user} onLogout={handleLogout} />}
        />
        <Route
          path="/pengumuman"
          element={<Dashboard user={user} onLogout={handleLogout} />}
        />
        <Route path="*" element={<Navigate to="/warga" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
