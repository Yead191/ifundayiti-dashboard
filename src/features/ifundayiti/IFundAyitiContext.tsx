import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";
import { genId } from "@/lib/utils";
import { INITIAL_APPLICATIONS, INITIAL_PERIODS, INITIAL_DONATIONS } from "./mockData";
import { MAX_FINALISTS } from "./types";
import type {
  Application,
  ApplicationPeriod,
  ApplicationPeriodInput,
  ApplicationStatus,
  Donation,
  WinnerAward,
} from "./types";

/** Result of a guarded transition — lets pages surface a friendly error toast. */
export interface ActionResult {
  ok: boolean;
  error?: string;
}

interface IFundAyitiContextValue {
  applications: Application[];
  periods: ApplicationPeriod[];
  donations: Donation[];
  moveToUnderReview: (id: string) => void;
  approveApplication: (id: string) => void;
  rejectApplication: (id: string, reason: string) => void;
  archiveApplication: (id: string) => void;
  moveToFinalist: (id: string) => ActionResult;
  removeFromFinalist: (id: string) => void;
  selectWinner: (id: string, award: WinnerAward) => ActionResult;
  updateWinnerStory: (id: string, story: string) => void;
  addPeriod: (input: ApplicationPeriodInput) => void;
  updatePeriod: (id: string, input: ApplicationPeriodInput) => void;
  removePeriod: (id: string) => void;
}

const IFundAyitiContext = createContext<IFundAyitiContextValue | undefined>(undefined);

export function IFundAyitiProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [periods, setPeriods] = useState<ApplicationPeriod[]>(INITIAL_PERIODS);
  const [donations] = useState<Donation[]>(INITIAL_DONATIONS);

  /** Patch a single application, always bumping `updatedAt`. */
  const patchApplication = useCallback((id: string, patch: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  const setStatus = useCallback(
    (id: string, status: ApplicationStatus, extra: Partial<Application> = {}) => {
      patchApplication(id, { status, ...extra });
    },
    [patchApplication]
  );

  const moveToUnderReview = useCallback((id: string) => setStatus(id, "underReview"), [setStatus]);

  const approveApplication = useCallback(
    (id: string) => setStatus(id, "approved", { reviewedAt: new Date().toISOString(), rejectionReason: null }),
    [setStatus]
  );

  const rejectApplication = useCallback(
    (id: string, reason: string) =>
      setStatus(id, "rejected", { reviewedAt: new Date().toISOString(), rejectionReason: reason }),
    [setStatus]
  );

  const archiveApplication = useCallback((id: string) => setStatus(id, "archived"), [setStatus]);

  const moveToFinalist = useCallback(
    (id: string): ActionResult => {
      const target = applications.find((a) => a.id === id);
      if (!target) return { ok: false, error: "Application not found." };

      const finalistsInPeriod = applications.filter(
        (a) => a.periodId === target.periodId && a.status === "finalist"
      ).length;

      if (finalistsInPeriod >= MAX_FINALISTS) {
        return { ok: false, error: `Only ${MAX_FINALISTS} finalists are allowed per application period.` };
      }

      setStatus(id, "finalist");
      return { ok: true };
    },
    [applications, setStatus]
  );

  const removeFromFinalist = useCallback((id: string) => setStatus(id, "approved"), [setStatus]);

  const selectWinner = useCallback(
    (id: string, award: WinnerAward): ActionResult => {
      const target = applications.find((a) => a.id === id);
      if (!target) return { ok: false, error: "Application not found." };
      if (target.status !== "finalist") {
        return { ok: false, error: "The winner must be selected from the finalists." };
      }

      const existingWinner = applications.find(
        (a) => a.periodId === target.periodId && a.status === "winner"
      );
      if (existingWinner) {
        return { ok: false, error: "This application period already has a winner." };
      }

      setStatus(id, "winner", {
        award,
        fundedAmount: award.awardAmount,
        reviewedAt: new Date().toISOString(),
      });
      return { ok: true };
    },
    [applications, setStatus]
  );

  const updateWinnerStory = useCallback(
    (id: string, story: string) => patchApplication(id, { successStory: story }),
    [patchApplication]
  );

  const addPeriod = useCallback((input: ApplicationPeriodInput) => {
    setPeriods((prev) => [{ ...input, id: genId("ap") }, ...prev]);
  }, []);

  const updatePeriod = useCallback((id: string, input: ApplicationPeriodInput) => {
    setPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, ...input } : p)));
  }, []);

  const removePeriod = useCallback((id: string) => {
    setPeriods((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      applications,
      periods,
      donations,
      moveToUnderReview,
      approveApplication,
      rejectApplication,
      archiveApplication,
      moveToFinalist,
      removeFromFinalist,
      selectWinner,
      updateWinnerStory,
      addPeriod,
      updatePeriod,
      removePeriod,
    }),
    [
      applications,
      periods,
      donations,
      moveToUnderReview,
      approveApplication,
      rejectApplication,
      archiveApplication,
      moveToFinalist,
      removeFromFinalist,
      selectWinner,
      updateWinnerStory,
      addPeriod,
      updatePeriod,
      removePeriod,
    ]
  );

  return <IFundAyitiContext.Provider value={value}>{children}</IFundAyitiContext.Provider>;
}

export function useIFundAyiti() {
  const ctx = useContext(IFundAyitiContext);
  if (!ctx) throw new Error("useIFundAyiti must be used within IFundAyitiProvider");
  return ctx;
}
