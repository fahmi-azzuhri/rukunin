import { approveMeetingNote, type MeetingNote } from "../../lib/api";

type MeetingNotesPageProps = {
  notes: MeetingNote[];
  rtName: string;
  canManage: boolean;
  isChief: boolean;
  onCreate: () => void;
};

export function MeetingNotesPage({
  notes,
  rtName,
  canManage,
  isChief,
  onCreate,
}: MeetingNotesPageProps) {
  async function handleApprove(note: MeetingNote) {
    try {
      const updated = await approveMeetingNote(note.rt_id, note.id);
      window.location.reload();
      return updated;
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Persetujuan notulen gagal",
      );
    }
  }
  return (
    <section
      className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white"
      id="notulen"
    >
      <div className="flex items-center justify-between border-b border-[#e1e7e2] px-[23px] pb-[18px] pt-[22px] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-[15px]">
        <div>
          <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
            CATATAN {rtName}
          </span>
          <h2 className="mt-2 text-lg tracking-[-0.5px]">Notulen rapat</h2>
        </div>
        {canManage && (
          <button
            className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white shadow-[0_5px_12px_#236b4a22] hover:bg-[#18563a]"
            onClick={onCreate}
            type="button"
          >
            <span>+</span> Tambah notulen
          </button>
        )}
      </div>

      <div className="grid gap-0">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#78847f]">
            Belum ada catatan notulen rapat.
          </div>
        ) : (
          notes.map((note) => (
            <article
              className="border-b border-[#e1e7e2] px-[23px] py-[22px] last:border-b-0"
              key={note.id}
            >
              <div className="flex flex-wrap items-center gap-[9px] text-[11px] text-[#78847f]">
                <span className="rounded bg-[#dcefe3] px-2 py-1 text-[10px] font-bold text-[#236b4a]">
                  {rtName}
                </span>
                <span>{note.date || "Tanggal belum diisi"}</span>
                <span
                  className={
                    note.status === "approved"
                      ? "rounded bg-[#dcefe3] px-2 py-1 text-[10px] font-bold text-[#236b4a]"
                      : "rounded bg-[#f3e7d6] px-2 py-1 text-[10px] font-bold text-[#8a5b0b]"
                  }
                >
                  {note.status === "approved"
                    ? "Disetujui"
                    : "Menunggu persetujuan"}
                </span>
              </div>
              <h3 className="mb-1.5 mt-[11px] text-base text-[#172522]">
                {note.title}
              </h3>
              {note.agenda && (
                <p className="mb-2 text-[11px] text-[#4d5b56]">
                  <strong>Agenda:</strong> {note.agenda}
                </p>
              )}
              <p className="mb-2.5 whitespace-pre-wrap text-xs leading-[1.7] text-[#65736c]">
                {note.content}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <small className="text-[10px] text-[#9aa69f]">
                  Oleh {note.created_by || "Sekretaris RT"}
                  {note.approved_by
                    ? ` • Disetujui oleh ${note.approved_by}`
                    : ""}
                </small>
                {isChief && note.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => void handleApprove(note)}
                    className="rounded border border-[#236b4a] bg-[#236b4a] px-3 py-2 text-[10px] font-bold text-white"
                  >
                    Setujui notulen
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
