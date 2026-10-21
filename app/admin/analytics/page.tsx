"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Funnel = {
  sessions: number;
  scans: number;
  scan_results: number;
  assets_found: number;
  asset_selected: number;
  route_available: number;
  recovery_completed: number;
  recovery_failed: number;
  execution_started?: number;
  approval_requested?: number;
  approval_confirmed?: number;
  transfer_submitted?: number;
  recovery_cancelled?: number;
  scan_rate: number;
  result_rate: number;
  assets_rate: number;
  selection_rate: number;
  route_rate: number;
  recovery_rate_from_route: number;
  total_recovery_rate: number;
};

type DailyRow = {
  date: string;
  sessions: number;
  scans: number;
  assets_found: number;
  asset_selected: number;
  route_available: number;
  recovery_completed: number;
};

type GroupRow = {
  name: string;
  sessions: number;
  scans: number;
  assets_found: number;
  selected: number;
  route: number;
  recovered: number;
  conversion_rate: number;
};

type BucketRow = {
  name: string;
  scans: number;
  selected: number;
  route: number;
  recovered: number;
  selection_rate: number;
  conversion_rate: number;
};

type CountRow = { name: string; count: number };

type Journey = {
  started_after_route: number;
  completed_after_route: number;
  completed_after_start: number;
  approvals_confirmed_after_request: number;
  start_rate_from_route: number;
  completion_rate_from_start: number;
  approval_confirmation_rate: number;
};

type OperationTotals = { observed: number; started: number; completed: number; failed: number; cancelled: number };
type DataQuality = {
  duplicate_events_ignored: number;
  events_without_client_time: number;
  missing_operation_sessions: number;
  unclassified_submission_sessions: number;
  missing_value_bucket_scans: number;
};

type DashboardData = {
  ok: boolean;
  generated_at: string;
  period_days: number;
  analytics_version?: number;
  period_start?: string;
  period_end?: string;
  time_zone?: string;
  journey?: Journey;
  operation_totals?: OperationTotals;
  data_quality?: DataQuality;
  failure_reasons?: CountRow[];
  cancellation_reasons?: CountRow[];
  funnel: Funnel;
  daily: DailyRow[];
  sources: GroupRow[];
  campaigns: GroupRow[];
  languages: GroupRow[];
  devices: GroupRow[];
  asset_buckets: BucketRow[];
  value_buckets: BucketRow[];
  dust_value_buckets: BucketRow[];
  feature_usage: CountRow[];
  route_statuses: CountRow[];
  route_tools: CountRow[];
  recovery_chains: CountRow[];
};

const PASSWORD_KEY = "ds_dashboard_password";

function pct(value: number) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function num(value: number) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-tight text-white">{value}</div>
      {note ? <div className="mt-1 text-xs font-semibold text-gray-500">{note}</div> : null}
    </div>
  );
}

function FunnelStep({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3">
      <div>
        <div className="text-sm font-black text-white">{label}</div>
      </div>
      <div className="text-xl font-black text-white">{value === undefined ? "—" : num(value)}</div>
    </div>
  );
}

