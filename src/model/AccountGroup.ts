export interface AccountGroup {
  id: string;
  name: string;
  color: string; // hex color, auto-assigned from palette
  accountIds: string[]; // providerUserIds of accounts in this group
  createdAt: string; // ISO datetime
}
