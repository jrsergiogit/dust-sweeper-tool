export type BalanceInput = {
  rawBalance?: unknown;
  balance?: unknown;
  decimals?: unknown;
};

export function tokenDecimals(value: unknown): number {
  const n = Number(value ?? 18);
  return Number.isInteger(n) && n >= 0 && n <= 36 ? n : 18;
}

/** Convert a decimal (including scientific notation) without floating-point multiplication. */
export function decimalToUnits(value: unknown, decimals: number): bigint {
  const match = String(value ?? '').trim().match(/^(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
  if (!match) return 0n;
  const exponent = Number(match[3] || 0);
  if (!Number.isInteger(exponent) || Math.abs(exponent) > 100) return 0n;
  const digits = match[1] + (match[2] || '');
  const shift = tokenDecimals(decimals) + exponent - (match[2] || '').length;
  try {
    const n = BigInt(digits);
    return shift >= 0 ? n * 10n ** BigInt(shift) : n / 10n ** BigInt(-shift);
  } catch { return 0n; }
}

export function unitsToDecimal(value: bigint, decimals: number): string {
  const d = tokenDecimals(decimals);
  if (d === 0) return value.toString();
  const digits = value.toString().padStart(d + 1, '0');
  const fraction = digits.slice(-d).replace(/0+$/, '');
  return `${digits.slice(0, -d)}${fraction ? `.${fraction}` : ''}`;
}

/** Keep the existing 0.5% buffer. This is NOT a gas estimate or a minimum value. */
export function recoveryAmounts(token: BalanceInput): { baseUnits: string; human: string } {
  const decimals = tokenDecimals(token.decimals);
  let raw = 0n;
  if (typeof token.rawBalance === 'string' && /^(?:0x[0-9a-f]+|\d+)$/i.test(token.rawBalance)) {
    try { raw = BigInt(token.rawBalance); } catch { raw = 0n; }
  } else {
    raw = decimalToUnits(token.balance, decimals);
  }
  if (raw <= 0n) return { baseUnits: '0', human: '0' };
  const buffered = raw * 995n / 1000n;
  // A single smallest unit is still attempted; never round a positive balance to zero.
  const amount = buffered > 0n ? buffered : raw;
  return { baseUnits: amount.toString(), human: unitsToDecimal(amount, decimals) };
}

export function assetBucket(count: number): string {
  return count <= 0 ? '0' : count === 1 ? '1' : count <= 3 ? '2_to_3' : count <= 10 ? '4_to_10' : '11_plus';
}
export function valueBucket(value: number): string {
  return !(value > 0) ? '0' : value < 1 ? 'lt_1' : value < 5 ? '1_to_5' : value < 20 ? '5_to_20' : value < 100 ? '20_to_100' : '100_plus';
}
export function scanBuckets(tokens: Array<{ priceUsd?: unknown; valueUsd?: unknown }>) {
  const priced = tokens.map(t => Number(t.priceUsd) > 0 ? Number(t.valueUsd) || 0 : 0);
  return {
    asset_bucket: assetBucket(tokens.length),
    value_bucket: valueBucket(priced.reduce((a, b) => a + b, 0)),
    dust_value_bucket: valueBucket(priced.filter(v => v > 0 && v <= 5).reduce((a, b) => a + b, 0)),
  };
}
