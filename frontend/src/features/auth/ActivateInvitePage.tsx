import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { activateInvite } from "../../lib/api";
import type { AuthUser } from "../../lib/api";

type ActivateInvitePageProps = {
  token: string;
  onLogin: (user: AuthUser, token: string) => void;
};

export function ActivateInvitePage({
  token,
  onLogin,
}: ActivateInvitePageProps) {
  const navigate = useNavigate();
  const [inviteToken, setInviteToken] = useState(token);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedToken = inviteToken.trim();
    if (!trimmedToken) {
      setError("Masukkan token undangan terlebih dahulu.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const result = await activateInvite(
        trimmedToken,
        username.trim(),
        password,
      );
      onLogin(result.user, result.token);
      navigate(result.user.role === "superadmin" ? "/admin" : "/warga", {
        replace: true,
      });
    } catch (activationError) {
      setError(
        activationError instanceof Error
          ? activationError.message
          : "Aktivasi gagal",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9f6] p-5 font-sans">
      <section className="w-[min(460px,100%)] rounded-[9px] border border-[#e1e7e2] bg-white p-9 shadow-[0_20px_50px_#17382e18]">
        <div className="flex items-center gap-2.5 pb-[38px] text-[21px] font-extrabold text-[#172522]">
          <span className="grid size-[29px] place-items-center rounded-[9px_9px_9px_2px] bg-[#e87e42] font-mono text-[15px] text-white">
            R
          </span>
          <span>rukunin</span>
        </div>
        <span className="font-mono text-[10px] tracking-[1.1px] text-[#93a19a]">
          UNDANGAN KETUA RT
        </span>
        <h1 className="mb-2 mt-3 text-[29px] tracking-[-1px] text-[#172522]">
          Aktifkan akun
        </h1>
        <p className="mb-[26px] text-xs text-[#78847f]">
          Buat username dan password untuk mulai mengelola area RT Anda.
        </p>
        {!inviteToken && (
          <div className="mb-5 rounded-[6px] border border-[#f0d6a8] bg-[#fff6e7] px-[15px] py-3 text-xs text-[#825e2d]">
            Masukkan token undangan untuk melanjutkan aktivasi akun.
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-[6px] border border-[#f0d6a8] bg-[#fff6e7] px-[15px] py-3 text-xs text-[#825e2d]">
            {error}
          </div>
        )}
        <form className="grid gap-[15px]" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-[11px] font-bold text-[#68766f]">
            Token undangan
            <input
              required
              className="rounded-[5px] border border-[#e1e7e2] px-3 py-2.5 text-[13px]"
              value={inviteToken}
              onChange={(event) => setInviteToken(event.target.value)}
              autoFocus
              spellCheck={false}
            />
          </label>
          <label className="grid gap-1.5 text-[11px] font-bold text-[#68766f]">
            Username
            <input
              required
              className="rounded-[5px] border border-[#e1e7e2] px-3 py-2.5 text-[13px]"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-[11px] font-bold text-[#68766f]">
            Password baru
            <input
              required
              minLength={6}
              type="password"
              className="rounded-[5px] border border-[#e1e7e2] px-3 py-2.5 text-[13px]"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            className="mt-2 rounded-[6px] bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Mengaktifkan..." : "Aktifkan akun"}
          </button>
        </form>
      </section>
    </main>
  );
}
