export type UserType = "INFLUENCER" | "AGENCY";

export interface OnboardingStatus {
  completed: boolean;
  userType: UserType | null;
  workspaceId: string | null;
  canCreateWorkspaces: boolean;
}

export interface CompleteOnboardingRequest {
  userType: UserType;
  workspaceNames?: string[];
  companyName?: string;
}
