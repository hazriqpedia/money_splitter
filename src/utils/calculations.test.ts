import { describe, it, expect } from 'vitest';
import { calculateReceiptTotals, calculateGrandTotals } from './calculations';
import type { Friend, Receipt } from '../types';

const friends: Friend[] = [
  { id: 'a', name: 'Alice' },
  { id: 'b', name: 'Bob' },
];

const receipt = (overrides: Partial<Receipt> = {}): Receipt => ({
  id: 'r1',
  name: 'Test',
  expectedTotal: 0,
  taxPercentage: 0,
  items: [],
  ...overrides,
});

describe('calculateReceiptTotals', () => {
  it('returns zero totals when there are no items', () => {
    const { totals, taxAmounts } = calculateReceiptTotals(receipt(), friends);
    expect(totals).toEqual({ a: 0, b: 0 });
    expect(taxAmounts).toEqual({ a: 0, b: 0 });
  });

  it('sums item splits per friend', () => {
    const { totals } = calculateReceiptTotals(receipt({
      items: [
        { id: 'i1', name: 'Pizza', splits: { a: 10, b: 20 } },
        { id: 'i2', name: 'Drinks', splits: { a: 5, b: 5 } },
      ],
    }), friends);
    expect(totals.a).toBeCloseTo(15);
    expect(totals.b).toBeCloseTo(25);
  });

  it('treats missing splits as zero', () => {
    const { totals } = calculateReceiptTotals(receipt({
      items: [{ id: 'i1', name: 'Solo', splits: { a: 30 } }],
    }), friends);
    expect(totals.a).toBeCloseTo(30);
    expect(totals.b).toBeCloseTo(0);
  });

  it('applies tax percentage to each person\'s subtotal', () => {
    const { totals, taxAmounts } = calculateReceiptTotals(receipt({
      taxPercentage: 10,
      items: [{ id: 'i1', name: 'Food', splits: { a: 100, b: 50 } }],
    }), friends);
    expect(taxAmounts.a).toBeCloseTo(10);
    expect(taxAmounts.b).toBeCloseTo(5);
    expect(totals.a).toBeCloseTo(110);
    expect(totals.b).toBeCloseTo(55);
  });

  it('zero tax produces zero tax amounts', () => {
    const { taxAmounts } = calculateReceiptTotals(receipt({
      taxPercentage: 0,
      items: [{ id: 'i1', name: 'Food', splits: { a: 40, b: 40 } }],
    }), friends);
    expect(taxAmounts.a).toBe(0);
    expect(taxAmounts.b).toBe(0);
  });

  it('handles a single friend', () => {
    const solo: Friend[] = [{ id: 'a', name: 'Alice' }];
    const { totals } = calculateReceiptTotals(receipt({
      items: [{ id: 'i1', name: 'Lunch', splits: { a: 25 } }],
    }), solo);
    expect(totals.a).toBeCloseTo(25);
  });
});

describe('calculateGrandTotals', () => {
  it('returns zeros when there are no receipts', () => {
    const totals = calculateGrandTotals([], friends);
    expect(totals).toEqual({ a: 0, b: 0 });
  });

  it('sums totals across multiple receipts', () => {
    const receipts: Receipt[] = [
      receipt({ id: 'r1', taxPercentage: 0, items: [{ id: 'i1', name: 'Dinner', splits: { a: 10, b: 5 } }] }),
      receipt({ id: 'r2', taxPercentage: 0, items: [{ id: 'i2', name: 'Dessert', splits: { a: 3, b: 7 } }] }),
    ];
    const totals = calculateGrandTotals(receipts, friends);
    expect(totals.a).toBeCloseTo(13);
    expect(totals.b).toBeCloseTo(12);
  });

  it('includes tax from each receipt in the grand total', () => {
    const receipts: Receipt[] = [
      receipt({ id: 'r1', taxPercentage: 10, items: [{ id: 'i1', name: 'Food', splits: { a: 100 } }] }),
    ];
    const totals = calculateGrandTotals(receipts, friends);
    expect(totals.a).toBeCloseTo(110);
  });

  it('does not include a friend who has no splits anywhere', () => {
    const receipts: Receipt[] = [
      receipt({ id: 'r1', items: [{ id: 'i1', name: 'Solo', splits: { a: 50 } }] }),
    ];
    const totals = calculateGrandTotals(receipts, friends);
    expect(totals.b).toBe(0);
  });
});
