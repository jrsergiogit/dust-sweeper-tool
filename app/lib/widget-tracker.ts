import { valueBucket } from './recovery-math';

export type WidgetFeature = 'finder' | 'bridge' | 'swap' | 'safety';
export type WidgetState = {
  status: 'idle' | 'available' | 'no-route' | 'selected' | 'started' | 'approval' | 'waiting' | 'submitted' | 'processing' | 'completed' | 'failed' | 'cancelled';
  message: string; busy: boolean; partial?: boolean; label?: string; operationId?: string;
};
type Props = Record<string, string | number | boolean>;
type Options = {
  emit: (event: string, properties: Props) => void;
  update: (feature: WidgetFeature, state: WidgetState) => void;
  id: () => string;
};
type Operation = { id: string; feature: WidgetFeature; started: boolean; complete: boolean; busy: boolean };
const prefix = (feature: WidgetFeature) => feature === 'finder' ? 'recovery' : feature === 'safety' ? 'safety_trade' : feature;
const routeFrom = (payload: any) => payload?.route ?? payload ?? {};
const stepsOf = (route: any): any[] => Array.isArray(route?.steps) ? route.steps : [];
const processesOf = (route: any): any[] => stepsOf(route).flatMap(step =>
  Array.isArray(step?.execution?.process) ? step.execution.process : []);
const routeKey = (route: any) => String(route?.id || [route?.fromChainId, route?.fromToken?.address, route?.fromAmount, route?.toChainId, route?.toToken?.address, route?.toAmount].join(':'));
const signature = (route: any) => [route?.fromChainId, route?.fromToken?.address, route?.fromAmount, route?.toChainId, route?.toToken?.address].join(':');
const upper = (x: unknown) => String(x || '').toUpperCase();
function label(route: any): string {
  const from = String(route?.fromToken?.symbol || '').slice(0, 24);
  const to = String(route?.toToken?.symbol || '').slice(0, 24);
  return from && to ? `${from} -> ${to}` : '';
}
function metadata(route: any): Props {
  return {
    chain_id: String(route?.fromChainId ?? route?.steps?.[0]?.action?.fromChainId ?? ''),
    to_chain_id: String(route?.toChainId ?? ''),
    route_tool: [...new Set(stepsOf(route).map(s => String(s?.toolDetails?.key || s?.tool || '')))].filter(Boolean).join(',').slice(0, 120),
  };
}
export function hasPartialTransfer(route: any): boolean {
  return processesOf(route).some(p => upper(p?.status) === 'DONE' && p?.txHash && !/ALLOWANCE|PERMIT|APPROVAL|CHAIN_SWITCH/.test(upper(p?.type)));
}
export function failureCategory(payload: any): string {
  const route = routeFrom(payload);
  const failed = processesOf(route).filter(p => ['FAILED', 'REVERTED', 'ERROR'].includes(upper(p.status)));
  const errors = [payload?.error, payload?.process?.error, payload?.action?.error, ...failed.map(p => p?.error)];
  const codes = errors.flatMap(e => [e?.code, e?.cause?.code]);
  const message = [payload?.message, payload?.process?.message, ...errors.flatMap(e => [e?.message, e?.cause?.message, e?.name]), ...failed.map(p => p?.message)].filter(Boolean).join(' ').toLowerCase();
  if (codes.some(code => String(code) === '4001' || String(code) === 'ACTION_REJECTED') || /user.{0,15}(reject|denied|cancel)|rejected.{0,15}user/.test(message)) return 'user_cancelled';
  if (/insufficient funds|insufficient.*gas|funds for gas|gas balance/.test(message)) return 'insufficient_gas';
  if (/chain mismatch|wrong network|chain.*not.*configured|switch.*chain/.test(message)) return 'wrong_network';
  if (/slippage|price impact|price.*changed/.test(message)) return 'price_changed';
  if (/timeout|timed out|network error|failed to fetch|rpc/.test(message)) return 'network_error';
  if (/execution reverted|transaction.*reverted/.test(message)) return 'transaction_reverted';
  return 'execution_error';
}
function failureMessage(category: string, partial: boolean): string {
  const messages: Record<string, string> = {
    user_cancelled: 'Request cancelled. You can review the details in LI.FI and try again.',
    insufficient_gas: 'The wallet reported insufficient funds for network gas. Check the network currency and required fee in LI.FI.',
    wrong_network: 'The wallet reported a network mismatch. Use the network requested by LI.FI.',
    price_changed: 'The quote or price conditions changed. Review an updated route in LI.FI.',
    network_error: 'The wallet or route service could not finish the request. Check its transaction status in LI.FI before retrying.',
    transaction_reverted: 'The route reported a reverted transaction. Review the transaction details and network fee in LI.FI.',
    execution_error: 'The operation did not complete. Review the details in LI.FI before retrying.',
  };
  return (messages[category] || messages.execution_error) + (partial ? ' Some transfer steps have completed: do not restart the whole operation without checking their status.' : '');
}

