import { pageTitles, roleLabels, type Role } from "./dashboardConfig.ts";

type DashboardHeaderProps = {
  activePage: string;
  role: Role;
  profileName: string;
  rtName: string;
};

export function DashboardHeader({
  activePage,
  role,
  profileName,
  rtName,
}: DashboardHeaderProps) {
  const todayLabel = new Date()
    .toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <header className="flex items-center justify-between">
      <div>
        <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
          {todayLabel}
        </span>
        <h1 className="mt-2.5 text-[34px] tracking-[-1.5px] max-[900px]:text-[28px]">
          {pageTitles[activePage] ?? pageTitles.warga}
        </h1>
      </div>
      <div className="flex items-center gap-3.5 max-[500px]:gap-2">
        <button
          className="size-[34px] rounded-full border border-[#e1e7e2] bg-transparent font-extrabold text-[#78847f]"
          aria-label="Notifikasi"
          type="button"
        >
          !
        </button>
        <div className="flex items-center gap-3.5 border-l border-[#e1e7e2] pl-[18px] text-xs font-bold text-[#57655f]">
          <span className="grid size-[30px] place-items-center rounded-full bg-[#e8a266] font-mono text-[10px] text-[#673a1d]">
            {profileName.slice(0, 1).toUpperCase()}
          </span>
          <div className="max-[500px]:hidden">
            <span className="block">{roleLabels[role]}</span>
            <span className="mt-0.5 block text-[10px] font-medium text-[#93a19a]">
              {rtName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
