export interface AgencyOpsSummary {
  workspaceCount: number;
  pendingApprovalCount: number;
  overdueApprovalCount: number;
  escalatedApprovalCount: number;
  atRiskPublishCount: number;
  approverCount: number;
}

export type AgencyOpsDueWindow = "ALL" | "TODAY" | "NEXT_24_HOURS" | "NEXT_7_DAYS" | "OVERDUE";
export type AgencyOpsQueueStatusFilter = "ALL" | "PENDING" | "OVERDUE" | "ESCALATED";

export interface AgencyOpsWorkspaceOption {
  workspaceId: string;
  workspaceName: string;
  companyName: string | null;
}

export interface AgencyOpsApproverOption {
  userId: string;
  displayName: string;
  email: string | null;
  workspaceCount: number;
}

export interface AgencyOpsQueueItem {
  collectionId: number;
  workspaceId: string;
  workspaceName: string;
  companyName: string | null;
  description: string;
  postCollectionType: string | null;
  reviewStatus: string | null;
  attentionStatus: "PENDING" | "OVERDUE" | "ESCALATED";
  nextApprovalStage: string | null;
  requiredApprovalSteps: number | null;
  completedApprovalSteps: number | null;
  channelCount: number | null;
  platforms: string[];
  eligibleApproverUserIds: string[];
  scheduledTime: string | null;
  reviewSubmittedAt: string | null;
  nextApprovalReminderAt: string | null;
  approvalEscalatedAt: string | null;
}

export interface AgencyOpsApproverWorkload {
  userId: string;
  displayName: string;
  email: string | null;
  workspaceCount: number;
  pendingApprovalCount: number;
  overdueApprovalCount: number;
  escalatedApprovalCount: number;
  nextDueAt: string | null;
}

export interface AgencyOpsWorkspaceHealth {
  workspaceId: string;
  workspaceName: string;
  companyName: string | null;
  pendingApprovalCount: number;
  overdueApprovalCount: number;
  escalatedApprovalCount: number;
  changesRequestedCount: number;
  atRiskPublishCount: number;
  healthStatus: "STABLE" | "WATCH" | "CRITICAL";
}

export interface AgencyOpsPublishRiskItem {
  collectionId: number;
  workspaceId: string;
  workspaceName: string;
  companyName: string | null;
  description: string;
  postCollectionType: string | null;
  riskType: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  eligibleApproverUserIds: string[];
  scheduledTime: string | null;
  reviewSubmittedAt: string | null;
  approvalEscalatedAt: string | null;
}

export interface AgencyOpsResponse {
  summary: AgencyOpsSummary;
  workspaces: AgencyOpsWorkspaceOption[];
  approvers: AgencyOpsApproverOption[];
  queue: AgencyOpsQueueItem[];
  overdueQueue: AgencyOpsQueueItem[];
  workload: AgencyOpsApproverWorkload[];
  workspaceHealth: AgencyOpsWorkspaceHealth[];
  publishRisk: AgencyOpsPublishRiskItem[];
}

export interface AgencyOpsFilters {
  workspaceId?: string;
  approverUserId?: string;
  status?: AgencyOpsQueueStatusFilter;
  dueWindow?: AgencyOpsDueWindow;
  timezone?: string;
}
