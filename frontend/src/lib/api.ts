export type Resident = {
  id: number;
  house_id: number;
  name: string;
  nik: string;
  no_kk: string;
  phone: string;
  status: string;
};

export type House = {
  id: number;
  number: string;
  address?: string;
  residents?: Resident[];
};

export type Contribution = {
  id: number;
  rt_id: number;
  resident_id: number;
  month: number;
  year: number;
  amount: number;
  status: string;
  pay_date: number;
};

export type Expense = {
  id: number;
  rt_id: number;
  description: string;
  amount: number;
  category: string;
  date: number;
  created_by: string;
};

export type Announcement = {
  id: number;
  rt_id: number;
  title: string;
  content: string;
  created_by: string;
  created_at: number;
};

export type AppointmentStatus =
  | "pending"
  | "approved"
  | "rescheduled"
  | "rejected";

export type Appointment = {
  id: number;
  rt_id: number;
  user_id?: number;
  resident_id?: number;
  requester_name: string;
  purpose: string;
  details: string;
  preferred_date: string;
  preferred_time: string;
  status: AppointmentStatus;
  proposed_date?: string;
  proposed_time?: string;
  decision_note?: string;
  assigned_to?: string;
  created_at: number;
  updated_at: number;
};

export type MeetingNote = {
  id: number;
  rt_id: number;
  title: string;
  date: string;
  agenda: string;
  content: string;
  created_by: string;
  status?: "pending" | "approved";
  approved_by?: string;
  approved_at?: number;
  created_at: number;
  updated_at: number;
};

export type Role =
  | "superadmin"
  | "ketua"
  | "ketua_rw"
  | "bendahara"
  | "sekretaris"
  | "wakil"
  | "warga";
export type AuthUser = {
  id: number;
  rt_id: number;
  rw_id?: number;
  username: string;
  name: string;
  role: Role;
  resident_id?: number;
};

export type Area = {
  id: number;
  rw_id?: number;
  name: string;
  chair: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  postal_code: string;
  rw?: {
    id: number;
    name: string;
    province: string;
    regency: string;
    district: string;
    village: string;
    postal_code: string;
  };
};