/** Route ownership is captured at execution start, not inferred from the external asset selection. */
export class WidgetTracker {
  private operations = new Map<string, Operation>();
  private seen = new Set<string>();
  constructor(private options: Options) {}
  private once(key: string, event: string, properties: Props) {
    if (this.seen.has(key)) return;
    if (this.seen.size > 6000) this.seen.delete(this.seen.values().next().value!);
    this.seen.add(key); this.options.emit(event, properties);
  }
  handle(event: string, payload: any, activeFeature: WidgetFeature) {
    if (event === 'availableRoutes') {
      if (!Array.isArray(payload)) return;
      const has = payload.length > 0;
      this.once(`${activeFeature}:available:${has ? signature(payload[0]) : 'none'}`, has ? `${prefix(activeFeature)}_route_available` : `${prefix(activeFeature)}_route_failed`, {
        feature: activeFeature, route_status: has ? 'available_in_widget' : 'no_routes', route_count: payload.length,
        ...(has ? { chain_id: String(payload[0]?.fromChainId || '') } : { error_category: 'no_routes' }),
      });
      if ([...this.operations.values()].some(op => op.feature === activeFeature && op.busy)) return;
      this.options.update(activeFeature, { status: has ? 'available' : 'no-route', busy: false,
        message: has ? 'Review the route, destination, amount received and network costs in LI.FI.' : 'No route is available for the current selection. Try a different amount or destination in LI.FI, or choose another asset.' });
      return;
    }
    if (event === 'routeHighValueLoss') {
      this.options.emit('route_high_value_loss', { feature: activeFeature, route_status: 'high_value_loss' }); return;
    }
    const route = routeFrom(payload);
    const key = routeKey(route);
    if (!key || key === ':::::') return;
    const previous = this.operations.get(key);
    const current = event === 'routeExecutionStarted' && previous?.complete ? undefined : previous;
    const feature = current?.feature || activeFeature;
    const p = prefix(feature);
    if (event === 'routeSelected') {
      this.once(`${feature}:selected:${key}`, `${p}_route_selected`, { feature, ...metadata(route), route_status: 'selected' });
      if ([...this.operations.values()].some(op => op.feature === feature && op.busy)) return;
      this.options.update(feature, { status: 'selected', busy: false, label: label(route), message: 'Check the destination, amount received and all network costs before confirming in your wallet.' });
      return;
    }
    if (!['routeExecutionStarted', 'routeExecutionUpdated', 'routeExecutionCompleted', 'routeExecutionFailed'].includes(event)) return;
    const operation = current || { id: this.options.id(), feature, started: false, complete: false, busy: false };
    if (this.operations.size > 2000 && !current) {
      for (const [k, op] of this.operations) { if (op.complete) { this.operations.delete(k); break; } }
    }
    this.operations.set(key, operation);
    const props = { feature, ...metadata(route), operation_id: operation.id };
    if (operation.complete) return;
    if (event === 'routeExecutionStarted') {
      operation.started = true; operation.busy = true;
      this.once(`${operation.id}:start`, `${p}_execution_started`, { ...props, route_status: 'started' });
      this.options.update(feature, { status: 'started', busy: true, operationId: operation.id, label: label(route), message: 'Operation started. Follow the requests in LI.FI and your wallet.' });
      return;
    }
    if (event === 'routeExecutionCompleted') {
      operation.complete = true; operation.busy = false;
      this.once(`${operation.id}:completed`, `${p}_completed`, {
        ...props, route_status: 'completed', start_observed: operation.started,
        output_value_bucket: valueBucket(Number(route?.toAmountUSD || 0)),
      });
      this.options.update(feature, { status: 'completed', busy: false, operationId: operation.id, label: label(route), message: 'LI.FI reported this operation complete. Review the transaction details below.' });
      return;
    }
    if (event === 'routeExecutionFailed') {
      operation.busy = false;
      const category = failureCategory(payload);
      const partial = hasPartialTransfer(route);
      this.once(`${operation.id}:failed:${category}`, category === 'user_cancelled' ? `${p}_cancelled` : `${p}_execution_failed`, {
        ...props, error_category: category, route_status: category === 'user_cancelled' ? 'cancelled' : 'failed', partial_execution: partial,
      });
      this.options.update(feature, { status: category === 'user_cancelled' ? 'cancelled' : 'failed', busy: false, partial,
        operationId: operation.id, label: label(route), message: failureMessage(category, partial) });
      // Never remount the widget, blacklist a tool, or restart a transaction here.
      return;
    }
    const processes = processesOf(route);
    if (processes.some(p => ['FAILED', 'REVERTED', 'ERROR'].includes(upper(p.status)))) {
      this.handle('routeExecutionFailed', payload, feature); return;
    }
    operation.busy = true;
    for (const [index, process] of processes.entries()) {
      const type = upper(process?.type), status = upper(process?.status);
      const approval = /ALLOWANCE|APPROVAL|PERMIT/.test(type);
      if (status === 'ACTION_REQUIRED') this.once(`${operation.id}:${index}:${type}:requested`, approval ? 'token_approval_requested' : 'wallet_confirmation_requested', { ...props, stage: approval ? 'approval' : 'wallet_confirmation' });
      if (process?.txHash) this.once(`${operation.id}:${index}:${type}:sent`, 'transaction_submitted', { ...props, stage: approval ? 'approval' : 'transfer' });
      if (status === 'DONE' && (approval || process?.txHash)) this.once(`${operation.id}:${index}:${type}:done`, approval ? 'token_approval_confirmed' : 'transaction_confirmed', { ...props, stage: approval ? 'approval' : 'transfer' });
    }
    const pending = [...processes].reverse().find(process => !['DONE', 'CANCELLED'].includes(upper(process?.status)));
    const approval = /ALLOWANCE|APPROVAL|PERMIT/.test(upper(pending?.type));
    const state: WidgetState = { status: 'processing', busy: true, operationId: operation.id, label: label(route), message: 'LI.FI is tracking the operation. Keep this page open.' };
    if (upper(pending?.status) === 'ACTION_REQUIRED') {
      state.status = approval ? 'approval' : 'waiting';
      state.message = approval ? 'Review the token permission request in your wallet. Approval is separate from the recovery transaction.' : 'Review and confirm the request in your wallet to continue.';
    } else if (pending?.txHash) {
      state.status = 'submitted'; state.message = 'A transaction was submitted. LI.FI is waiting for its network confirmation.';
    }
    this.options.update(feature, state);
  }
}
