import type { AuthUser, House, Resident } from "../../lib/api";
import type { Role } from "./dashboardConfig.ts";

type ResidentsDataTablesProps = {
  residents: Resident[];
  houses: House[];
  users: AuthUser[];
  user: AuthUser;
  profileName: string;
  role: Role;
  rtName: string;
  houseNumber: Map<number, string>;
  filteredResidents: Resident[];
  isLoading: boolean;
  canViewResidentDetails: boolean;
  canManageResidents: boolean;
  isSaving: boolean;
  onEditResident: (resident: Resident) => void;
  onDeleteResident: (resident: Resident) => void;
  onEditHouse: (house: House) => void;
  onDeleteHouse: (house: House) => void;
  onUserRoleChange: (userId: number, role: Role) => void;
};

export function ResidentsDataTables({
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
  canViewResidentDetails,
  canManageResidents,
  isSaving,
  onEditResident,
  onDeleteResident,
  onEditHouse,
  onDeleteHouse,
  onUserRoleChange,
}: ResidentsDataTablesProps) {
  return (
    <>
      <section className="overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr>
                <th>WARGA</th>
                {canViewResidentDetails && <th>NIK</th>}
                <th>NO. RUMAH</th>
                <th>STATUS</th>
                <th>TELEPON</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <EmptyRow
                  colSpan={canViewResidentDetails ? 6 : 5}
                  text="Memuat data warga..."
                />
              ) : filteredResidents.length === 0 ? (
                <EmptyRow
                  colSpan={canViewResidentDetails ? 6 : 5}
                  text="Belum ada data warga."
                />
              ) : (
                filteredResidents.map((resident) => (
                  <tr key={resident.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-full bg-[#dcefe3] font-mono text-xs font-bold text-[#236b4a]">
                          {resident.name.slice(0, 1).toUpperCase()}
                        </span>
                        <strong>{resident.name}</strong>
                      </div>
                    </td>
                    {canViewResidentDetails && <td>{resident.nik || "-"}</td>}
                    <td>
                      <span className="rounded bg-[#f1f5f1] px-2 py-1 text-[10px] font-bold text-[#57655f]">
                        {houseNumber.get(resident.house_id) ??
                          `#${resident.house_id}`}
                      </span>
                    </td>
                    <td>
                      <span className="rounded bg-[#dcefe3] px-2 py-1 text-[10px] font-bold text-[#236b4a]">
                        {resident.status || "Anggota"}
                      </span>
                    </td>
                    <td>{resident.phone || "-"}</td>
                    <td>
                      {canManageResidents && (
                        <>
                          <button
                            onClick={() => onEditResident(resident)}
                            className="border-0 bg-transparent text-xs font-bold text-[#78847f]"
                            aria-label={`Opsi ${resident.name}`}
                          >
                            Edit
                          </button>
                          <button
                            className="ml-2 border-0 bg-transparent text-xs font-bold text-[#b94b3e]"
                            onClick={() => onDeleteResident(resident)}
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {canViewResidentDetails && (
        <section className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white">
          <TableHeading
            eyebrow={`DATA PROPERTI ${rtName}`}
            title="Daftar rumah"
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr>
                  <th>NOMOR RUMAH</th>
                  <th>JUMLAH WARGA</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {houses.length === 0 ? (
                  <EmptyRow colSpan={3} text="Belum ada rumah." />
                ) : (
                  houses.map((house) => (
                    <tr key={house.id}>
                      <td>
                        <span className="rounded bg-[#f1f5f1] px-2 py-1 text-[10px] font-bold text-[#57655f]">
                          {house.number}
                        </span>
                      </td>
                      <td>
                        {house.residents?.length ??
                          residents.filter(
                            (resident) => resident.house_id === house.id,
                          ).length}{" "}
                        warga
                      </td>
                      <td>
                        {canManageResidents && (
                          <>
                            <button
                              className="border-0 bg-transparent text-xs font-bold text-[#78847f]"
                              onClick={() => onEditHouse(house)}
                            >
                              Edit
                            </button>
                            <button
                              className="ml-2 border-0 bg-transparent text-xs font-bold text-[#b94b3e]"
                              onClick={() => onDeleteHouse(house)}
                            >
                              Hapus
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {role === "ketua" && (
        <section className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white">
          <TableHeading
            eyebrow="PENGELOLA RT"
            title="Akun akses"
            suffix="Ubah role langsung di tabel"
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr>
                  <th>NAMA</th>
                  <th>USERNAME</th>
                  <th>HAK AKSES</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <EmptyRow colSpan={3} text="Belum ada akun tambahan." />
                ) : (
                  users.map((account) => (
                    <tr key={account.id}>
                      <td>
                        <strong>
                          {account.id === user.id ? profileName : account.name}
                        </strong>
                      </td>
                      <td>{account.username}</td>
                      <td>
                        <select
                          className="rounded-[5px] border border-[#d3ddd6] bg-white px-2 py-1 text-[10px] font-bold text-[#236b4a] outline-0 focus:border-[#236b4a]"
                          value={
                            account.id === user.id ? "ketua" : account.role
                          }
                          onChange={(event) =>
                            onUserRoleChange(
                              account.id,
                              event.target.value as Role,
                            )
                          }
                          disabled={isSaving || account.id === user.id}
                        >
                          <option value="ketua">Ketua RT</option>
                          <option value="bendahara">Bendahara</option>
                          <option value="sekretaris">Sekretaris</option>
                          <option value="wakil">Wakil RT</option>
                          <option value="warga">Warga</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

function TableHeading({
  eyebrow,
  title,
  suffix,
}: {
  eyebrow: string;
  title: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between px-[23px] pb-[18px] pt-[22px]">
      <div>
        <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
          {eyebrow}
        </span>
        <h2 className="mt-2 text-lg tracking-[-0.5px]">{title}</h2>
      </div>
      {suffix && <span className="text-[11px] text-[#78847f]">{suffix}</span>}
    </div>
  );
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-8 text-center text-xs text-[#78847f]">
        {text}
      </td>
    </tr>
  );
}
