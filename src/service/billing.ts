/**
 * Paddle Billing Service
 *
 * All functions below are MOCKED pending Paddle account setup.
 * Each function documents the backend endpoint it will call and the
 * corresponding Paddle billing operation, so wiring up the real backend
 * is a straightforward find-and-replace on the mock bodies.
 *
 * Integration checklist:
 *  1. Configure the Paddle vendor account and checkout products
 *  2. Create products + prices in the Paddle dashboard for each plan
 *  3. Update paddlePriceId values in src/constants/plans.ts
 *  4. Implement backend endpoints listed below using the Paddle billing API
 *  5. Replace each mock body with the real fetch() call
 */

import { Invoice, PlanType, UpcomingInvoice, UserPlan } from "@/model/Plan";

type GetToken = () => Promise<string | null>;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const PADDLE_LIVE = false; // Flip to true once Paddle is configured

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

/**
 * POST /billing/checkout
 * Backend: create a hosted Paddle checkout for the selected subscription plan.
 *
 * Redirects the user to a hosted Paddle Checkout page to start a paid plan.
 */
export async function createCheckoutSessionApi(
  _getToken: GetToken,
  _planType: PlanType,
  _successUrl: string,
  _cancelUrl: string
): Promise<{ url: string }> {
  if (PADDLE_LIVE) {
    const token = await _getToken();
    const res = await fetch(`${BACKEND}/billing/checkout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planType: _planType,
        successUrl: _successUrl,
        cancelUrl: _cancelUrl,
      }),
    });
    if (!res.ok) throw new Error(`Checkout failed: ${res.statusText}`);
    return res.json();
  }

  await new Promise((r) => setTimeout(r, 800));
  return { url: "#paddle-checkout-pending" };
}

// ---------------------------------------------------------------------------
// Billing Portal
// ---------------------------------------------------------------------------

/**
 * POST /billing/portal
 * Backend: create a Paddle billing management session for the current customer.
 *
 * Opens the Paddle billing portal where users can update payment methods,
 * download invoices, and cancel their subscription.
 */
export async function createBillingPortalSessionApi(
  _getToken: GetToken,
  _returnUrl: string
): Promise<{ url: string }> {
  if (PADDLE_LIVE) {
    const token = await _getToken();
    const res = await fetch(`${BACKEND}/billing/portal`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ returnUrl: _returnUrl }),
    });
    if (!res.ok) throw new Error(`Portal failed: ${res.statusText}`);
    return res.json();
  }

  await new Promise((r) => setTimeout(r, 600));
  return { url: "#paddle-portal-pending" };
}

// ---------------------------------------------------------------------------
// Cancel Subscription
// ---------------------------------------------------------------------------

/**
 * DELETE /billing/subscription
 * Backend: mark the Paddle subscription to cancel at the end of the billing period.
 *
 * Marks the subscription to cancel at the end of the current billing period.
 * The user retains access until then.
 */
export async function cancelSubscriptionApi(_getToken: GetToken): Promise<UserPlan> {
  if (PADDLE_LIVE) {
    const token = await _getToken();
    const res = await fetch(`${BACKEND}/billing/subscription`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Cancel failed: ${res.statusText}`);
    return res.json();
  }

  await new Promise((r) => setTimeout(r, 800));
  return {
    currentPlan: "AGENCY_PRO",
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    renewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
    cancelAtPeriodEnd: true,
  };
}

// ---------------------------------------------------------------------------
// Upcoming Invoice
// ---------------------------------------------------------------------------

/**
 * GET /billing/invoice/upcoming
 * Backend: fetch the upcoming Paddle invoice/renewal charge for the current subscription.
 *
 * Returns the next scheduled charge for the current subscription.
 * Returns null for free-plan users.
 */
export async function fetchUpcomingInvoiceApi(
  _getToken: GetToken
): Promise<UpcomingInvoice | null> {
  if (PADDLE_LIVE) {
    const token = await _getToken();
    const res = await fetch(`${BACKEND}/billing/invoice/upcoming`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Upcoming invoice failed: ${res.statusText}`);
    return res.json();
  }

  await new Promise((r) => setTimeout(r, 400));
  // Mock: no upcoming invoice (free plan)
  // To preview the paid UI, change the return below to the commented object.
  return null;
  // return {
  //   amount: 1900,
  //   currency: "usd",
  //   dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  //   description: "Pro Plan — Monthly",
  // };
}

// ---------------------------------------------------------------------------
// Invoice History
// ---------------------------------------------------------------------------

/**
 * GET /billing/invoices
 * Backend: fetch recent Paddle invoices for the current customer.
 *
 * Returns the last 12 invoices for the current user.
 */
export async function fetchInvoicesApi(_getToken: GetToken): Promise<Invoice[]> {
  if (PADDLE_LIVE) {
    const token = await _getToken();
    const res = await fetch(`${BACKEND}/billing/invoices`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Invoices failed: ${res.statusText}`);
    return res.json();
  }

  await new Promise((r) => setTimeout(r, 500));
  // Mock: no invoices for free plan user
  // To preview the paid UI, uncomment the array below.
  return [];
  // return [
  //   {
  //     id: "inv_mock_001",
  //     amount: 1900,
  //     currency: "usd",
  //     status: "paid",
  //     date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  //     invoiceUrl: "https://billing.example.com/i/inv_mock_001",
  //     description: "Pro Plan — Feb 2026",
  //   },
  //   {
  //     id: "inv_mock_002",
  //     amount: 1900,
  //     currency: "usd",
  //     status: "paid",
  //     date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  //     invoiceUrl: "https://billing.example.com/i/inv_mock_002",
  //     description: "Pro Plan — Jan 2026",
  //   },
  // ];
}
