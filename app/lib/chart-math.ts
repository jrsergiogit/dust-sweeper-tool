export function chartHeights(sessions: number, recoveries: number, max: number, pixels = 180) {
  const scale = pixels / Math.max(1, max);
  return {
    sessions: sessions > 0 ? Math.max(1, Math.round(sessions * scale)) : 0,
    recoveries: recoveries > 0 ? Math.max(1, Math.round(recoveries * scale)) : 0,
  };
}
