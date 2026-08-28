import type { House, Resident } from "../../lib/api";

type ResidentsSummaryProps = {
  residents: Resident[];
  houses: House[];
  isLoading: boolean;
  canViewHouseCount: boolean;
  rtName: string;
};

export function ResidentsSummary({
  residents,
  houses,
  isLoading,
  canViewHouseCount,
  rtName,
}: ResidentsSummaryProps) {
  const cards = [
    [
      "TOTAL WARGA",
      isLoading ? "--" : String(residents.length),
      `terdata di ${rtName}`,
    ],
    ...(canViewHouseCount
      ? [
          [
            "TOTAL RUMAH",
            isLoading ? "--" : String(houses.length),
            "rumah terdaftar",
          ],
        ]
      : []),
    [
      "KEPALA KELUARGA",
      isLoading
        ? "--"
        : String(
            residents.filter(
              (resident) => resident.status === "Kepala Keluarga",
            ).length,
          ),
      "dari total warga",
    ],
  ];

  return (
    <section
      className="grid grid-cols-3 gap-[15px] max-[900px]:grid-cols-1"
      aria-label="Ringkasan data"
    >
      {cards.map(([label, value, caption], index) => (
        <article
          className={`min-h-[135px] rounded-[7px] border border-[#e1e7e2] bg-white px-[21px] py-5 ${index === 0 ? "border-t-[3px] border-t-[#e87e42]" : ""}`}
          key={label}
        >
          <span className="font-mono text-[10px] font-medium leading-none tracking-[1.1px] text-[#8d9a93]">
            {label}
          </span>
          <strong className="mt-[13px] block text-[33px] tracking-[-1px]">
            {value}
          </strong>
          <span className="text-[11px] text-[#9ba49f]">{caption}</span>
        </article>
      ))}
    </section>
  );
}
