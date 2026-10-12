export type AssetFilters = { price: 'all' | 'priced' | 'unpriced'; search: string; network: string };

/** Sorting is by observed USD value, not a safety or recoverability ranking. */
export function visibleAssets<T extends { priceUsd?: unknown; valueUsd?: unknown }>(
  assets: T[], filters: AssetFilters,
  networkName: (asset: T) => string,
  display: (asset: T) => { name: string; symbol: string },
): T[] {
  const query = filters.search.trim().toLowerCase();
  return assets.map((asset, index) => ({ asset, index })).filter(({ asset }) => {
    const priced = Number(asset.priceUsd) > 0;
    if (filters.price === 'priced' && !priced) return false;
    if (filters.price === 'unpriced' && priced) return false;
    if (filters.network !== 'all' && networkName(asset) !== filters.network) return false;
    const label = display(asset);
    return !query || `${label.name} ${label.symbol}`.toLowerCase().includes(query);
  }).sort((a, b) => {
    const aValue = Number(a.asset.valueUsd), bValue = Number(b.asset.valueUsd);
    const av = Number.isFinite(aValue) ? aValue : 0, bv = Number.isFinite(bValue) ? bValue : 0;
    return bv - av || a.index - b.index;
  }).map(({ asset }) => asset);
}

export function displayAssetAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0';
  if (value < 0.000001) return '<0.000001';
  return value.toLocaleString('en-US', { maximumFractionDigits: 6 });
}