function DailyChart({ rows }: { rows: DailyRow[] }) {
  const recent = rows.slice(-30);
  const max = Math.max(1, ...recent.map((row) => row.sessions));

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[720px] items-end gap-2 pt-8">
        {recent.map((row) => {
          const height = row.sessions > 0 ? Math.max(6, Math.round((row.sessions / max) * 180)) : 0;
          const recoveryHeight = row.sessions > 0 && row.recovery_completed > 0
            ? Math.max(2, Math.round((row.recovery_completed / row.sessions) * height))
            : 0;
          return (
            <div key={row.date} className="group flex min-w-0 flex-1 flex-col items-center">
              <div className="relative flex h-[190px] w-full items-end justify-center">
                <div
                  className="relative w-[70%] min-w-3 rounded-t-md bg-white/10 transition group-hover:bg-white/15"
                  style={{ height }}
                  title={`${row.date}: ${row.sessions} sessions, ${row.recovery_completed} sessions with recovery completed`}
                >
                  {recoveryHeight > 0 ? (
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-sm bg-purple-500"
                      style={{ height: recoveryHeight }}
                    />
                  ) : null}
                </div>
              </div>
              <div className="mt-2 -rotate-45 whitespace-nowrap text-[9px] font-semibold text-gray-600">
                {row.date.slice(5)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold text-gray-500">
        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-white/10" /> Sessions</span>
        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-purple-500" /> Sessions with recovery completed</span>
      </div>
    </div>
  );
}

function GroupTable({ title, rows }: { title: string; rows: GroupRow[] }) {
  return (
    <section className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 text-[9px] font-black uppercase tracking-wide text-gray-600">
            <tr>
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4 text-right">Sessions</th>
              <th className="pb-3 pr-4 text-right">Scans</th>
              <th className="pb-3 pr-4 text-right">Assets</th>
              <th className="pb-3 pr-4 text-right">Selected</th>
              <th className="pb-3 pr-4 text-right">Route</th>
              <th className="pb-3 pr-4 text-right">Recovered</th>
              <th className="pb-3 text-right">Conv.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.length ? rows.slice(0, 12).map((row) => (
              <tr key={row.name}>
                <td className="py-3 pr-4 font-bold text-gray-200">{row.name || "(none)"}</td>
                <td className="py-3 pr-4 text-right text-gray-400">{num(row.sessions)}</td>
                <td className="py-3 pr-4 text-right text-gray-400">{num(row.scans)}</td>
                <td className="py-3 pr-4 text-right text-gray-400">{num(row.assets_found)}</td>
                <td className="py-3 pr-4 text-right text-gray-400">{num(row.selected)}</td>
                <td className="py-3 pr-4 text-right text-gray-400">{num(row.route)}</td>
                <td className="py-3 pr-4 text-right font-black text-white">{num(row.recovered)}</td>
                <td className="py-3 text-right font-black text-purple-300">{pct(row.conversion_rate)}</td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="py-8 text-center text-gray-600">No data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function assetBucketLabel(value: string) {
  const labels: Record<string, string> = {
    "0": "0 assets",
    "1": "1 asset",
    "2_to_3": "2–3 assets",
    "4_to_10": "4–10 assets",
    "11_plus": "11+ assets",
  };
  return labels[value] || value || "(none)";
}

function valueBucketLabel(value: string) {
  const labels: Record<string, string> = {
    "0": "$0",
    "lt_1": "< $1",
    "1_to_5": "$1–$5",
    "5_to_20": "$5–$20",
    "20_to_100": "$20–$100",
    "100_plus": "$100+",
    "20_plus": "$20+",
  };
  return labels[value] || value || "(none)";
}

function BucketTable({ title, rows, kind }: { title: string; rows: BucketRow[]; kind: "asset" | "value" }) {
  return (
    <section className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-white/10 text-[9px] font-black uppercase tracking-wide text-gray-600">
            <tr>
              <th className="pb-3 pr-4">Bucket</th>
              <th className="pb-3 pr-4 text-right">Scans</th>
              <th className="pb-3 pr-4 text-right">Selected</th>
              <th className="pb-3 pr-4 text-right">Route</th>
              <th className="pb-3 pr-4 text-right">Recovered</th>
              <th className="pb-3 text-right">Scan → Recovery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.length ? rows.map((row) => (
              <tr key={row.name}>
                <td className="py-3 pr-4 font-bold text-gray-200">{kind === "asset" ? assetBucketLabel(row.name) : valueBucketLabel(row.name)}</td>
                <td className="py-3 pr-4 text-right text-gray-400">{num(row.scans)}</td>
                <td className="py-3 pr-4 text-right text-gray-400">{num(row.selected)}</td>
                <td className="py-3 pr-4 text-right text-gray-400">{num(row.route)}</td>
                <td className="py-3 pr-4 text-right font-black text-white">{num(row.recovered)}</td>
                <td className="py-3 text-right font-black text-purple-300">{pct(row.conversion_rate)}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="py-8 text-center text-gray-600">No data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CountTable({ title, rows, note, total }: { title: string; rows: CountRow[]; note?: string; total?: number }) {
  return (
    <section className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">
      <h2 className="text-lg font-black text-white">{title}</h2>
      {total !== undefined ? <div className="mt-2 text-3xl font-black text-white">{num(total)} <span className="text-sm text-gray-400">sessions</span></div> : null}
      {note ? <p className="mt-2 text-xs leading-5 text-gray-400">{note}</p> : null}
      <div className="mt-4 space-y-2">
        {rows.length ? rows.slice(0, 12).map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
            <span className="min-w-0 break-words text-sm font-bold text-gray-300">{row.name || "(not set)"}</span>
            <span className="shrink-0 text-sm font-black text-white">{num(row.count)}</span>
          </div>
        )) : <div className="py-8 text-center text-sm text-gray-600">No data yet.</div>}
      </div>
    </section>
  );
}

export default function AnalyticsDashboardPage() {
  const [password, setPassword] = useState("");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(PASSWORD_KEY);
      if (saved) setPassword(saved);
    } catch {}
  }, []);

  async function loadDashboard(nextDays = days, nextPassword = password) {
    if (!nextPassword) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/analytics-dashboard?days=${nextDays}`, {
        headers: { Authorization: `Bearer ${nextPassword}` },
        cache: "no-store",
      });
      const body = await response.json();

      if (!response.ok || !body?.ok) {
        throw new Error(body?.error || "Unable to load dashboard.");
      }

      setData(body as DashboardData);
      try {
        window.sessionStorage.setItem(PASSWORD_KEY, nextPassword);
      } catch {}
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  function submitPassword(event: FormEvent) {
    event.preventDefault();
    void loadDashboard(days, password);
  }

  function changeDays(nextDays: number) {
    setDays(nextDays);
    if (password) void loadDashboard(nextDays, password);
  }

  const lastUpdated = useMemo(() => {
    if (!data?.generated_at) return "";
    try {
      return new Date(data.generated_at).toLocaleString();
    } catch {
      return data.generated_at;
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-[72vh] bg-[#060609] px-5 py-16 text-white">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.035] p-8 shadow-2xl">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-purple-300">Dust Sweeper</div>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Analytics Dashboard</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Enter the dashboard password configured in Vercel. Analytics never stores wallet addresses, token contract addresses, private keys or seed phrases.
          </p>

          <form onSubmit={submitPassword} className="mt-6 space-y-3">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Dashboard password"
              autoComplete="current-password"
              className="min-h-12 w-full rounded-xl border-2 border-white/10 bg-black/30 px-4 text-white outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !password}
              className="min-h-12 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 font-black text-white disabled:opacity-50"
            >
              {loading ? "Loading…" : "Open dashboard"}
            </button>
          </form>
          {error ? <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm font-bold text-red-300">{error}</div> : null}
        </div>
      </div>
    );
  }

  const f = data.funnel;
  const hasExecutionDetails = (data.analytics_version || 0) >= 3;
  const journey = hasExecutionDetails ? data.journey : undefined;
  const operations = hasExecutionDetails ? data.operation_totals : undefined;
  const quality = hasExecutionDetails ? data.data_quality : undefined;
  const hasHistoricalGaps = quality && (quality.missing_operation_sessions > 0 || quality.unclassified_submission_sessions > 0);

  return (
    <div className="min-h-screen bg-[#060609] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-purple-300">Dust Sweeper</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Conversion Analytics</h1>
            <p className="mt-2 text-sm text-gray-600">Updated {lastUpdated}</p>
            {data.period_start && data.period_end ? <p className="mt-1 text-xs text-gray-500">{data.period_start} – {data.period_end} · {data.time_zone}</p> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[7, 30, 90].map((option) => (
              <button
                key={option}
                onClick={() => changeDays(option)}
                className={`rounded-xl px-4 py-2 text-sm font-black ${days === option ? "bg-white text-black" : "border border-white/10 bg-white/[0.04] text-gray-400"}`}
              >
                {option} days
              </button>
            ))}
            <button
              onClick={() => void loadDashboard()}
              disabled={loading}
              className="rounded-xl border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm font-black text-purple-200 disabled:opacity-50"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </header>

        {!hasExecutionDetails ? (
          <div role="status" className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200">
            Update the Apps Script and its existing Web App deployment to enable execution stages, approvals and failure reasons. The overview below is using the previous analytics backend.
          </div>
        ) : null}
        {hasHistoricalGaps ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-gray-300">
            Some events in this period are missing execution details. Missing stages and reasons cannot be reconstructed; operation totals include only events with an operation ID.
          </div>
        ) : null}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Sessions" value={num(f.sessions)} note={`${data.period_days}-day period`} />
          <MetricCard label="Finder scans" value={num(f.scans)} note={`${pct(f.scan_rate)} of sessions`} />
          <MetricCard label="Routes available" value={num(f.route_available)} note="Sessions with at least one route" />
          <MetricCard label="Recovery completed" value={num(f.recovery_completed)} note={`${pct(f.total_recovery_rate)} of sessions`} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-600">Finder funnel</div>
            <p className="mt-2 text-xs leading-5 text-gray-400">Unique sessions that reached each stage during the period. A session can appear at a later stage even if an earlier event was not recorded.</p>
            <div className="mt-4 space-y-2">
              <FunnelStep label="Sessions" value={f.sessions} />
              <FunnelStep label="Scans started" value={f.scans} />
              <FunnelStep label="Scan results" value={f.scan_results} />
              <FunnelStep label="Assets found" value={f.assets_found} />
              <FunnelStep label="Asset selected" value={f.asset_selected} />
              <FunnelStep label="Route available" value={f.route_available} />
              {hasExecutionDetails ? <FunnelStep label="Operation started" value={f.execution_started} /> : null}
              {hasExecutionDetails ? <FunnelStep label="Recovery transaction sent" value={f.transfer_submitted} /> : null}
              <FunnelStep label="Recovery completed" value={f.recovery_completed} />
            </div>
            <p className="mt-4 text-xs leading-5 text-gray-400">Approval is optional and shown separately. A submitted transaction is counted here only when identified as a recovery transfer.</p>
          </div>

          <div className="min-w-0 space-y-6">
            {journey ? (
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">
                <h2 className="text-lg font-black">Observed progression</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Route → start" value={f.route_available ? pct(journey.start_rate_from_route) : "—"} note={`${num(journey.started_after_route)} of ${num(f.route_available)} sessions`} />
                  <MetricCard label="Start → recovery" value={f.execution_started ? pct(journey.completion_rate_from_start) : "—"} note={`${num(journey.completed_after_start)} of ${num(f.execution_started ?? 0)} sessions`} />
                  <MetricCard label="Route → recovery" value={f.route_available ? pct(f.recovery_rate_from_route) : "—"} note={`${num(journey.completed_after_route)} of ${num(f.route_available)} sessions`} />
                </div>
                <p className="mt-3 text-xs leading-5 text-gray-400">Both events must be recorded in order within the period and session. Start → recovery also matches the operation ID when available. Route comparisons can include different attempts in the same session.</p>
              </section>
            ) : null}
            {hasExecutionDetails ? (
              <section className="rounded-3xl border border-purple-400/20 bg-purple-500/[0.05] p-5 shadow-xl">
                <h2 className="text-lg font-black">Token approval <span className="ml-2 text-xs font-semibold text-purple-300">When required</span></h2>
                <p className="mt-2 text-xs leading-5 text-gray-400">Sessions with at least one approval event. Recoveries can proceed without a new approval if permission is already sufficient or the route does not require it.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <FunnelStep label="Approval requested" value={f.approval_requested} />
                  <FunnelStep label="Approval completed" value={f.approval_confirmed} />
                </div>
                {journey && (f.approval_requested ?? 0) > 0 ? <p className="mt-3 text-xs text-purple-200">{num(journey.approvals_confirmed_after_request)} of {num(f.approval_requested ?? 0)} requesting sessions had at least one later approval completed ({pct(journey.approval_confirmation_rate)}), matching operation IDs when available.</p> : null}
              </section>
            ) : null}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-600">Daily trend</div>
              <h2 className="mt-1 text-lg font-black text-white">Sessions and recoveries</h2>
              <DailyChart rows={data.daily} />
            </div>
          </div>
        </section>

        {hasExecutionDetails ? (
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <CountTable title="Execution failures by reason" total={f.recovery_failed} rows={data.failure_reasons || []} note="Unique sessions per reason. Includes failures before a transaction is sent; user cancellations are counted separately." />
            <CountTable title="Cancellations by reason" total={f.recovery_cancelled} rows={data.cancellation_reasons || []} note="Unique sessions per reason. A cancellation means the user declined or stopped a request; an absent reason remains unrecorded." />
          </section>
        ) : null}

        {operations ? (
          <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">
            <h2 className="text-lg font-black">Identified recovery operations</h2>
            <p className="mt-2 text-xs leading-5 text-gray-400">{num(operations.observed)} distinct operation IDs observed. These counts can exceed sessions when a user performs several operations. Retries within the same operation ID count once per outcome.</p>
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {([
                ["Started", operations.started], ["Completed", operations.completed],
                ["Had a failure", operations.failed], ["Had a cancellation", operations.cancelled],
              ] as const).map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-black/20 p-4">
                  <div className="text-xs font-semibold text-gray-400">{label}</div>
                  <div className="mt-2 text-2xl font-black">{num(value)}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {quality ? (
          <details className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-6 text-gray-400">
            <summary className="cursor-pointer font-bold text-gray-300">Tracking coverage for this period</summary>
            <div className="mt-3 grid gap-x-6 sm:grid-cols-2">
              <div>Sessions with execution events missing an operation ID: <strong>{num(quality.missing_operation_sessions)}</strong></div>
              <div>Sessions with submitted transactions of unknown type: <strong>{num(quality.unclassified_submission_sessions)}</strong></div>
              <div>Duplicate event IDs ignored: <strong>{num(quality.duplicate_events_ignored)}</strong></div>
              <div>Events ordered by receipt time (client time unavailable): <strong>{num(quality.events_without_client_time)}</strong></div>
              <div>Finder scan sessions missing a value bucket: <strong>{num(quality.missing_value_bucket_scans)}</strong></div>
            </div>
            <p className="mt-2">Historical stages without operation IDs are matched only by session and recorded time. Transactions without a known stage are excluded from the recovery transaction count. Events blocked or never received cannot be measured.</p>
          </details>
        ) : null}

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <GroupTable title="Traffic sources" rows={data.sources} />
          <GroupTable title="Campaigns" rows={data.campaigns} />
          <GroupTable title="Languages" rows={data.languages} />
          <GroupTable title="Devices" rows={data.devices} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <BucketTable title="Recovery by assets found" rows={data.asset_buckets} kind="asset" />
          <BucketTable title="Recovery by priced wallet value" rows={data.value_buckets} kind="value" />
          <BucketTable title="Recovery by low-value asset total" rows={data.dust_value_buckets} kind="value" />
          <CountTable title="Feature usage" rows={data.feature_usage} note="Unique sessions per feature." />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <CountTable title="Recovery route statuses" rows={data.route_statuses} note="Unique Finder sessions per observed status." />
          <CountTable title="LI.FI tools selected" rows={data.route_tools} note="Unique Finder sessions with an explicitly selected route, per tool." />
          <CountTable title="Selected recovery chains" rows={data.recovery_chains} note="Unique Finder sessions per selected source chain." />
        </section>

        <footer className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-xs leading-5 text-gray-600">
          Metrics count anonymous sessions, except the identified operations section. A session or operation can have a failure or cancellation and later complete a recovery; these totals are not mutually exclusive. Reason counts can overlap when a session encounters several reasons. Bucket tables use the first observed Finder scan. The analytics system does not store wallet addresses, token contract addresses, transaction hashes, private keys, seed phrases, or exact wallet holdings.
        </footer>
      </div>
    </div>
  );
}
