import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  annual: process.env.STRIPE_PRICE_ANNUAL!,
} as const;

export type Plan = keyof typeof PRICE_IDS;

export function planFromPriceId(priceId: string | undefined): Plan | null {
  if (priceId === PRICE_IDS.monthly) return "monthly";
  if (priceId === PRICE_IDS.annual) return "annual";
  return null;
}
