export type RegionOption = {
  code: string;
  name: string;
  postal_code?: string;
};

const regionApiUrl = "https://www.emsifa.com/api-wilayah-indonesia/api";
const postalApiUrl = "https://kodepos.vercel.app/search/";

async function getRegions(path: string): Promise<RegionOption[]> {
  const response = await fetch(`${regionApiUrl}/${path}.json`);
  if (!response.ok) throw new Error("Data wilayah gagal dimuat");
  const regions = (await response.json()) as Array<{
    id: string;
    name: string;
  }>;
  return regions.map((region) => ({ code: region.id, name: region.name }));
}

export function getProvinces() {
  return getRegions("provinces");
}

export function getRegencies(provinceCode: string) {
  return getRegions(`regencies/${provinceCode}`);
}

export function getDistricts(regencyCode: string) {
  return getRegions(`districts/${regencyCode}`);
}

export function getVillages(districtCode: string) {
  return getRegions(`villages/${districtCode}`);
}

export async function getPostalCode(
  village: string,
  district: string,
  regency: string,
  province: string,
) {
  const response = await fetch(
    `${postalApiUrl}?q=${encodeURIComponent(village)}`,
  );
  if (!response.ok) return "";
  const body = (await response.json()) as {
    data?: Array<{
      code?: string;
      village?: string;
      district?: string;
      regency?: string;
      province?: string;
    }>;
  };
  const normalized = (value: string) =>
    value
      .toLowerCase()
      .replace(/^(kabupaten|kab\.|kota)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
  const selected = [village, district, regency, province].map(normalized);
  const match = (body.data ?? []).find((item) =>
    [item.village, item.district, item.regency, item.province]
      .map((value) => normalized(value ?? ""))
      .every((value, index) => !selected[index] || value === selected[index]),
  );
  return match?.code ? String(match.code) : "";
}
