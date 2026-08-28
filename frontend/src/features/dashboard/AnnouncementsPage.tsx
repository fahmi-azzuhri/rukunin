import type { Announcement } from "../../lib/api";

type AnnouncementsPageProps = {
  announcements: Announcement[];
  rtName: string;
  canManage: boolean;
  onCreate: () => void;
};

export function AnnouncementsPage({
  announcements,
  rtName,
  canManage,
  onCreate,
}: AnnouncementsPageProps) {
  return (
    <section
      className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white"
      id="pengumuman"
    >
      <div className="flex items-center justify-between border-b border-[#e1e7e2] px-[23px] pb-[18px] pt-[22px] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-[15px]">
        <div>
          <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
            KOMUNIKASI {rtName}
          </span>
          <h2 className="mt-2 text-lg tracking-[-0.5px]">Pengumuman</h2>
        </div>
        {canManage && (
          <button
            className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white shadow-[0_5px_12px_#236b4a22] hover:bg-[#18563a]"
            onClick={onCreate}
            type="button"
          >
            <span>+</span> Buat pengumuman
          </button>
        )}
      </div>
      <div className="grid gap-0">
        {announcements.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#78847f]">
            Belum ada pengumuman.
          </div>
        ) : (
          announcements.map((announcement) => (
            <article
              className="border-b border-[#e1e7e2] px-[23px] py-[22px] last:border-b-0"
              key={announcement.id}
            >
              <div className="flex items-center gap-[9px] text-[11px] text-[#78847f]">
                <span className="rounded bg-[#dcefe3] px-2 py-1 text-[10px] font-bold text-[#236b4a]">
                  {rtName}
                </span>
                <span>
                  {announcement.created_at
                    ? new Date(
                        announcement.created_at * 1000,
                      ).toLocaleDateString("id-ID")
                    : "Baru saja"}
                </span>
              </div>
              <h3 className="mb-1.5 mt-[11px] text-base text-[#172522]">
                {announcement.title}
              </h3>
              <p className="mb-2.5 whitespace-pre-wrap text-xs leading-[1.7] text-[#65736c]">
                {announcement.content}
              </p>
              <small className="text-[10px] text-[#9aa69f]">
                Oleh {announcement.created_by || "Pengurus RT"}
              </small>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
