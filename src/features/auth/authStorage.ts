import type { AuthUser } from "../../lib/api";

const tokenKey = "rukunin_token";
const userKey = "rukunin_user";

export function getStoredUser(): AuthUser | null {
  const savedUser = localStorage.getItem(userKey);
  const token = localStorage.getItem(tokenKey);

  return savedUser && token ? (JSON.parse(savedUser) as AuthUser) : null;
}

export function storeSession(user: AuthUser, token: string) {
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
}
