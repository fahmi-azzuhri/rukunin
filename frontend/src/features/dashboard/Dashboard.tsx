import { useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  createAnnouncement,
  createAppointment,
  createContribution,
  createExpense,
  createHouse,
  createResident,
  createUser,
  deleteHouse,
  deleteResident,
  updateAppointment,
  updateArea,
  updateHouse,
  updateResident,
  updateUserRole,
} from "../../lib/api";
import type { AuthUser, House, Resident } from "../../lib/api";
import { roleLabels, type Role } from "./dashboardConfig.ts";
import { filterResidents } from "./dashboardSelectors.ts";
import { useDashboardState } from "./useDashboardState.ts";
import { DashboardSidebar } from "./DashboardSidebar.tsx";
import { DashboardHeader } from "./DashboardHeader.tsx";
import { ProfilePage } from "./ProfilePage.tsx";
import { AnnouncementsPage } from "./AnnouncementsPage.tsx";
import { AppointmentsPage } from "./AppointmentsPage.tsx";
import { ContributionsPage, ExpensesPage } from "./FinancePages.tsx";
import { ResidentsPage } from "./ResidentsPage.tsx";
import { DashboardModals } from "./DashboardModals.tsx";

type DashboardProps = { user: AuthUser; onLogout: () => void };

export function Dashboard({ user, onLogout }: DashboardProps) {
  const state = useDashboardState(user);
  const [isSaving, setIsSaving] = useState(false);
  const [resident, setResident] = useState<Resident | null>(null);
  const [house, setHouse] = useState<House | null>(null);
  const [openModal, setOpenModal] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<
    import("../../lib/api").Appointment | null
  >(null);
  const [search, setSearch] = useState("");
  const [residentFilter, setResidentFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const location = useLocation();
  const role = user.role;
  const activePage = location.pathname.replace("/", "") || "warga";
  const rtName = state.area?.name ?? "RT 01";
  const profileName =
    role === "ketua" && state.area?.chair ? state.area.chair : user.name;
  const canManageFinance = role === "bendahara";
  const canManageAnnouncements = role === "ketua" || role === "wakil";
  const canManageAppointments =
    role === "ketua" || role === "wakil" || role === "warga";
  const canManageResidents =
    role === "ketua" || role === "wakil" || role === "sekretaris";
  const canViewResidentDetails = canManageResidents;
  const filteredResidents = filterResidents(
    state.residents,
    search,
    residentFilter,
  );
  const activeFilterLabel =
    residentFilter === "all"
      ? "Semua"
      : residentFilter === "empty-house"
        ? "Tanpa rumah"
        : (roleLabels[residentFilter as Role] ??
          state.houseNumber.get(Number(residentFilter)) ??
          "Filter aktif");
  const closeModal = () => setOpenModal("");
  const save = async (
    event: FormEvent<HTMLFormElement>,
    action: (form: FormData) => Promise<void>,
    fallback: string,
    after?: () => void,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSaving(true);
    state.setError("");
    try {
      await action(new FormData(form));
      form.reset();
      after?.();
    } catch (error) {
      state.setError(error instanceof Error ? error.message : fallback);
    } finally {
      setIsSaving(false);
    }
  };

  async function handleResident(event: FormEvent<HTMLFormElement>) {
    const editing = resident;
    await save(
      event,
      async (form) => {
        const data = {
          name: String(form.get("name") ?? ""),
          nik: String(form.get("nik") ?? ""),
          no_kk: String(form.get("no_kk") ?? ""),
          phone: String(form.get("phone") ?? ""),
          status: String(form.get("status") ?? "Anggota"),
          house_id: Number(form.get("house_id")),
        };
        if (editing) await updateResident(state.rtId, editing.id, data);
        else {
          const username = String(form.get("username") ?? "").trim();
          const password = String(form.get("password") ?? "");
          const accountRole = String(form.get("account_role") ?? "");
          await createResident(state.rtId, {
            ...data,
            ...(username || password || accountRole
              ? { username, password, role: accountRole as Role }
              : {}),
          });
        }
      },
      "Warga gagal disimpan",
      async () => {
        setResident(null);
        closeModal();
        await state.loadData();
      },
    );
  }

  async function handleHouse(event: FormEvent<HTMLFormElement>) {
    const editing = house;
    await save(
      event,
      async (form) => {
        const number = String(form.get("number") ?? "")
          .trim()
          .toUpperCase();
        if (
          state.houses.some(
            (item) =>
              item.id !== editing?.id && item.number.toUpperCase() === number,
          )
        )
          throw new Error(
            `Nomor rumah ${number} sudah terdaftar di ${rtName}.`,
          );
        if (editing) await updateHouse(state.rtId, editing.id, number);
        else await createHouse(state.rtId, number);
      },
      "Rumah gagal disimpan",
      async () => {
        setHouse(null);
        closeModal();
        await state.loadData();
      },
    );
  }

  async function handleDeleteResident(item: Resident) {
    if (!window.confirm(`Warga ${item.name} akan dihapus. Lanjutkan?`)) return;
    try {
      await deleteResident(state.rtId, item.id);
      await state.loadData();
    } catch (error) {
      state.setError(
        error instanceof Error ? error.message : "Warga gagal dihapus",
      );
    }
  }
  async function handleDeleteHouse(item: House) {
    if (!window.confirm(`Rumah ${item.number} akan dihapus. Lanjutkan?`))
      return;
    try {
      await deleteHouse(state.rtId, item.id);
      await state.loadData();
    } catch (error) {
      state.setError(
        error instanceof Error ? error.message : "Rumah gagal dihapus",
      );
    }
  }
  async function handleContribution(event: FormEvent<HTMLFormElement>) {
    await save(
      event,
      async (form) => {
        await createContribution(state.rtId, {
          resident_id: Number(form.get("resident_id")),
          month: Number(form.get("month")),
          year: Number(form.get("year")),
          amount: Number(form.get("amount")),
        });
      },
      "Iuran gagal disimpan",
      async () => {
        closeModal();
        await state.loadData();
      },
    );
  }
  async function handleExpense(event: FormEvent<HTMLFormElement>) {
    await save(
      event,
      async (form) => {
        await createExpense(state.rtId, {
          description: String(form.get("description") ?? ""),
          category: String(form.get("category") ?? "Lainnya"),
          amount: Number(form.get("amount")),
          date: Date.now(),
          created_by: user.name,
        });
      },
      "Pengeluaran gagal disimpan",
      async () => {
        closeModal();
        await state.loadData();
      },
    );
  }
  async function handleAnnouncement(event: FormEvent<HTMLFormElement>) {
    await save(
      event,
      async (form) => {
        const item = await createAnnouncement(state.rtId, {
          title: String(form.get("title") ?? ""),
          content: String(form.get("content") ?? ""),
          created_by: user.name,
        });
        state.setAnnouncements((current) => [item, ...current]);
      },
      "Pengumuman gagal disimpan",
      closeModal,
    );
  }

  async function handleAppointment(event: FormEvent<HTMLFormElement>) {
    await save(
      event,
      async (form) => {
        const item = await createAppointment(state.rtId, {
          purpose: String(form.get("purpose") ?? ""),
          details: String(form.get("details") ?? ""),
          preferred_date: String(form.get("preferred_date") ?? ""),
          preferred_time: String(form.get("preferred_time") ?? ""),
          requester_name: String(form.get("requester_name") ?? user.name),
        });
        state.setAppointments((current) => [item, ...current]);
      },
      "Janji temu gagal dibuat",
      closeModal,
    );
  }

  async function handleAppointmentReview(event: FormEvent<HTMLFormElement>) {
    const review = selectedAppointment;
    if (!review) return;

    if (role === "warga") {
      setSelectedAppointment(null);
      closeModal();
      return;
    }

    await save(
      event,
      async (form) => {
        const statusValue = String(form.get("status") ?? review.status);
        const item = await updateAppointment(state.rtId, review.id, {
          status: statusValue as import("../../lib/api").AppointmentStatus,
          proposed_date: String(form.get("proposed_date") ?? ""),
          proposed_time: String(form.get("proposed_time") ?? ""),
          decision_note: String(form.get("decision_note") ?? ""),
          assigned_to: String(
            form.get("assigned_to") ?? review.assigned_to ?? "ketua",
          ),
        });
        state.setAppointments((current) =>
          current.map((entry) => (entry.id === item.id ? item : entry)),
        );
      },
      "Janji temu gagal diperbarui",
      () => {
        setSelectedAppointment(null);
        closeModal();
      },
    );
  }
  async function handleUser(event: FormEvent<HTMLFormElement>) {
    await save(
      event,
      async (form) => {
        const residentId = Number(form.get("resident_id"));
        const selected = state.residents.find((item) => item.id === residentId);
        if (!selected) throw new Error("Pilih warga yang akan diberi akun.");
        const account = await createUser({
          username: String(form.get("username") ?? ""),
          password: String(form.get("password") ?? ""),
          name: selected.name,
          role: String(form.get("role") ?? "warga") as Role,
          resident_id: residentId,
        });
        state.setUsers((current) => [...current, account]);
      },
      "Akun gagal dibuat",
      closeModal,
    );
  }
  async function handleRoleChange(userId: number, nextRole: Role) {
    if (
      nextRole === "ketua" &&
      !window.confirm(
        "Jadikan akun ini Ketua RT? Ketua RT saat ini akan diturunkan menjadi Warga dan sesi Anda akan berakhir.",
      )
    )
      return;
    setIsSaving(true);
    try {
      const updated = await updateUserRole(userId, nextRole);
      state.setUsers((current) =>
        current.map((account) =>
          account.id === updated.id ? updated : account,
        ),
      );
      if (nextRole === "ketua") onLogout();
    } catch (error) {
      state.setError(
        error instanceof Error ? error.message : "Hak akses gagal diperbarui",
      );
    } finally {
      setIsSaving(false);
    }
  }
  async function handleArea(event: FormEvent<HTMLFormElement>) {
    await save(
      event,
      async (form) => {
        const updated = await updateArea(state.rtId, {
          name: String(form.get("name") ?? "").trim(),
          chair: String(form.get("chair") ?? "").trim(),
        });
        state.setArea((current) => ({ ...updated, rw: current?.rw }));
      },
      "Profil area gagal diperbarui",
      closeModal,
    );
  }

  if (state.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9f6] font-sans">
        <div className="text-center">
          <div className="mb-4 size-12 animate-spin rounded-full border-4 border-[#d3ddd6] border-t-[#236b4a]" />
          <p className="text-sm text-[#68766f]">Memuat dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#f7f9f6] font-sans text-[#172522]">
      <DashboardSidebar
        role={role}
        rtName={rtName}
        profileName={profileName}
        onAreaSettings={() => setOpenModal("area")}
        onLogout={onLogout}
      />
      <section className="min-w-0 max-w-[1170px] flex-1 px-[54px] pb-[70px] pt-[43px] max-[900px]:px-5 max-[900px]:pb-[50px] max-[900px]:pt-[29px]">
        <DashboardHeader
          activePage={activePage}
          role={role}
          profileName={profileName}
          rtName={rtName}
        />
        {activePage === "profil" && (
          <ProfilePage
            user={user}
            role={role}
            area={state.area}
            profileName={profileName}
            rtName={rtName}
          />
        )}
        {activePage === "pengumuman" && (
          <AnnouncementsPage
            announcements={state.announcements}
            rtName={rtName}
            canManage={canManageAnnouncements}
            onCreate={() => setOpenModal("announcement")}
          />
        )}
        {activePage === "janji-temu" && (
          <AppointmentsPage
            appointments={state.appointments}
            rtName={rtName}
            canManage={canManageAppointments}
            role={role}
            onCreate={() => setOpenModal("appointment")}
            onReview={(appointment) => {
              setSelectedAppointment(appointment);
              setOpenModal("appointment-review");
            }}
          />
        )}
        {activePage === "iuran" && (
          <ContributionsPage
            contributions={state.contributions}
            residentName={state.residentName}
            rtName={rtName}
            canManage={canManageFinance}
            onCreate={() => setOpenModal("contribution")}
          />
        )}
        {activePage === "kas" && (
          <ExpensesPage
            expenses={state.expenses}
            balance={state.currentBalance}
            totalExpenses={state.totalExpenses}
            rtName={rtName}
            canManage={canManageFinance}
            onCreate={() => setOpenModal("expense")}
          />
        )}
        {activePage === "warga" && (
          <ResidentsPage
            residents={state.residents}
            houses={state.houses}
            users={state.users}
            user={user}
            profileName={profileName}
            role={role}
            rtName={rtName}
            houseNumber={state.houseNumber}
            filteredResidents={filteredResidents}
            isLoading={state.isLoading}
            error={state.error}
            canManageResidents={canManageResidents}
            canViewResidentDetails={canViewResidentDetails}
            isSaving={isSaving}
            search={search}
            residentFilter={residentFilter}
            activeFilterLabel={activeFilterLabel}
            isFilterOpen={isFilterOpen}
            onSearchChange={setSearch}
            onFilterToggle={() => setIsFilterOpen((open) => !open)}
            onFilterChange={(value) => {
              setResidentFilter(value);
              setIsFilterOpen(false);
            }}
            onRetry={() => void state.loadData()}
            onAddResident={() => {
              setResident(null);
              setOpenModal("resident");
            }}
            onAddHouse={() => {
              setHouse(null);
              setOpenModal("house");
            }}
            onEditResident={(item) => {
              setResident(item);
              setOpenModal("resident");
            }}
            onDeleteResident={(item) => void handleDeleteResident(item)}
            onEditHouse={(item) => {
              setHouse(item);
              setOpenModal("house");
            }}
            onDeleteHouse={(item) => void handleDeleteHouse(item)}
            onUserRoleChange={(id, nextRole) =>
              void handleRoleChange(id, nextRole)
            }
          />
        )}
      </section>
      <DashboardModals
        residentOpen={openModal === "resident"}
        resident={resident}
        houseOpen={openModal === "house"}
        house={house}
        contributionOpen={openModal === "contribution"}
        expenseOpen={openModal === "expense"}
        announcementOpen={openModal === "announcement"}
        appointmentOpen={openModal === "appointment"}
        appointmentReviewOpen={openModal === "appointment-review"}
        selectedAppointment={selectedAppointment}
        userOpen={openModal === "user"}
        areaOpen={openModal === "area"}
        houses={state.houses}
        residents={state.residents}
        area={state.area}
        role={role}
        isSaving={isSaving}
        onResidentSubmit={handleResident}
        onHouseSubmit={handleHouse}
        onContributionSubmit={handleContribution}
        onExpenseSubmit={handleExpense}
        onAnnouncementSubmit={handleAnnouncement}
        onAppointmentSubmit={handleAppointment}
        onAppointmentReviewSubmit={handleAppointmentReview}
        onUserSubmit={handleUser}
        onAreaSubmit={handleArea}
        onCloseResident={() => {
          setResident(null);
          closeModal();
        }}
        onCloseHouse={() => {
          setHouse(null);
          closeModal();
        }}
        onCloseContribution={closeModal}
        onCloseExpense={closeModal}
        onCloseAnnouncement={closeModal}
        onCloseAppointment={() => {
          setSelectedAppointment(null);
          closeModal();
        }}
        onCloseAppointmentReview={() => {
          setSelectedAppointment(null);
          closeModal();
        }}
        onCloseUser={closeModal}
        onCloseArea={closeModal}
      />
    </main>
  );
}
