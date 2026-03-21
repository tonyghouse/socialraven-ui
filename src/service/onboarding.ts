import {
  CompleteOnboardingRequest,
  OnboardingStatus,
} from "@/model/Onboarding";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

async function authHeaders(getToken: GetToken): Promise<HeadersInit> {
  const token = await getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getOnboardingStatusApi(
  getToken: GetToken
): Promise<OnboardingStatus> {
  const res = await fetch(`${BACKEND}/onboarding/status`, {
    headers: await authHeaders(getToken),
  });
  if (!res.ok) throw new Error(`getOnboardingStatus failed: ${res.status}`);
  return res.json();
}

export async function completeOnboardingApi(
  getToken: GetToken,
  request: CompleteOnboardingRequest
): Promise<OnboardingStatus> {
  const res = await fetch(`${BACKEND}/onboarding/complete`, {
    method: "POST",
    headers: await authHeaders(getToken),
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `completeOnboarding failed: ${res.status}`);
  }
  return res.json();
}

export async function upgradeToAgencyApi(
  getToken: GetToken
): Promise<OnboardingStatus> {
  const res = await fetch(`${BACKEND}/onboarding/upgrade-to-agency`, {
    method: "POST",
    headers: await authHeaders(getToken),
  });
  if (!res.ok) throw new Error(`upgradeToAgency failed: ${res.status}`);
  return res.json();
}
