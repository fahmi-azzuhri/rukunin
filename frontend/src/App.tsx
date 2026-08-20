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
    <main className="flex min-h-screen bg-[#f7f9f6] font-sans text-[#172522]">
      <aside className="flex w-[250px] shrink-0 flex-col bg-[#17382e] px-[18px] pb-5 pt-7 text-[#d6e5dc] max-[800px]:w-[68px] max-[800px]:px-2.5 max-[800px]:py-5">
        <div className="flex items-center gap-2.5 px-3 pb-[47px] text-[21px] font-extrabold tracking-[-0.7px] text-white max-[800px]:px-[9px] max-[800px]:pb-[35px]">
          <span className="grid size-[29px] place-items-center rounded-[9px_9px_9px_2px] bg-[#e87e42] font-mono text-[15px] text-white">
            R
          </span>
          <span>rukunin</span>
        </div>
        <div className="px-[13px] pb-2.5 font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#78968a] max-[800px]:text-[0px]">
          AREA KERJA
        </div>
        <div className="relative flex items-center gap-2 rounded-lg border border-[#3b6b57] bg-[#285442] p-3 text-[13px] font-bold text-white max-[800px]:justify-center max-[800px]:px-0 max-[800px]:py-3.5">
          <span className="size-[7px] rounded-full bg-[#f4b85c]" /> RT 01{" "}
          <span className="ml-auto text-[#a3c3b2] max-[800px]:hidden">v</span>
          <small className="absolute bottom-2 left-[27px] text-[10px] font-medium text-[#9ab4a7] max-[800px]:hidden">
            RW 01
          </small>
        </div>
        <nav className="mt-[33px] grid gap-1.5" aria-label="Navigasi utama">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[7px] p-3 text-[13px] font-semibold no-underline ${isActive ? "bg-[#f2f6f1] text-[#172522]" : "text-[#9cb7a9] hover:bg-[#f2f6f1] hover:text-[#172522]"} max-[800px]:justify-center max-[800px]:px-0 max-[800px]:py-[13px] max-[800px]:text-[0px]`
            }
            to="/warga"
          >
            <span className="max-[800px]:text-[10px]">01</span> Warga
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[7px] p-3 text-[13px] font-semibold no-underline ${isActive ? "bg-[#f2f6f1] text-[#172522]" : "text-[#9cb7a9] hover:bg-[#f2f6f1] hover:text-[#172522]"} max-[800px]:justify-center max-[800px]:px-0 max-[800px]:py-[13px] max-[800px]:text-[0px]`
            }
            to="/iuran"
          >
            <span className="max-[800px]:text-[10px]">02</span> Iuran
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[7px] p-3 text-[13px] font-semibold no-underline ${isActive ? "bg-[#f2f6f1] text-[#172522]" : "text-[#9cb7a9] hover:bg-[#f2f6f1] hover:text-[#172522]"} max-[800px]:justify-center max-[800px]:px-0 max-[800px]:py-[13px] max-[800px]:text-[0px]`
            }
            to="/kas"
          >
            <span className="max-[800px]:text-[10px]">03</span> Kas RT
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[7px] p-3 text-[13px] font-semibold no-underline ${isActive ? "bg-[#f2f6f1] text-[#172522]" : "text-[#9cb7a9] hover:bg-[#f2f6f1] hover:text-[#172522]"} max-[800px]:justify-center max-[800px]:px-0 max-[800px]:py-[13px] max-[800px]:text-[0px]`
            }
            to="/pengumuman"
          >
            <span className="max-[800px]:text-[10px]">04</span> Pengumuman
          </NavLink>
        </nav>
        <div className="mt-auto flex items-center gap-2.5 border-t border-[#315646] px-2 pb-0 pt-[18px] text-[11px] max-[800px]:justify-center max-[800px]:px-0">
          <div className="grid size-8 place-items-center rounded-full bg-[#e8a266] font-mono text-[11px] text-[#673a1d]">
            BS
          </div>
          <div>
            <strong className="block text-[11px] text-white max-[800px]:hidden">
              {user.name}
            </strong>
            <small className="mt-[3px] block text-[#87a698] max-[800px]:hidden">
              {roleLabels[role]}
            </small>
          </div>
          <span className="ml-auto tracking-[2px] text-[#8ca99b] max-[800px]:hidden">
            ...
          </span>
        </div>
        <button
          className="mt-2.5 rounded-[5px] border border-[#3b6b57] bg-transparent px-[9px] py-[7px] text-[10px] text-[#b8cec0]"
          onClick={onLogout}
        >
          Keluar
        </button>
      </aside>

      <section
        className="min-w-0 max-w-[1170px] flex-1 px-[54px] pb-[70px] pt-[43px] max-[800px]:px-5 max-[800px]:pb-[50px] max-[800px]:pt-[29px]"
        id="warga"
      >
        <header className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
              SELASA, 19 AGUSTUS 2026
            </span>
            <h1 className="mt-2.5 text-[34px] tracking-[-1.5px] max-[800px]:text-[28px]">
              {activePage === "warga"
                ? "Data warga"
                : activePage === "iuran"
                  ? "Iuran warga"
                  : activePage === "kas"
                    ? "Kas RT"
                    : "Pengumuman"}
            </h1>
          </div>
          <div className="flex items-center gap-3.5 max-[500px]:gap-2">
            <button
              className="size-[34px] rounded-full border border-[#e1e7e2] bg-transparent font-extrabold text-[#78847f]"
              aria-label="Notifikasi"
            >
              !
            </button>
            <div className="flex items-center gap-3.5 border-l border-[#e1e7e2] pl-[18px] text-xs font-bold text-[#57655f]">
              <span className="grid size-[30px] place-items-center rounded-full bg-[#e8a266] font-mono text-[10px] text-[#673a1d]">
                BS
              </span>
              <span className="max-[500px]:hidden">{roleLabels[role]}</span>
            </div>
          </div>
        </header>
        {activePage === "pengumuman" && (
          <section
            className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white"
            id="pengumuman"
          >
            <div className="flex items-center justify-between border-b border-[#e1e7e2] px-[23px] pb-[18px] pt-[22px] max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-[15px]">
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                  KOMUNIKASI RT 01
                </span>
                <h2 className="mt-2 text-lg tracking-[-0.5px]">Pengumuman</h2>
              </div>
              {canManageAnnouncements && (
                <button
                  className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white shadow-[0_5px_12px_#236b4a22] hover:bg-[#18563a]"
                  onClick={() => setIsAnnouncementFormOpen(true)}
                >
                  <span>+</span> Buat pengumuman
                </button>
              )}
            </div>
            <div className="grid gap-0">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#78847f]">
                  Belum ada pengumuman.
                </div>
              ) : (
                announcements.map((announcement) => (
                  <article
                    className="border-b border-[#e1e7e2] px-[23px] py-[22px] last:border-b-0"
                    key={announcement.id}
                  >
                    <div className="flex items-center gap-[9px] text-[11px] text-[#78847f]">
                      <span className="rounded bg-[#dcefe3] px-2 py-1 text-[10px] font-bold text-[#236b4a]">
                        RT 01
                      </span>
                      <span>
                        {announcement.created_at
                          ? new Date(
                              announcement.created_at * 1000,
                            ).toLocaleDateString("id-ID")
                          : "Baru saja"}
                      </span>
                    </div>
                    <h3 className="mb-1.5 mt-[11px] text-base text-[#172522]">
                      {announcement.title}
                    </h3>
                    <p className="mb-2.5 whitespace-pre-wrap text-xs leading-[1.7] text-[#65736c]">
                      {announcement.content}
                    </p>
                    <small className="text-[10px] text-[#9aa69f]">
                      Oleh {announcement.created_by || "Pengurus RT"}
                    </small>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
        {activePage === "warga" && (
          <div>
            <div className="my-[30px] flex items-center justify-between text-[13px] text-[#78847f] max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-[15px]">
              <p>Kelola data warga dan rumah di lingkungan RT 01.</p>
              <div className="flex gap-[9px]">
                {canManageResidents && (
                  <button
                    className="inline-flex items-center gap-[9px] rounded-[6px] border border-[#d3ddd6] bg-transparent px-3.5 py-[11px] text-xs font-extrabold text-[#236b4a]"
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
                    className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white shadow-[0_5px_12px_#236b4a22] hover:bg-[#18563a]"
                    onClick={() => setIsFormOpen(true)}
                  >
                    <span>+</span> Tambah warga
                  </button>
                )}
              </div>
            </div>
            {error && (
              <div className="mb-5 rounded-[6px] border border-[#f0d6a8] bg-[#fff6e7] px-[15px] py-3 text-xs text-[#825e2d]">
                <strong>Gagal memproses permintaan.</strong> {error}{" "}
                <button onClick={() => void loadData()}>Coba lagi</button>
              </div>
            )}
            <section
              className="grid grid-cols-3 gap-[15px] max-[800px]:grid-cols-1"
              aria-label="Ringkasan data"
            >
              <article className="min-h-[135px] rounded-[7px] border border-t-[3px] border-[#e1e7e2] border-t-[#e87e42] bg-white px-[21px] py-5">
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#8d9a93]">
                  TOTAL WARGA
                </span>
                <strong className="mt-[13px] block text-[33px] tracking-[-1px]">
                  {isLoading ? "--" : residents.length}
                </strong>
                <span className="text-[11px] text-[#9ba49f]">
                  terdata di RT 01
                </span>
              </article>
              <article className="min-h-[135px] rounded-[7px] border border-[#e1e7e2] bg-white px-[21px] py-5">
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#8d9a93]">
                  TOTAL RUMAH
                </span>
                <strong className="mt-[13px] block text-[33px] tracking-[-1px]">
                  {isLoading ? "--" : houses.length}
                </strong>
                <span className="text-[11px] text-[#9ba49f]">
                  rumah terdaftar
                </span>
              </article>
              <article className="min-h-[135px] rounded-[7px] border border-[#e1e7e2] bg-white px-[21px] py-5">
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#8d9a93]">
                  KEPALA KELUARGA
                </span>
                <strong className="mt-[13px] block text-[33px] tracking-[-1px]">
                  {isLoading
                    ? "--"
                    : residents.filter(
                        (resident) => resident.status === "Kepala Keluarga",
                      ).length}
                </strong>
                <span className="text-[11px] text-[#9ba49f]">
                  dari total warga
                </span>
              </article>
            </section>
            <section className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white">
              <div className="flex items-center justify-between px-[23px] pb-[18px] pt-[22px] max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-[18px]">
                <div>
                  <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                    DATABASE RT 01
                  </span>
                  <h2 className="mt-2 text-lg tracking-[-0.5px]">
                    Daftar warga
                  </h2>
                </div>
                <div className="flex items-center gap-2.5 max-[800px]:w-full">
                  <label className="flex flex-1 items-center gap-2 rounded-[5px] border border-[#e1e7e2] px-2.5 py-2 text-[#9aa69f]">
                    <span>/</span>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari nama atau NIK..."
                    />
                  </label>
                  <button className="rounded-[5px] border border-[#d3ddd6] bg-transparent px-3 py-2 text-[11px] font-bold text-[#57655f] max-[800px]:px-2.5">
                    Filter <span>v</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
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
                        <td
                          colSpan={6}
                          className="p-8 text-center text-xs text-[#78847f]"
                        >
                          Memuat data warga...
                        </td>
                      </tr>
                    ) : filteredResidents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-xs text-[#78847f]"
                        >
                          Belum ada data warga.
                        </td>
                      </tr>
                    ) : (
                      filteredResidents.map((resident) => (
                        <tr key={resident.id}>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <span className="grid size-8 place-items-center rounded-full bg-[#dcefe3] font-mono text-xs font-bold text-[#236b4a]">
                                {resident.name.slice(0, 1).toUpperCase()}
                              </span>
                              <strong>{resident.name}</strong>
                            </div>
                          </td>
                          <td>{resident.nik || "-"}</td>
                          <td>
                            <span className="rounded bg-[#f1f5f1] px-2 py-1 text-[10px] font-bold text-[#57655f]">
                              {houseNumber.get(resident.house_id) ??
                                `#${resident.house_id}`}
                            </span>
                          </td>
                          <td>
                            <span className="rounded bg-[#dcefe3] px-2 py-1 text-[10px] font-bold text-[#236b4a]">
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
                                className="border-0 bg-transparent text-xs font-bold text-[#78847f]"
                                aria-label={`Opsi ${resident.name}`}
                              >
                                Edit
                              </button>
                            )}
                            {canManageResidents && (
                              <button
                                className="ml-2 border-0 bg-transparent text-xs font-bold text-[#b94b3e]"
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
            <section className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white">
              <div className="flex items-center justify-between px-[23px] pb-[18px] pt-[22px]">
                <div>
                  <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                    DATA PROPERTI RT 01
                  </span>
                  <h2 className="mt-2 text-lg tracking-[-0.5px]">
                    Daftar rumah
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
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
                        <td
                          colSpan={3}
                          className="p-8 text-center text-xs text-[#78847f]"
                        >
                          Belum ada rumah.
                        </td>
                      </tr>
                    ) : (
                      houses.map((house) => (
                        <tr key={house.id}>
                          <td>
                            <span className="rounded bg-[#f1f5f1] px-2 py-1 text-[10px] font-bold text-[#57655f]">
                              {house.number}
                            </span>
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
                                className="border-0 bg-transparent text-xs font-bold text-[#78847f]"
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
                                className="ml-2 border-0 bg-transparent text-xs font-bold text-[#b94b3e]"
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
              <section className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white">
                <div className="flex items-center justify-between px-[23px] pb-[18px] pt-[22px]">
                  <div>
                    <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                      PENGELOLA RT
                    </span>
                    <h2 className="mt-2 text-lg tracking-[-0.5px]">
                      Akun akses
                    </h2>
                  </div>
                  <button
                    className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white shadow-[0_5px_12px_#236b4a22] hover:bg-[#18563a]"
                    onClick={() => setIsUserFormOpen(true)}
                  >
                    <span>+</span> Buat akun
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
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
                          <td
                            colSpan={3}
                            className="p-8 text-center text-xs text-[#78847f]"
                          >
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
                              <span className="rounded bg-[#dcefe3] px-2 py-1 text-[10px] font-bold text-[#236b4a]">
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
          <section
            className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white"
            id="iuran"
          >
            <div className="flex items-center justify-between border-b border-[#e1e7e2] px-[23px] pb-[18px] pt-[22px] max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-[15px]">
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                  KEUANGAN RT 01
                </span>
                <h2 className="mt-2 text-lg tracking-[-0.5px]">Iuran warga</h2>
              </div>
              {canManageFinance && (
                <button
                  className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white shadow-[0_5px_12px_#236b4a22] hover:bg-[#18563a]"
                  onClick={() => setIsContributionFormOpen(true)}
                >
                  <span>+</span> Catat pembayaran
                </button>
              )}
            </div>
            <div className="flex gap-[70px] border-b border-[#e1e7e2] bg-[#fbfcfa] px-[23px] py-[19px] max-[800px]:gap-[35px]">
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#8d9a93]">
                  TOTAL TERCATAT
                </span>
                <strong className="mt-2 block text-xl">
                  Rp {totalContributions.toLocaleString("id-ID")}
                </strong>
              </div>
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#8d9a93]">
                  PEMBAYARAN
                </span>
                <strong className="mt-2 block text-xl">
                  {contributions.length}
                </strong>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
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
                      <td
                        colSpan={4}
                        className="p-8 text-center text-xs text-[#78847f]"
                      >
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
                          <span className="rounded bg-[#dcefe3] px-2 py-1 text-[10px] font-bold text-[#236b4a]">
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
          <section
            className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white"
            id="kas"
          >
            <div className="flex items-center justify-between border-b border-[#e1e7e2] px-[23px] pb-[18px] pt-[22px] max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-[15px]">
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                  KEUANGAN RT 01
                </span>
                <h2 className="mt-2 text-lg tracking-[-0.5px]">Kas RT</h2>
              </div>
              {canManageFinance && (
                <button
                  className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white shadow-[0_5px_12px_#236b4a22] hover:bg-[#18563a]"
                  onClick={() => setIsExpenseFormOpen(true)}
                >
                  <span>+</span> Catat pengeluaran
                </button>
              )}
            </div>
            <div className="flex gap-[70px] border-b border-[#e1e7e2] bg-[#fbfcfa] px-[23px] py-[19px] max-[800px]:gap-[35px]">
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#8d9a93]">
                  SALDO BERJALAN
                </span>
                <strong
                  className={`mt-2 block text-xl ${currentBalance < 0 ? "text-[#b94b3e]" : "text-[#172522]"}`}
                >
                  Rp {currentBalance.toLocaleString("id-ID")}
                </strong>
              </div>
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#8d9a93]">
                  TOTAL PENGELUARAN
                </span>
                <strong className="mt-2 block text-xl">
                  Rp {totalExpenses.toLocaleString("id-ID")}
                </strong>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
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
                      <td
                        colSpan={4}
                        className="p-8 text-center text-xs text-[#78847f]"
                      >
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
                          <span className="rounded bg-[#f1f5f1] px-2 py-1 text-[10px] font-bold text-[#57655f]">
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
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#17382e66] p-5"
          role="presentation"
        >
          <section
            className="max-h-[calc(100vh_-_40px)] w-[min(520px,100%)] overflow-y-auto rounded-[9px] bg-white p-7 shadow-[0_20px_50px_#17382e24] [&_form]:grid [&_form]:gap-[15px] [&_label]:grid [&_label]:gap-1.5 [&_label]:text-[11px] [&_label]:font-bold [&_label]:text-[#68766f] [&_input]:rounded-[5px] [&_input]:border [&_input]:border-[#e1e7e2] [&_input]:p-[11px] [&_input]:text-[13px] [&_input]:outline-0 [&_select]:rounded-[5px] [&_select]:border [&_select]:border-[#e1e7e2] [&_select]:bg-white [&_select]:p-[11px] [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-[5px] [&_textarea]:border [&_textarea]:border-[#e1e7e2] [&_textarea]:p-2.5 [&_textarea]:text-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="mb-5 flex items-start justify-between border-b border-[#e1e7e2] pb-4">
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                  DATA BARU
                </span>
                <h2 className="mt-2 text-lg tracking-[-0.5px]" id="modal-title">
                  {editingResident ? "Edit warga" : "Tambah warga"}
                </h2>
              </div>
              <button
                className="border-0 bg-transparent text-lg text-[#78847f]"
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
              <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
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
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  className="rounded-[6px] border border-[#d3ddd6] bg-transparent px-3.5 py-[11px] text-xs font-extrabold text-[#236b4a]"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingResident(null);
                  }}
                >
                  Batal
                </button>
                <button
                  className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
                  disabled={isSaving}
                >
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
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#17382e66] p-5"
          role="presentation"
        >
          <section
            className="max-h-[calc(100vh_-_40px)] w-[min(520px,100%)] overflow-y-auto rounded-[9px] bg-white p-7 shadow-[0_20px_50px_#17382e24]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
          >
            <div className="mb-5 flex items-start justify-between border-b border-[#e1e7e2] pb-4">
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                  AKUN PENGGUNA
                </span>
                <h2
                  className="mt-2 text-lg tracking-[-0.5px]"
                  id="user-modal-title"
                >
                  Buat akun & role
                </h2>
              </div>
              <button
                className="border-0 bg-transparent text-lg text-[#78847f]"
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
              <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
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
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  className="rounded-[6px] border border-[#d3ddd6] bg-transparent px-3.5 py-[11px] text-xs font-extrabold text-[#236b4a]"
                  onClick={() => setIsUserFormOpen(false)}
                >
                  Batal
                </button>
                <button
                  className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Buat akun"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isHouseFormOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#17382e66] p-5"
          role="presentation"
        >
          <section
            className="max-h-[calc(100vh_-_40px)] w-[min(420px,100%)] overflow-y-auto rounded-[14px] bg-white shadow-[0_24px_70px_#17382e30]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="house-modal-title"
          >
            <div className="mb-0 flex items-start justify-between border-b border-[#e1e7e2] bg-[#fbfcfa] px-7 pb-5 pt-6 max-[500px]:px-5">
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                  DATA RUMAH
                </span>
                <h2
                  className="mt-2 text-lg tracking-[-0.5px]"
                  id="house-modal-title"
                >
                  {editingHouse ? "Edit rumah" : "Tambah rumah"}
                </h2>
              </div>
              <button
                className="border-0 bg-transparent text-lg text-[#78847f]"
                onClick={() => setIsHouseFormOpen(false)}
                aria-label="Tutup"
              >
                x
              </button>
            </div>
            <form
              className="grid gap-5 p-7 max-[500px]:p-5"
              onSubmit={handleHouseSubmit}
            >
              <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
                Nomor rumah
                <input
                  required
                  className="h-12 rounded-[7px] border border-[#d3ddd6] bg-white px-3.5 text-base font-bold tracking-[0.04em] text-[#172522] outline-0 transition focus:border-[#236b4a] focus:ring-4 focus:ring-[#236b4a]/10"
                  name="number"
                  placeholder="Contoh: A-01"
                  autoFocus
                  defaultValue={editingHouse?.number ?? ""}
                />
              </label>
              <div className="mt-1 flex justify-end gap-2.5 border-t border-[#e1e7e2] pt-5">
                <button
                  type="button"
                  className="rounded-[6px] border border-[#d3ddd6] bg-transparent px-3.5 py-[11px] text-xs font-extrabold text-[#236b4a]"
                  onClick={() => {
                    setIsHouseFormOpen(false);
                    setEditingHouse(null);
                  }}
                >
                  Batal
                </button>
                <button
                  className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
                  disabled={isSaving}
                >
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
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#17382e66] p-5"
          role="presentation"
        >
          <section
            className="max-h-[calc(100vh_-_40px)] w-[min(560px,100%)] overflow-y-auto rounded-[14px] bg-white shadow-[0_24px_70px_#17382e30]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contribution-modal-title"
          >
            <div className="mb-0 flex items-start justify-between border-b border-[#e1e7e2] bg-[#fbfcfa] px-7 pb-5 pt-6 max-[500px]:px-5">
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                  KEUANGAN RT 01
                </span>
                <h2
                  className="mt-2 text-lg tracking-[-0.5px]"
                  id="contribution-modal-title"
                >
                  Catat pembayaran
                </h2>
              </div>
              <button
                className="border-0 bg-transparent text-lg text-[#78847f]"
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
              <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
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
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  className="rounded-[6px] border border-[#d3ddd6] bg-transparent px-3.5 py-[11px] text-xs font-extrabold text-[#236b4a]"
                  onClick={() => setIsContributionFormOpen(false)}
                >
                  Batal
                </button>
                <button
                  className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Simpan pembayaran"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isExpenseFormOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#17382e66] p-5"
          role="presentation"
        >
          <section
            className="max-h-[calc(100vh_-_40px)] w-[min(520px,100%)] overflow-y-auto rounded-[9px] bg-white p-7 shadow-[0_20px_50px_#17382e24]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-modal-title"
          >
            <div className="mb-5 flex items-start justify-between border-b border-[#e1e7e2] pb-4">
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                  KAS RT 01
                </span>
                <h2
                  className="mt-2 text-lg tracking-[-0.5px]"
                  id="expense-modal-title"
                >
                  Catat pengeluaran
                </h2>
              </div>
              <button
                className="border-0 bg-transparent text-lg text-[#78847f]"
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
              <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
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
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  className="rounded-[6px] border border-[#d3ddd6] bg-transparent px-3.5 py-[11px] text-xs font-extrabold text-[#236b4a]"
                  onClick={() => setIsExpenseFormOpen(false)}
                >
                  Batal
                </button>
                <button
                  className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Simpan pengeluaran"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isAnnouncementFormOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#17382e66] p-5"
          role="presentation"
        >
          <section
            className="max-h-[calc(100vh_-_40px)] w-[min(520px,100%)] overflow-y-auto rounded-[9px] bg-white p-7 shadow-[0_20px_50px_#17382e24]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-modal-title"
          >
            <div className="mb-5 flex items-start justify-between border-b border-[#e1e7e2] pb-4">
              <div>
                <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
                  KOMUNIKASI RT 01
                </span>
                <h2
                  className="mt-2 text-lg tracking-[-0.5px]"
                  id="announcement-modal-title"
                >
                  Buat pengumuman
                </h2>
              </div>
              <button
                className="border-0 bg-transparent text-lg text-[#78847f]"
                onClick={() => setIsAnnouncementFormOpen(false)}
                aria-label="Tutup"
              >
                x
              </button>
            </div>
            <form
              className="grid gap-5 p-7 max-[500px]:p-5"
              onSubmit={handleAnnouncementSubmit}
            >
              <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
                Judul
                <input
                  required
                  className="rounded-[7px] border border-[#d3ddd6] bg-white px-3.5 py-3 text-[13px] text-[#172522] outline-0 transition focus:border-[#236b4a] focus:ring-4 focus:ring-[#236b4a]/10"
                  name="title"
                  placeholder="Contoh: Kerja bakti hari Minggu"
                />
              </label>
              <label className="grid gap-2 text-[11px] font-bold text-[#68766f]">
                Isi pengumuman
                <textarea
                  required
                  className="min-h-[150px] rounded-[7px] border border-[#d3ddd6] bg-white px-3.5 py-3 text-[13px] leading-6 text-[#172522] outline-0 transition focus:border-[#236b4a] focus:ring-4 focus:ring-[#236b4a]/10"
                  name="content"
                  rows={5}
                  placeholder="Tulis informasi untuk warga..."
                />
              </label>
              <div className="mt-1 flex justify-end gap-2.5 border-t border-[#e1e7e2] pt-5">
                <button
                  type="button"
                  className="rounded-[6px] border border-[#d3ddd6] bg-transparent px-3.5 py-[11px] text-xs font-extrabold text-[#236b4a]"
                  onClick={() => setIsAnnouncementFormOpen(false)}
                >
                  Batal
                </button>
                <button
                  className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
                  disabled={isSaving}
                >
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
    <main className="grid min-h-screen place-items-center bg-[#f7f9f6] p-5 font-sans">
      <section className="w-[min(420px,100%)] rounded-[9px] border border-[#e1e7e2] bg-white p-9 shadow-[0_20px_50px_#17382e18]">
        <div className="flex items-center gap-2.5 pb-[38px] text-[21px] font-extrabold tracking-[-0.7px] text-[#172522]">
          <span className="grid size-[29px] place-items-center rounded-[9px_9px_9px_2px] bg-[#e87e42] font-mono text-[15px] text-white">
            R
          </span>
          <span>rukunin</span>
        </div>
        <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
          AREA PENGELOLAAN RT
        </span>
        <h1 className="mb-2 mt-3 text-[29px] tracking-[-1px] text-[#172522]">
          Masuk ke akun
        </h1>
        <p className="mb-[26px] text-xs text-[#78847f]">
          Kelola data warga, iuran, kas, dan pengumuman RT.
        </p>
        {error && (
          <div className="mb-5 rounded-[6px] border border-[#f0d6a8] bg-[#fff6e7] px-[15px] py-3 text-xs text-[#825e2d]">
            {error}
          </div>
        )}
        <form className="grid gap-[15px]" onSubmit={handleLogin}>
          <label className="grid gap-1.5 text-[11px] font-bold text-[#68766f]">
            Username
            <input
              required
              className="rounded-[5px] border border-[#e1e7e2] bg-white px-3 py-2.5 text-[13px] text-[#172522] outline-0 focus:border-[#236b4a]"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoFocus
            />
          </label>
          <label className="grid gap-1.5 text-[11px] font-bold text-[#68766f]">
            Password
            <input
              required
              className="rounded-[5px] border border-[#e1e7e2] bg-white px-3 py-2.5 text-[13px] text-[#172522] outline-0 focus:border-[#236b4a]"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            className="mt-2 inline-flex w-full items-center justify-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white shadow-[0_5px_12px_#236b4a22] hover:bg-[#18563a] disabled:opacity-50"
            disabled={isLoading}
          >
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
