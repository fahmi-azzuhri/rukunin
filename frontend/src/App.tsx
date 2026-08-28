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
        <Route
          path="/profil"
          element={<Dashboard user={user} onLogout={handleLogout} />}
        />
        <Route path="*" element={<Navigate to="/warga" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
