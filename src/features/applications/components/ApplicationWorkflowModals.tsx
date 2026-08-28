import type { useApplicationWorkflow } from "../useApplicationWorkflow";
import { RejectReasonModal } from "./RejectReasonModal";
import { SelectWinnerModal } from "./SelectWinnerModal";
import { WinnerStoryModal } from "./WinnerStoryModal";
import type { Application } from "@/features/core/types";

type Workflow = ReturnType<typeof useApplicationWorkflow>;

/** Renders the reject / winner / story modals for a workflow instance. */
export function ApplicationWorkflowModals({ wf }: { wf: Workflow }) {
  return (
    <>
      <RejectReasonModal
        open={!!wf.rejecting}
        applicantName={wf.rejecting?.personal?.name}
        onCancel={wf.closeRejecting}
        onConfirm={wf.confirmReject}
      />
      <SelectWinnerModal
        // Cast or map if types mismatch slightly
        application={wf.winnering}
        maxAmount={1000} // Canonical max amount
        open={!!wf.winnering}
        onCancel={wf.closeWinnering}
        onConfirm={wf.confirmWinner}
      />
      <WinnerStoryModal
        application={wf.storying as unknown as Application}
        open={!!wf.storying}
        onCancel={wf.closeStorying}
        onConfirm={wf.confirmStory}
      />
    </>
  );
}
