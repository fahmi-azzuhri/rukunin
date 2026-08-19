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

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
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

  return response.json() as Promise<T>;
}

export function getResidents(rtId: number) {
  return request<Resident[]>(`/api/rts/${rtId}/residents`);
}

export function getHouses(rtId: number) {
  return request<House[]>(`/api/rts/${rtId}/houses`);
}

export function createHouse(rtId: number, number: string) {
  return request<House>(`/api/rts/${rtId}/houses`, {
    method: "POST",
    body: JSON.stringify({ number }),
  });
}

export function createResident(
  rtId: number,
  resident: Pick<
    Resident,
    "house_id" | "name" | "nik" | "no_kk" | "phone" | "status"
  >,
) {
  return request<Resident>(`/api/rts/${rtId}/residents`, {
    method: "POST",
    body: JSON.stringify(resident),
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
