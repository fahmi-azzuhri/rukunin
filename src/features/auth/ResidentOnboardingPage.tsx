import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { completeResidentOnboarding, type AuthUser } from "../../lib/api";

type ResidentOnboardingPageProps = {
  user: AuthUser;
  onComplete: (user: AuthUser, token: string) => void;
};

export function ResidentOnboardingPage({
  user,
  onComplete,
}: ResidentOnboardingPageProps) {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [nik, setNik] = useState("");
  const [noKK, setNoKK] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const fields = [
      ["alamat rumah", address],
      ["nomor rumah RT", houseNumber],
      ["NIK", nik],
      ["nomor KK", noKK],
      ["nomor telepon", phone],
    ] as const;
    const missingField = fields.find(([, value]) => !value.trim());
    if (missingField) {
      setError(`${missingField[0]} wajib diisi.`);
      return;
    }
    setIsLoading(true);
    try {
      const result = await completeResidentOnboarding({
        address: address.trim(),
        house_number: houseNumber.trim(),
        nik: nik.trim(),
        no_kk: noKK.trim(),
        phone: phone.trim(),
      });
      onComplete(result.user, localStorage.getItem("rukunin_token") ?? "");
      navigate("/warga", { replace: true });
    } catch (onboardingError) {
      setError(
        onboardingError instanceof Error
          ? onboardingError.message
          : "Data warga gagal disimpan",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9f6] p-5 font-sans">
      <section className="w-[min(460px,100%)] rounded-[9px] border border-[#e1e7e2] bg-white p-9 shadow-[0_20px_50px_#17382e18]">
        <div className="flex items-center gap-2.5 pb-[38px] text-[21px] font-extrabold text-[#172522]">
          <img
            className="size-[29px] object-contain"
            src="/rukunin-logo.svg"
            alt="rukunin"
          />
          <span>rukunin</span>
        </div>
        <span className="font-mono text-[10px] tracking-[1.1px] text-[#93a19a]">
          DATA WARGA KETUA RT
        </span>
        <h1 className="mb-2 mt-3 text-[29px] tracking-[-1px] text-[#172522]">
          Lengkapi data warga
        </h1>
        <p className="mb-[26px] text-xs text-[#78847f]">
          Halo {user.name}. Lengkapi data diri dan alamat rumah Anda untuk
          melanjutkan ke dashboard RT.
        </p>
        {error && (
          <div className="mb-5 rounded-[6px] border border-[#f0d6a8] bg-[#fff6e7] px-[15px] py-3 text-xs text-[#825e2d]">
            {error}
          </div>
        )}
        <form className="grid gap-[15px]" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-[11px] font-bold text-[#68766f]">
            Alamat rumah
            <textarea
              required
              rows={3}
              className="resize-y rounded-[5px] border border-[#e1e7e2] px-3 py-2.5 text-[13px]"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Contoh: Jl. Melati No. 12"
              autoFocus
            />
          </label>
          <label className="grid gap-1.5 text-[11px] font-bold text-[#68766f]">
            Nomor rumah RT
            <input
              required
              className="rounded-[5px] border border-[#e1e7e2] px-3 py-2.5 text-[13px]"
              value={houseNumber}
              onChange={(event) => setHouseNumber(event.target.value)}
              placeholder="Contoh: 12A"
            />
          </label>
          <label className="grid gap-1.5 text-[11px] font-bold text-[#68766f]">
            NIK
            <input
              required
              inputMode="numeric"
              className="rounded-[5px] border border-[#e1e7e2] px-3 py-2.5 text-[13px]"
              value={nik}
              onChange={(event) => setNik(event.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-[11px] font-bold text-[#68766f]">
            Nomor KK
            <input
              required
              inputMode="numeric"
              className="rounded-[5px] border border-[#e1e7e2] px-3 py-2.5 text-[13px]"
              value={noKK}
              onChange={(event) => setNoKK(event.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-[11px] font-bold text-[#68766f]">
            Nomor telepon
            <input
              required
              type="tel"
              className="rounded-[5px] border border-[#e1e7e2] px-3 py-2.5 text-[13px]"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <button
            className="mt-2 rounded-[6px] bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan..." : "Simpan dan lanjutkan"}
          </button>
        </form>
      </section>
    </main>
  );
}
