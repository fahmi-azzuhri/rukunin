import type { Area, AuthUser } from "../../lib/api";
import { roleLabels, type Role } from "./dashboardConfig.ts";

type ProfilePageProps = {
  user: AuthUser;
  role: Role;
  area: Area | null;
  profileName: string;
  rtName: string;
};

export function ProfilePage({
  user,
  role,
  area,
  profileName,
  rtName,
}: ProfilePageProps) {
  return (
    <section className="mt-[25px] grid gap-5" id="profil">
      <div className="rounded-[10px] border border-[#e1e7e2] bg-white p-7 max-[500px]:p-5">
        <div className="flex items-start gap-5 max-[500px]:flex-col">
          <div className="grid size-16 shrink-0 place-items-center rounded-[18px] bg-[#dcefe3] font-mono text-xl font-medium text-[#236b4a]">
            {profileName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <span className="font-mono text-[10px] font-medium tracking-[1.1px] text-[#93a19a]">
              PROFIL PENGGUNA
            </span>
            <h2 className="mt-2 text-2xl tracking-[-0.7px]">{profileName}</h2>
            <p className="mt-1 text-xs text-[#78847f]">
              Kelola informasi akun dan lihat akses area kerja Anda.
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 max-[700px]:grid-cols-1">
        <div className="rounded-[10px] border border-[#e1e7e2] bg-white p-6">
          <span className="font-mono text-[10px] font-medium tracking-[1.1px] text-[#93a19a]">
            INFORMASI AKUN
          </span>
          <dl className="mt-5 grid gap-4">
            <div>
              <dt className="text-[11px] font-bold text-[#9aa69f]">Nama</dt>
              <dd className="mt-1 text-sm font-bold text-[#172522]">
                {profileName}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-[#9aa69f]">Username</dt>
              <dd className="mt-1 text-sm font-bold text-[#172522]">
                {user.username}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-[#9aa69f]">
                Hak akses
              </dt>
              <dd className="mt-1">
                <span className="rounded bg-[#dcefe3] px-2 py-1 text-[10px] font-bold text-[#236b4a]">
                  {roleLabels[role]}
                </span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="rounded-[10px] border border-[#e1e7e2] bg-white p-6">
          <span className="font-mono text-[10px] font-medium tracking-[1.1px] text-[#93a19a]">
            AREA KERJA
          </span>
          <dl className="mt-5 grid gap-4">
            <div>
              <dt className="text-[11px] font-bold text-[#9aa69f]">RT aktif</dt>
              <dd className="mt-1 text-sm font-bold text-[#172522]">
                {rtName}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-[#9aa69f]">
                Nama Ketua RT
              </dt>
              <dd className="mt-1 text-sm font-bold text-[#172522]">
                {area?.chair || "Belum diisi"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-[#9aa69f]">
                Status akun
              </dt>
              <dd className="mt-1 text-sm font-bold text-[#236b4a]">Aktif</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
