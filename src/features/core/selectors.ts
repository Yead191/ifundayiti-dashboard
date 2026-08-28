import { STATUS_ORDER, statusLabelMap } from "./statusMaps";
import type { Application, ApplicationStatus, Donation } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface ProgramStats {
  totalApplications: number;
  byStatus: Record<ApplicationStatus, number>;
  totalDonations: number;
  awardedGrants: number;
  currentProgramFund: number;
}

/** Aggregate headline numbers for the overview + donations pages. */
export function computeStats(applications: Application[], donations: Donation[]): ProgramStats {
  const byStatus = STATUS_ORDER.reduce(
    (acc, status) => ({ ...acc, [status]: 0 }),
    {} as Record<ApplicationStatus, number>
  );

  for (const app of applications) byStatus[app.status] += 1;

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const awardedGrants = applications.reduce((sum, a) => sum + (a.fundedAmount ?? 0), 0);

  return {
    totalApplications: applications.length,
    byStatus,
    totalDonations,
    awardedGrants,
    currentProgramFund: totalDonations - awardedGrants,
  };
}

export interface MonthlyPoint {
  month: string;
  value: number;
}

/** Applications grouped by month for a given year. */
export function monthlyApplications(applications: Application[], year: number): MonthlyPoint[] {
  const counts = new Array(12).fill(0);
  for (const app of applications) {
    const d = new Date(app.createdAt);
    if (d.getFullYear() === year) counts[d.getMonth()] += 1;
  }
  return MONTHS.map((month, i) => ({ month, value: counts[i] }));
}

/** Donation totals grouped by month for a given year. */
export function monthlyDonations(donations: Donation[], year: number): MonthlyPoint[] {
  const amounts = new Array(12).fill(0);
  for (const d of donations) {
    const date = new Date(d.date);
    if (date.getFullYear() === year) amounts[date.getMonth()] += d.amount;
  }
  return MONTHS.map((month, i) => ({ month, value: amounts[i] }));
}

export interface StatusSlice {
  status: ApplicationStatus;
  label: string;
  count: number;
}

/** Non-zero status distribution for the donut chart. */
export function statusDistribution(applications: Application[]): StatusSlice[] {
  const stats = computeStats(applications, []);
  return STATUS_ORDER.map((status) => ({
    status,
    label: statusLabelMap[status],
    count: stats.byStatus[status],
  })).filter((slice) => slice.count > 0);
}

/** Distinct years present across applications and donations, newest first. */
export function availableYears(applications: Application[], donations: Donation[]): number[] {
  const years = new Set<number>();
  for (const a of applications) years.add(new Date(a.createdAt).getFullYear());
  for (const d of donations) years.add(new Date(d.date).getFullYear());
  if (years.size === 0) years.add(new Date().getFullYear());
  return [...years].sort((a, b) => b - a);
}
