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
import { ResidentOnboardingPage } from "./features/auth/ResidentOnboardingPage.tsx";
import { SuperadminPage } from "./features/admin/SuperadminPage.tsx";
import { LandingPage } from "./features/marketing/LandingPage.tsx";
import { RwDashboardPage } from "./features/rw/RwDashboardPage.tsx";

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
        {!user && <Route path="/" element={<LandingPage />} />}
        {!user && (
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        )}
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
              <AuthenticatedRoutes
                user={user}
                onLogout={handleLogout}
                onLogin={handleLogin}
              />
            ) : (
              <Navigate to="/" replace />
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
  onLogin,
}: {
  user: AuthUser;
  onLogout: () => void;
  onLogin: (user: AuthUser, token: string) => void;
}) {
  if (user.role === "superadmin") {
    return (
      <Routes>
        <Route path="/admin" element={<SuperadminPage onLogout={onLogout} />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }
  if (user.role === "ketua" && !user.resident_id) {
    return (
      <Routes>
        <Route
          path="/onboarding/resident"
          element={<ResidentOnboardingPage user={user} onComplete={onLogin} />}
        />
        <Route
          path="*"
          element={<Navigate to="/onboarding/resident" replace />}
        />
      </Routes>
    );
  }
  if (user.role === "ketua_rw") {
    return (
      <Routes>
        <Route path="/rw" element={<RwDashboardPage onLogout={onLogout} />} />
        <Route path="*" element={<Navigate to="/rw" replace />} />
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
