/**
 * Dust Sweeper Analytics v3 — compatible with the existing Events sheet.
 * Run upgradeAnalyticsSchema(), then update the EXISTING Web App deployment.
 * Existing rows, spreadsheet ID, shared secret and deployment URL are preserved.
 * No wallet/token addresses, transaction hashes or exact holdings are stored.
 */
const EVENTS_SHEET = 'Events';
const BASE_HEADERS = [
  'timestamp', 'session_id', 'event', 'language', 'source', 'medium', 'campaign',
  'content', 'term', 'device', 'path', 'referrer', 'feature', 'result',
  'asset_bucket', 'value_bucket', 'dust_value_bucket', 'chain_id',
  'route_status', 'route_tool', 'reason'
];
const EXTRA_HEADERS = [
  'event_id', 'occurred_at', 'operation_id', 'stage', 'error_category',
  'quote_status', 'to_chain_id', 'start_observed', 'partial_execution',
  'analytics_version', 'has_ad_click', 'output_value_bucket', 'route_count',
  'partial_results', 'failed_network_count'
];
const EVENT_HEADERS = BASE_HEADERS.concat(EXTRA_HEADERS);
const FAILURE_NAMES = {
  user_cancelled: 'User declined or cancelled', insufficient_gas: 'Insufficient funds for gas',
  wrong_network: 'Wallet network mismatch', price_changed: 'Quote, slippage or price changed',
  network_error: 'Connection or RPC error', transaction_reverted: 'Transaction reverted',
  execution_error: 'Execution error — unspecified', provider_error: 'Route provider error',
  timeout: 'Request timed out', rate_limited: 'Service rate limit', unknown: 'Reason not recorded'
};

/** New installations only. Existing installations use upgradeAnalyticsSchema(). */
function setupAnalytics() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Open this script from the analytics spreadsheet.');
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty('SPREADSHEET_ID');
  if (existingId && existingId !== spreadsheet.getId()) throw new Error('This script is configured for a different spreadsheet.');
  properties.setProperty('SPREADSHEET_ID', spreadsheet.getId());
  let secret = properties.getProperty('ANALYTICS_SHARED_SECRET');
  if (!secret) {
    secret = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
    properties.setProperty('ANALYTICS_SHARED_SECRET', secret);
  }
  let sheet = spreadsheet.getSheetByName(EVENTS_SHEET);
  if (!sheet) sheet = spreadsheet.insertSheet(EVENTS_SHEET);
  withScriptLock(function () { ensureEventHeaders(sheet); });
  console.log('Setup complete. ANALYTICS_SHARED_SECRET=' + secret);
  return 'Setup complete. Keep the secret in the execution log private.';
}

/** Adds missing columns only. Safe to run again; never rewrites event rows. */
function upgradeAnalyticsSchema() {
  const headers = withScriptLock(function () { return ensureEventHeaders(getEventsSheet()); });
  const message = 'Analytics v3 ready. ' + headers.length + ' columns; existing rows and settings preserved.';
  console.log(message);
  return message;
}

/** Starts the new measurement period once. Re-running preserves the same cutoff. */
function startAnalyticsPeriod() {
  return withScriptLock(function () {
    const properties = PropertiesService.getScriptProperties();
    let start = properties.getProperty('ANALYTICS_PERIOD_START');
    if (!start) {
      start = new Date().toISOString();
      properties.setProperty('ANALYTICS_PERIOD_START', start);
    }
    console.log('Measurement period starts at ' + start + '. Historical rows preserved.');
    return start;
  });
}

function ensureEventHeaders(sheet) {
  let headers = sheet.getLastRow() ? sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(String) : [];
  while (headers.length && !headers[headers.length - 1]) headers.pop();
  if (headers.length && !BASE_HEADERS.every(function (name, i) { return headers[i] === name; })) {
    throw new Error('Unexpected Events headers. No data changed. Restore the original first 21 column names.');
  }
  if (new Set(headers).size !== headers.length) throw new Error('Duplicate Events headers. No data changed.');
  const originalLength = headers.length;
  if (!headers.length) headers = BASE_HEADERS.slice();
  EXTRA_HEADERS.forEach(function (name) { if (headers.indexOf(name) === -1) headers.push(name); });
  const columns = sheet.getMaxColumns();
  if (columns < headers.length) sheet.insertColumnsAfter(columns, headers.length - columns);
  if (headers.length !== originalLength) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  }
  return headers;
}

