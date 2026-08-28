import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useIFundAyiti } from "./IFundAyitiContext";
import { MAX_GRANT_AMOUNT, type Application, type WinnerAward } from "./types";
import type { AppActionKey } from "./applicationActions";

/**
 * Centralizes the full application lifecycle: opening the detail drawer,
 * running guarded status transitions, and coordinating the reject / winner /
 * story modals with success + error toasts. Shared by any page that lets an
 * admin act on an application.
 */
export function useApplicationWorkflow() {
  const {
    applications,
    periods,
    moveToUnderReview,
    approveApplication,
    rejectApplication,
    archiveApplication,
    moveToFinalist,
    removeFromFinalist,
    selectWinner,
    updateWinnerStory,
  } = useIFundAyiti();

  const [viewingId, setViewingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [winneringId, setWinneringId] = useState<string | null>(null);
  const [storyingId, setStoryingId] = useState<string | null>(null);

  const byId = (id: string | null) => (id ? applications.find((a) => a.id === id) ?? null : null);

  const viewing = byId(viewingId);
  const rejecting = byId(rejectingId);
  const winnering = byId(winneringId);
  const storying = byId(storyingId);

  const periodFor = (app: Application | null) =>
    app ? periods.find((p) => p.id === app.periodId) : undefined;

  const onAction = (key: AppActionKey, app: Application) => {
    switch (key) {
      case "view":
        setViewingId(app.id);
        break;
      case "underReview":
        moveToUnderReview(app.id);
        toast.success("Moved to Under Review", { description: `${app.personal.name}'s application is now under review.` });
        break;
      case "approve":
        approveApplication(app.id);
        toast.success("Application approved", {
          description: `${app.personal.name} is now publicly visible as an approved applicant.`,
        });
        break;
      case "reject":
        setRejectingId(app.id);
        break;
      case "finalist": {
        const result = moveToFinalist(app.id);
        if (result.ok) {
          toast.success("Added to finalists", { description: `${app.personal.name} is now a Top 5 finalist.` });
        } else {
          toast.error("Couldn't add finalist", { description: result.error });
        }
        break;
      }
      case "removeFinalist":
        removeFromFinalist(app.id);
        toast.message("Removed from finalists", { description: `${app.personal.name} is back to Approved.` });
        break;
      case "selectWinner":
        setWinneringId(app.id);
        break;
      case "editStory":
        setStoryingId(app.id);
        break;
      case "archive":
        archiveApplication(app.id);
        toast.message("Application archived", { description: `${app.personal.name}'s application is now read-only.` });
        break;
    }
  };

  const confirmReject = (reason: string) => {
    if (!rejecting) return;
    rejectApplication(rejecting.id, reason);
    toast.message("Application rejected", { description: `${rejecting.personal.name} has been notified.` });
    setRejectingId(null);
  };

  const confirmWinner = (award: WinnerAward) => {
    if (!winnering) return;
    const result = selectWinner(winnering.id, award);
    if (result.ok) {
      toast.success("Winner selected 🎉", {
        description: `${winnering.personal.name} is now the winner and appears on the public Winners page.`,
      });
      setWinneringId(null);
    } else {
      toast.error("Couldn't select winner", { description: result.error });
    }
  };

  const confirmStory = (story: string) => {
    if (!storying) return;
    updateWinnerStory(storying.id, story);
    toast.success("Winner story saved");
    setStoryingId(null);
  };

  const winnerMaxAmount = useMemo(
    () => periodFor(winnering)?.maximumGrantAmount ?? MAX_GRANT_AMOUNT,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [winnering, periods]
  );

  return {
    onAction,
    viewing,
    closeViewing: () => setViewingId(null),
    viewingPeriod: periodFor(viewing),
    rejecting,
    closeRejecting: () => setRejectingId(null),
    confirmReject,
    winnering,
    winnerMaxAmount,
    closeWinnering: () => setWinneringId(null),
    confirmWinner,
    storying,
    closeStorying: () => setStoryingId(null),
    confirmStory,
  };
}
