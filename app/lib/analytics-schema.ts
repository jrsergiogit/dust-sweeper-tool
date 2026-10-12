export const ALLOWED_EVENTS = new Set([
  'page_view', 'finder_opened', 'wallet_opened', 'bridge_opened', 'swap_opened', 'scam_scan_opened',
  'wallet_scan_started', 'wallet_scan_completed', 'wallet_scan_failed', 'wallet_assets_found',
  'recovery_asset_selected', 'recovery_quote_available', 'recovery_quote_failed',
  'recovery_route_available', 'recovery_route_failed', 'recovery_route_selected',
  'recovery_execution_started', 'recovery_execution_failed', 'recovery_cancelled', 'recovery_completed',
  'portfolio_scan_started', 'portfolio_scan_completed', 'portfolio_scan_failed',
  'scam_scan_started', 'scam_scan_completed', 'scam_scan_failed',
  'bridge_route_failed', 'swap_route_failed', 'safety_trade_route_failed',
  'bridge_route_available', 'bridge_route_selected', 'bridge_execution_started', 'bridge_execution_failed', 'bridge_cancelled', 'bridge_completed',
  'swap_route_available', 'swap_route_selected', 'swap_execution_started', 'swap_execution_failed', 'swap_cancelled', 'swap_completed',
  'safety_trade_route_available', 'safety_trade_route_selected', 'safety_trade_execution_started', 'safety_trade_execution_failed', 'safety_trade_cancelled', 'safety_trade_completed',
  'wallet_confirmation_requested', 'token_approval_requested', 'token_approval_confirmed', 'transaction_submitted', 'transaction_confirmed',
  'route_high_value_loss', 'recovery_source_changed',
]);
const PROPERTY_KEYS = new Set([
  'feature', 'language', 'result', 'chain_id', 'to_chain_id', 'route_status', 'route_tool', 'quote_status',
  'error_category', 'asset_bucket', 'value_bucket', 'dust_value_bucket', 'operation_id', 'stage',
  'route_count', 'start_observed', 'partial_execution', 'analytics_version', 'has_ad_click', 'output_value_bucket',
  'partial_results', 'failed_network_count', 'source', 'wallet_check',
]);
export function cleanText(value: unknown, max = 140): string {
  if (typeof value !== 'string') return '';
  let text = value.replace(/[\r\n\t\u0000]/g, ' ').replace(/0x[a-fA-F0-9]{40,64}/g, '[redacted]').slice(0, max);
  if (/^[=+\-@]/.test(text)) text = `'${text}`; // Defense against Sheets formula injection.
  return text;
}
export function cleanAnalyticsProperties(raw: unknown): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
  for (const [key, value] of Object.entries(raw)) {
    if (!PROPERTY_KEYS.has(key)) continue;
    if (typeof value === 'string') result[key] = cleanText(value, 120);
    else if (typeof value === 'boolean') result[key] = value;
    else if (typeof value === 'number' && Number.isFinite(value)) result[key] = value;
  }
  return result;
}
