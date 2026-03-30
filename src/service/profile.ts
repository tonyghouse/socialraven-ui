import { apiHeaders } from "@/lib/api-headers";
import { ProfileResponse } from "@/model/Profile";

type GetToken = () => Promise<string | null>;

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.socialraven.io";

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      message = data?.message ?? message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function fetchMyProfileApi(getToken: GetToken): Promise<ProfileResponse> {
  const res = await fetch(`${backendUrl}/profile/me`, {
    method: "GET",
    headers: await apiHeaders(getToken),
  });

  return parseResponse<ProfileResponse>(res);
}

export async function updateMyProfileNameApi(
  getToken: GetToken,
  firstName: string,
  lastName: string
): Promise<ProfileResponse> {
  const res = await fetch(`${backendUrl}/profile/me`, {
    method: "PATCH",
    headers: await apiHeaders(getToken),
    body: JSON.stringify({ firstName, lastName }),
  });

  return parseResponse<ProfileResponse>(res);
}

export async function addMyProfileEmailApi(
  getToken: GetToken,
  emailAddress: string
): Promise<ProfileResponse> {
  const res = await fetch(`${backendUrl}/profile/me/emails`, {
    method: "POST",
    headers: await apiHeaders(getToken),
    body: JSON.stringify({ emailAddress }),
  });

  return parseResponse<ProfileResponse>(res);
}

export async function setMyPrimaryEmailApi(
  getToken: GetToken,
  emailAddressId: string
): Promise<ProfileResponse> {
  const res = await fetch(`${backendUrl}/profile/me/emails/${encodeURIComponent(emailAddressId)}/primary`, {
    method: "PATCH",
    headers: await apiHeaders(getToken),
  });

  return parseResponse<ProfileResponse>(res);
}

export async function deleteMyProfileEmailApi(
  getToken: GetToken,
  emailAddressId: string
): Promise<ProfileResponse> {
  const res = await fetch(`${backendUrl}/profile/me/emails/${encodeURIComponent(emailAddressId)}`, {
    method: "DELETE",
    headers: await apiHeaders(getToken),
  });

  return parseResponse<ProfileResponse>(res);
}

export async function uploadMyProfileImageApi(
  getToken: GetToken,
  file: File
): Promise<ProfileResponse> {
  const token = await getToken();
  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${backendUrl}/profile/me/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body,
  });

  return parseResponse<ProfileResponse>(res);
}

export async function deleteMyProfileImageApi(getToken: GetToken): Promise<ProfileResponse> {
  const res = await fetch(`${backendUrl}/profile/me/image`, {
    method: "DELETE",
    headers: await apiHeaders(getToken),
  });

  return parseResponse<ProfileResponse>(res);
}
