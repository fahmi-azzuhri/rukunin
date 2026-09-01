import type { AuthUser } from "../../lib/api";

export type Role = AuthUser["role"];

export const roleLabels: Record<Role, string> = {
  superadmin: "Superadmin",
  ketua: "Ketua RT",
  bendahara: "Bendahara",
  sekretaris: "Sekretaris",
  wakil: "Wakil RT",
  warga: "Warga",
};

export const dashboardNavigation = [
  ["01", "Warga", "/warga"],
  ["02", "Iuran", "/iuran"],
  ["03", "Kas RT", "/kas"],
  ["04", "Pengumuman", "/pengumuman"],
  ["05", "Notulen", "/notulen"],
  ["06", "Janji temu", "/janji-temu"],
] as const;

export const pageTitles: Record<string, string> = {
  warga: "Data warga",
  iuran: "Iuran warga",
  kas: "Kas RT",
  profil: "Profil pengguna",
  pengumuman: "Pengumuman",
  notulen: "Notulen rapat",
  "janji-temu": "Janji temu",
};
