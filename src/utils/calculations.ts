import type { Friend, Receipt } from '../types';

export function calculateReceiptTotals(
  receipt: Receipt,
  friends: Friend[]
): { totals: Record<string, number>; taxAmounts: Record<string, number> } {
  const totals: Record<string, number> = {};
  friends.forEach(f => (totals[f.id] = 0));

  receipt.items.forEach(item => {
    friends.forEach(f => { totals[f.id] += item.splits[f.id] || 0; });
  });

  const taxAmounts: Record<string, number> = {};
  friends.forEach(f => {
    taxAmounts[f.id] = totals[f.id] * (receipt.taxPercentage / 100);
    totals[f.id] += taxAmounts[f.id];
  });

  return { totals, taxAmounts };
}

export function calculateGrandTotals(
  receipts: Receipt[],
  friends: Friend[]
): Record<string, number> {
  const grandTotals: Record<string, number> = {};
  friends.forEach(f => (grandTotals[f.id] = 0));

  receipts.forEach(r => {
    const { totals } = calculateReceiptTotals(r, friends);
    friends.forEach(f => (grandTotals[f.id] += totals[f.id]));
  });

  return grandTotals;
}

// Sum of all splits across all friends + tax — used to validate against the printed receipt total.
export function calculateReceiptCalculatedTotal(receipt: Receipt): number {
  let subtotal = 0;
  receipt.items.forEach(item => {
    Object.values(item.splits).forEach(amt => { subtotal += amt; });
  });
  return subtotal + subtotal * (receipt.taxPercentage / 100);
}
