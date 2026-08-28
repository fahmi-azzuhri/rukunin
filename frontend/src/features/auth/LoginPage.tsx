import { useState } from "react";
import type { FormEvent } from "react";
import { login } from "../../lib/api";
import type { AuthUser } from "../../lib/api";

type LoginPageProps = {
  onLogin: (user: AuthUser, token: string) => void;
};

export function LoginPage({ onLogin }: LoginPageProps) {
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