export type Rw = {
  id: number;
  name: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  postal_code: string;
  max_rts: number;
  rts?: Area[];
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  const token = localStorage.getItem("rukunin_token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Gagal terhubung ke server");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function login(username: string, password: string) {
  return request<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function activateInvite(
  token: string,
  username: string,
  password: string,
) {
  return request<{ token: string; user: AuthUser }>("/api/auth/activate", {
    method: "POST",
    body: JSON.stringify({ token, username, password }),
  });
}

export function completeResidentOnboarding(input: {
  address: string;
  house_number: string;
  nik: string;
  no_kk: string;
  phone: string;
}) {
  return request<{ user: AuthUser; resident: Resident }>(
    "/api/auth/onboarding/resident",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function createManagedRT(input: {
  rw_mode: "none" | "with_rw";
  rw_name: string;
  rw_chair_name: string;
  rw_username: string;
  rt_name: string;
  chair_name: string;
  username: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  postal_code: string;
  max_rts: number;
}) {
  return request<{
    rt: Area;
    chair: AuthUser;
    invite_token: string;
    expires_at: number;
    rw: Rw;
    rw_chair?: AuthUser;
    rw_invite_token: string;
  }>("/api/admin/rts", { method: "POST", body: JSON.stringify(input) });
}

export function createManagedRWAccount(input: {
  rw_name: string;
  chair_name: string;
  username: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  postal_code: string;
}) {
  return request<{ invite_token: string }>("/api/admin/rw-account", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getManagedAreas() {
  return request<Area[]>("/api/admin/areas");
}

export function getRws() {
  return request<Rw[]>("/api/rws");
}

export function updateRwLimit(rwId: number, maxRts: number) {
  return request<Rw>(`/api/admin/rws/${rwId}/limit`, {
    method: "PUT",
    body: JSON.stringify({ max_rts: maxRts }),
  });
}

export function getMyRw() {
  return request<Rw & { rts: Area[] }>("/api/rw/me");
}

export function createRtForMyRw(input: {
  rt_name: string;
  chair_name: string;
  username: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  postal_code: string;
}) {
  return request<{ invite_token: string }>("/api/rw/rts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createRw(
  input: Pick<
    Rw,
    "name" | "province" | "regency" | "district" | "village" | "postal_code"
  >,
) {
  return request<Rw>("/api/rws", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function assignRtToRw(rtId: number, rwId: number) {
  return request<Area>(`/api/admin/rts/${rtId}/rw`, {
    method: "PUT",
    body: JSON.stringify({ rw_id: rwId }),
  });
}

export function getCurrentUser() {
  return request<AuthUser>("/api/auth/me");
}
export function logout() {
  localStorage.removeItem("rukunin_token");
  localStorage.removeItem("rukunin_user");
}

export function getResidents(rtId: number) {
  return request<Resident[]>(`/api/rts/${rtId}/residents`);
}
export function getUsers() {
  return request<AuthUser[]>("/api/users");
}

export function getArea(rtId: number) {
  return request<Area>(`/api/rts/${rtId}/`);
}

export function updateArea(rtId: number, area: Pick<Area, "name" | "chair">) {
  return request<Area>(`/api/rts/${rtId}/`, {
    method: "PUT",
    body: JSON.stringify(area),
  });
}

export function createUser(user: {
  username: string;
  password: string;
  name: string;
  role: Role;
  resident_id?: number;
}) {
  return request<AuthUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function updateUserRole(userId: number, role: Role) {
  return request<AuthUser>(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}
export function getHouses(rtId: number) {
  return request<House[]>(`/api/rts/${rtId}/houses`);
}

export function createHouse(rtId: number, number: string, address: string) {
  return request<House>(`/api/rts/${rtId}/houses`, {
    method: "POST",
    body: JSON.stringify({ number, address }),
  });
}

export function updateHouse(
  rtId: number,
  houseId: number,
  number: string,
  address: string,
) {
  return request<House>(`/api/rts/${rtId}/houses/${houseId}`, {
    method: "PUT",
    body: JSON.stringify({ number, address }),
  });
}

export function deleteHouse(rtId: number, houseId: number) {
  return request<void>(`/api/rts/${rtId}/houses/${houseId}`, {
    method: "DELETE",
  });
}

export function createResident(
  rtId: number,
  resident: Pick<
    Resident,
    "house_id" | "name" | "nik" | "no_kk" | "phone" | "status"
  > & {
    username?: string;
    password?: string;
    role?: Role;
  },
) {
  return request<Resident>(`/api/rts/${rtId}/residents`, {
    method: "POST",
    body: JSON.stringify(resident),
  });
}

export function updateResident(
  rtId: number,
  residentId: number,
  resident: Pick<
    Resident,
    "house_id" | "name" | "nik" | "no_kk" | "phone" | "status"
  >,
) {
  return request<Resident>(`/api/rts/${rtId}/residents/${residentId}`, {
    method: "PUT",
    body: JSON.stringify(resident),
  });
}

export function deleteResident(rtId: number, residentId: number) {
  return request<void>(`/api/rts/${rtId}/residents/${residentId}`, {
    method: "DELETE",
  });
}

export function getContributions(rtId: number) {
  return request<Contribution[]>(`/api/rts/${rtId}/contributions`);
}

export function createContribution(
  rtId: number,
  contribution: Pick<Contribution, "resident_id" | "month" | "year" | "amount">,
) {
  return request<Contribution>(`/api/rts/${rtId}/contributions`, {
    method: "POST",
    body: JSON.stringify({ ...contribution, status: "Paid" }),
  });
}

export function getExpenses(rtId: number) {
  return request<Expense[]>(`/api/rts/${rtId}/expenses`);
}

export function createExpense(
  rtId: number,
  expense: Pick<
    Expense,
    "description" | "amount" | "category" | "date" | "created_by"
  >,
) {
  return request<Expense>(`/api/rts/${rtId}/expenses`, {
    method: "POST",
    body: JSON.stringify(expense),
  });
}

export function getAnnouncements(rtId: number) {
  return request<Announcement[]>(`/api/rts/${rtId}/announcements`);
}

export function createAnnouncement(
  rtId: number,
  announcement: Pick<Announcement, "title" | "content" | "created_by">,
) {
  return request<Announcement>(`/api/rts/${rtId}/announcements`, {
    method: "POST",
    body: JSON.stringify(announcement),
  });
}

export function getMeetingNotes(rtId: number) {
  return request<MeetingNote[]>(`/api/rts/${rtId}/meeting-notes`);
}

export function createMeetingNote(
  rtId: number,
  note: Pick<
    MeetingNote,
    "title" | "date" | "agenda" | "content" | "created_by"
  >,
) {
  return request<MeetingNote>(`/api/rts/${rtId}/meeting-notes`, {
    method: "POST",
    body: JSON.stringify(note),
  });
}

export function approveMeetingNote(
  rtId: number,
  noteId: number,
  status: "approved" = "approved",
) {
  return request<MeetingNote>(`/api/rts/${rtId}/meeting-notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function getAppointments(rtId: number) {
  return request<Appointment[]>(`/api/rts/${rtId}/appointments`);
}

export function getAppointment(rtId: number, appointmentId: number) {
  return request<Appointment>(`/api/rts/${rtId}/appointments/${appointmentId}`);
}

export function createAppointment(
  rtId: number,
  appointment: Pick<
    Appointment,
    | "purpose"
    | "details"
    | "preferred_date"
    | "preferred_time"
    | "requester_name"
  >,
) {
  return request<Appointment>(`/api/rts/${rtId}/appointments`, {
    method: "POST",
    body: JSON.stringify(appointment),
  });
}

export function updateAppointment(
  rtId: number,
  appointmentId: number,
  review: Partial<
    Pick<
      Appointment,
      | "status"
      | "proposed_date"
      | "proposed_time"
      | "decision_note"
      | "assigned_to"
    >
  >,
) {
  return request<Appointment>(
    `/api/rts/${rtId}/appointments/${appointmentId}`,
    {
      method: "PUT",
      body: JSON.stringify(review),
    },
  );
}
