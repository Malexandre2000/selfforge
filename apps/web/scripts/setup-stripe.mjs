// One-off (idempotent) setup script: creates the SelfForge Premium product
// and its monthly/annual prices in Stripe. Safe to re-run — it looks up an
// existing product by name before creating a new one. Run again against a
// live-mode secret key when setting up production billing.
//
// Usage: node scripts/setup-stripe.mjs  (run from apps/web, with .env.local loaded)
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error("STRIPE_SECRET_KEY is not set");
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const PRODUCT_NAME = "SelfForge Premium";
const MONTHLY_AMOUNT = 2400; // $24.00
const ANNUAL_AMOUNT = 19900; // $199.00

async function findOrCreateProduct() {
  const existing = await stripe.products.search({
    query: `name:"${PRODUCT_NAME}" AND active:"true"`,
  });
  if (existing.data[0]) return existing.data[0];

  return stripe.products.create({
    name: PRODUCT_NAME,
    description:
      "Full access to your AI coach, personalized daily missions, habit tracking, and progress tracking.",
  });
}

async function findOrCreatePrice(productId, { interval, unitAmount, nickname }) {
  const existing = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  const match = existing.data.find(
    (p) => p.recurring?.interval === interval && p.unit_amount === unitAmount,
  );
  if (match) return match;

  return stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: unitAmount,
    recurring: { interval },
    nickname,
  });
}

const product = await findOrCreateProduct();
const monthly = await findOrCreatePrice(product.id, {
  interval: "month",
  unitAmount: MONTHLY_AMOUNT,
  nickname: "Monthly",
});
const annual = await findOrCreatePrice(product.id, {
  interval: "year",
  unitAmount: ANNUAL_AMOUNT,
  nickname: "Annual",
});

console.log("Product:", product.id);
console.log("STRIPE_PRICE_MONTHLY=" + monthly.id);
console.log("STRIPE_PRICE_ANNUAL=" + annual.id);
