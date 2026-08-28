import { NavLink } from "react-router-dom";
import {
  dashboardNavigation,
  roleLabels,
  type Role,
} from "./dashboardConfig.ts";

type DashboardSidebarProps = {
  role: Role;
  rtName: string;
  profileName: string;
  onAreaSettings: () => void;
  onLogout: () => void;
};

export function DashboardSidebar({
  role,
  rtName,
  profileName,
  onAreaSettings,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <aside className="flex w-[250px] shrink-0 flex-col bg-[#17382e] px-[18px] pb-5 pt-7 text-[#d6e5dc] max-[900px]:w-[68px] max-[900px]:px-2.5 max-[900px]:py-5">
      <div className="flex items-center gap-2.5 px-3 pb-[47px] text-[21px] font-extrabold tracking-[-0.7px] text-white max-[900px]:px-[9px] max-[900px]:pb-[35px]">
        <span className="grid size-[29px] place-items-center rounded-[9px_9px_9px_2px] bg-[#e87e42] font-mono text-[15px] text-white">
          R
        </span>
        <span className="max-[900px]:hidden">rukunin</span>
      </div>
      <div className="px-[13px] pb-2.5 font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#78968a] max-[900px]:text-[0px]">
        AREA KERJA
      </div>
      <div className="relative flex items-center gap-2 rounded-lg border border-[#3b6b57] bg-[#285442] p-3 text-[13px] font-bold text-white max-[900px]:justify-center max-[900px]:px-0 max-[900px]:py-3.5">
        <span className="size-[7px] shrink-0 rounded-full bg-[#f4b85c]" />
        <span className="truncate max-[900px]:hidden">{rtName}</span>
        <span className="ml-auto text-[#a3c3b2] max-[900px]:hidden">v</span>
      </div>
      {role === "ketua" && (
        <button
          className="mt-2 rounded-[6px] border border-[#3b6b57] bg-transparent px-3 py-2 text-left text-[10px] font-bold text-[#b8cec0] hover:bg-[#285442] max-[900px]:hidden"
          onClick={onAreaSettings}
          type="button"
        >
          Pengaturan area
        </button>
      )}
      <nav className="mt-[33px] grid gap-1.5" aria-label="Navigasi utama">
        {dashboardNavigation.map(([number, label, path]) => (
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[7px] p-3 text-[13px] font-semibold no-underline ${isActive ? "bg-[#f2f6f1] text-[#172522]" : "text-[#9cb7a9] hover:bg-[#f2f6f1] hover:text-[#172522]"} max-[900px]:justify-center max-[900px]:px-0 max-[900px]:py-[13px] max-[900px]:text-[0px]`
            }
            key={path}
            to={path}
          >
            <span className="max-[900px]:text-[10px]">{number}</span> {label}
          </NavLink>
        ))}
      </nav>
      <NavLink
        className="mt-auto flex items-center gap-2.5 border-t border-[#315646] px-2 pb-0 pt-[18px] text-[11px] no-underline max-[900px]:justify-center max-[900px]:px-0"
        to="/profil"
      >
        <div className="grid size-8 place-items-center rounded-full bg-[#e8a266] font-mono text-[11px] text-[#673a1d]">
          {profileName.slice(0, 1).toUpperCase()}
        </div>
        <div className="max-[900px]:hidden">
          <strong className="block text-[11px] text-white">
            {profileName}
          </strong>
          <small className="mt-[3px] block text-[#87a698]">
            {roleLabels[role]}
          </small>
        </div>
        <span className="ml-auto tracking-[2px] text-[#8ca99b] max-[900px]:hidden">
          ...
        </span>
      </NavLink>
      <button
        className="mt-2.5 rounded-[5px] border border-[#3b6b57] bg-transparent px-[9px] py-[7px] text-[10px] text-[#b8cec0]"
        onClick={onLogout}
        type="button"
      >
        Keluar
      </button>
    </aside>
  );
}