function withScriptLock(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try { return callback(); } finally { lock.releaseLock(); }
}

function showAnalyticsSecret() {
  const secret = PropertiesService.getScriptProperties().getProperty('ANALYTICS_SHARED_SECRET');
  if (!secret) throw new Error('Run setupAnalytics() first.');
  console.log(secret);
  return secret;
}

function doGet() {
  return jsonResponse({ ok: true, service: 'Dust Sweeper Analytics Google Sheets backend', analytics_version: 3 });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const secret = PropertiesService.getScriptProperties().getProperty('ANALYTICS_SHARED_SECRET');
    if (!secret || body.secret !== secret) return jsonResponse({ ok: false, error: 'Unauthorized' });
    if (body.action === 'event') { appendEvent(body.data || {}); return jsonResponse({ ok: true }); }
    if (body.action === 'dashboard') return jsonResponse(buildDashboard(normalizeDays(body.days), body.period));
    return jsonResponse({ ok: false, error: 'Unknown action' });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function appendEvent(data) {
  const p = data.properties && typeof data.properties === 'object' && !Array.isArray(data.properties) ? data.properties : {};
  const receivedAt = new Date();
  const clientAt = parseDate(data.occurred_at);
  const occurredAt = clientAt && clientAt.getTime() <= receivedAt.getTime() + 60000 && clientAt.getTime() >= receivedAt.getTime() - 7 * 86400000 ? clientAt : '';
  const record = {
    timestamp: receivedAt, session_id: safeCell(data.session_id, 100), event: safeCell(data.event, 60),
    language: safeCell(p.language, 20), source: safeCell(data.source, 100), medium: safeCell(data.medium, 100),
    campaign: safeCell(data.campaign, 140), content: safeCell(data.content, 140), term: safeCell(data.term, 140),
    device: safeCell(data.device, 20), path: safeCell(data.path, 160), referrer: safeCell(data.referrer, 300),
    feature: safeCell(p.feature, 40), result: safeCell(p.result, 40),
    asset_bucket: safeCell(p.asset_bucket, 30), value_bucket: safeCell(p.value_bucket, 30), dust_value_bucket: safeCell(p.dust_value_bucket, 30),
    chain_id: safeCell(p.chain_id, 30), route_status: safeCell(p.route_status, 40), route_tool: safeCell(p.route_tool, 120),
    reason: safeCell(p.error_category || p.reason, 100), event_id: safeCell(data.event_id, 100), occurred_at: occurredAt,
    operation_id: safeCell(p.operation_id, 100), stage: safeCell(p.stage, 40), error_category: safeCell(p.error_category || p.reason, 100),
    quote_status: safeCell(p.quote_status, 40), to_chain_id: safeCell(p.to_chain_id, 30),
    start_observed: safeScalar(p.start_observed), partial_execution: safeScalar(p.partial_execution),
    analytics_version: safeCell(p.analytics_version, 20), has_ad_click: safeScalar(p.has_ad_click),
    output_value_bucket: safeCell(p.output_value_bucket, 30), route_count: safeScalar(p.route_count),
    partial_results: safeScalar(p.partial_results), failed_network_count: safeScalar(p.failed_network_count)
  };
  if (!record.session_id || !record.event) throw new Error('Missing event or session ID');
  withScriptLock(function () {
    const sheet = getEventsSheet();
    const headers = ensureEventHeaders(sheet);
    sheet.appendRow(headers.map(function (name) { return Object.prototype.hasOwnProperty.call(record, name) ? record[name] : ''; }));
  });
}

function buildDashboard(requestedDays, requestedPeriod) {
  let days = normalizeDays(requestedDays);
  const sheet = getEventsSheet(), timeZone = Session.getScriptTimeZone(), now = new Date();
  const sinceUpdate = requestedPeriod === 'since_update';
  const periodStart = sinceUpdate ? parseDate(PropertiesService.getScriptProperties().getProperty('ANALYTICS_PERIOD_START')) : null;
  if (sinceUpdate && (!periodStart || periodStart.getTime() > now.getTime())) {
    throw new Error('Execute startAnalyticsPeriod no Apps Script e atualize a implantação existente.');
  }
  // Step through calendar dates, avoiding duplicate/skipped days at DST changes.
  const calendarAnchor = new Date(Utilities.formatDate(now, timeZone, 'yyyy-MM-dd') + 'T12:00:00.000Z');
  if (periodStart) {
    const firstDay = new Date(Utilities.formatDate(periodStart, timeZone, 'yyyy-MM-dd') + 'T12:00:00.000Z');
    days = Math.round((calendarAnchor.getTime() - firstDay.getTime()) / 86400000) + 1;
  }
  const dateKeys = [];
  for (let i = days - 1; i >= 0; i--) dateKeys.push(Utilities.formatDate(new Date(calendarAnchor.getTime() - i * 86400000), 'UTC', 'yyyy-MM-dd'));
  const daily = dict();
  dateKeys.forEach(function (date) { daily[date] = newDailySet(); });
  const records = [], dedupe = new Set();
  const quality = { duplicate_events_ignored: 0, events_without_client_time: 0, missing_operation_sessions: 0, unclassified_submission_sessions: 0, missing_value_bucket_scans: 0 };
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const values = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
    const headers = values[0].map(String), index = dict();
    headers.forEach(function (name, i) { index[name] = i; });
    if (!BASE_HEADERS.every(function (name) { return Object.prototype.hasOwnProperty.call(index, name); })) throw new Error('Events headers are incomplete.');
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      const get = function (name) { return Object.prototype.hasOwnProperty.call(index, name) ? row[index[name]] : ''; };
      const received = parseDate(get('timestamp')), client = parseDate(get('occurred_at'));
      const timestamp = client || received;
      if (!timestamp || timestamp.getTime() > now.getTime() + 60000) continue;
      if (periodStart && timestamp.getTime() < periodStart.getTime()) continue;
      const date = Utilities.formatDate(timestamp, timeZone, 'yyyy-MM-dd');
      if (!daily[date]) continue;
      const event = text(get('event')), sessionId = text(get('session_id')) || 'legacy-row-' + r;
      if (!event) continue;
      const eventId = text(get('event_id'));
      if (eventId) {
        const key = sessionId + ':' + eventId;
        if (dedupe.has(key)) { quality.duplicate_events_ignored++; continue; }
        dedupe.add(key);
      }
      if (!client) quality.events_without_client_time++;
      const record = { timestamp: timestamp.getTime(), date: date, row: r, sessionId: sessionId, event: event };
      headers.forEach(function (name) { if (!['timestamp', 'event', 'session_id', 'occurred_at'].includes(name)) record[name] = text(get(name)); });
      records.push(record);
    }
  }
  // Old rows retain receipt time. Missing history is never fabricated.
  records.sort(function (a, b) { return a.timestamp - b.timestamp || a.row - b.row; });
  const sessions = dict(), featureCounts = dict(), routeStatuses = dict(), routeTools = dict(), chains = dict();
  const failures = dict(), cancellations = dict(), operations = dict();
  const missingOperations = new Set(), unclassifiedSubmissions = new Set();
  records.forEach(function (record) {
    const id = record.sessionId;
    if (!sessions[id]) sessions[id] = newSession(id);
    const session = sessions[id];
    session.records.push(record);
    session.events[record.event] = true;
    ['source', 'medium', 'campaign', 'language', 'device'].forEach(function (key) { fillFirstReal(session, key, record[key]); });
    if (record.feature) incrementUnique(featureCounts, record.feature, id);
    const finder = isFinderRecord(record);
    if (finder) {
      session.finderRecords.push(record);
      session.finderEvents[record.event] = true;
      // First Finder scan only: Portfolio / Wallet scans never populate these buckets.
      if (record.event === 'wallet_scan_started' && session.firstFinderScanSeen) session.bucketWindowOpen = false;
      if (record.event === 'wallet_scan_completed' && !session.firstFinderScanSeen) {
        session.firstFinderScanSeen = true;
        session.bucketWindowOpen = true;
      }
      if (session.bucketWindowOpen && ['wallet_scan_completed', 'wallet_assets_found', 'recovery_asset_selected'].includes(record.event)) {
        ['asset_bucket', 'value_bucket', 'dust_value_bucket'].forEach(function (key) { fillFirstReal(session, key, record[key]); });
      }
      if (record.route_status) incrementUnique(routeStatuses, record.route_status, id);
      if (record.event === 'recovery_route_selected' && record.route_tool) {
        record.route_tool.split(',').forEach(function (tool) { if (tool.trim()) incrementUnique(routeTools, tool.trim(), id); });
      }
      if (record.chain_id && record.event === 'recovery_asset_selected') incrementUnique(chains, record.chain_id, id);
      const isFailure = record.event === 'recovery_execution_failed';
      const category = normalizedReason(record.error_category || record.reason);
      const isCancellation = record.event === 'recovery_cancelled' || (isFailure && category === 'user_cancelled');
      if (isCancellation) incrementUnique(cancellations, category, id);
      else if (isFailure) incrementUnique(failures, category, id);
      if (record.event === 'transaction_submitted' && !['transfer', 'approval'].includes(record.stage)) unclassifiedSubmissions.add(id);
      if (isExecutionRecord(record)) {
        if (record.operation_id) {
          const key = id + ':' + record.operation_id;
          if (!operations[key]) operations[key] = { started: false, completed: false, failed: false, cancelled: false };
          const operation = operations[key];
          if (record.event === 'recovery_execution_started') operation.started = true;
          if (record.event === 'recovery_completed') operation.completed = true;
          if (isFailure && !isCancellation) operation.failed = true;
          if (isCancellation) operation.cancelled = true;
        } else missingOperations.add(id);
      }
    }
    const day = daily[record.date];
    day.any[id] = true;
    if (finder) {
      const mapping = { wallet_scan_started: 'scans', wallet_assets_found: 'assets', recovery_asset_selected: 'selected', recovery_route_available: 'route', recovery_completed: 'recovered' };
      if (mapping[record.event]) day[mapping[record.event]][id] = true;
    }
  });
  const list = Object.keys(sessions).map(function (id) { return sessions[id]; });
  const count = function (event) { return countFinderSessions(list, event); };
  const countStage = function (event, stage) { return list.filter(function (s) { return s.finderRecords.some(function (r) { return r.event === event && r.stage === stage; }); }).length; };
  const failureSessions = list.filter(function (s) { return s.finderRecords.some(function (r) { return r.event === 'recovery_execution_failed' && normalizedReason(r.error_category || r.reason) !== 'user_cancelled'; }); }).length;
  const cancelledSessions = list.filter(function (s) { return s.finderRecords.some(function (r) { return r.event === 'recovery_cancelled' || (r.event === 'recovery_execution_failed' && normalizedReason(r.error_category || r.reason) === 'user_cancelled'); }); }).length;
  const matched = function (before, after, sameOperation, afterStage) { return list.filter(function (s) { return orderedPair(s.finderRecords, before, after, sameOperation, afterStage); }).length; };
  const journey = {
    started_after_route: matched('recovery_route_available', 'recovery_execution_started', false),
    completed_after_route: matched('recovery_route_available', 'recovery_completed', false),
    completed_after_start: matched('recovery_execution_started', 'recovery_completed', true),
    submitted_after_start: matched('recovery_execution_started', 'transaction_submitted', true, 'transfer'),
    approvals_confirmed_after_request: matched('token_approval_requested', 'token_approval_confirmed', true)
  };
  const funnel = {
    sessions: list.length, finder_sessions: list.filter(function (s) { return s.finderRecords.length > 0; }).length,
    scans: count('wallet_scan_started'), scan_results: count('wallet_scan_completed'), assets_found: count('wallet_assets_found'),
    asset_selected: count('recovery_asset_selected'), route_available: count('recovery_route_available'),
    execution_started: count('recovery_execution_started'), approval_requested: count('token_approval_requested'),
    approval_confirmed: count('token_approval_confirmed'), transfer_submitted: countStage('transaction_submitted', 'transfer'),
    transfer_confirmed: countStage('transaction_confirmed', 'transfer'),
    recovery_completed: count('recovery_completed'), recovery_failed: failureSessions, recovery_cancelled: cancelledSessions
  };
  funnel.scan_rate = rate(funnel.scans, funnel.sessions);
  funnel.result_rate = rate(funnel.scan_results, funnel.scans);
  funnel.assets_rate = rate(funnel.assets_found, funnel.scan_results);
  funnel.selection_rate = rate(funnel.asset_selected, funnel.assets_found);
  funnel.route_rate = rate(funnel.route_available, funnel.asset_selected);
  funnel.total_recovery_rate = rate(funnel.recovery_completed, funnel.sessions);
  // Matched sessions in chronological order, not unrelated aggregate totals.
  funnel.recovery_rate_from_route = rate(journey.completed_after_route, funnel.route_available);
  journey.start_rate_from_route = rate(journey.started_after_route, funnel.route_available);
  journey.completion_rate_from_start = rate(journey.completed_after_start, funnel.execution_started);
  journey.approval_confirmation_rate = rate(journey.approvals_confirmed_after_request, funnel.approval_requested);
  quality.missing_operation_sessions = missingOperations.size;
  quality.unclassified_submission_sessions = unclassifiedSubmissions.size;
  quality.missing_value_bucket_scans = list.filter(function (s) { return s.finderEvents.wallet_scan_completed && !s.value_bucket; }).length;
  const ops = Object.keys(operations).map(function (key) { return operations[key]; });
  const operationTotals = { observed: ops.length, started: ops.filter(function (o) { return o.started; }).length, completed: ops.filter(function (o) { return o.completed; }).length, failed: ops.filter(function (o) { return o.failed; }).length, cancelled: ops.filter(function (o) { return o.cancelled; }).length };
  return {
    ok: true, analytics_version: 3, generated_at: now.toISOString(), period_days: days,
    period_start: dateKeys[0], period_end: dateKeys[dateKeys.length - 1], time_zone: timeZone,
    period_mode: sinceUpdate ? 'since_update' : 'days',
    measurement_started_at: periodStart ? periodStart.toISOString() : null,
    funnel: funnel, journey: journey, operation_totals: operationTotals, data_quality: quality,
    failure_reasons: reasonRows(failures), cancellation_reasons: reasonRows(cancellations),
    daily: dateKeys.map(function (date) { const day = daily[date]; return { date: date, sessions: sizeOf(day.any), scans: sizeOf(day.scans), assets_found: sizeOf(day.assets), asset_selected: sizeOf(day.selected), route_available: sizeOf(day.route), recovery_completed: sizeOf(day.recovered) }; }),
    sources: groupSessions(list, 'source'), campaigns: groupSessions(list, 'campaign'), languages: groupSessions(list, 'language'), devices: groupSessions(list, 'device'),
    asset_buckets: groupBuckets(list, 'asset_bucket', ['0', '1', '2_to_3', '4_to_10', '11_plus']),
    value_buckets: groupBuckets(list, 'value_bucket', ['0', 'lt_1', '1_to_5', '5_to_20', '20_to_100', '100_plus']),
    dust_value_buckets: groupBuckets(list, 'dust_value_bucket', ['0', 'lt_1', '1_to_5', '5_to_20', '20_to_100', '100_plus', '20_plus']),
    feature_usage: mapUniqueCounts(featureCounts), route_statuses: mapUniqueCounts(routeStatuses), route_tools: mapUniqueCounts(routeTools), recovery_chains: mapUniqueCounts(chains)
  };
}

