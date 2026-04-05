import type { PostCollectionResponse } from "@/model/PostCollectionResponse";

const APPROVAL_LOCK_CONFIRMATION_MESSAGE =
  "Saving material edits will remove this collection from the publishing queue and send it back into review. Continue?";

const REAPPROVAL_SUCCESS_MESSAGE =
  "Material changes saved. The collection is back in review.";

export function confirmApprovalLockIfNeeded(approvalLocked: boolean) {
  return !approvalLocked || window.confirm(APPROVAL_LOCK_CONFIRMATION_MESSAGE);
}

export function approvalUpdateSuccessMessage(
  updated: Pick<PostCollectionResponse, "overallStatus">,
  fallbackMessage: string
) {
  return updated.overallStatus === "IN_REVIEW"
    ? REAPPROVAL_SUCCESS_MESSAGE
    : fallbackMessage;
}
