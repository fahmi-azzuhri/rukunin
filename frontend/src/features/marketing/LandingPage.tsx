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
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#f7f9f6] via-[#f7f9f6] to-white text-[#172522]">
      <nav className="sticky top-0 z-50 border-b border-[#e1e7e2] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex min-h-[68px] w-full max-w-[1160px] items-center justify-between px-4 sm:px-6">
          <button
            className="flex items-center gap-2.5 border-0 bg-transparent p-0 text-[19px] font-extrabold tracking-[-0.7px] transition hover:opacity-80 sm:text-[20px]"
            onClick={() => navigate("/")}
            type="button"
          >
            <img
              className="size-8 shrink-0 object-contain"
              src="/rukunin-logo.svg"
              alt="rukunin"
            />
            <span>rukunin</span>
          </button>

          <button
            className="rounded-[10px] border border-[#236b4a] bg-[#236b4a] px-4 py-2 text-sm font-extrabold text-white shadow-md transition hover:border-[#18563a] hover:bg-[#18563a] sm:px-5 sm:py-2.5"
            onClick={() => navigate("/login")}
            type="button"
          >
            Masuk
          </button>
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-[1160px] grid-cols-1 items-center gap-12 px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:pb-20 lg:pt-16">
        <div className="relative z-10 w-full max-w-[640px]">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-[#e87e42]/10 px-3 py-1.5 sm:mb-5 sm:px-4 sm:py-2">
            <span className="text-base sm:text-lg">✨</span>

            <p className="truncate font-mono text-[9px] font-medium tracking-[0.7px] text-[#e87e42] sm:text-[11px] sm:tracking-[1px]">
              SOLUSI UNTUK SEMUA LINGKUNGAN
            </p>
          </div>

          <h1 className="text-[clamp(38px,7vw,76px)] font-extrabold leading-[0.98] tracking-[-2.5px] sm:tracking-[-3.5px]">
            <span className="block whitespace-nowrap">Kelola RT & RW</span>
            <span className="block whitespace-nowrap">dengan mudah.</span>
          </h1>

          <p className="mt-5 max-w-[540px] text-[15px] leading-6 text-[#68766f] sm:mt-7 sm:text-[16px] sm:leading-7">
            Rukunin adalah platform administrasi untuk berbagai RT dan RW.
            Kelola data warga, iuran, kas, dan komunikasi lingkungan dalam satu
            ruang kerja yang aman dan terorganisir.
          </p>

          <div className="mt-7 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <button
              className="w-full rounded-[10px] border-0 bg-gradient-to-r from-[#236b4a] to-[#1d5a3f] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_24px_#236b4a3d] transition hover:scale-[1.02] hover:shadow-[0_16px_32px_#236b4a4d] sm:w-auto sm:py-4"
              onClick={() => navigate("/login")}
              type="button"
            >
              🚀 Masuk ke ruang kerja
            </button>

            <button
              className="w-full rounded-[10px] border-2 border-[#236b4a] bg-white px-6 py-3 text-sm font-extrabold text-[#236b4a] transition hover:bg-[#236b4a]/5 sm:w-auto sm:py-3.5"
              onClick={() => navigate("/aktivasi")}
              type="button"
            >
              📧 Aktivasi undangan
            </button>
          </div>
        </div>

        <div className="relative mx-auto h-[430px] w-full max-w-[600px] sm:h-[500px] lg:mx-0">
          <div className="absolute right-[3%] top-[2%] h-48 w-48 rounded-full bg-[#e87e42]/20 blur-[70px] sm:h-72 sm:w-72 sm:blur-[90px]" />

          <div className="absolute bottom-0 left-[15%] h-48 w-48 rounded-full bg-[#236b4a]/20 blur-[80px] sm:h-72 sm:w-72 sm:blur-[100px]" />

          <div className="absolute right-[2%] top-0 h-[360px] w-[88%] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#216a4b] via-[#18583f] to-[#123c30] shadow-[0_25px_60px_rgba(25,78,57,0.28)] sm:h-[420px] sm:w-[88%] sm:rounded-[24px] lg:right-0 lg:w-[90%]">
            <div className="absolute -right-20 -top-20 size-52 rounded-full bg-[#e87e42]/20 blur-3xl sm:size-64" />

            <div className="absolute -bottom-24 -left-16 size-60 rounded-full bg-[#7fc29e]/10 blur-3xl sm:size-72" />

            <div className="relative z-10 flex items-center justify-between px-4 pt-5 sm:px-7 sm:pt-6">
              <div className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1.5 backdrop-blur sm:px-3">
                <span className="text-[7px] font-bold tracking-[0.5px] text-white/80 sm:text-[9px] sm:tracking-[0.8px]">
                  ⚡ KELOLA LINGKUNGANMU
                </span>
              </div>
            </div>

            <div className="relative z-30 mx-auto mt-6 w-[72%] max-w-[330px] text-center sm:mt-7 sm:w-[290px]">
              <p className="text-[8px] font-bold tracking-[1.2px] text-[#f2b47c] sm:text-[10px] sm:tracking-[1.5px]">
                UNTUK SETIAP RT & RW
              </p>

              <h2 className="mt-2 text-[21px] font-extrabold leading-[1.08] tracking-[-0.8px] text-white sm:text-[27px] sm:tracking-[-1px]">
                Satu platform untuk banyak lingkungan
              </h2>
            </div>

            <div className="absolute bottom-[-58px] left-1/2 z-10 w-[78%] max-w-[430px] -translate-x-1/2 rounded-[18px] border-[5px] border-white/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:bottom-[-85px] sm:w-[78%] sm:rounded-[22px] sm:border-[7px]">
              <div className="flex h-6 items-center gap-1 border-b border-[#e8ece9] bg-[#f7f8f7] px-2.5 sm:h-8 sm:gap-1.5 sm:px-3">
                <span className="size-1.5 rounded-full bg-[#ef6b62] sm:size-2" />
                <span className="size-1.5 rounded-full bg-[#f4c34e] sm:size-2" />
                <span className="size-1.5 rounded-full bg-[#63b878] sm:size-2" />
              </div>

              <div className="grid grid-cols-3 gap-1.5 bg-[#f4f7f4] p-2 sm:gap-3 sm:p-4">
                <div className="flex h-[82px] flex-col justify-center rounded-lg border border-[#e4e9e5] bg-white p-2 shadow-sm sm:h-[125px] sm:rounded-xl sm:p-4">
                  <div className="mb-1 text-[22px] text-[#236b4a] sm:mb-2 sm:text-[30px]">
                    ∞
                  </div>

                  <span className="text-[8px] font-bold sm:text-[12px]">
                    Lingkungan
                  </span>

                  <span className="mt-0.5 text-[6px] text-[#84918a] sm:mt-1 sm:text-[8px]">
                    12 komunitas
                  </span>
                </div>

                <div className="h-[82px] rounded-lg border border-[#e4e9e5] bg-white p-2 shadow-sm sm:h-[125px] sm:rounded-xl sm:p-4">
                  <p className="text-[7px] font-bold sm:text-[10px]">
                    Statistik
                  </p>

                  <div className="mt-2 flex h-[38px] items-end justify-between gap-0.5 sm:mt-4 sm:h-[55px] sm:gap-1">
                    {[35, 50, 42, 65, 55, 82].map((height, i) => (
                      <div
                        key={i}
                        className="w-full rounded-t bg-gradient-to-t from-[#236b4a] to-[#75b28f]"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex h-[82px] flex-col items-center justify-center rounded-lg border border-[#e4e9e5] bg-white p-2 shadow-sm sm:h-[125px] sm:rounded-xl sm:p-3">
                  <div className="flex size-7 items-center justify-center rounded-full bg-[#236b4a]/10 text-sm sm:size-11 sm:text-xl">
                    🛡️
                  </div>

                  <span className="mt-1 text-[7px] font-bold sm:mt-2 sm:text-[11px]">
                    Aman
                  </span>

                  <span className="mt-0.5 text-[5px] text-[#84918a] sm:mt-1 sm:text-[7px]">
                    Terlindungi
                  </span>
                </div>

                <div className="col-span-3 space-y-1 rounded-lg border border-[#e4e9e5] bg-white p-2 sm:space-y-2 sm:rounded-xl sm:p-3">
                  <div className="h-1.5 w-2/3 rounded-full bg-[#e5ebe7] sm:h-2" />
                  <div className="h-1.5 w-full rounded-full bg-[#edf1ee] sm:h-2" />
                  <div className="h-1.5 w-4/5 rounded-full bg-[#edf1ee] sm:h-2" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute left-0 top-[78px] z-20 w-[105px] rounded-lg border border-white/80 bg-white/95 p-2 shadow-[0_12px_28px_rgba(32,70,54,0.16)] backdrop-blur-md sm:left-[-5px] sm:top-[105px] sm:w-[145px] sm:rounded-xl sm:p-3">
            <div className="flex items-center justify-between">
              <span className="text-[6px] font-bold text-[#59665f] sm:text-[8px]">
                Progress
              </span>

              <span className="text-[6px] font-bold text-[#236b4a] sm:text-[8px]">
                80%
              </span>
            </div>

            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#e8ece9] sm:mt-2 sm:h-1.5">
              <div className="h-full w-[80%] rounded-full bg-[#e87e42]" />
            </div>

            <div className="mt-2 flex items-center justify-between sm:mt-3">
              <span className="text-[6px] font-bold text-[#59665f] sm:text-[8px]">
                Progresi
              </span>

              <span className="text-[6px] font-bold text-[#236b4a] sm:text-[8px]">
                70%
              </span>
            </div>

            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#e8ece9] sm:mt-2 sm:h-1.5">
              <div className="h-full w-[70%] rounded-full bg-[#236b4a]" />
            </div>
          </div>

          <div className="absolute left-0 top-[165px] z-20 w-[105px] rounded-lg border border-white/80 bg-white/95 p-2 shadow-[0_12px_28px_rgba(32,70,54,0.16)] backdrop-blur-md sm:left-[-5px] sm:top-[215px] sm:w-[145px] sm:rounded-xl sm:p-3">
            <p className="text-[6px] font-bold text-[#59665f] sm:text-[8px]">
              Iuran collection
            </p>

            <div className="mt-1.5 flex items-center gap-2 sm:mt-2 sm:gap-3">
              <div className="relative size-[35px] shrink-0 rounded-full bg-[conic-gradient(#236b4a_0deg_220deg,#e87e42_220deg_305deg,#e7ebe8_305deg_360deg)] sm:size-[48px]">
                <div className="absolute inset-[6px] rounded-full bg-white sm:inset-[8px]" />
              </div>

              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1">
                  <span className="size-1 rounded-full bg-[#236b4a] sm:size-1.5" />
                  <span className="text-[5px] text-[#68766f] sm:text-[7px]">
                    Lunas
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="size-1 rounded-full bg-[#e87e42] sm:size-1.5" />
                  <span className="text-[5px] text-[#68766f] sm:text-[7px]">
                    Belum
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="size-1 rounded-full bg-[#d9dedb] sm:size-1.5" />
                  <span className="text-[5px] text-[#68766f] sm:text-[7px]">
                    Cicil
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[5px] left-0 z-20 w-[105px] rounded-lg border border-white/80 bg-white/95 p-2 shadow-[0_12px_28px_rgba(32,70,54,0.16)] backdrop-blur-md sm:bottom-[25px] sm:left-[-5px] sm:w-[145px] sm:rounded-xl sm:p-3">
            <p className="text-[6px] font-bold text-[#59665f] sm:text-[8px]">
              List of communities
            </p>

            <div className="mt-1.5 space-y-1.5 sm:mt-2 sm:space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#236b4a] text-[6px] font-bold text-white sm:size-6 sm:text-[8px]">
                    ∞
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[5px] font-bold sm:text-[7px]">
                      RT Community
                    </p>

                    <p className="text-[4px] text-[#8b958f] sm:text-[6px]">
                      Active community
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute right-0 top-[135px] z-20 w-[108px] rounded-lg border border-white/80 bg-white/95 p-2 shadow-[0_12px_28px_rgba(32,70,54,0.16)] backdrop-blur-md sm:right-[-5px] sm:top-[179px] sm:w-[150px] sm:rounded-xl sm:p-3">
            <div className="flex items-center justify-between">
              <p className="text-[6px] font-bold text-[#59665f] sm:text-[8px]">
                Activity feed
              </p>

              <span className="text-[8px] text-[#a1aaa5] sm:text-[10px]">
                •••
              </span>
            </div>

            <div className="mt-2 space-y-2 sm:mt-3 sm:space-y-3">
              <div className="flex gap-1.5 sm:gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#d8e8df] text-[6px] sm:size-6 sm:text-[8px]">
                  👤
                </div>

                <div className="min-w-0">
                  <p className="text-[5px] font-bold sm:text-[7px]">
                    Pengumuman
                  </p>

                  <p className="mt-0.5 text-[4px] leading-2 text-[#7d8982] sm:text-[6px] sm:leading-3">
                    Rapat bulanan akan diadakan Sabtu ini
                  </p>

                  <span className="text-[4px] text-[#a0aaa4] sm:text-[5px]">
                    2m
                  </span>
                </div>
              </div>

              <div className="flex gap-1.5 sm:gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f7dfcf] text-[6px] sm:size-6 sm:text-[8px]">
                  💰
                </div>

                <div className="min-w-0">
                  <p className="text-[5px] font-bold sm:text-[7px]">
                    Iuran warga
                  </p>

                  <p className="mt-0.5 text-[4px] leading-2 text-[#7d8982] sm:text-[6px] sm:leading-3">
                    Pembayaran bulan Juni diterima
                  </p>

                  <span className="text-[4px] text-[#a0aaa4] sm:text-[5px]">
                    35m
                  </span>
                </div>
              </div>

              <div className="flex -space-x-1.5 pt-1 sm:-space-x-2">
                <div className="size-4 rounded-full border border-white bg-[#236b4a] sm:size-5 sm:border-2" />
                <div className="size-4 rounded-full border border-white bg-[#e87e42] sm:size-5 sm:border-2" />
                <div className="size-4 rounded-full border border-white bg-[#91b7a2] sm:size-5 sm:border-2" />

                <span className="ml-1.5 text-[4px] text-[#7d8982] sm:ml-2 sm:text-[6px]">
                  +12 warga
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[5px] right-0 z-20 w-[108px] rounded-lg border border-white/80 bg-white/95 p-2 shadow-[0_12px_28px_rgba(32,70,54,0.16)] backdrop-blur-md sm:bottom-[35px] sm:right-[-5px] sm:w-[150px] sm:rounded-xl sm:p-3">
            <div className="flex items-center justify-between">
              <p className="text-[6px] font-bold text-[#59665f] sm:text-[8px]">
                Community events
              </p>

              <span className="text-[8px] text-[#a1aaa5] sm:text-[10px]">
                •••
              </span>
            </div>

            <div className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2.5">
              <div className="flex gap-1.5 sm:gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#236b4a]/10 text-[7px] sm:size-6 sm:text-[9px]">
                  📅
                </div>

                <div className="min-w-0">
                  <p className="text-[5px] font-bold sm:text-[7px]">Rapat RT</p>

                  <p className="text-[4px] text-[#8a958e] sm:text-[6px]">
                    Sabtu, 22 Jun · 19:00
                  </p>
                </div>
              </div>

              <div className="flex gap-1.5 sm:gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#e87e42]/10 text-[7px] sm:size-6 sm:text-[9px]">
                  💰
                </div>

                <div className="min-w-0">
                  <p className="text-[5px] font-bold sm:text-[7px]">
                    Iuran Bulanan
                  </p>

                  <p className="text-[4px] text-[#8a958e] sm:text-[6px]">
                    10 Jun – 20 Jun
                  </p>
                </div>
              </div>

              <div className="flex gap-1.5 sm:gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#236b4a]/10 text-[7px] sm:size-6 sm:text-[9px]">
                  🧹
                </div>

                <div className="min-w-0">
                  <p className="text-[5px] font-bold sm:text-[7px]">
                    Kerja Bakti
                  </p>

                  <p className="text-[4px] text-[#8a958e] sm:text-[6px]">
                    Minggu, 23 Jun · 07:00
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2 border-t border-[#edf0ee] pt-1.5 sm:mt-3 sm:pt-2">
              <span className="text-[5px] font-bold text-[#236b4a] sm:text-[6px]">
                Lihat semua acara →
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e1e7e2] bg-white">
        <div className="mx-auto w-full max-w-[1160px] px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto mb-9 max-w-[650px] text-center sm:mb-12">
            <h2 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] sm:tracking-[-2px]">
              Fitur yang Kamu Butuhkan
            </h2>

            <p className="mx-auto mt-3 max-w-[520px] text-sm leading-6 text-[#68766f] sm:text-base">
              Dirancang khusus untuk memudahkan pengelolaan RT dan RW di seluruh
              Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {highlights.map(([number, title, description, icon]) => (
              <div
                key={number}
                className="group rounded-[14px] border border-[#e1e7e2] bg-white p-5 transition hover:border-[#236b4a] hover:shadow-[0_12px_32px_#236b4a1a] sm:p-6"
              >
                <div className="mb-3 text-[36px] sm:mb-4 sm:text-[40px]">
                  {icon}
                </div>

                <span className="font-mono text-[10px] font-bold text-[#e87e42]">
                  {number}
                </span>

                <h3 className="mt-2 text-[16px] font-extrabold text-[#172522] sm:mt-3 sm:text-[17px]">
                  {title}
                </h3>

                <p className="mt-2 text-[13px] leading-6 text-[#68766f] sm:mt-3 sm:text-[14px]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#f7f9f6] to-white py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1160px] px-4 text-center sm:px-6">
          <h2 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-1.5px] sm:tracking-[-2px]">
            Siap untuk mulai?
          </h2>

          <p className="mx-auto mb-7 mt-4 max-w-[500px] text-sm leading-6 text-[#68766f] sm:mb-8 sm:text-base">
            Bergabunglah dengan puluhan lingkungan yang telah mempercayai
            Rukunin untuk mengelola komunitas mereka.
          </p>

          <div className="mx-auto flex w-full max-w-[500px] flex-col gap-3 sm:flex-row sm:max-w-none sm:items-center sm:justify-center sm:gap-4">
            <button
              className="w-full rounded-[8px] border-0 bg-gradient-to-r from-[#236b4a] to-[#1d5a3f] px-8 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_24px_#236b4a3d] transition hover:scale-[1.02] hover:shadow-[0_16px_32px_#236b4a4d] sm:w-auto sm:py-4"
              onClick={() => navigate("/login")}
              type="button"
            >
              🚀 Masuk Sekarang
            </button>

            <button
              className="w-full rounded-[8px] border-2 border-[#236b4a] bg-white px-8 py-3 text-sm font-extrabold text-[#236b4a] transition hover:bg-[#236b4a]/5 sm:w-auto sm:py-3.5"
              onClick={() => navigate("/aktivasi")}
              type="button"
            >
              📧 Dapatkan Akses
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e1e7e2] bg-[#172522] py-7 text-white sm:py-8">
        <div className="mx-auto flex w-full max-w-[1160px] flex-col items-center justify-center gap-3 px-4 text-center sm:px-6">
          <div className="flex items-center gap-2">
            <img
              className="size-6 object-contain"
              src="/rukunin-logo.svg"
              alt="rukunin"
            />

            <span className="font-extrabold">Rukunin</span>
          </div>

          <p className="text-[11px] text-white/70 sm:text-[12px]">
            © {currentYear} Rukunin by{" "}
            <a
              href="https://efkode.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e87e42] transition hover:text-[#ff9d5c]"
            >
              efkode.dev
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
