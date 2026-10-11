import type { Contribution, Expense, House, Resident } from "../../lib/api";

export function createResidentNameLookup(residents: Resident[]) {
  return new Map(residents.map((resident) => [resident.id, resident.name]));
}

export function createHouseNumberLookup(houses: House[]) {
  return new Map(houses.map((house) => [house.id, house.number]));
}

export function getFinancialSummary(
  contributions: Contribution[],
  expenses: Expense[],
) {
  const totalContributions = contributions.reduce(
    (total, contribution) => total + contribution.amount,
    0,
  );
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  return {
    totalContributions,
    totalExpenses,
    currentBalance: totalContributions - totalExpenses,
  };
}

export function filterResidents(
  residents: Resident[],
  search: string,
  residentFilter: string,
) {
  const normalizedSearch = search.toLowerCase();

  return residents.filter(
    (resident) =>
      `${resident.name} ${resident.nik} ${resident.phone}`
        .toLowerCase()
        .includes(normalizedSearch) &&
      (residentFilter === "all" ||
        (residentFilter === "empty-house"
          ? resident.house_id === 0
          : resident.status === residentFilter ||
            String(resident.house_id) === residentFilter)),
  );
}
