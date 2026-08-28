import { useState } from "react";
import { toast } from "sonner";
import {
  useUpdateApplicationStatusMutation,
  useSelectWinnerMutation,
  useDeleteApplicationMutation,
  type APIApplication
} from "@/redux/features/applications/applicationsApi";
import type { AppActionKey } from "./applicationActions";
import type { WinnerAward } from "@/features/core/types";

export function useApplicationWorkflow(onSuccess?: () => void) {
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateApplicationStatusMutation();
  const [setWinner, { isLoading: isSettingWinner }] = useSelectWinnerMutation();
  const [deleteApp, { isLoading: isDeleting }] = useDeleteApplicationMutation();

  const [rejectingApp, setRejectingApp] = useState<APIApplication | null>(null);
  const [winneringApp, setWinneringApp] = useState<APIApplication | null>(null);
  const [storyingApp, setStoryingApp] = useState<APIApplication | null>(null);

  const onAction = async (key: AppActionKey, app: APIApplication) => {
    switch (key) {
      case "underReview":
        try {
          await updateStatus({ id: app._id, body: { status: "underReview" } }).unwrap();
          toast.success("Moved to Under Review", { description: `${app.personal.name}'s application is now under review.` });
          onSuccess?.();
        } catch (err: any) {
          toast.error("Failed to update status", { description: err.data?.message || "An error occurred" });
        }
        break;
      case "approve":
        try {
          await updateStatus({ id: app._id, body: { status: "approved" } }).unwrap();
          toast.success("Application approved", {
            description: `${app.personal.name} is now approved.`,
          });
          onSuccess?.();
        } catch (err: any) {
          toast.error("Failed to approve", { description: err.data?.message || "An error occurred" });
        }
        break;
      case "reject":
        setRejectingApp(app);
        break;
      case "finalist":
        try {
          await updateStatus({ id: app._id, body: { status: "finalist" } }).unwrap();
          toast.success("Added to finalists", { description: `${app.personal.name} is now a finalist.` });
          onSuccess?.();
        } catch (err: any) {
          toast.error("Failed to add finalist", { description: err.data?.message || "An error occurred" });
        }
        break;
      case "removeFinalist":
        try {
          await updateStatus({ id: app._id, body: { status: "approved" } }).unwrap();
          toast.message("Removed from finalists", { description: `${app.personal.name} is back to Approved.` });
          onSuccess?.();
        } catch (err: any) {
          toast.error("Failed to remove finalist", { description: err.data?.message || "An error occurred" });
        }
        break;
      case "selectWinner":
        setWinneringApp(app);
        break;
      case "editStory":
        setStoryingApp(app);
        break;
      case "archive":
        try {
          await updateStatus({ id: app._id, body: { status: "archived" } }).unwrap();
          toast.message("Application archived", { description: `${app.personal.name}'s application is now read-only.` });
          onSuccess?.();
        } catch (err: any) {
          toast.error("Failed to archive", { description: err.data?.message || "An error occurred" });
        }
        break;
    }
  };

  const confirmReject = async (reason: string) => {
    if (!rejectingApp) return;
    try {
      await updateStatus({ id: rejectingApp._id, body: { status: "rejected", rejectionReason: reason } }).unwrap();
      toast.success("Application rejected", { description: `${rejectingApp.personal.name} has been notified.` });
      setRejectingApp(null);
      onSuccess?.();
    } catch (err: any) {
      toast.error("Failed to reject application", { description: err.data?.message || "An error occurred" });
    }
  };

  const confirmWinner = async (award: { awardedAmount: number; successStory: string; quote?: string }) => {
    if (!winneringApp) return;
    try {
      await setWinner({
        id: winneringApp._id,
        body: {
          status: "winner",
          successStory: award.successStory,
          quote: award.quote,
          awardedAmount: award.awardedAmount,
        },
      }).unwrap();
      toast.success("Winner selected 🎉", {
        description: `${winneringApp.personal.name} is now the winner.`,
      });
      setWinneringApp(null);
      onSuccess?.();
    } catch (err: any) {
      toast.error("Failed to select winner", { description: err.data?.message || "An error occurred" });
    }
  };

  const confirmStory = async (story: string) => {
    if (!storyingApp) return;
    try {
      await setWinner({
        id: storyingApp._id,
        body: {
          status: "winner",
          successStory: story,
          awardedAmount: storyingApp.awardedAmount || storyingApp.grant.requestedAmount,
        },
      }).unwrap();
      toast.success("Winner story saved");
      setStoryingApp(null);
      onSuccess?.();
    } catch (err: any) {
      toast.error("Failed to save story", { description: err.data?.message || "An error occurred" });
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteApp(id).unwrap();
      toast.success("Application deleted successfully");
      onSuccess?.();
    } catch (err: any) {
      toast.error("Failed to delete application", { description: err.data?.message || "An error occurred" });
    }
  };

  return {
    onAction,
    rejecting: rejectingApp,
    closeRejecting: () => setRejectingApp(null),
    confirmReject,
    winnering: winneringApp,
    closeWinnering: () => setWinneringApp(null),
    confirmWinner,
    storying: storyingApp,
    closeStorying: () => setStoryingApp(null),
    confirmStory,
    confirmDelete,
    isDeleting,
    isUpdatingStatus,
    isSettingWinner,
  };
}
