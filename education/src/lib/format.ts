/**
 * Deterministic number and money formatter for Next.js SSR/CSR hydration safety.
 * Always formats with standard non-breaking spaces, avoiding locale discrepancies between Node.js server and browser.
 */
export function formatMoney(amount: number | string): string {
  const n = Math.round(Number(amount) || 0);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatNumber(num: number | string): string {
  return formatMoney(num);
}
