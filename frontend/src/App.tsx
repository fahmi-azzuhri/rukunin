import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { AuthUser } from "./lib/api";
import { LoginPage } from "./features/auth/LoginPage.tsx";
import {
  clearSession,
  getStoredUser,
  storeSession,
} from "./features/auth/authStorage.ts";
import { Dashboard } from "./features/dashboard/Dashboard.tsx";
import { ActivateInvitePage } from "./features/auth/ActivateInvitePage.tsx";
import { SuperadminPage } from "./features/admin/SuperadminPage.tsx";

function App() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  function handleLogin(nextUser: AuthUser, token: string) {
    storeSession(nextUser, token);
    setUser(nextUser);
  }

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/aktivasi"
          element={
            <ActivateInvitePage
              token={
                new URLSearchParams(window.location.search).get("token") ?? ""
              }
              onLogin={handleLogin}
            />
          }
        />
        <Route
          path="*"
          element={
            user ? (
              <AuthenticatedRoutes user={user} onLogout={handleLogout} />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function AuthenticatedRoutes({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  if (user.role === "superadmin") {
    return (
      <Routes>
        <Route path="/admin" element={<SuperadminPage onLogout={onLogout} />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/warga" replace />} />
      <Route path="*" element={<Dashboard user={user} onLogout={onLogout} />} />
    </Routes>
  );
}

export default App;