function isFinderRecord(r) {
  if (r.feature && r.feature !== 'finder') return false;
  if (r.feature === 'finder') return true;
  // Legacy generic approval / transaction events without a feature remain unclassified.
  return r.event === 'finder_opened' || /^wallet_(scan_|assets_found)/.test(r.event) || /^recovery_/.test(r.event);
}
function isExecutionRecord(r) { return /^recovery_(execution_|completed|cancelled)/.test(r.event) || /^token_approval_/.test(r.event) || /^transaction_/.test(r.event) || r.event === 'wallet_confirmation_requested'; }

function orderedPair(records, before, after, sameOperation, afterStage) {
  const starts = records.filter(function (r) { return r.event === before; });
  return records.some(function (end) {
    if (end.event !== after || (afterStage && end.stage !== afterStage)) return false;
    return starts.some(function (start) {
      if (start.timestamp > end.timestamp) return false;
      if (sameOperation && (start.operation_id || end.operation_id)) return Boolean(start.operation_id && start.operation_id === end.operation_id);
      return true; // Historical rows: ordered session evidence only; UI describes this limitation.
    });
  });
}

function groupSessions(list, field) {
  const groups = dict();
  list.forEach(function (s) { const name = s[field] || (field === 'source' ? 'direct' : '(not set)'); if (!groups[name]) groups[name] = []; groups[name].push(s); });
  return Object.keys(groups).map(function (name) {
    const group = groups[name], recovered = countFinderSessions(group, 'recovery_completed');
    return { name: name, sessions: group.length, scans: countFinderSessions(group, 'wallet_scan_started'), assets_found: countFinderSessions(group, 'wallet_assets_found'), selected: countFinderSessions(group, 'recovery_asset_selected'), route: countFinderSessions(group, 'recovery_route_available'), recovered: recovered, conversion_rate: rate(recovered, group.length) };
  }).sort(function (a, b) { return b.sessions - a.sessions || b.recovered - a.recovered; });
}

