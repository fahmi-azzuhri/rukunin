import { useEffect, useState } from "react";
import {
  getAnnouncements,
  getAppointments,
  getArea,
  getContributions,
  getExpenses,
  getHouses,
  getResidents,
  getUsers,
} from "../../lib/api";
import type {
  Announcement,
  Appointment,
  Area,
  AuthUser,
  Contribution,
  Expense,
  House,
  Resident,
} from "../../lib/api";

export function useDashboardState(user: AuthUser) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [area, setArea] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const rtId = user.rt_id;

  async function loadData() {
    setIsLoading(true);
    setError("");
    const results = await Promise.allSettled([
      getArea(rtId),
      getResidents(rtId),
      getHouses(rtId),
      getContributions(rtId),
      getExpenses(rtId),
      getAnnouncements(rtId),
      getAppointments(rtId),
    ]);
    const [
      areaResult,
      residentResult,
      houseResult,
      contributionResult,
      expenseResult,
      announcementResult,
      appointmentResult,
    ] = results;
    const failedModules: string[] = [];

    if (areaResult.status === "fulfilled") setArea(areaResult.value);
    else failedModules.push("area RT");
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
    if (appointmentResult.status === "fulfilled")
      setAppointments(appointmentResult.value);
    else failedModules.push("janji temu");

    if (user.role === "ketua") {
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
    const loadTimer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  const residentName = new Map(
    residents.map((resident) => [resident.id, resident.name]),
  );
  const houseNumber = new Map(houses.map((house) => [house.id, house.number]));
  const totalContributions = contributions.reduce(
    (total, item) => total + item.amount,
    0,
  );
  const totalExpenses = expenses.reduce(
    (total, item) => total + item.amount,
    0,
  );

  return {
    residents,
    setResidents,
    houses,
    setHouses,
    contributions,
    setContributions,
    expenses,
    setExpenses,
    announcements,
    setAnnouncements,
    appointments,
    setAppointments,
    users,
    setUsers,
    area,
    setArea,
    isLoading,
    error,
    setError,
    loadData,
    rtId,
    residentName,
    houseNumber,
    totalContributions,
    totalExpenses,
    currentBalance: totalContributions - totalExpenses,
  };
}
