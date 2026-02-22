/**
 * Account Groups Service
 *
 * All functions below are MOCKED pending backend implementation.
 * Each function documents the backend endpoint it will call so wiring up
 * the real backend is a straightforward find-and-replace on the mock bodies.
 *
 * Integration checklist:
 *  1. Implement backend endpoints listed below (Spring Boot controller)
 *  2. Flip GROUPS_LIVE = true
 *  3. Replace mock bodies with real fetch() calls
 */

import { AccountGroup } from "@/model/AccountGroup";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const GROUPS_LIVE = false; // Flip to true once /account-groups endpoints are live

// ---------------------------------------------------------------------------
// Fetch all groups
// ---------------------------------------------------------------------------

/**
 * GET /account-groups
 * Backend: returns all account groups for the authenticated user
 */
export async function fetchAccountGroupsApi(
  _getToken: GetToken
): Promise<AccountGroup[]> {
  if (GROUPS_LIVE) {
    const token = await _getToken();
    const res = await fetch(`${BACKEND}/account-groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`Backend error: ${res.status} - ${body}`);
    return JSON.parse(body) as AccountGroup[];
  }

  await new Promise((r) => setTimeout(r, 400));
  return [
    {
      id: "group-1",
      name: "Brand Accounts",
      color: "#6366f1",
      accountIds: [],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "group-2",
      name: "Personal",
      color: "#22c55e",
      accountIds: [],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// ---------------------------------------------------------------------------
// Create group
// ---------------------------------------------------------------------------

/**
 * POST /account-groups
 * Body: { name: string, color: string }
 * Backend: creates a new account group for the authenticated user
 */
export async function createAccountGroupApi(
  _getToken: GetToken,
  name: string,
  color: string
): Promise<AccountGroup> {
  if (GROUPS_LIVE) {
    const token = await _getToken();
    const res = await fetch(`${BACKEND}/account-groups`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name, color }),
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`Backend error: ${res.status} - ${body}`);
    return JSON.parse(body) as AccountGroup;
  }

  await new Promise((r) => setTimeout(r, 400));
  return {
    id: `group-${Date.now()}`,
    name,
    color,
    accountIds: [],
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Update group (rename / recolor)
// ---------------------------------------------------------------------------

/**
 * PUT /account-groups/{id}
 * Body: { name: string, color: string }
 * Backend: updates the name and/or color of an existing group
 */
export async function updateAccountGroupApi(
  _getToken: GetToken,
  id: string,
  name: string,
  color: string
): Promise<AccountGroup> {
  if (GROUPS_LIVE) {
    const token = await _getToken();
    const res = await fetch(`${BACKEND}/account-groups/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name, color }),
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`Backend error: ${res.status} - ${body}`);
    return JSON.parse(body) as AccountGroup;
  }

  await new Promise((r) => setTimeout(r, 300));
  return { id, name, color, accountIds: [], createdAt: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// Delete group
// ---------------------------------------------------------------------------

/**
 * DELETE /account-groups/{id}
 * Backend: deletes the group; member accounts become ungrouped
 */
export async function deleteAccountGroupApi(
  _getToken: GetToken,
  id: string
): Promise<void> {
  if (GROUPS_LIVE) {
    const token = await _getToken();
    const res = await fetch(`${BACKEND}/account-groups/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`Backend error: ${res.status} - ${body}`);
    return;
  }

  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// Add account to group
// ---------------------------------------------------------------------------

/**
 * PUT /account-groups/{groupId}/accounts/{providerUserId}
 * Backend: assigns the account to the group; removes it from any previous group
 */
export async function addAccountToGroupApi(
  _getToken: GetToken,
  groupId: string,
  providerUserId: string
): Promise<void> {
  if (GROUPS_LIVE) {
    const token = await _getToken();
    const res = await fetch(
      `${BACKEND}/account-groups/${groupId}/accounts/${providerUserId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const body = await res.text();
    if (!res.ok) throw new Error(`Backend error: ${res.status} - ${body}`);
    return;
  }

  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// Remove account from group
// ---------------------------------------------------------------------------

/**
 * DELETE /account-groups/{groupId}/accounts/{providerUserId}
 * Backend: removes the account from the group; account becomes ungrouped
 */
export async function removeAccountFromGroupApi(
  _getToken: GetToken,
  groupId: string,
  providerUserId: string
): Promise<void> {
  if (GROUPS_LIVE) {
    const token = await _getToken();
    const res = await fetch(
      `${BACKEND}/account-groups/${groupId}/accounts/${providerUserId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const body = await res.text();
    if (!res.ok) throw new Error(`Backend error: ${res.status} - ${body}`);
    return;
  }

  await new Promise((r) => setTimeout(r, 300));
}