function groupBuckets(list, field, preferredOrder) {
  const groups = dict();
  list.forEach(function (s) { if (!s.finderEvents.wallet_scan_completed) return; const name = s[field] || '(not set)'; if (!groups[name]) groups[name] = []; groups[name].push(s); });
  return Object.keys(groups).map(function (name) {
    const group = groups[name], scans = group.length, selected = countFinderSessions(group, 'recovery_asset_selected'), recovered = countFinderSessions(group, 'recovery_completed');
    return { name: name, scans: scans, selected: selected, route: countFinderSessions(group, 'recovery_route_available'), recovered: recovered, selection_rate: rate(selected, scans), conversion_rate: rate(recovered, scans) };
  }).sort(function (a, b) { const ai = preferredOrder.indexOf(a.name), bi = preferredOrder.indexOf(b.name); return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi) || b.scans - a.scans; });
}

function newSession(id) { return { id: id, events: dict(), finderEvents: dict(), records: [], finderRecords: [], source: '', medium: '', campaign: '', language: '', device: '', asset_bucket: '', value_bucket: '', dust_value_bucket: '', firstFinderScanSeen: false, bucketWindowOpen: false }; }
function newDailySet() { return { any: dict(), scans: dict(), assets: dict(), selected: dict(), route: dict(), recovered: dict() }; }
function countFinderSessions(list, event) { return list.filter(function (s) { return Boolean(s.finderEvents[event]); }).length; }
function fillFirstReal(object, key, value) { const v = text(value); if (!object[key] && v && v !== '(not set)') object[key] = v; }
function normalizedReason(reason) { return Object.prototype.hasOwnProperty.call(FAILURE_NAMES, reason) ? reason : 'unknown'; }
function reasonRows(store) { return mapUniqueCounts(store).map(function (row) { return { name: FAILURE_NAMES[row.name] || FAILURE_NAMES.unknown, category: row.name, count: row.count }; }); }
function normalizeDays(days) { const n = Number(days || 30); return Number.isFinite(n) ? Math.min(365, Math.max(1, Math.floor(n))) : 30; }
function rate(numerator, denominator) { return denominator ? Math.round(numerator / denominator * 1000) / 10 : 0; }
function incrementUnique(store, key, id) { if (!store[key]) store[key] = dict(); store[key][id] = true; }
function mapUniqueCounts(store) { return Object.keys(store).map(function (key) { return { name: key, count: sizeOf(store[key]) }; }).sort(function (a, b) { return b.count - a.count; }); }
function sizeOf(value) { return Object.keys(value || {}).length; }
function dict() { return Object.create(null); }
function text(value) { return value == null ? '' : String(value).trim(); }
function parseDate(value) { if (value == null || value === '') return null; const date = value instanceof Date ? value : new Date(value); return isNaN(date.getTime()) ? null : date; }
function safeScalar(value) { return typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value)) ? value : ''; }
function safeCell(value, maxLength) {
  let result = value == null ? '' : String(value);
  result = result.replace(/[\r\n\t\u0000]/g, ' ').replace(/0x[a-fA-F0-9]{40,64}/g, '[redacted]');
  if (maxLength) result = result.slice(0, maxLength);
  return /^[=+\-@]/.test(result) ? "'" + result : result;
}
function getEventsSheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Run setupAnalytics() first.');
  const sheet = SpreadsheetApp.openById(id).getSheetByName(EVENTS_SHEET);
  if (!sheet) throw new Error('Events sheet not found.');
  return sheet;
}
function jsonResponse(payload) { return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON); }
