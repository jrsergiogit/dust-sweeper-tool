/** Helpers de carteira: deep links (handoff do Chrome mobile para o navegador da carteira) e config do widget. */

export const SITE_HOST = 'dustsweepertool.com';
export type WalletApp = 'metamask' | 'trust' | 'coinbase';

/** Chave estavel do ativo escolhido: "chainId:native" ou "chainId:0xendereco" (minusculo). */
export function assetHandoffKey(chainId: string, tokenAddress: string, native: boolean): string {
  return `${chainId}:${native || !tokenAddress ? 'native' : tokenAddress.toLowerCase()}`;
}
export const HANDOFF_ASSET_RE = /^\d{1,10}:(native|0x[0-9a-f]{40})$/;

/** Abre o site DENTRO do app da carteira, ja com o endereco escaneado e o ativo escolhido. */
export function walletHandoffUrl(app: WalletApp, address: string, asset: string): string {
  const q = new URLSearchParams();
  if (address) q.set('wallet', address);
  if (asset) q.set('asset', asset);
  const qs = q.toString() ? `?${q.toString()}` : '';
  if (app === 'metamask') return `https://metamask.app.link/dapp/${SITE_HOST}${qs}`;
  const target = encodeURIComponent(`https://${SITE_HOST}/${qs}`);
  return app === 'trust' ? `https://link.trustwallet.com/open_url?url=${target}` : `https://go.cb-w.com/dapp?cb_url=${target}`;
}

/** Config de carteira do widget. Defina NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID para usar o SEU projeto Reown/WalletConnect. */
export function buildWalletConfig() {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  const icon = `https://${SITE_HOST}/logo.png`;
  return {
    ...(projectId ? { walletConnect: { projectId, metadata: {
      name: 'Dust Sweeper Tool', description: 'Find forgotten crypto, swap and bridge.', url: `https://${SITE_HOST}`, icons: [icon],
    } } } : {}),
    metaMask: { dappMetadata: { name: 'Dust Sweeper Tool', url: `https://${SITE_HOST}`, iconUrl: icon } },
    coinbase: { appName: 'Dust Sweeper Tool', appLogoUrl: icon },
  };
}
