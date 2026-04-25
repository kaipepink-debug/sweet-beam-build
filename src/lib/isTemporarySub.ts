/**
 * Determines if a subscription is a temporary 30-minute access.
 * Identified by paymentMethod = "Temporário" or planName containing "Temporário".
 */
export function isTemporarySubscription(sub: any): boolean {
  if (!sub) return false;
  const pm = (sub.paymentMethod || sub.meio_pagamento || "").toString().toLowerCase();
  const plan = (sub.planName || sub.plano || "").toString().toLowerCase();
  return pm.includes("temporár") || plan.includes("temporár");
}

export function getSubscriptionFromStorage(): any | null {
  try {
    const raw = localStorage.getItem("naut_subscription");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getActiveSubscription(subData: any): any | null {
  if (!subData?.subscriptions?.length) return null;
  return subData.subscriptions.find((s: any) => s.isActive) || subData.subscriptions[0];
}
