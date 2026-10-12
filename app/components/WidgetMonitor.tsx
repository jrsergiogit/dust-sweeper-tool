'use client';
import { useEffect, useRef } from 'react';
import { useWidgetEvents, WidgetEvent } from '@lifi/widget';
import { anonymousId, getBrowserLanguage, trackDustEvent, type AnalyticsProperties } from '../lib/dust-analytics';
import { WidgetTracker, type WidgetFeature, type WidgetState } from '../lib/widget-tracker';

type Props = {
  feature: WidgetFeature;
  buckets: AnalyticsProperties;
  onState: (feature: WidgetFeature, state: WidgetState) => void;
  onFormChanged?: () => void;
};
/** Kept outside the component that renders LiFiWidget, as recommended by LI.FI. */
export default function WidgetMonitor(props: Props) {
  const events = useWidgetEvents();
  const latest = useRef(props);
  latest.current = props;
  const tracker = useRef<WidgetTracker | null>(null);
  if (!tracker.current) tracker.current = new WidgetTracker({
    id: anonymousId,
    emit: (event, properties) => trackDustEvent(event, {
      ...(properties.feature === 'finder' ? latest.current.buckets : {}),
      ...properties, language: getBrowserLanguage(),
    }),
    update: (feature, state) => latest.current.onState(feature, state),
  });
  useEffect(() => {
    const handlers = [
      WidgetEvent.AvailableRoutes, WidgetEvent.RouteSelected, WidgetEvent.RouteExecutionStarted,
      WidgetEvent.RouteExecutionUpdated, WidgetEvent.RouteExecutionCompleted, WidgetEvent.RouteExecutionFailed,
      WidgetEvent.RouteHighValueLoss,
    ].map(event => {
      const handler = (payload: unknown) => {
        try { tracker.current?.handle(event, payload, latest.current.feature); } catch { /* Telemetry must not affect execution. */ }
      };
      events.on(event as any, handler);
      return { event, handler };
    });
    const changed = () => latest.current.onFormChanged?.();
    events.on(WidgetEvent.SourceChainTokenSelected, changed);
    events.on(WidgetEvent.DestinationChainTokenSelected, changed);
    events.on(WidgetEvent.FormFieldChanged, changed);
    return () => {
      for (const { event, handler } of handlers) events.off(event as any, handler);
      events.off(WidgetEvent.SourceChainTokenSelected, changed);
      events.off(WidgetEvent.DestinationChainTokenSelected, changed);
      events.off(WidgetEvent.FormFieldChanged, changed);
    };
  }, [events]);
  return null;
}
