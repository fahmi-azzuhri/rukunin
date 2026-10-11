import type { Resident, House } from "../../lib/api";
import type { Role } from "./dashboardConfig.ts";
import { ResidentsSummary } from "./ResidentsSummary.tsx";
import { ResidentsDataTables } from "./ResidentsDataTables.tsx";

type ResidentsPageProps = {
  residents: Resident[];
  houses: House[];
  users: Parameters<typeof ResidentsDataTables>[0]["users"];
  user: Parameters<typeof ResidentsDataTables>[0]["user"];
  profileName: string;
  role: Role;
  rtName: string;
  houseNumber: Map<number, string>;
  filteredResidents: Resident[];
  isLoading: boolean;
  error: string;
  canManageResidents: boolean;
  canViewResidentDetails: boolean;
  isSaving: boolean;
  search: string;
  residentFilter: string;
  activeFilterLabel: string;
  isFilterOpen: boolean;
  onSearchChange: (value: string) => void;
  onFilterToggle: () => void;
  onFilterChange: (value: string) => void;
  onRetry: () => void;
  onAddResident: () => void;
  onEditResident: (resident: Resident) => void;
  onDeleteResident: (resident: Resident) => void;
  onEditHouse: (house: House) => void;
  onDeleteHouse: (house: House) => void;
  onUserRoleChange: (userId: number, role: Role) => void;
};

export function ResidentsPage({
  residents,
  houses,
  users,
  user,
  profileName,
  role,
  rtName,
  houseNumber,
  filteredResidents,
  isLoading,
  error,
  canManageResidents,
  canViewResidentDetails,
  isSaving,
  search,
  residentFilter,
  activeFilterLabel,
  isFilterOpen,
  onSearchChange,
  onFilterToggle,
  onFilterChange,
  onRetry,
  onAddResident,
  onEditResident,
  onDeleteResident,
  onEditHouse,
  onDeleteHouse,
  onUserRoleChange,
}: ResidentsPageProps) {
  return (
    <div>
      <div className="my-[30px] flex items-center justify-between text-[13px] text-[#78847f] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-[15px]">
        <p>Kelola data warga dan rumah di lingkungan {rtName}.</p>
        <div className="flex gap-[9px]">
          {canManageResidents && (
            <button
              className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white shadow-[0_5px_12px_#236b4a22] hover:bg-[#18563a]"
              onClick={onAddResident}
              type="button"
            >
              <span>+</span> Tambah warga
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="mb-5 rounded-[6px] border border-[#f0d6a8] bg-[#fff6e7] px-[15px] py-3 text-xs text-[#825e2d]">
          <strong>Gagal memproses permintaan.</strong> {error}{" "}
          <button onClick={onRetry} type="button">
            Coba lagi
          </button>
        </div>
      )}
      <ResidentsSummary
        residents={residents}
        houses={houses}
        isLoading={isLoading}
        canViewHouseCount={canViewResidentDetails}
        rtName={rtName}
      />
      <div className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white">
        <div className="flex items-center justify-between px-[23px] pb-[18px] pt-[22px] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-[18px]">
          <div>
            <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
              DATABASE {rtName}
            </span>
            <h2 className="mt-2 text-lg tracking-[-0.5px]">Daftar warga</h2>
          </div>
          <div className="flex items-center gap-2.5 max-[900px]:w-full">
            <label className="flex flex-1 items-center gap-2 rounded-[5px] border border-[#e1e7e2] px-2.5 py-2 text-[#9aa69f]">
              <span>/</span>
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={
                  canViewResidentDetails
                    ? "Cari nama atau NIK..."
                    : "Cari nama atau telepon..."
                }
              />
            </label>
            <div className="relative">
              <button
                className={`rounded-[5px] border px-3 py-2 text-[11px] font-bold max-[900px]:px-2.5 ${residentFilter === "all" ? "border-[#d3ddd6] bg-transparent text-[#57655f]" : "border-[#b9d8c3] bg-[#edf7ef] text-[#236b4a]"}`}
                onClick={onFilterToggle}
                type="button"
              >
                {activeFilterLabel} <span className="ml-2">v</span>
              </button>
              {isFilterOpen && (
                <ResidentFilterMenu
                  houses={houses}
                  residentFilter={residentFilter}
                  onChange={onFilterChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <ResidentsDataTables
        residents={residents}
        houses={houses}
        users={users}
        user={user}
        profileName={profileName}
        role={role}
        rtName={rtName}
        houseNumber={houseNumber}
        filteredResidents={filteredResidents}
        isLoading={isLoading}
        canViewResidentDetails={canViewResidentDetails}
        canManageResidents={canManageResidents}
        isSaving={isSaving}
        onEditResident={onEditResident}
        onDeleteResident={onDeleteResident}
        onEditHouse={onEditHouse}
        onDeleteHouse={onDeleteHouse}
        onUserRoleChange={onUserRoleChange}
      />
    </div>
  );
}

function ResidentFilterMenu({
  houses,
  residentFilter,
  onChange,
}: {
  houses: House[];
  residentFilter: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-10 grid min-w-[190px] gap-1 rounded-[8px] border border-[#e1e7e2] bg-white p-1.5 shadow-[0_12px_30px_#17382e18]">
      <FilterButton label="Semua warga" value="all" onChange={onChange} />
      {(["Kepala Keluarga", "Anggota", "Tamu"] as const).map((status) => (
        <FilterButton
          key={status}
          label={status}
          value={status}
          onChange={onChange}
        />
      ))}
      {houses.length > 0 && (
        <>
          <div className="my-1 border-t border-[#edf0ed]" />
          {houses.map((house) => (
            <FilterButton
              key={house.id}
              label={`Rumah ${house.number}`}
              value={String(house.id)}
              onChange={onChange}
            />
          ))}
        </>
      )}
      {residentFilter !== "all" && (
        <FilterButton
          label="Hapus filter"
          value="all"
          onChange={onChange}
          danger
        />
      )}
    </div>
  );
}

function FilterButton({
  label,
  value,
  onChange,
  danger = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  danger?: boolean;
}) {
  return (
    <button
      className={`${danger ? "mt-1 border-t border-[#edf0ed] text-[#b94b3e]" : "text-[#57655f] hover:bg-[#f2f6f1]"} rounded-[5px] px-3 py-2 text-left text-[11px] font-bold`}
      onClick={() => onChange(value)}
      type="button"
    >
      {label}
    </button>
  );
}
