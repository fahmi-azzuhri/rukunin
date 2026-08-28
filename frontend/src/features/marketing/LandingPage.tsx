import { useNavigate } from "react-router-dom";

const highlights = [
  [
    "01",
    "Data warga",
    "Satu daftar rapi untuk rumah, keluarga, dan status warga.",
  ],
  [
    "02",
    "Keuangan RT",
    "Catat iuran dan pengeluaran dengan angka yang mudah dipantau.",
  ],
  [
    "03",
    "Komunikasi",
    "Sampaikan pengumuman penting tanpa tercecer di banyak tempat.",
  ],
] as const;

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9f6] text-[#172522]">
      <nav className="mx-auto flex w-[min(1160px,100%)] items-center justify-between px-6 py-6 max-[600px]:px-5">
        <button
          className="flex items-center gap-2.5 border-0 bg-transparent p-0 text-[20px] font-extrabold tracking-[-0.7px]"
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
          className="rounded-[6px] border border-[#cbd9d0] bg-white px-4 py-2.5 text-xs font-extrabold text-[#236b4a] transition hover:border-[#236b4a]"
          onClick={() => navigate("/login")}
          type="button"
        >
          Masuk
        </button>
      </nav>

      <section className="mx-auto grid w-[min(1160px,100%)] grid-cols-[1.05fr_0.95fr] items-center gap-14 px-6 pb-20 pt-16 max-[850px]:grid-cols-1 max-[850px]:gap-12 max-[600px]:px-5 max-[600px]:pb-14 max-[600px]:pt-10">
        <div className="max-w-[640px]">
          <p className="mb-5 font-mono text-[10px] font-medium tracking-[1.4px] text-[#e87e42]">
            PLATFORM ADMINISTRASI LINGKUNGAN
          </p>
          <h1 className="max-w-[620px] text-[clamp(42px,6vw,76px)] font-extrabold leading-[0.98] tracking-[-3.5px] max-[600px]:tracking-[-2px]">
            Warga rukun, RT teratur.
          </h1>
          <p className="mt-7 max-w-[500px] text-[16px] leading-7 text-[#68766f]">
            Rukunin membantu pengurus RT mengelola data warga, iuran, kas, dan
            informasi lingkungan dalam satu ruang kerja yang tenang.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              className="rounded-[6px] border-0 bg-[#236b4a] px-5 py-3.5 text-xs font-extrabold text-white shadow-[0_8px_18px_#236b4a2e] transition hover:bg-[#18563a]"
              onClick={() => navigate("/login")}
              type="button"
            >
              Masuk ke ruang kerja
            </button>
            <button
              className="rounded-[6px] border border-[#cbd9d0] bg-transparent px-5 py-3.5 text-xs font-extrabold text-[#236b4a] transition hover:bg-white"
              onClick={() => navigate("/aktivasi")}
              type="button"
            >
              Aktivasi undangan
            </button>
          </div>
        </div>

        <div className="relative min-h-[390px] overflow-hidden rounded-[14px] bg-[#17382e] p-7 text-white shadow-[0_24px_60px_#17382e24] max-[600px]:min-h-[330px] max-[600px]:p-5">
          <div className="absolute -right-20 -top-20 size-64 rounded-full border-[28px] border-[#e87e42] opacity-90" />
          <div className="absolute -bottom-24 -left-20 size-64 rounded-full border-[28px] border-[#6eaa87] opacity-40" />
          <div className="relative flex h-full min-h-[336px] flex-col justify-between max-[600px]:min-h-[290px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[1.2px] text-[#a8c5b5]">
                RUANG KERJA RT
              </span>
              <img
                className="size-10 rounded-[10px] object-contain"
                src="/rukunin-logo.svg"
                alt=""
              />
            </div>
            <div>
              <p className="font-mono text-[11px] text-[#e87e42]">
                HARI INI DI LINGKUNGANMU
              </p>
              <p className="mt-3 max-w-[330px] text-[31px] font-extrabold leading-[1.05] tracking-[-1.2px]">
                Semua yang penting, terlihat jelas.
              </p>
              <div className="mt-7 grid grid-cols-3 gap-2.5">
                <div className="border-t border-[#507765] pt-2.5">
                  <strong className="block text-lg">128</strong>
                  <span className="text-[10px] text-[#a8c5b5]">Warga</span>
                </div>
                <div className="border-t border-[#507765] pt-2.5">
                  <strong className="block text-lg">92%</strong>
                  <span className="text-[10px] text-[#a8c5b5]">Iuran</span>
                </div>
                <div className="border-t border-[#507765] pt-2.5">
                  <strong className="block text-lg">04</strong>
                  <span className="text-[10px] text-[#a8c5b5]">Info baru</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#e1e7e2] bg-white">
        <div className="mx-auto grid w-[min(1160px,100%)] grid-cols-3 gap-0 px-6 py-10 max-[700px]:grid-cols-1 max-[700px]:gap-7 max-[600px]:px-5">
          {highlights.map(([number, title, description]) => (
            <article
              className="border-l border-[#e1e7e2] px-7 first:border-l-0 max-[700px]:border-l-0 max-[700px]:border-t max-[700px]:px-0 max-[700px]:pt-6 max-[700px]:first:border-t-0 max-[700px]:first:pt-0"
              key={number}
            >
              <span className="font-mono text-[10px] text-[#e87e42]">
                {number}
              </span>
              <h2 className="mt-3 text-[17px] font-extrabold">{title}</h2>
              <p className="mt-2 max-w-[260px] text-xs leading-5 text-[#78847f]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
