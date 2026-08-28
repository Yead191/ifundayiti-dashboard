import type { useApplicationWorkflow } from "../useApplicationWorkflow";
import { ApplicationDetailDrawer } from "./ApplicationDetailDrawer";
import { RejectReasonModal } from "./RejectReasonModal";
import { SelectWinnerModal } from "./SelectWinnerModal";
import { WinnerStoryModal } from "./WinnerStoryModal";

type Workflow = ReturnType<typeof useApplicationWorkflow>;

/** Renders the drawer + reject / winner / story modals for a workflow instance. */
export function ApplicationWorkflowModals({ wf }: { wf: Workflow }) {
  return (
    <>
      <ApplicationDetailDrawer
        application={wf.viewing}
        period={wf.viewingPeriod}
        open={!!wf.viewing}
        onClose={wf.closeViewing}
        onAction={wf.onAction}
      />
      <RejectReasonModal
        open={!!wf.rejecting}
        applicantName={wf.rejecting?.personal.name}
        onCancel={wf.closeRejecting}
        onConfirm={wf.confirmReject}
      />
      <SelectWinnerModal
        application={wf.winnering}
        maxAmount={wf.winnerMaxAmount}
        open={!!wf.winnering}
        onCancel={wf.closeWinnering}
        onConfirm={wf.confirmWinner}
      />
      <WinnerStoryModal
        application={wf.storying}
        open={!!wf.storying}
        onCancel={wf.closeStorying}
        onConfirm={wf.confirmStory}
      />
    </>
  );
}
