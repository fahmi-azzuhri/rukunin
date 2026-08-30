import { useNavigate } from "react-router-dom";

const highlights = [
  [
    "01",
    "Multi RT & RW",
    "Kelola berbagai RT dan RW dalam satu platform tanpa batas.",
    "🏘️",
  ],
  [
    "02",
    "Transparansi Keuangan",
    "Catat iuran dan pengeluaran dengan mudah, laporan real-time untuk setiap lingkungan.",
    "💰",
  ],
  [
    "03",
    "Komunikasi Terpusat",
    "Pengumuman, jadwal, dan informasi langsung ke seluruh warga tanpa tercecer.",
    "📢",
  ],
] as const;

export function LandingPage() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-b from-[#f7f9f6] via-[#f7f9f6] to-white text-[#172522]">
      <nav className="sticky top-0 z-50 border-b border-[#e1e7e2] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-[min(1160px,100%)] items-center justify-between px-6 py-4 max-[600px]:px-5">
          <button
            className="flex items-center gap-2.5 border-0 bg-transparent p-0 text-[20px] font-extrabold tracking-[-0.7px] transition hover:opacity-80"
            onClick={() => navigate("/")}
            type="button"
          >
            <img
              className="size-8 object-contain"
              src="/rukunin-logo.svg"
              alt="rukunin"
            />
            <span>rukunin</span>
          </button>
          <button
            className="rounded-[6px] border border-[#236b4a] bg-[#236b4a] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#18563a] hover:border-[#18563a]"
            onClick={() => navigate("/login")}
            type="button"
          >
            Masuk
          </button>
        </div>
      </nav>

      <section className="mx-auto grid w-[min(1160px,100%)] grid-cols-[1.05fr_0.95fr] items-center gap-14 px-6 pb-20 pt-20 max-[850px]:grid-cols-1 max-[850px]:gap-12 max-[600px]:px-5 max-[600px]:pb-14 max-[600px]:pt-14">
        <div className="max-w-[640px]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e87e42]/10 px-4 py-2 mb-5">
            <span className="text-lg">✨</span>
            <p className="font-mono text-[11px] font-medium tracking-[1px] text-[#e87e42]">
              SOLUSI UNTUK SEMUA LINGKUNGAN
            </p>
          </div>
          <h1 className="max-w-[620px] text-[clamp(42px,6vw,76px)] font-extrabold leading-[0.98] tracking-[-3.5px] max-[600px]:tracking-[-2px]">
            Kelola RT & RW dengan mudah.
          </h1>
          <p className="mt-7 max-w-[500px] text-[16px] leading-7 text-[#68766f]">
            Rukunin adalah platform administrasi untuk berbagai RT dan RW.
            Kelola data warga, iuran, kas, dan komunikasi lingkungan dalam satu
            ruang kerja yang aman dan terorganisir.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              className="rounded-[8px] border-0 bg-gradient-to-r from-[#236b4a] to-[#1d5a3f] px-6 py-4 text-sm font-extrabold text-white shadow-[0_12px_24px_#236b4a3d] transition hover:shadow-[0_16px_32px_#236b4a4d] hover:scale-105"
              onClick={() => navigate("/login")}
              type="button"
            >
              🚀 Masuk ke ruang kerja
            </button>
            <button
              className="rounded-[8px] border-2 border-[#236b4a] bg-white px-6 py-3.5 text-sm font-extrabold text-[#236b4a] transition hover:bg-[#236b4a]/5"
              onClick={() => navigate("/aktivasi")}
              type="button"
            >
              📧 Aktivasi undangan
            </button>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#17382e] via-[#1a4237] to-[#0f2822] p-8 text-white shadow-[0_32px_64px_#17382e32] max-[600px]:min-h-[360px] max-[600px]:p-6">
          <div className="absolute -right-16 -top-16 size-72 rounded-full bg-[#e87e42] opacity-20 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 size-72 rounded-full bg-[#6eaa87] opacity-10 blur-3xl" />
          <div className="relative flex h-full min-h-[360px] flex-col justify-between max-[600px]:min-h-[320px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[1.4px] text-[#a8c5b5] font-semibold">
                ⚡ KELOLA LINGKUNGANMU
              </span>
              <img
                className="size-12 rounded-[12px] object-contain shadow-lg"
                src="/rukunin-logo.svg"
                alt=""
              />
            </div>
            <div>
              <p className="font-mono text-[12px] text-[#6eaa87] tracking-wide font-semibold">
                UNTUK SETIAP RT & RW
              </p>
              <p className="mt-4 max-w-[330px] text-[32px] font-extrabold leading-[1.1] tracking-[-1px]">
                Satu platform untuk banyak lingkungan.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white/10 backdrop-blur border border-white/20 p-4">
                  <strong className="block text-2xl">∞</strong>
                  <span className="text-[11px] text-[#a8c5b5] font-medium">
                    RT/RW
                  </span>
                </div>
                <div className="rounded-lg bg-white/10 backdrop-blur border border-white/20 p-4">
                  <strong className="block text-2xl">📊</strong>
                  <span className="text-[11px] text-[#a8c5b5] font-medium">
                    Real-time
                  </span>
                </div>
                <div className="rounded-lg bg-white/10 backdrop-blur border border-white/20 p-4">
                  <strong className="block text-2xl">🔐</strong>
                  <span className="text-[11px] text-[#a8c5b5] font-medium">
                    Aman
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e1e7e2] bg-white">
        <div className="mx-auto w-[min(1160px,100%)] px-6 py-16 max-[600px]:px-5 max-[600px]:py-10">
          <div className="mb-12 text-center">
            <h2 className="text-[clamp(32px,5vw,48px)] font-extrabold tracking-[-2px]">
              Fitur yang Kamu Butuhkan
            </h2>
            <p className="mt-3 text-[#68766f] max-w-[520px] mx-auto">
              Dirancang khusus untuk memudahkan pengelolaan RT dan RW di seluruh
              Indonesia
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 max-[700px]:grid-cols-1 max-[700px]:gap-6">
            {highlights.map(([number, title, description, icon]) => (
              <div
                key={number}
                className="group rounded-[12px] border border-[#e1e7e2] bg-white p-6 transition hover:border-[#236b4a] hover:shadow-[0_12px_32px_#236b4a1a]"
              >
                <div className="text-[40px] mb-4">{icon}</div>
                <span className="font-mono text-[10px] text-[#e87e42] font-bold">
                  {number}
                </span>
                <h3 className="mt-3 text-[17px] font-extrabold text-[#172522]">
                  {title}
                </h3>
                <p className="mt-3 text-[14px] leading-6 text-[#68766f]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#f7f9f6] to-white py-16 max-[600px]:py-10">
        <div className="mx-auto w-[min(1160px,100%)] px-6 text-center max-[600px]:px-5">
          <h2 className="text-[clamp(32px,5vw,48px)] font-extrabold tracking-[-2px] mb-4">
            Siap untuk mulai?
          </h2>
          <p className="text-[#68766f] mb-8 max-w-[500px] mx-auto">
            Bergabunglah dengan puluhan lingkungan yang telah mempercayai
            Rukunin untuk mengelola komunitas mereka.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              className="rounded-[8px] border-0 bg-gradient-to-r from-[#236b4a] to-[#1d5a3f] px-8 py-4 text-sm font-extrabold text-white shadow-[0_12px_24px_#236b4a3d] transition hover:shadow-[0_16px_32px_#236b4a4d] hover:scale-105"
              onClick={() => navigate("/login")}
              type="button"
            >
              🚀 Masuk Sekarang
            </button>
            <button
              className="rounded-[8px] border-2 border-[#236b4a] bg-white px-8 py-3.5 text-sm font-extrabold text-[#236b4a] transition hover:bg-[#236b4a]/5"
              onClick={() => navigate("/aktivasi")}
              type="button"
            >
              📧 Dapatkan Akses
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e1e7e2] bg-[#172522] py-8 text-white">
        <div className="mx-auto w-[min(1160px,100%)] px-6 text-center max-[600px]:px-5">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              className="size-6 object-contain"
              src="/rukunin-logo.svg"
              alt="rukunin"
            />
            <span className="font-extrabold">Rukunin</span>
          </div>
          <p className="text-[12px] text-white/70">
            © {currentYear} Rukunin by{" "}
            <a
              href="https://efkode.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e87e42] hover:text-[#ff9d5c] transition"
            >
              efkode.dev
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
