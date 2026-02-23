import { AccountGroup } from "@/model/AccountGroup";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

// ---------------------------------------------------------------------------
// Fetch all groups
// ---------------------------------------------------------------------------

export async function fetchAccountGroupsApi(
  getToken: GetToken
): Promise<AccountGroup[]> {
  const token = await getToken();
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

// ---------------------------------------------------------------------------
// Create group
// ---------------------------------------------------------------------------

export async function createAccountGroupApi(
  getToken: GetToken,
  name: string,
  color: string
): Promise<AccountGroup> {
  const token = await getToken();
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

// ---------------------------------------------------------------------------
// Update group (rename / recolor)
// ---------------------------------------------------------------------------

export async function updateAccountGroupApi(
  getToken: GetToken,
  id: string,
  name: string,
  color: string
): Promise<AccountGroup> {
  const token = await getToken();
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

// ---------------------------------------------------------------------------
// Delete group
// ---------------------------------------------------------------------------

export async function deleteAccountGroupApi(
  getToken: GetToken,
  id: string
): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${BACKEND}/account-groups/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Backend error: ${res.status} - ${body}`);
}

// ---------------------------------------------------------------------------
// Add account to group
// ---------------------------------------------------------------------------

export async function addAccountToGroupApi(
  getToken: GetToken,
  groupId: string,
  providerUserId: string
): Promise<void> {
  const token = await getToken();
  const res = await fetch(
    `${BACKEND}/account-groups/${groupId}/accounts/${encodeURIComponent(providerUserId)}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const body = await res.text();
  if (!res.ok) throw new Error(`Backend error: ${res.status} - ${body}`);
}

// ---------------------------------------------------------------------------
// Remove account from group
// ---------------------------------------------------------------------------

export async function removeAccountFromGroupApi(
  getToken: GetToken,
  groupId: string,
  providerUserId: string
): Promise<void> {
  const token = await getToken();
  const res = await fetch(
    `${BACKEND}/account-groups/${groupId}/accounts/${encodeURIComponent(providerUserId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const body = await res.text();
  if (!res.ok) throw new Error(`Backend error: ${res.status} - ${body}`);
}
