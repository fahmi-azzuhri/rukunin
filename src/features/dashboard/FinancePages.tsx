import type { Contribution, Expense } from "../../lib/api";

type FinanceProps = {
  rtName: string;
  canManage: boolean;
  onCreate: () => void;
};

type ContributionsPageProps = FinanceProps & {
  contributions: Contribution[];
  residentName: Map<number, string>;
};

export function ContributionsPage({
  contributions,
  residentName,
  rtName,
  canManage,
  onCreate,
}: ContributionsPageProps) {
  const total = contributions.reduce((sum, item) => sum + item.amount, 0);
  return (
    <section
      className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white"
      id="iuran"
    >
      <FinanceHeading
        title="Iuran warga"
        label={`KEUANGAN ${rtName}`}
        action={canManage ? "Catat pembayaran" : undefined}
        onCreate={onCreate}
      />
      <FinanceStats
        items={[
          ["TOTAL TERCATAT", `Rp ${total.toLocaleString("id-ID")}`],
          ["PEMBAYARAN", String(contributions.length)],
        ]}
      />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr>
              <th>WARGA</th>
              <th>PERIODE</th>
              <th>NOMINAL</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {contributions.length === 0 ? (
              <EmptyRow text="Belum ada pembayaran iuran." />
            ) : (
              contributions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>
                      {residentName.get(item.resident_id) ??
                        `Warga #${item.resident_id}`}
                    </strong>
                  </td>
                  <td>
                    {String(item.month).padStart(2, "0")}/{item.year}
                  </td>
                  <td>Rp {item.amount.toLocaleString("id-ID")}</td>
                  <td>
                    <span className="rounded bg-[#dcefe3] px-2 py-1 text-[10px] font-bold text-[#236b4a]">
                      {item.status || "Paid"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type ExpensesPageProps = FinanceProps & {
  expenses: Expense[];
  balance: number;
  totalExpenses: number;
};

export function ExpensesPage({
  expenses,
  balance,
  totalExpenses,
  rtName,
  canManage,
  onCreate,
}: ExpensesPageProps) {
  return (
    <section
      className="mt-[25px] overflow-hidden rounded-[7px] border border-[#e1e7e2] bg-white"
      id="kas"
    >
      <FinanceHeading
        title="Kas RT"
        label={`KEUANGAN ${rtName}`}
        action={canManage ? "Catat pengeluaran" : undefined}
        onCreate={onCreate}
      />
      <FinanceStats
        items={[
          [
            "SALDO BERJALAN",
            `Rp ${balance.toLocaleString("id-ID")}`,
            balance < 0,
          ],
          ["TOTAL PENGELUARAN", `Rp ${totalExpenses.toLocaleString("id-ID")}`],
        ]}
      />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr>
              <th>KETERANGAN</th>
              <th>KATEGORI</th>
              <th>NOMINAL</th>
              <th>TANGGAL</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <EmptyRow text="Belum ada pengeluaran." />
            ) : (
              expenses.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.description}</strong>
                  </td>
                  <td>
                    <span className="rounded bg-[#f1f5f1] px-2 py-1 text-[10px] font-bold text-[#57655f]">
                      {item.category || "Lainnya"}
                    </span>
                  </td>
                  <td>Rp {item.amount.toLocaleString("id-ID")}</td>
                  <td>
                    {item.date
                      ? new Date(item.date).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FinanceHeading({
  title,
  label,
  action,
  onCreate,
}: {
  title: string;
  label: string;
  action?: string;
  onCreate: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#e1e7e2] px-[23px] pb-[18px] pt-[22px] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-[15px]">
      <div>
        <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#93a19a]">
          {label}
        </span>
        <h2 className="mt-2 text-lg tracking-[-0.5px]">{title}</h2>
      </div>
      {action && (
        <button
          className="inline-flex items-center gap-[9px] rounded-[6px] border-0 bg-[#236b4a] px-4 py-[11px] text-xs font-extrabold text-white shadow-[0_5px_12px_#236b4a22] hover:bg-[#18563a]"
          onClick={onCreate}
          type="button"
        >
          <span>+</span> {action}
        </button>
      )}
    </div>
  );
}

function FinanceStats({ items }: { items: [string, string, boolean?][] }) {
  return (
    <div className="flex gap-[70px] border-b border-[#e1e7e2] bg-[#fbfcfa] px-[23px] py-[19px] max-[900px]:gap-[35px]">
      {items.map(([label, value, negative]) => (
        <div key={label}>
          <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#8d9a93]">
            {label}
          </span>
          <strong
            className={`mt-2 block text-xl ${negative ? "text-[#b94b3e]" : ""}`}
          >
            {value}
          </strong>
        </div>
      ))}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <tr>
      <td colSpan={4} className="p-8 text-center text-xs text-[#78847f]">
        {text}
      </td>
    </tr>
  );
}
