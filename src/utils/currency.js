/**
 * Currency and Weight Formatting Utilities for Sri Jayam Jewellers
 */

export function formatINR(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹ 0';
  const num = Math.round(Number(val));
  return '₹ ' + num.toLocaleString('en-IN');
}

export function formatGrams(val) {
  if (val === undefined || val === null || isNaN(val)) return '0.00 g';
  return Number(val).toFixed(2) + ' g';
}
