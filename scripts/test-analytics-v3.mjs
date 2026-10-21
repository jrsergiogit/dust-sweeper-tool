import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// Runs inside scripts/test.mjs. Google services and framework/network boundaries
// are mocked; no production sheet, wallet or external API is contacted.
export async function runAnalyticsV3Tests({ test, load, root, react }) {
  const source = fs.readFileSync(path.join(root, 'apps-script/Code.gs'), 'utf8');
  const plain = value => JSON.parse(JSON.stringify(value));
  function fixture({ now = '2026-10-21T12:00:00Z', zone = 'UTC' } = {}) {
    const properties = new Map([['SPREADSHEET_ID', 'test-sheet'], ['ANALYTICS_SHARED_SECRET', 'test-secret']]);
    const state = { rows: [], columns: 26, writes: 0, lockDepth: 0 };
    class Clock extends Date {
      constructor(...args) { super(...(args.length ? args : [now])); }
      static now() { return Date.parse(now); }
    }
    const sheet = {
      getLastRow: () => state.rows.length,
      getLastColumn: () => Math.max(0, ...state.rows.map(r => r.length)),
      getMaxColumns: () => state.columns,
      insertColumnsAfter: (_after, count) => { state.columns += count; },
      setFrozenRows: () => {},
      getRange(row, col, height, width) {
        if (typeof row === 'string') return { setNumberFormat() {} };
        return {
          getValues: () => Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => state.rows[row - 1 + y]?.[col - 1 + x] ?? '')),
          setValues(values) {
            state.writes++;
            values.forEach((valuesRow, y) => {
              state.rows[row - 1 + y] ||= [];
              valuesRow.forEach((value, x) => { state.rows[row - 1 + y][col - 1 + x] = value; });
            });
          },
        };
      },
      appendRow: row => { state.rows.push(Array.from(row)); },
    };
    const spreadsheet = { getId: () => 'test-sheet', getSheetByName: () => sheet, insertSheet: () => sheet };
    const context = vm.createContext({
      Date: Clock, console: { log() {}, error() {} },
      SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet, openById(id) { assert.equal(id, 'test-sheet'); return spreadsheet; } },
      PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties.get(key), setProperty: (key, value) => properties.set(key, value) }) },
      LockService: { getScriptLock: () => ({ waitLock() { state.lockDepth++; }, releaseLock() { state.lockDepth--; } }) },
      Session: { getScriptTimeZone: () => zone },
      Utilities: {
        formatDate: (date, timeZone) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date),
        getUuid: () => 'test-uuid',
      },
      ContentService: { MimeType: { JSON: 'application/json' }, createTextOutput: body => ({ body, setMimeType() { return this; } }) },
    });
    vm.runInContext(source, context, { filename: 'Code.gs' });
    const headers = plain(vm.runInContext('EVENT_HEADERS', context));
    const base = plain(vm.runInContext('BASE_HEADERS', context));
    state.rows = [headers.slice()];
    function setRows(records, columns = headers) {
      state.rows = [columns.slice(), ...records.map(record => columns.map(key => record[key] ?? ''))];
      state.columns = Math.max(26, columns.length);
    }
    return { context, state, headers, base, properties, setRows, dashboard: days => plain(context.buildDashboard(days || 30)) };
  }
  const event = (session_id, name, minute = 0, fields = {}) => ({
    timestamp: new Date(Date.parse('2026-10-21T08:00:00Z') + minute * 60000),
    session_id, event: name, feature: 'finder', ...fields,
  });

  await test('Analytics migration appends columns without changing historical rows, settings or custom columns', () => {
    const f = fixture();
    f.setRows([event('legacy', 'recovery_completed', 0, { custom_note: 'keep me' })], [...f.base, 'custom_note']);
    const oldRow = f.state.rows[1].slice();
    f.context.upgradeAnalyticsSchema();
    assert.deepEqual(f.state.rows[0].slice(0, 21), f.base);
    assert.deepEqual(f.state.rows[1], oldRow);
    assert.equal(f.state.rows[0][21], 'custom_note');
    assert.equal(f.state.rows[0].length, 37);
    assert.equal(f.properties.get('ANALYTICS_SHARED_SECRET'), 'test-secret');
    assert.equal(f.properties.get('SPREADSHEET_ID'), 'test-sheet');
    const writes = f.state.writes;
    f.context.upgradeAnalyticsSchema();
    assert.equal(f.state.writes, writes);
    assert.equal(f.state.lockDepth, 0);
    assert.equal(f.dashboard().funnel.recovery_completed, 1);
  });

  await test('Analytics migration rejects incompatible headers before writing and releases its lock', () => {
    const f = fixture();
    f.state.rows = [['unrelated', 'data'], ['preserve', 'this']];
    const before = plain(f.state.rows);
    assert.throws(() => f.context.upgradeAnalyticsSchema(), /Unexpected Events headers/);
    assert.deepEqual(f.state.rows, before);
    assert.equal(f.state.writes, 0);
    assert.equal(f.state.lockDepth, 0);
  });

  await test('Analytics persists execution stage, reason, operation ID, false and zero without sensitive fields', () => {
    const f = fixture();
    f.context.appendEvent({ event: 'recovery_execution_failed', session_id: 'session-test', event_id: 'event-test', occurred_at: '2026-10-21T11:59:00Z', properties: {
      feature: 'finder', error_category: 'insufficient_gas', stage: 'transfer', operation_id: 'op-test', start_observed: false, failed_network_count: 0,
      wallet_address: '0x' + '1'.repeat(40), txHash: 'private', exact_balance: 42,
    } });
    const row = Object.fromEntries(f.state.rows[0].map((key, i) => [key, f.state.rows[1][i]]));
    assert.equal(row.reason, 'insufficient_gas'); assert.equal(row.error_category, 'insufficient_gas');
    assert.equal(row.operation_id, 'op-test'); assert.equal(row.stage, 'transfer');
    assert.equal(row.event_id, 'event-test'); assert.equal(row.occurred_at.toISOString(), '2026-10-21T11:59:00.000Z');
    assert.equal(row.start_observed, false); assert.equal(row.failed_network_count, 0);
    assert.ok(!JSON.stringify(row).includes('private')); assert.equal(row.wallet_address, undefined);
  });

  await test('Analytics keeps existing authentication and does not append unauthorized events', () => {
    const f = fixture();
    const call = body => JSON.parse(f.context.doPost({ postData: { contents: JSON.stringify(body) } }).body);
    assert.equal(call({ action: 'event', secret: 'wrong', data: {} }).error, 'Unauthorized');
    assert.equal(f.state.rows.length, 1);
    assert.equal(call({ action: 'dashboard', secret: 'test-secret', days: 7 }).analytics_version, 3);
    assert.equal(JSON.parse(f.context.doGet().body).analytics_version, 3);
  });

  await test('Analytics deduplicates event IDs and repeated session stages without merging distinct operations', () => {
    const f = fixture();
    f.setRows([
      event('s1', 'recovery_execution_started', 0, { event_id: 'e1', operation_id: 'a' }),
      event('s1', 'recovery_execution_started', 0, { event_id: 'e1', operation_id: 'a' }),
      event('s1', 'recovery_completed', 1, { event_id: 'e2', operation_id: 'a' }),
      event('s1', 'recovery_execution_started', 2, { event_id: 'e3', operation_id: 'b' }),
      event('s1', 'recovery_completed', 3, { event_id: 'e4', operation_id: 'b' }),
    ]);
    const d = f.dashboard();
    assert.equal(d.funnel.sessions, 1); assert.equal(d.funnel.recovery_completed, 1);
    assert.equal(d.operation_totals.started, 2); assert.equal(d.operation_totals.completed, 2);
    assert.equal(d.data_quality.duplicate_events_ignored, 1);
  });

  await test('Conversion requires chronological events in the same session and matches execution operation IDs', () => {
    const f = fixture();
    f.setRows([
      event('route-only', 'recovery_route_available'),
      event('complete-only', 'recovery_completed'),
      event('reverse', 'recovery_completed'), event('reverse', 'recovery_route_available', 1),
      event('good', 'recovery_route_available'), event('good', 'recovery_execution_started', 1, { operation_id: 'a' }), event('good', 'recovery_completed', 2, { operation_id: 'a' }),
      event('different-op', 'recovery_execution_started', 1, { operation_id: 'a' }), event('different-op', 'recovery_completed', 2, { operation_id: 'b' }),
    ]);
    const d = f.dashboard();
    assert.equal(d.journey.completed_after_route, 1); assert.equal(d.funnel.recovery_rate_from_route, 33.3);
    assert.equal(d.journey.completed_after_start, 1); assert.equal(d.journey.completion_rate_from_start, 50);
  });

  await test('Client occurrence time restores execution order when requests arrive out of order', () => {
    const f = fixture();
    f.setRows([
      event('s', 'recovery_completed', 0, { occurred_at: '2026-10-21T07:02:00Z', operation_id: 'a' }),
      event('s', 'recovery_execution_started', 1, { occurred_at: '2026-10-21T07:01:00Z', operation_id: 'a' }),
    ]);
    assert.equal(f.dashboard().journey.completed_after_start, 1);
    assert.equal(f.dashboard().data_quality.events_without_client_time, 0);
  });

  await test('Approval transactions are not recovery transfers and approval remains optional', () => {
    const f = fixture();
    f.setRows([
      event('approved', 'recovery_execution_started', 0, { operation_id: 'a' }),
      event('approved', 'token_approval_requested', 1, { operation_id: 'a', stage: 'approval' }),
      event('approved', 'transaction_submitted', 2, { operation_id: 'a', stage: 'approval' }),
      event('approved', 'token_approval_confirmed', 3, { operation_id: 'a', stage: 'approval' }),
      event('no-approval', 'recovery_execution_started', 0, { operation_id: 'b' }),
      event('no-approval', 'transaction_submitted', 1, { operation_id: 'b', stage: 'transfer' }),
      event('no-approval', 'recovery_completed', 2, { operation_id: 'b' }),
    ]);
    const d = f.dashboard();
    assert.equal(d.funnel.approval_requested, 1); assert.equal(d.funnel.approval_confirmed, 1);
    assert.equal(d.journey.approval_confirmation_rate, 100); assert.equal(d.funnel.transfer_submitted, 1);
    assert.equal(d.funnel.recovery_completed, 1); assert.equal(d.journey.completed_after_start, 1);
  });

  await test('Swap, bridge and unclassified generic transactions cannot inflate Finder execution', () => {
    const f = fixture();
    f.setRows([
      event('s', 'token_approval_requested', 0, { feature: 'swap', operation_id: 'swap' }),
      event('s', 'transaction_submitted', 1, { feature: 'bridge', stage: 'transfer' }),
      event('s', 'transaction_submitted', 2, { feature: '', stage: 'transfer' }),
      event('s', 'transaction_submitted', 3, { stage: '' }),
    ]);
    const d = f.dashboard();
    assert.equal(d.funnel.approval_requested, 0); assert.equal(d.funnel.transfer_submitted, 0);
    assert.equal(d.data_quality.unclassified_submission_sessions, 1); assert.equal(d.operation_totals.observed, 0);
  });

  await test('Failures and cancellations are separated by reason and retries may later succeed', () => {
    const f = fixture();
    f.setRows([
      event('retry', 'recovery_execution_started', 0, { operation_id: 'a' }),
      event('retry', 'recovery_execution_failed', 1, { operation_id: 'a', error_category: 'insufficient_gas' }),
      event('retry', 'recovery_execution_failed', 2, { operation_id: 'a', error_category: 'insufficient_gas' }),
      event('retry', 'recovery_completed', 3, { operation_id: 'a' }),
      event('cancel', 'recovery_cancelled', 0, { operation_id: 'b', error_category: 'user_cancelled' }),
      event('legacy-cancel', 'recovery_execution_failed', 0, { reason: 'user_cancelled' }),
      event('unknown', 'recovery_execution_failed'),
    ]);
    const d = f.dashboard();
    assert.equal(d.funnel.recovery_failed, 2); assert.equal(d.funnel.recovery_cancelled, 2);
    assert.equal(d.failure_reasons.find(r => r.category === 'insufficient_gas').count, 1);
    assert.equal(d.failure_reasons.find(r => r.category === 'unknown').count, 1);
    assert.equal(d.cancellation_reasons[0].count, 2);
    assert.equal(d.operation_totals.failed, 1); assert.equal(d.operation_totals.completed, 1);
  });

  await test('Original 21-column history remains readable without fabricated operation or transfer details', () => {
    const f = fixture();
    f.setRows([
      event('legacy', 'recovery_route_available'), event('legacy', 'recovery_execution_started', 1),
      event('legacy', 'transaction_submitted', 2), event('legacy', 'recovery_completed', 3),
      event('legacy', 'recovery_execution_failed', 4),
    ], f.base);
    const d = f.dashboard();
    assert.equal(d.funnel.recovery_completed, 1); assert.equal(d.funnel.transfer_submitted, 0);
    assert.equal(d.operation_totals.observed, 0); assert.equal(d.data_quality.missing_operation_sessions, 1);
    assert.equal(d.data_quality.unclassified_submission_sessions, 1); assert.equal(d.failure_reasons[0].category, 'unknown');
    assert.equal(d.journey.completed_after_start, 1);
  });

  await test('Finder buckets use the first Finder scan rather than portfolio values or a later scan', () => {
    const f = fixture();
    f.setRows([
      event('s', 'portfolio_scan_completed', 0, { feature: 'wallet', value_bucket: '100_plus' }),
      event('s', 'wallet_scan_started', 1), event('s', 'wallet_scan_completed', 2, { value_bucket: 'lt_1', asset_bucket: '1' }),
      event('s', 'wallet_assets_found', 3, { value_bucket: 'lt_1' }),
      event('s', 'wallet_scan_started', 4), event('s', 'wallet_scan_completed', 5, { value_bucket: '20_to_100' }),
    ]);
    const d = f.dashboard();
    assert.equal(d.value_buckets.length, 1); assert.equal(d.value_buckets[0].name, 'lt_1');
    assert.equal(d.funnel.scans, 1); assert.equal(d.data_quality.missing_value_bucket_scans, 0);
  });

  await test('Attribution waits for real values and selected tools count unique selection sessions only', () => {
    const f = fixture();
    f.setRows([
      event('s', 'page_view', 0, { feature: '', source: '', campaign: '(not set)' }),
      event('s', 'recovery_route_available', 1, { source: 'google', campaign: 'launch', route_tool: 'quoted-only' }),
      event('s', 'recovery_route_selected', 2, { route_tool: 'tool-a,tool-b' }),
      event('s', 'recovery_route_selected', 3, { route_tool: 'tool-a' }),
    ]);
    const d = f.dashboard();
    assert.equal(d.sources[0].name, 'google'); assert.equal(d.campaigns[0].name, 'launch');
    assert.deepEqual(d.route_tools, [{ name: 'tool-a', count: 1 }, { name: 'tool-b', count: 1 }]);
  });

  await test('Calendar window includes the first full local day and excludes older records', () => {
    const f = fixture();
    f.setRows([
      event('first', 'page_view', 0, { timestamp: new Date('2026-10-15T00:00:00Z') }),
      event('old', 'page_view', 0, { timestamp: new Date('2026-10-14T23:59:59Z') }),
      event('today', 'page_view'),
    ]);
    const d = f.dashboard(7);
    assert.equal(d.period_start, '2026-10-15'); assert.equal(d.funnel.sessions, 2);
    assert.equal(d.daily.length, 7); assert.equal(d.daily[0].sessions, 1);
    assert.equal(d.daily.reduce((n, r) => n + r.sessions, 0), 2);
  });

  await test('Calendar dates remain consecutive through daylight-saving transitions', () => {
    const f = fixture({ now: '2026-03-09T04:30:00Z', zone: 'America/New_York' });
    const d = f.dashboard(3);
    assert.deepEqual(d.daily.map(r => r.date), ['2026-03-07', '2026-03-08', '2026-03-09']);
  });

  await test('API forwards valid client times and clears invalid, future and excessively old times', async () => {
    const oldUrl = process.env.ANALYTICS_SHEETS_WEB_APP_URL, oldSecret = process.env.ANALYTICS_SHARED_SECRET, oldFetch = globalThis.fetch;
    process.env.ANALYTICS_SHEETS_WEB_APP_URL = 'https://example.invalid/script';
    process.env.ANALYTICS_SHARED_SECRET = 'test-secret';
    try {
      const handler = load('app/api/analytics-event/route.ts');
      for (const time of [new Date().toISOString(), 'invalid', '2099-01-01T00:00:00Z', '2000-01-01T00:00:00Z']) {
        let payload;
        globalThis.fetch = async (_url, options) => { payload = JSON.parse(options.body); return Response.json({ ok: true }); };
        const response = await handler.POST(new Request('https://dustsweepertool.com/api/analytics-event', { method: 'POST', headers: { origin: 'https://dustsweepertool.com', 'content-type': 'application/json' }, body: JSON.stringify({
          event: 'transaction_submitted', event_id: 'event-123456', session_id: 'session-123456', occurred_at: time,
          properties: { feature: 'finder', stage: 'transfer', operation_id: 'op-123456' },
        }) }));
        assert.equal(response.status, 200);
        assert.equal(payload.data.occurred_at, time === 'invalid' || !time.startsWith(String(new Date().getUTCFullYear())) ? '' : time);
        assert.equal(payload.data.properties.operation_id, 'op-123456'); assert.equal(payload.data.properties.stage, 'transfer');
      }
    } finally {
      if (oldUrl === undefined) delete process.env.ANALYTICS_SHEETS_WEB_APP_URL; else process.env.ANALYTICS_SHEETS_WEB_APP_URL = oldUrl;
      if (oldSecret === undefined) delete process.env.ANALYTICS_SHARED_SECRET; else process.env.ANALYTICS_SHARED_SECRET = oldSecret;
      globalThis.fetch = oldFetch;
    }
  });

  await test('Dashboard renders all execution stages, optional approvals and separate outcome reasons', () => {
    const previous = react.useState;
    const f = fixture();
    f.setRows([event('s', 'recovery_execution_started', 0, { operation_id: 'a' }), event('s', 'recovery_cancelled', 1, { operation_id: 'a', error_category: 'user_cancelled' })]);
    const data = f.dashboard();
    let i = 0;
    react.useState = init => { const n = i++; return [n === 2 ? data : typeof init === 'function' ? init() : init, () => {}]; };
    function expand(node) {
      if (Array.isArray(node)) return node.map(expand);
      if (!node || typeof node !== 'object') return node;
      if (typeof node.type === 'function') return expand(node.type(node.props));
      return { type: node.type, ...node.props, children: expand(node.props?.children) };
    }
    try {
      const Page = load('app/admin/analytics/page.tsx').default;
      const rendered = JSON.stringify(expand(Page()));
      for (const text of ['Operation started', 'Recovery transaction sent', 'Recovery completed', 'Approval requested', 'Approval completed', 'When required', 'Execution failures by reason', 'Cancellations by reason', 'User declined or cancelled']) assert.ok(rendered.includes(text), text);
      assert.ok(!rendered.includes('on-chain recovery failure'));
      delete data.analytics_version;
      i = 0;
      const legacy = JSON.stringify(expand(Page()));
      assert.ok(legacy.includes('Update the Apps Script')); assert.ok(!legacy.includes('Recovery transaction sent'));
    } finally { react.useState = previous; }
  });
}
