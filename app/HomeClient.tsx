'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import WidgetMonitor from './components/WidgetMonitor';
import FinderIntro from './components/FinderIntro';
import { visibleAssets, displayAssetAmount } from './lib/finder-ux';
import { type WidgetFeature, type WidgetState } from './lib/widget-tracker';
import { type PreflightState, checkInitialQuote } from './lib/preflight';
import { recoveryAmounts, scanBuckets } from './lib/recovery-math';
import { COMMISSION_WALLET, DENIED_EXCHANGES, NATIVE_ADDRESS, RECOVERY_FEE, RECOVERY_INTEGRATOR, RECOVERY_SLIPPAGE, RECOVERY_MAX_PRICE_IMPACT } from './lib/lifi-config';
import { getBrowserLanguage, trackDustEvent } from './lib/dust-analytics';

const LiFiWidget = dynamic(() => import('@lifi/widget').then((module) => module.LiFiWidget), { ssr: false, loading: () => <div role="status" className="p-8 text-center text-sm text-gray-300">Loading recovery tools...<p className="mt-2 text-gray-400">Your wallet is not connected automatically.</p></div> });

/** Matching inline SVGs: no icon package, external request or extra dependency. */
function ToolIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    finder: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5M10.5 7.5v6M7.5 10.5h6" /></>,
    alchemy: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 8h18M21 12h-5a2 2 0 0 0 0 4h5M6 5V3h12v2" /><circle cx="16.5" cy="14" r=".65" fill="currentColor" stroke="none" /></>,
    bridge: <><path d="M2 17h20M5 7v14M19 7v14M5 9c4 5 10 5 14 0M9 12v5M15 12v5M2 10l3-1M19 9l3 1" /></>,
    swap: <><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4" /></>,
    safety: <><path d="m12 3 8 3v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V6l8-3Z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  };
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="h-[26px] w-[26px]">
      {icons[name] ?? icons.finder}
    </svg>
  );
}

// --- SUA CARTEIRA PARA RECEBIMENTO DE COMISSÕES / PAGAMENTO ---
const MY_WALLET = COMMISSION_WALLET;

// Polygon USDC (6 decimals)
const POLYGON_USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

type NativeTokenInfo = { name: string; symbol: string };

const NATIVE_BY_CHAIN_ID: Record<string, NativeTokenInfo> = {
  '1': { name: 'Ethereum', symbol: 'ETH' },
  '10': { name: 'Ethereum', symbol: 'ETH' },
  '25': { name: 'Cronos', symbol: 'CRO' },
  '56': { name: 'BNB', symbol: 'BNB' },
  '100': { name: 'Gnosis', symbol: 'xDAI' },
  '137': { name: 'Polygon', symbol: 'POL' },
  '250': { name: 'Fantom', symbol: 'FTM' },
  '324': { name: 'Ethereum', symbol: 'ETH' },
  '1088': { name: 'Metis', symbol: 'METIS' },
  '1101': { name: 'Polygon zkEVM', symbol: 'ETH' },
  '1284': { name: 'Moonbeam', symbol: 'GLMR' },
  '1285': { name: 'Moonriver', symbol: 'MOVR' },
  '42161': { name: 'Ethereum', symbol: 'ETH' },
  '42220': { name: 'Celo', symbol: 'CELO' },
  '43114': { name: 'Avalanche', symbol: 'AVAX' },
  '59144': { name: 'Ethereum', symbol: 'ETH' },
  '81457': { name: 'Blast', symbol: 'ETH' },
  '8453': { name: 'Ethereum', symbol: 'ETH' },
  '11155111': { name: 'Ethereum', symbol: 'ETH' },
  '534352': { name: 'Ethereum', symbol: 'ETH' },
  '7777777': { name: 'Zora', symbol: 'ETH' },
};

const NATIVE_BY_NETWORK: Record<string, NativeTokenInfo> = {
  ethereum: { name: 'Ethereum', symbol: 'ETH' },
  eth: { name: 'Ethereum', symbol: 'ETH' },
  mainnet: { name: 'Ethereum', symbol: 'ETH' },

  bsc: { name: 'BNB', symbol: 'BNB' },
  bnb: { name: 'BNB', symbol: 'BNB' },
  bnbchain: { name: 'BNB', symbol: 'BNB' },
  bnbsmartchain: { name: 'BNB', symbol: 'BNB' },
  bnbmainnet: { name: 'BNB', symbol: 'BNB' },
  binancesmartchainmainnet: { name: 'BNB', symbol: 'BNB' },
  binance: { name: 'BNB', symbol: 'BNB' },
  binancesmartchain: { name: 'BNB', symbol: 'BNB' },

  polygon: { name: 'Polygon', symbol: 'POL' },
  matic: { name: 'Polygon', symbol: 'POL' },
  polygonpos: { name: 'Polygon', symbol: 'POL' },
  polygonmainnet: { name: 'Polygon', symbol: 'POL' },
  polygonposmainnet: { name: 'Polygon', symbol: 'POL' },

  arbitrum: { name: 'Ethereum', symbol: 'ETH' },
  arbitrumone: { name: 'Ethereum', symbol: 'ETH' },
  optimism: { name: 'Ethereum', symbol: 'ETH' },
  op: { name: 'Ethereum', symbol: 'ETH' },
  base: { name: 'Ethereum', symbol: 'ETH' },
  zksync: { name: 'Ethereum', symbol: 'ETH' },
  zksyncera: { name: 'Ethereum', symbol: 'ETH' },
  scroll: { name: 'Ethereum', symbol: 'ETH' },
  linea: { name: 'Ethereum', symbol: 'ETH' },
  blast: { name: 'Blast', symbol: 'ETH' },
  zora: { name: 'Zora', symbol: 'ETH' },

  avalanche: { name: 'Avalanche', symbol: 'AVAX' },
  avalanchecchain: { name: 'Avalanche', symbol: 'AVAX' },
  fantom: { name: 'Fantom', symbol: 'FTM' },
  cronos: { name: 'Cronos', symbol: 'CRO' },
  celo: { name: 'Celo', symbol: 'CELO' },
  gnosis: { name: 'Gnosis', symbol: 'xDAI' },
  xdai: { name: 'Gnosis', symbol: 'xDAI' },
  metis: { name: 'Metis', symbol: 'METIS' },
  moonbeam: { name: 'Moonbeam', symbol: 'GLMR' },
  moonriver: { name: 'Moonriver', symbol: 'MOVR' },
};

function normalizeNetworkKey(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function getTokenDisplay(token: any): NativeTokenInfo {
  const rawSymbol = String(
    token?.symbol ?? token?.tokenSymbol ?? token?.metadata?.symbol ?? ''
  ).trim();

  const rawName = String(
    token?.name ?? token?.tokenName ?? token?.metadata?.name ?? ''
  ).trim();

  const isUnknownName =
    !rawName ||
    rawName.toLowerCase() === 'unknown token' ||
    rawName.toLowerCase() === 'unknown' ||
    rawName.toUpperCase() === 'NATIVE';

  const rawAddress = String(token?.tokenAddress ?? token?.contractAddress ?? token?.address ?? '').trim();
  const normalizedAddress = rawAddress.toLowerCase();
  const isZeroAddress = !rawAddress || normalizedAddress === '0x0000000000000000000000000000000000000000' || normalizedAddress === '0x0000000000000000000000000000000000001010';
  const chainIdForDisplay = String(token?.chainId ?? token?.chain_id ?? token?.networkId ?? token?.network_id ?? token?.chain?.id ?? token?.network?.id ?? token?.network?.chainId ?? token?.metadata?.chainId ?? '');
  const isPolygonNativeMatic = chainIdForDisplay === '137' && rawSymbol.toUpperCase() === 'MATIC' && isZeroAddress;

  const isNative = isZeroAddress && (rawSymbol.toUpperCase() === 'NATIVE' || isPolygonNativeMatic || !rawSymbol);

  if (isNative) {
    const chainCandidates = [
      token?.chainId,
      token?.chain_id,
      token?.networkId,
      token?.network_id,
      token?.chain?.id,
      token?.network?.id,
      token?.network?.chainId,
      token?.metadata?.chainId,
    ]
      .filter((value) => value !== undefined && value !== null && String(value) !== '')
      .map((value) => String(value));

    for (const chainId of chainCandidates) {
      if (NATIVE_BY_CHAIN_ID[chainId]) return NATIVE_BY_CHAIN_ID[chainId];
    }

    const networkCandidates = [
      token?.network,
      token?.networkName,
      token?.chainName,
      token?.chain,
      token?.network?.name,
      token?.chain?.name,
      token?.metadata?.network,
    ];

    for (const candidate of networkCandidates) {
      if (typeof candidate !== 'string') continue;
      const networkKey = normalizeNetworkKey(candidate);
      if (NATIVE_BY_NETWORK[networkKey]) return NATIVE_BY_NETWORK[networkKey];
    }

    return {
      name: 'Native token',
      symbol: 'NATIVE',
    };
  }

  return {
    symbol: rawSymbol || 'UNKNOWN',
    name: isUnknownName ? (rawSymbol || 'Unknown token') : rawName,
  };
}

function getTokenChainId(token: any): string {
  const directCandidates = [
    token?.chainId,
    token?.chain_id,
    token?.networkId,
    token?.network_id,
    token?.chain?.id,
    token?.network?.id,
    token?.network?.chainId,
    token?.metadata?.chainId,
  ];

  for (const candidate of directCandidates) {
    if (candidate !== undefined && candidate !== null && String(candidate) !== '') return String(candidate);
  }

  const networkCandidates = [
    token?.network,
    token?.networkName,
    token?.chainName,
    token?.chain,
    token?.network?.name,
    token?.chain?.name,
    token?.metadata?.network,
  ];

  for (const candidate of networkCandidates) {
    if (typeof candidate !== 'string') continue;
    const key = normalizeNetworkKey(candidate);
    const mapping: Record<string, string> = {
      ethereum: '1', eth: '1', mainnet: '1',
      bsc: '56', bnb: '56', bnbchain: '56', bnbsmartchain: '56', bnbmainnet: '56', binance: '56', binancesmartchain: '56', binancesmartchainmainnet: '56',
      polygon: '137', matic: '137', polygonpos: '137', polygonmainnet: '137', polygonposmainnet: '137',
      arbitrum: '42161', arbitrumone: '42161',
      optimism: '10', op: '10',
      base: '8453',
      avalanche: '43114', avalanchecchain: '43114',
      fantom: '250', cronos: '25', celo: '42220', gnosis: '100', xdai: '100',
      metis: '1088', moonbeam: '1284', moonriver: '1285',
      zksync: '324', zksyncera: '324', scroll: '534352', linea: '59144', blast: '81457', zora: '7777777',
    };
    if (mapping[key]) return mapping[key];
  }

  return '';
}

function getTokenAddress(token: any): string {
  const raw = String(token?.tokenAddress ?? token?.contractAddress ?? token?.address ?? '').trim();
  // Contract addresses, not user-controlled token symbols, determine native currency.
  return isNativeTokenAddress(raw) ? NATIVE_ADDRESS : raw;
}

function getTokenBalanceNumber(token: any): number {
  const candidates = [
    token?.balance,
    token?.tokenBalance,
    token?.amount,
    token?.quantity,
    token?.balanceFormatted,
  ];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null || candidate === '') continue;
    const value = Number(candidate);
    if (Number.isFinite(value)) return value;
  }

  return 0;
}

function hasPositiveWalletBalance(token: any): boolean {
  return getTokenBalanceNumber(token) > 0;
}

function isNativeTokenAddress(address: string): boolean {
  const a = String(address || '').toLowerCase();
  return !a ||
    a === '0x0000000000000000000000000000000000000000' ||
    a === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ||
    a === '0x0000000000000000000000000000000000001010';
}

function getNetworkDisplay(token: any): string {
  const chainId = getTokenChainId(token);
  const byId: Record<string, string> = {
    '1': 'Ethereum', '10': 'Optimism', '25': 'Cronos', '56': 'BNB Chain', '100': 'Gnosis',
    '137': 'Polygon', '250': 'Fantom', '324': 'zkSync Era', '1088': 'Metis', '1101': 'Polygon zkEVM',
    '1284': 'Moonbeam', '1285': 'Moonriver', '42161': 'Arbitrum', '42220': 'Celo', '43114': 'Avalanche',
    '59144': 'Linea', '81457': 'Blast', '8453': 'Base', '534352': 'Scroll', '7777777': 'Zora',
  };
  if (byId[chainId]) return byId[chainId];
  if (typeof token?.network === 'string') return token.network;
  return token?.network?.name || token?.chainName || (chainId ? `Chain ${chainId}` : 'Unknown network');
}

function isValidAddress(addr: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getPricedAssetsValue(tokens: any[]): number {
  return tokens.reduce((sum: number, token: any) => {
    const price = Number(token?.priceUsd || 0);
    const value = Number(token?.valueUsd || 0);
    return sum + (Number.isFinite(price) && price > 0 && Number.isFinite(value) ? value : 0);
  }, 0);
}

function getUnpricedAssetsCount(tokens: any[]): number {
  return tokens.filter((token: any) => Number(token?.priceUsd || 0) <= 0).length;
}

function formatUsd(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return '0.00';
  const abs = Math.abs(n);
  const decimals = abs >= 1 ? 2 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 12;
  const fixed = n.toFixed(decimals);
  const trimmed = fixed.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
  const [whole, fraction] = trimmed.split('.');
  const normalizedFraction = fraction ? fraction.padEnd(2, '0') : '00';
  return `${whole}.${normalizedFraction}`;
}


const EMPTY_WIDGET_STATE: WidgetState = { status: 'idle', message: '', busy: false };

export default function AppPortal() {
  const [activeTab, setActiveTab] = useState('finder');

  // Finder
  const [scanStep, setScanStep] = useState<'initial' | 'scanning' | 'result'>('initial');
  const [userAddressInput, setUserAddressInput] = useState('');
  const [foundBalance, setFoundBalance] = useState('0.00');
  const [foundTokens, setFoundTokens] = useState<any[]>([]);
  const [refreshingFinderBalances, setRefreshingFinderBalances] = useState(false);
  const [tokenRiskChecks, setTokenRiskChecks] = useState<Record<string, { status: 'loading' | 'success' | 'empty' | 'error'; result?: any }>>({});
  const tokenRiskKey = (token: any) => `${String(getTokenChainId(token) || '')}:${String(getTokenAddress(token) || '').toLowerCase()}`;

  const [portfolioTokens, setPortfolioTokens] = useState<any[]>([]);
  const [portfolioTotal, setPortfolioTotal] = useState('0.00');
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioAddress, setPortfolioAddress] = useState('');
  const [portfolioResultAddress, setPortfolioResultAddress] = useState('');
  const [portfolioError, setPortfolioError] = useState('');
  const [selectedRecoveryToken, setSelectedRecoveryToken] = useState<any | null>(null);
  const [isWalletBrowser, setIsWalletBrowser] = useState(false);
  const recoverySectionRef = useRef<HTMLDivElement | null>(null);
  const [routePreflight, setRoutePreflight] = useState<PreflightState>({ status: 'idle' });
  const [recoveryWidgetNonce, setRecoveryWidgetNonce] = useState(0);
  const [finderAddress, setFinderAddress] = useState('');
  const [scanError, setScanError] = useState('');
  const [scanWarning, setScanWarning] = useState('');
  const [portfolioWarning, setPortfolioWarning] = useState('');
  const [portfolioScanned, setPortfolioScanned] = useState(false);
  const [widgetEdited, setWidgetEdited] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [assetNetwork, setAssetNetwork] = useState('all');
  const [assetFilter, setAssetFilter] = useState<'all' | 'priced' | 'unpriced'>('all');
  const [shareMessage, setShareMessage] = useState('');
  const [toolReady, setToolReady] = useState(false);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [widgetStates, setWidgetStates] = useState<Record<WidgetFeature, WidgetState>>({
    finder: EMPTY_WIDGET_STATE, swap: EMPTY_WIDGET_STATE, bridge: EMPTY_WIDGET_STATE, safety: EMPTY_WIDGET_STATE,
  });
  const scanInFlight = useRef(false);
  const lastOpened = useRef('');
  const assetListRef = useRef<HTMLDivElement | null>(null);
  const analyticsBuckets = useMemo(() => scanBuckets(foundTokens), [foundTokens]);
  const executionBusy = Object.values(widgetStates).some(state => state.busy);
  const currentFeature: WidgetFeature = activeTab === 'swap' || activeTab === 'bridge' || activeTab === 'safety' ? activeTab : 'finder';
  const recoveryState = widgetStates.finder;
  const visibleFinderAssets = useMemo(() => visibleAssets(foundTokens, {
    price: assetFilter, search: assetSearch, network: assetNetwork,
  }, getNetworkDisplay, getTokenDisplay), [foundTokens, assetFilter, assetSearch, assetNetwork]);
  const finderNetworks = useMemo(() => [...new Set(foundTokens.map(getNetworkDisplay))].sort(), [foundTokens]);

  // Detect wallet in-app browsers so mobile users see launch buttons in Chrome,
  // but see the LI.FI widget after the same site opens inside their wallet.
  useEffect(() => {
    const userAgent = navigator.userAgent || '';
    const provider = (window as any).ethereum;
    const providers = Array.isArray(provider?.providers) ? provider.providers : [provider];
    const walletUserAgent = /MetaMask|TrustWallet|CoinbaseWallet|Coinbase Wallet|Rainbow|UniswapWallet|OKX/i.test(userAgent);
    const injectedWallet = providers.some((item: any) => Boolean(
      item?.isMetaMask || item?.isTrust || item?.isCoinbaseWallet || item?.isRainbow || item?.isOkxWallet
    ));
    setIsWalletBrowser(walletUserAgent || injectedWallet);
  }, []);

  // Check security indicators per contract independently of token pricing.
  useEffect(() => {
    let cancelled = false;
    const checkTokens = async () => {
      const candidates = foundTokens.filter((token: any) => {
        const address = String(getTokenAddress(token) || '');
        const chainId = String(getTokenChainId(token) || '');
        return /^0x[a-fA-F0-9]{40}$/.test(address) && Boolean(chainId);
      });
      for (const token of candidates) {
        if (cancelled) return;
        const key = tokenRiskKey(token);
        if (tokenRiskChecks[key]) continue;
        const address = String(getTokenAddress(token));
        const chainId = String(getTokenChainId(token));
        setTokenRiskChecks((prev) => ({ ...prev, [key]: { status: 'loading' } }));
        try {
          const response = await fetch(`/api/token-security?chainId=${encodeURIComponent(chainId)}&address=${encodeURIComponent(address)}`, { cache: 'no-store' });
          if (!response.ok) throw new Error('Security lookup unavailable');
          const payload = await response.json();
          if (cancelled) return;
          setTokenRiskChecks((prev) => ({
            ...prev,
            [key]: payload?.status === 'success' && payload?.result
              ? { status: 'success', result: payload.result }
              : { status: 'empty' },
          }));
        } catch {
          if (!cancelled) setTokenRiskChecks((prev) => ({ ...prev, [key]: { status: 'error' } }));
        }
      }
    };
    if (foundTokens.length) void checkTokens();
    return () => { cancelled = true; };
  // tokenRiskChecks intentionally omitted: do not restart the scan when a check result updates.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundTokens]);


  // Scam Detector
  const [tokenToScan, setTokenToScan] = useState('');
  const [safetyStep, setSafetyStep] = useState<'initial' | 'scanning' | 'result'>('initial');
  const [safetyResult, setSafetyResult] = useState<any>(null);
  const [safetyError, setSafetyError] = useState('');

  useEffect(() => {
    const readTool = () => {
      const tool = new URLSearchParams(window.location.search).get('tool');
      const allowed: Record<string, string> = { finder: 'finder', wallet: 'alchemy', alchemy: 'alchemy', bridge: 'bridge', swap: 'swap', safety: 'safety', 'scam-scan': 'safety' };
      if (tool && allowed[tool]) setActiveTab(allowed[tool]);
    };
    readTool(); setToolReady(true);
  }, []);

  useEffect(() => {
    if (!toolReady || lastOpened.current === activeTab) return;
    lastOpened.current = activeTab;
    const event = ({ finder: 'finder_opened', alchemy: 'wallet_opened', bridge: 'bridge_opened', swap: 'swap_opened', safety: 'scam_scan_opened' } as Record<string, string>)[activeTab];
    trackDustEvent(event, { feature: activeTab === 'alchemy' ? 'wallet' : activeTab, language: getBrowserLanguage() });
  }, [activeTab, toolReady]);

  useEffect(() => {
    if (!executionBusy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [executionBusy]);

  const selectTool = (tab: string) => {
    if (executionBusy) return;
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tool', tab === 'alchemy' ? 'wallet' : tab);
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  };

  // --- GOPLUS TOKEN DATA (MULTICHAIN) ---
  const checkTokenSafety = async (contract: string) => {
    const normalizedContract = contract.trim().toLowerCase();
    const chainsToCheck = [
      { id: '56', name: 'BNB Chain' },
      { id: '137', name: 'Polygon' },
      { id: '1', name: 'Ethereum' },
      { id: '42161', name: 'Arbitrum' },
      { id: '10', name: 'Optimism' },
      { id: '8453', name: 'Base' },
    ];

    const responses = await Promise.all(
      chainsToCheck.map(async (chain) => {
        try {
          const response = await fetch(
            `https://api.gopluslabs.io/api/v1/token_security/${chain.id}?contract_addresses=${normalizedContract}`,
            { cache: 'no-store', signal: AbortSignal.timeout(12000) }
          );

          if (!response.ok) {
            return { chain, status: 'error' as const };
          }

          const data = await response.json().catch(() => null);
          const securityData = data?.result?.[normalizedContract];

          if (!securityData || typeof securityData !== 'object') {
            return { chain, status: 'empty' as const };
          }

          return { chain, status: 'success' as const, securityData };
        } catch {
          return { chain, status: 'error' as const };
        }
      })
    );

    const matches = responses.filter((item) => item.status === 'success') as Array<{
      chain: { id: string; name: string };
      status: 'success';
      securityData: Record<string, any>;
    }>;

    const failedNetworks = responses
      .filter((item) => item.status === 'error')
      .map((item) => item.chain.name);

    if (!matches.length) {
      if (failedNetworks.length > 0) {
        return {
          status: 'error',
          failedNetworks,
          checkedNetworks: chainsToCheck.map((chain) => chain.name),
        };
      }

      return {
        status: 'empty',
        failedNetworks: [],
        checkedNetworks: chainsToCheck.map((chain) => chain.name),
      };
    }

    const primary = matches[0];
    const securityData = primary.securityData;
    const networksFound = matches.map((item) => item.chain);

    return {
      status: 'success',
      isHoneypot: securityData.is_honeypot,
      buyTax: securityData.buy_tax,
      sellTax: securityData.sell_tax,
      isMintable: securityData.is_mintable,
      isProxy: securityData.is_proxy,
      isOpenSource: securityData.is_open_source,
      isBlacklisted: securityData.is_blacklisted,
      canTakeBackOwnership: securityData.can_take_back_ownership,
      hiddenOwner: securityData.hidden_owner,
      transferPausable: securityData.transfer_pausable,
      tradingCooldown: securityData.trading_cooldown,
      selfDestruct: securityData.selfdestruct,
      holderCount: securityData.holder_count,
      tokenName: securityData.token_name,
      tokenSymbol: securityData.token_symbol,
      detectedChain: primary.chain.id,
      detectedNetwork: primary.chain.name,
      networksFound,
      failedNetworks,
    };
  };

  const handleSafetyScan = async () => {
    const normalized = tokenToScan.trim();

    if (!isValidAddress(normalized)) {
      setSafetyError('Enter a valid 0x contract address.');
      setSafetyResult(null);
      setSafetyStep('initial');
      return;
    }

    setSafetyError('');
    setSafetyAcknowledged(false);
    trackDustEvent('scam_scan_started', { feature: 'safety', language: getBrowserLanguage() });
    setSafetyResult(null);
    setSafetyStep('scanning');

    const result = await checkTokenSafety(normalized);

    if (result?.status === 'error') {
      trackDustEvent('scam_scan_failed', { feature: 'safety', error_category: 'provider_error' });
      setSafetyError(
        `GoPlus could not verify this contract right now. Some network requests failed: ${result.failedNetworks.join(', ')}. Please try again later.`
      );
      setSafetyStep('initial');
      return;
    }

    if (result?.status === 'empty') {
      trackDustEvent('scam_scan_completed', { feature: 'safety', result: 'no_data' });
      setSafetyError(
        'No GoPlus data was returned for this address on the checked networks. This does not mean the token is safe or unsafe.'
      );
      setSafetyStep('initial');
      return;
    }

    trackDustEvent('scam_scan_completed', { feature: 'safety', result: 'data_returned', chain_id: String(result.detectedChain || '') });
    setSafetyResult(result);
    setSafetyStep('result');
  };

  const fetchRealBalances = async (address: string) => {
    try {
      const response = await fetch('/api/alchemy/tokens', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address }), signal: AbortSignal.timeout(25000),
      });
      const data = await response.json();
      if (!response.ok) return { error: data?.error || 'Unable to scan the wallet right now.', category: data?.category || (response.status === 429 ? 'rate_limited' : 'provider_error') };
      return data;
    } catch (error) {
      return { error: 'The scan could not finish. Please check your connection and try again.', category: error instanceof Error && /timeout|abort/i.test(error.name) ? 'timeout' : 'network_error' };
    }
  };

  const scanWarningText = (result: any) => {
    const failed = Array.isArray(result?.failedNetworks) ? result.failedNetworks : [];
    if (failed.length) return `Some networks could not be checked (${failed.join(', ')}). The results below are incomplete; scan again later.`;
    if (result?.moreResults) return 'The provider returned a partial set of assets. These results may not include all balances.';
    return '';
  };

  const handleScan = async () => {
    if (scanInFlight.current || executionBusy) return;
    if (!isValidAddress(userAddressInput)) { setScanError('Enter a valid public EVM wallet address starting with 0x.'); return; }
    const address = userAddressInput.trim();
    scanInFlight.current = true;
    setScanError(''); setScanWarning(''); setScanStep('scanning');
    trackDustEvent('wallet_scan_started', { feature: 'finder', language: getBrowserLanguage() });
    // Existing Google Ads conversion is unchanged: this is a scan start, not revenue.
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') gtag('event', 'conversion', { send_to: 'AW-10796225601/yRUoCOahioodEMGohZwo' });
    try {
      const result = await fetchRealBalances(address);
      if (result?.error) {
        trackDustEvent('wallet_scan_failed', { feature: 'finder', error_category: result.category || 'provider_error' });
        setScanError(result.error); setScanStep('initial'); return;
      }
      const assets = Array.isArray(result.tokens) ? result.tokens.filter(hasPositiveWalletBalance) : [];
      const buckets = scanBuckets(assets);
      trackDustEvent('wallet_scan_completed', { feature: 'finder', language: getBrowserLanguage(), ...buckets,
        result: assets.length ? 'assets_found' : 'no_assets', partial_results: Boolean(result.partial),
        failed_network_count: result.failedNetworks?.length || 0,
      });
      if (assets.length) trackDustEvent('wallet_assets_found', { feature: 'finder', ...buckets });
      setFoundTokens(assets); setFoundBalance(formatUsd(getPricedAssetsValue(assets)));
      setFinderAddress(address); setAssetFilter('all'); setAssetSearch(''); setAssetNetwork('all'); setScanWarning(scanWarningText(result));
      setSelectedRecoveryToken(null); setWidgetEdited(false); setScanStep('result');
    } finally { scanInFlight.current = false; }
  };

  const canLeaveRecovery = () => {
    if (executionBusy) return false;
    return !recoveryState.partial || window.confirm('Some transfer steps may already have completed. Review their status in LI.FI first. Leave these transaction details and choose a new operation?');
  };
  const handleResetScan = () => {
    if (!canLeaveRecovery()) return;
    setScanStep('initial'); setUserAddressInput(''); setFinderAddress(''); setFoundBalance('0.00'); setFoundTokens([]);
    setSelectedRecoveryToken(null); setRoutePreflight({ status: 'idle' }); setWidgetEdited(false);
    setScanError(''); setScanWarning(''); setShareMessage('');
    setWidgetStates(current => ({ ...current, finder: EMPTY_WIDGET_STATE }));
  };
  const chooseAnotherAsset = async () => {
    if (!canLeaveRecovery()) return;
    setSelectedRecoveryToken(null); setWidgetEdited(false); setRoutePreflight({ status: 'idle' });
    setWidgetStates(current => ({ ...current, finder: EMPTY_WIDGET_STATE }));
    setRefreshingFinderBalances(true);
    setScanWarning('');
    try {
      const result = await fetchRealBalances(finderAddress);
      if (result?.error) {
        setScanWarning(`Could not refresh wallet balances. Showing the previous scan results. ${result.error}`);
      } else {
        const hasIncompleteNetworks = Array.isArray(result?.failedNetworks) && result.failedNetworks.length > 0;
        const incomplete = hasIncompleteNetworks || Boolean(result?.moreResults) || Boolean(result?.partial);
        if (incomplete) {
          setScanWarning('Wallet balances could not be fully refreshed. Showing the previous scan results; try a new scan shortly.');
        } else {
          const freshAssets = Array.isArray(result?.tokens) ? result.tokens.filter(hasPositiveWalletBalance) : [];
          setFoundTokens(freshAssets);
          setFoundBalance(formatUsd(getPricedAssetsValue(freshAssets)));
          setScanWarning('');
        }
      }
    } catch {
      setScanWarning('Could not refresh wallet balances. Showing the previous scan results.');
    } finally {
      setRefreshingFinderBalances(false);
      window.setTimeout(() => assetListRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }), 0);
    }
  };
  const selectRecoveryToken = (token: any) => {
    if (!canLeaveRecovery()) return;
    trackDustEvent('recovery_asset_selected', { feature: 'finder', language: getBrowserLanguage(), chain_id: getTokenChainId(token), ...analyticsBuckets });
    setWidgetEdited(false); setRoutePreflight({ status: 'idle' }); setShareMessage('');
    setWidgetStates(current => ({ ...current, finder: EMPTY_WIDGET_STATE }));
    setRecoveryWidgetNonce(n => n + 1); setSelectedRecoveryToken(token);
    window.setTimeout(() => recoverySectionRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }), 80);
  };
  const shareRecovery = async () => {
    const text = 'I completed a crypto operation with Dust Sweeper. Explore your wallet at https://dustsweepertool.com';
    try {
      if (navigator.share) await navigator.share({ title: 'Dust Sweeper', text, url: 'https://dustsweepertool.com' });
      else { await navigator.clipboard.writeText(text); setShareMessage('Link copied.'); }
    } catch { setShareMessage('Sharing was cancelled or unavailable.'); }
  };

  const loadPortfolio = async () => {
    if (portfolioLoading) return;
    if (!isValidAddress(portfolioAddress)) { setPortfolioError('Enter a valid 0x wallet address.'); return; }
    const scannedAddress = portfolioAddress.trim();
    setPortfolioLoading(true); setPortfolioError(''); setPortfolioWarning('');
    trackDustEvent('portfolio_scan_started', { feature: 'wallet', language: getBrowserLanguage() });
    const result = await fetchRealBalances(scannedAddress);
    setPortfolioLoading(false);
    if (result?.error) {
      trackDustEvent('portfolio_scan_failed', { feature: 'wallet', error_category: result.category || 'provider_error' });
      setPortfolioError(result.error); return;
    }
    const assets = Array.isArray(result.tokens) ? result.tokens.filter(hasPositiveWalletBalance) : [];
    setPortfolioTokens(assets); setPortfolioTotal(formatUsd(getPricedAssetsValue(assets)));
    setPortfolioResultAddress(scannedAddress);
    setPortfolioScanned(true); setPortfolioWarning(scanWarningText(result));
    trackDustEvent('portfolio_scan_completed', { feature: 'wallet', result: assets.length ? 'assets_found' : 'no_assets', ...scanBuckets(assets) });
    // A Wallet scan must not overwrite the Finder's address or results.
  };

  useEffect(() => {
    if (!selectedRecoveryToken || widgetEdited || isNativeTokenAddress(getTokenAddress(selectedRecoveryToken))) {
      setRoutePreflight({ status: 'idle' }); return;
    }
    const controller = new AbortController();
    const input = {
      chainId: getTokenChainId(selectedRecoveryToken), fromToken: getTokenAddress(selectedRecoveryToken),
      fromAddress: finderAddress, fromAmount: recoveryAmounts(selectedRecoveryToken).baseUnits,
    };
    const timer = window.setTimeout(async () => {
      setRoutePreflight({ status: 'checking', message: 'Checking an initial quote. The final options are shown inside LI.FI.' });
      try {
        const state = await checkInitialQuote(input, controller.signal, (window as any).ethereum);
        if (controller.signal.aborted) return;
        setRoutePreflight(state);
        trackDustEvent(['no-route', 'error', 'incomplete'].includes(state.status) ? 'recovery_quote_failed' : 'recovery_quote_available', {
          feature: 'finder', ...analyticsBuckets, chain_id: input.chainId, quote_status: state.status,
          error_category: state.category, route_tool: state.tool,
        });
      } catch { /* An obsolete request is intentionally discarded. */ }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [selectedRecoveryToken, finderAddress, widgetEdited, analyticsBuckets]);

  // Configuracoes LiFi (mantidas iguais, adaptadas apenas nas cores do theme se necessário)
  const finderConfig = useMemo(() => {
    const chainId = selectedRecoveryToken ? getTokenChainId(selectedRecoveryToken) : '';
    const tokenAddress = selectedRecoveryToken ? getTokenAddress(selectedRecoveryToken) : '';
    const native = isNativeTokenAddress(tokenAddress);
    const amount = selectedRecoveryToken ? recoveryAmounts(selectedRecoveryToken) : { human: '0', baseUnits: '0' };
    return {
      integrator: RECOVERY_INTEGRATOR, fee: RECOVERY_FEE, referrer: MY_WALLET,
      exchanges: { deny: [...DENIED_EXCHANGES] },
      ...(chainId ? { fromChain: Number(chainId), toChain: Number(chainId) } : {}),
      ...(tokenAddress ? { fromToken: tokenAddress } : {}),
      // Native coins need an explicit destination choice, not ETH->ETH/BNB->BNB.
      toToken: native ? '' : NATIVE_ADDRESS,
      ...(amount.baseUnits !== '0' ? { fromAmount: amount.human } : {}),
      useRelayerRoutes: true, slippage: RECOVERY_SLIPPAGE, maxPriceImpact: RECOVERY_MAX_PRICE_IMPACT,
      routePriority: 'RECOMMENDED' as const,
      formUpdateKey: `${chainId}-${tokenAddress}-${amount.human}-${recoveryWidgetNonce}`,
      appearance: 'dark' as const, variant: 'compact' as const,
      theme: {
        palette: { primary: { main: '#8B5CF6' }, background: { paper: '#121215', default: '#09090b' } },
        container: { display: 'flex', height: 'auto', maxHeight: 'none', overflow: 'visible', backgroundColor: '#09090b' },
      },
      disabledUI: ['walletHeader', 'appearance', 'poweredBy'],
    };
  }, [selectedRecoveryToken, recoveryWidgetNonce]);
  const safetyBuyConfig = useMemo(() => ({ integrator: 'DustSweeper', fee: 0.05, referrer: MY_WALLET, exchanges: { deny: ['nordstern'] }, toChain: safetyResult?.detectedChain ? parseInt(safetyResult.detectedChain) : 56, toToken: tokenToScan, appearance: 'dark' as const, variant: 'compact' as const, theme: { palette: { primary: { main: '#8B5CF6' }, background: { paper: '#121215', default: '#09090b' } }, container: { display: 'flex', height: 'auto', maxHeight: 'none', overflow: 'visible', backgroundColor: '#09090b' } } }), [tokenToScan, safetyResult]);
  const swapConfig = useMemo(() => ({ integrator: 'DustSweeper', referrer: MY_WALLET, fee: 0.01, exchanges: { deny: ['nordstern'] }, appearance: 'dark' as const, variant: 'compact' as const, fromChain: 56, toChain: 56, fromToken: '0x0000000000000000000000000000000000000000', toToken: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', fromAmount: 0.01, slippage: 0.03, routePriority: 'CHEAPEST' as const, theme: { palette: { primary: { main: '#8B5CF6' }, background: { paper: '#121215', default: '#09090b' } }, container: { display: 'flex', height: 'auto', maxHeight: 'none', overflow: 'visible', backgroundColor: '#09090b' } }, disabledUI: ['walletHeader', 'appearance', 'poweredBy'] }), []);
  const bridgeConfig = useMemo(() => ({ integrator: 'DustSweeper_Bridge', fee: 0.01, referrer: MY_WALLET, exchanges: { deny: ['nordstern'] }, appearance: 'dark' as const, variant: 'compact' as const, theme: { palette: { primary: { main: '#8B5CF6' }, background: { paper: '#121215', default: '#09090b' } }, container: { display: 'flex', height: 'auto', maxHeight: 'none', overflow: 'visible', backgroundColor: '#09090b' } }, disabledUI: ['walletHeader', 'appearance', 'poweredBy'] }), []);

  const tabs = [
    { id: 'finder', label: 'Dust Finder', description: 'Find your assets' },
    { id: 'alchemy', label: 'Wallet', description: 'View balances' },
    { id: 'bridge', label: 'Bridge', description: 'Move across networks' },
    { id: 'swap', label: 'Swap', description: 'Exchange tokens' },
    { id: 'safety', label: 'Scam Scan', description: 'Check token risks' }
  ];

  const toolSwitcher = (
    <nav id="tools" aria-label="Wallet tools" className="relative z-20 mb-5 scroll-mt-24 rounded-2xl border border-white/10 bg-[#0b0e16]/95 p-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.25)] sm:rounded-[24px] sm:p-2">
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTool(tab.id)}
            disabled={executionBusy && activeTab !== tab.id}
            aria-pressed={activeTab === tab.id}
            aria-label={`${tab.label}: ${tab.description}`}
            className={`group min-h-[88px] min-w-0 rounded-xl border px-0.5 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-[96px] sm:px-2 sm:py-3 lg:min-h-[88px] lg:px-3 ${
              activeTab === tab.id
                ? 'border-purple-400/40 bg-gradient-to-br from-purple-500/25 to-indigo-500/15 shadow-[0_8px_24px_rgba(88,28,135,0.18)]'
                : 'border-transparent bg-transparent hover:border-white/15 hover:bg-white/[0.05]'
            }`}
          >
            <span className="flex h-full flex-col items-center justify-center gap-1.5 lg:flex-row lg:justify-start lg:gap-3">
              <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${
                activeTab === tab.id ? 'bg-purple-400/15 text-purple-200' : 'bg-white/[0.04] text-gray-300 group-hover:text-white'
              }`}><ToolIcon name={tab.id} /></span>
              <span className="min-w-0 text-center lg:text-left">
                <span className={`flex min-h-[34px] items-center justify-center whitespace-normal text-[13px] font-semibold leading-[17px] sm:min-h-9 sm:text-sm sm:leading-[18px] lg:min-h-0 lg:justify-start lg:text-[15px] lg:leading-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>{tab.label}</span>
                <span className="mt-1 hidden text-[13px] leading-[18px] text-gray-300 xl:block">{tab.description}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen w-full bg-[#060609] text-gray-100 font-sans relative overflow-x-hidden">
      <WidgetMonitor
        feature={currentFeature}
        buckets={analyticsBuckets}
        onState={(feature, state) => setWidgetStates(current => ({ ...current, [feature]: state }))}
        onFormChanged={() => { if (activeTab === 'finder') setWidgetEdited(true); }}
      />
      {/* Premium background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20rem] left-1/2 -translate-x-1/2 w-[48rem] h-[48rem] rounded-full bg-purple-600/[0.09] blur-[130px]" />
        <div className="absolute top-[28rem] left-[-18rem] w-[38rem] h-[38rem] rounded-full bg-blue-600/[0.06] blur-[120px]" />
        <div className="absolute bottom-[-18rem] right-[-12rem] w-[38rem] h-[38rem] rounded-full bg-violet-600/[0.07] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-[1380px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {toolSwitcher}

        {executionBusy && <p role="status" className="mb-4 rounded-xl border border-purple-400/25 bg-purple-500/10 p-4 text-sm text-purple-100">An operation is in progress. Follow LI.FI and your wallet; keep this page open.</p>}
        {activeTab !== 'finder' && activeTab !== 'alchemy' && widgetStates[currentFeature].status !== 'idle' && (
          <div role="status" aria-live="polite" className="mb-4 rounded-xl border border-purple-400/20 bg-white/[0.03] p-4 text-sm text-gray-200">{widgetStates[currentFeature].message}</div>
        )}
        <div className="grid gap-6 lg:items-start">
          {/* Main tool area */}
          <div className="min-w-0">
            {/* FINDER */}
            {activeTab === 'finder' && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                {scanStep !== 'result' ? (
                  <>
                    <FinderIntro
                      address={userAddressInput} busy={scanStep === 'scanning'} error={scanError}
                      onAddressChange={value => { setUserAddressInput(value); setScanError(''); }}
                      onScan={() => { void handleScan(); }}
                    />

                  </>
                ) : (
                  <>
                  <ol aria-label="Recovery steps" className="mb-4 grid grid-cols-3 gap-1 rounded-2xl border border-white/[0.08] bg-[#0d0e14]/80 p-2">
                    <li className="rounded-xl bg-white/[0.035] px-3 py-3 text-sm text-emerald-300">1. Scanned</li>
                    <li className={`rounded-xl px-3 py-3 text-sm ${selectedRecoveryToken ? 'text-emerald-300' : 'bg-purple-500/10 text-purple-200'}`}>2. Choose asset</li>
                    <li className={`rounded-xl px-3 py-3 text-sm ${selectedRecoveryToken ? 'bg-purple-500/10 text-purple-200' : 'text-gray-500'}`}>3. Review</li>
                  </ol>

                  <div className="space-y-5">
                    {!selectedRecoveryToken && (<>
                    <section aria-label="Scan summary" className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.04] p-4 sm:p-5">
                      {refreshingFinderBalances && <p role="status" aria-live="polite" className="mb-3 rounded-xl border border-purple-400/25 bg-purple-500/10 p-3 text-sm text-purple-100">Refreshing wallet balances…</p>}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-emerald-300">Scan complete</p>
                          <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{foundTokens.length} asset{foundTokens.length === 1 ? '' : 's'} found</p>
                          <p className="mt-3 text-sm leading-6 text-gray-300">Estimated asset value: <span className="font-semibold text-white">{foundTokens.length === 0 ? 'No assets found' : parseFloat(foundBalance) > 0 ? `$${foundBalance}` : 'Price unavailable'}</span></p>
                          <p className="mt-1 text-xs leading-5 text-gray-400">Based on available prices. The recoverable amount depends on the route and costs.</p>
                        </div>
                        <button onClick={handleResetScan} disabled={executionBusy} className="min-h-11 shrink-0 rounded-xl border border-white/15 px-3 text-sm text-gray-200 disabled:opacity-40">New scan</button>
                      </div>
                      {getUnpricedAssetsCount(foundTokens) > 0 && <p className="mt-2 text-xs text-gray-400">{getUnpricedAssetsCount(foundTokens)} asset(s) have no reliable USD price and remain visible below.</p>}
                      {scanWarning && <p role="status" className="mt-3 text-sm text-amber-200">{scanWarning}</p>}
                    </section>

                    <div ref={assetListRef} className="scroll-mt-24 rounded-[30px] border border-white/[0.08] bg-gradient-to-b from-white/[0.035] to-white/[0.018] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.26)] sm:p-6">
                      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-purple-300">Step 2 · Your wallet assets</p>
                          <h3 className="mt-2 text-2xl font-bold text-white">Choose an asset to get started</h3>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-300">View recovery options for one asset, then review the amount and costs before confirming.</p>
                        </div>
                        <span className="shrink-0 self-start rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-300 sm:self-auto">{visibleFinderAssets.length} of {foundTokens.length} shown</span>
                      </div>
                      <section aria-label="Search and filters" className="mb-4 rounded-2xl border border-white/10 bg-black/15 p-3 sm:p-4">
                        <p className="mb-3 text-sm font-semibold text-gray-200">Find an asset</p>
                        <div>
                      <div className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_190px]">
                        <input aria-label="Search assets" value={assetSearch} onChange={e => setAssetSearch(e.target.value)} placeholder="Search token name or symbol" className="min-h-11 min-w-0 rounded-xl border border-white/15 bg-black/30 px-3 text-base text-white placeholder:text-gray-400" />
                        <select aria-label="Filter by network" value={assetNetwork} onChange={e => setAssetNetwork(e.target.value)} className="min-h-11 min-w-0 rounded-xl border border-white/15 bg-[#11131b] px-3 text-sm text-gray-200">
                          <option value="all">All networks</option>
                          {finderNetworks.map(network => <option key={network} value={network}>{network}</option>)}
                        </select>
                      </div>
                      <div aria-label="Filter assets" className="flex flex-wrap gap-2">
                        {(['all', 'priced', 'unpriced'] as const).map(filter => <button key={filter} aria-pressed={assetFilter === filter} onClick={() => setAssetFilter(filter)} className={`min-h-11 rounded-xl border px-3 text-sm ${assetFilter === filter ? 'border-purple-400/40 bg-purple-500/15 text-white' : 'border-white/10 text-gray-300'}`}>{filter === 'all' ? 'All assets' : filter === 'priced' ? 'With price' : 'Without price'}</button>)}
                      </div>
                      {foundTokens.length > 0 && visibleFinderAssets.length === 0 && <div className="mb-3 rounded-xl border border-white/10 p-4 text-sm text-gray-300"><p>No assets match these filters.</p><button onClick={() => { setAssetFilter('all'); setAssetSearch(''); setAssetNetwork('all'); }} className="mt-2 min-h-11 rounded-lg border border-white/20 px-4">Clear filters</button></div>}
                        </div>
                      </section>
                      <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                        {foundTokens.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center">
                            <p className="text-sm font-semibold text-gray-400">No assets with a positive balance found</p>
                            <p className="mt-2 text-sm leading-6 text-gray-400">The wallet scan did not return any positive token balances.</p>
                          </div>
                        ) : (
                          visibleFinderAssets.map((token, i) => {
                            const displayToken = getTokenDisplay(token);
                            const networkName = getNetworkDisplay(token);
                            const isSelected = selectedRecoveryToken === token;
                            const tokenAmount = getTokenBalanceNumber(token);
                            const canRoute = Boolean(getTokenChainId(token)) && tokenAmount > 0;

                            return (
                              <div
                                key={`${token.network}-${token.tokenAddress || token.contractAddress || 'native'}-${i}`}
                                className={`rounded-2xl border p-4 transition-all duration-300 ${isSelected ? 'border-purple-400/35 bg-purple-500/[0.10] shadow-[0_10px_30px_rgba(124,58,237,0.12)]' : 'border-white/[0.06] bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.045]'}`}
                              >
                                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/15 bg-purple-500/10 text-xs font-black text-purple-200">
                                        {displayToken.symbol.slice(0, 4)}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="truncate font-bold text-white">{displayToken.symbol}</p>
                                        <p className="mt-0.5 truncate text-sm text-gray-400">{displayToken.name}</p>
                                      </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                      <span className="rounded-lg border border-white/[0.07] bg-black/20 px-2 py-1 text-xs font-semibold text-gray-300">{networkName}</span>
                                      {tokenAmount > 0 && <span className="min-w-0 break-all font-mono text-sm text-gray-300">{displayAssetAmount(tokenAmount)} {displayToken.symbol}</span>}
                                    </div>
                                    {(() => {
                                      const check = tokenRiskChecks[tokenRiskKey(token)];
                                      const result = check?.result || {};
                                      const warnings: string[] = [];
                                      const yes = (v: any) => ['1', 'true', 'yes'].includes(String(v ?? '').trim().toLowerCase());
                                      const hasValue = (v: any) => v !== null && v !== undefined && v !== '';
                                      // Only show an amber warning for stronger, actionable indicators.
                                      // Minting and pausable transfers alone are common contract features, not proof of risk.
                                      if (yes(result.isHoneypot)) warnings.push('Possible honeypot indicator reported');
                                      if (yes(result.isBlacklisted)) warnings.push('Blacklist functionality reported');
                                      if (yes(result.hiddenOwner)) warnings.push('Hidden owner indicator reported');
                                      const buyTax = Number(result.buyTax);
                                      const sellTax = Number(result.sellTax);
                                      if (hasValue(result.buyTax) && Number.isFinite(buyTax) && buyTax >= 20) warnings.push(`Reported buy tax: ${buyTax.toFixed(1)}%`);
                                      if (hasValue(result.sellTax) && Number.isFinite(sellTax) && sellTax >= 20) warnings.push(`Reported sell tax: ${sellTax.toFixed(1)}%`);
                                      if (!check || check.status === 'loading') return <p className="mt-2 text-[11px] text-gray-500">{check?.status === 'loading' ? 'Checking security indicators…' : 'Security check pending…'}</p>;
                                      if (check.status === 'error') return <p className="mt-2 text-[11px] text-gray-500">Security check unavailable.</p>;
                                      if (check.status === 'empty') return <p className="mt-2 text-[11px] text-gray-500">No security data available for this contract.</p>;
                                      if (warnings.length > 0) return <div className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.04] px-3 py-2"><p className="text-[11px] font-semibold text-amber-200">Review contract indicators</p><ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-amber-100">{warnings.map((signal) => <li key={signal}>{signal}</li>)}</ul><p className="mt-1 text-[10px] leading-4 text-gray-500">Third-party indicators are not a definitive classification.</p></div>;
                                      return null;
                                    })()}
                                  </div>
                                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:flex-col md:items-end">
                                    {Number(token?.priceUsd || 0) > 0 ? (
                                      <p className="break-all font-mono text-base font-semibold text-white">${formatUsd(token.valueUsd)} <span className="font-sans text-xs font-normal text-gray-400">estimated</span></p>
                                    ) : (
                                      <p className="text-sm text-gray-400">Price unavailable</p>
                                    )}
                                    <button
                                      onClick={() => selectRecoveryToken(token)}
                                      disabled={!canRoute || executionBusy}
                                      className={`min-h-12 w-full rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300 sm:w-auto ${isSelected ? 'border border-purple-300/30 bg-purple-500/25 text-white' : 'border border-purple-400/40 bg-purple-600 text-white hover:bg-purple-500'} disabled:cursor-not-allowed disabled:opacity-40`}
                                    >
                                      {isSelected ? 'Selected' : 'View recovery options'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    </>)}

                    {selectedRecoveryToken && (
                      <div ref={recoverySectionRef} className="scroll-mt-24 rounded-[30px] border border-purple-400/20 bg-purple-500/[0.04] p-4 sm:p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-300">Step 3 · Review and confirm</p>
                        <h3 className="mt-2 text-2xl font-black text-white">Review your recovery options</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-300">Review what you would receive and the costs below. Confirm each required step in your wallet.</p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-400">Asset chosen from your scan</p>
                            <p className="mt-1 break-words text-lg font-bold text-white">{getTokenDisplay(selectedRecoveryToken).symbol} · {getNetworkDisplay(selectedRecoveryToken)}</p>
                            <p className="mt-2 text-sm leading-6 text-gray-400">Wallet {shortAddr(finderAddress)}. Connect this wallet in LI.FI below.</p>
                          </div>
                          <button onClick={() => { void chooseAnotherAsset(); }} disabled={executionBusy || refreshingFinderBalances} className="min-h-12 w-full shrink-0 rounded-xl border border-purple-300/40 bg-purple-500/10 px-4 text-sm font-semibold text-purple-100 hover:bg-purple-500/20 disabled:opacity-40 sm:w-auto">{refreshingFinderBalances ? "Refreshing balances…" : "Choose another asset"}</button>
                        </div>
                        {isNativeTokenAddress(getTokenAddress(selectedRecoveryToken)) && (
                          <p className="mt-3 rounded-xl border border-purple-300/20 p-4 text-sm text-purple-100">This is already the currency used to pay network fees. Choose a different token or network to receive below.</p>
                        )}
                        <div className="mt-3 text-sm text-gray-300">
                          <details className="rounded-xl border border-white/10 px-4 open:pb-4">
                            <summary className="min-h-11 cursor-pointer content-center font-medium text-gray-300">About fees and wallet confirmation</summary>
                            <p className="mt-2 leading-6">Connecting a wallet does not complete a recovery. You review permissions and confirm each required step in your own wallet. LI.FI displays the current destination, estimated output and costs. Network gas may be charged separately.</p>
                            <p className="mt-2 leading-6">The amount starts slightly below the scanned balance. That buffer is not a gas estimate. Review the final amount in the widget, especially for native currencies.</p>
                            <p className="mt-2 leading-6"><a href="/faq" target="_blank" rel="noopener noreferrer" className="text-purple-300 underline underline-offset-4">Fee details and FAQ</a><span aria-hidden="true"> &middot; </span><a href="/terms" target="_blank" rel="noopener noreferrer" className="text-purple-300 underline underline-offset-4">Terms</a></p>
                          </details>
                        </div>
                        {recoveryState.status !== 'idle' && (
                          <div role="status" aria-live="polite" className={`my-4 rounded-2xl border p-4 text-sm leading-6 ${recoveryState.status === 'completed' ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100' : ['failed', 'cancelled', 'no-route'].includes(recoveryState.status) ? 'border-amber-400/40 bg-amber-500/10 text-amber-100' : 'border-purple-400/30 bg-purple-500/10 text-purple-100'}`}>
                            {recoveryState.label && <p className="mb-1 text-base font-bold">{recoveryState.label}</p>}
                            {recoveryState.message}
                            {recoveryState.status === 'completed' && <div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={() => { void chooseAnotherAsset(); }} disabled={refreshingFinderBalances} className="min-h-11 rounded-lg bg-purple-600 px-4 text-sm text-white disabled:opacity-40">{refreshingFinderBalances ? "Refreshing…" : "Check another asset"}</button><button onClick={shareRecovery} className="min-h-11 rounded-lg border border-white/20 px-4 text-sm">Share recovery</button><span>{shareMessage}</span></div>}
                          </div>
                        )}
                        {!isWalletBrowser && <section className="mobile-wallet-handoff my-3 rounded-2xl border border-violet-400/25 bg-[#100d1c] p-4 sm:hidden" aria-label="Continue in wallet">
                          <h3 className="text-base font-semibold text-white">Finish in your wallet</h3>
                          <p className="mt-1 text-sm leading-5 text-gray-300">On iPhone, switching networks can return you to Chrome without opening the approval screen. Open Dust Sweeper in your wallet first, then choose this token and continue there.</p>
                          <div className="mt-3 grid grid-cols-1 gap-2">
                            <a href="https://metamask.app.link/dapp/dustsweepertool.com" target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white">Open in MetaMask</a>
                            <a href="https://link.trustwallet.com/open_url?url=https%3A%2F%2Fdustsweepertool.com" target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white">Open in Trust Wallet</a>
                            <a href="https://go.cb-w.com/dapp?cb_url=https%3A%2F%2Fdustsweepertool.com" target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white">Open in Coinbase Wallet</a>
                          </div>
                          <p className="mt-3 text-xs leading-4 text-gray-500">Other wallet? Open its built-in browser and visit dustsweepertool.com. Only approve transactions you recognize.</p>
                        </section>}
                        <div className={isWalletBrowser ? "lifi-widget-shell mt-3 min-w-0 rounded-[24px] border border-white/10 bg-[#09090b]" : "lifi-widget-shell mt-3 hidden min-w-0 rounded-[24px] border border-white/10 bg-[#09090b] sm:block"}>
                          <LiFiWidget key={`${getTokenChainId(selectedRecoveryToken)}-${getTokenAddress(selectedRecoveryToken)}-${recoveryWidgetNonce}`} integrator="DustSweeper" config={finderConfig as any} />
                        </div>
                        {!widgetEdited && ['incomplete', 'wrong-network', 'simulation-failed', 'insufficient-gas', 'no-route', 'error'].includes(routePreflight.status) && (
                          <div className="mt-3 rounded-xl border border-white/10 p-4 text-sm text-gray-400">
                            <details><summary className="min-h-11 cursor-pointer content-center font-semibold text-gray-200">Initial check details (optional)</summary>
                            <p className="mt-1">{routePreflight.message}</p>
                            <p className="mt-1">This is separate from the route currently displayed in LI.FI. It never approves or sends a transaction.</p></details>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  </>
                )}

              </div>
            )}

            {/* WALLET */}
            {activeTab === 'alchemy' && (() => {
              const walletAssets = portfolioTokens.filter(hasPositiveWalletBalance);
              const walletNetworks = [...new Set(walletAssets.map((token) => getNetworkDisplay(token)))].filter(Boolean);
              const walletDustAssets = walletAssets.filter((token) => {
                const value = Number(token?.valueUsd || 0);
                return value > 0 && value <= 5;
              });
              const walletDustValue = walletDustAssets.reduce((sum, token) => sum + Number(token?.valueUsd || 0), 0);
              const walletNetworkTotals = walletAssets.reduce((acc: Record<string, number>, token) => {
                const network = getNetworkDisplay(token) || 'Unknown network';
                acc[network] = (acc[network] || 0) + Number(token?.valueUsd || 0);
                return acc;
              }, {});
              const topWalletNetworks = Object.entries(walletNetworkTotals)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6);

              return (
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                  <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.015] p-6 shadow-2xl sm:p-8">
                    <div className="mb-6 flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/15 bg-purple-500/10 text-2xl">🔎</div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300">Wallet explorer</span>
                        <h2 className="mt-1 text-2xl font-black text-white">What’s in your wallet?</h2>
                        <p className="mt-1 text-sm text-gray-400">Discover your assets, networks, portfolio value and low-value balances.</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-2">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          aria-label="Public wallet address for portfolio scan"
                          aria-invalid={Boolean(portfolioError)}
                          value={portfolioAddress}
                          onChange={e => setPortfolioAddress(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') loadPortfolio(); }}
                          placeholder="Paste wallet address (0x...)"
                          className="min-w-0 flex-1 bg-transparent px-4 py-3.5 font-mono text-sm text-white outline-none placeholder:text-gray-600"
                        />
                        <button
                          onClick={loadPortfolio}
                          disabled={portfolioLoading}
                          className="inline-flex h-[56px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-7 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_32px_rgba(109,40,217,0.30)] transition hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_16px_38px_rgba(109,40,217,0.42)] focus:outline-none focus:ring-2 focus:ring-purple-400/40 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[190px]"
                        >
                          {portfolioLoading ? 'Analyzing...' : 'Analyze Wallet →'}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-600">
                      <span>Public address only · No private keys required</span>
                      {portfolioAddress && isValidAddress(portfolioAddress) && <span className="font-mono text-gray-500">{shortAddr(portfolioAddress)}</span>}
                    </div>
                    {portfolioError && <p role="alert" className="mt-3 text-center text-sm text-red-300">{portfolioError}</p>}
                    {portfolioWarning && <p role="status" className="mt-3 text-sm text-amber-200">{portfolioWarning}</p>}
                  </div>

                  {!portfolioScanned ? (
                    <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.025] p-10 text-center shadow-xl sm:p-14">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/15 bg-purple-500/10 text-3xl">🔎</div>
                      <h3 className="mt-5 text-xl font-black text-white">See what your wallet holds</h3>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Enter any public EVM wallet address to see balances, networks and portfolio value.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 shadow-xl">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Portfolio</p>
                          <p className="mt-2 text-2xl font-black text-white">${portfolioTotal}</p>
                          <p className="mt-1 text-[10px] text-gray-600">Estimated current value</p>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 shadow-xl">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Assets</p>
                          <p className="mt-2 text-2xl font-black text-white">{walletAssets.length}</p>
                          <p className="mt-1 text-[10px] text-gray-600">Positive balances found</p>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 shadow-xl">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Networks</p>
                          <p className="mt-2 text-2xl font-black text-white">{walletNetworks.length}</p>
                          <p className="mt-1 text-[10px] text-gray-600">Networks with assets</p>
                        </div>
                        <div className="rounded-[24px] border border-purple-400/15 bg-purple-500/[0.06] p-5 shadow-xl">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-purple-300">Low-value assets</p>
                          <p className="mt-2 text-2xl font-black text-white">${walletDustValue.toFixed(2)}</p>
                          <p className="mt-1 text-[10px] text-gray-500">{walletDustAssets.length} asset{walletDustAssets.length === 1 ? '' : 's'} ≤ $5</p>
                        </div>
                      </div>

                      {topWalletNetworks.length > 0 && (
                        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 shadow-xl sm:p-6">
                          <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Portfolio distribution</p>
                              <h3 className="mt-1 text-lg font-black text-white">Where your crypto is</h3>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">Live data</span>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {topWalletNetworks.map(([network, value]) => (
                              <div key={network} className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="truncate text-sm font-bold text-white">{network}</span>
                                  <span className="shrink-0 text-sm font-black text-purple-300">${formatUsd(value)}</span>
                                </div>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${Math.min(100, Object.values(walletNetworkTotals).reduce((sum, total) => sum + total, 0) > 0 ? (value / Object.values(walletNetworkTotals).reduce((sum, total) => sum + total, 0)) * 100 : 0)}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 shadow-xl sm:p-6">
                        <div className="mb-6 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Your assets</p>
                            <h3 className="mt-1 text-lg font-black text-white">Tokens in this wallet</h3>
                          </div>
                          <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-[10px] font-bold uppercase text-purple-300">{walletAssets.length} assets</span>
                        </div>
                        <div className="space-y-2">
                          {walletAssets.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-gray-600">No positive token balances found.</div>
                          ) : walletAssets.map((token, i) => {
                            const displayToken = getTokenDisplay(token);
                            const networkLabel = getNetworkDisplay(token);
                            const valueUsd = Number(token?.valueUsd || 0);
                            const logo = String(token?.logo || '').trim();

                            return (
                              <div key={`${token.network}-${token.tokenAddress || 'native'}-${i}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition hover:border-white/[0.12] hover:bg-white/[0.04]">
                                <div className="flex min-w-0 items-center gap-3">
                                  {logo ? (
                                    <img src={logo} alt="" className="h-9 w-9 shrink-0 rounded-full border border-white/10 bg-black/20" />
                                  ) : (
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-purple-400/15 bg-purple-500/10 text-[10px] font-black text-purple-300">{displayToken.symbol.slice(0, 3)}</div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-white">
                                      {displayToken.symbol}
                                      <span className="font-medium text-gray-400"> · {displayToken.name}</span>
                                    </p>
                                    <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wider text-gray-500">{networkLabel}</p>
                                  </div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-sm font-bold text-gray-200">{getTokenBalanceNumber(token).toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
                                  <p className={`mt-1 text-[11px] ${valueUsd > 0 && valueUsd <= 5 ? 'text-purple-300' : 'text-gray-500'}`}>${formatUsd(valueUsd)}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {walletDustAssets.length > 0 && (
                        <div className="rounded-[28px] border border-purple-400/15 bg-gradient-to-br from-purple-500/[0.10] to-transparent p-5 shadow-xl sm:p-6">
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-300">🧹 Dust opportunity</p>
                              <h3 className="mt-1 text-xl font-black text-white">You have ${walletDustValue.toFixed(2)} in low-value assets</h3>
                              <p className="mt-1 text-sm text-gray-500">These assets may be worth reviewing in Dust Finder.</p>
                            </div>
                            <button
                              onClick={() => {
                                if (!canLeaveRecovery()) return;
                                if (finderAddress !== portfolioResultAddress) {
                                  setUserAddressInput(portfolioResultAddress); setScanStep('initial');
                                  setSelectedRecoveryToken(null); setScanError('');
                                  setWidgetStates(current => ({ ...current, finder: EMPTY_WIDGET_STATE }));
                                }
                                selectTool('finder');
                              }}
                              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_12px_28px_rgba(109,40,217,0.28)] transition hover:from-purple-500 hover:to-indigo-500"
                            >
                              Review this wallet in Finder →
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}

            {/* BRIDGE */}
            {activeTab === 'bridge' && (
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#09090b] p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="mb-3 flex items-center gap-3 px-4 pt-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-xl">🌉</span>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-purple-300">Cross-chain</p><h2 className="font-black text-white">Bridge assets</h2></div>
                </div>
                <LiFiWidget integrator="DustSweeper_Bridge" config={bridgeConfig as any} />
              </div>
            )}

            {/* SWAP */}
            {activeTab === 'swap' && (
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#09090b] p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="mb-3 flex items-center gap-3 px-4 pt-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xl">🔄</span>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Trade</p><h2 className="font-black text-white">Swap tokens</h2></div>
                </div>
                <LiFiWidget integrator="DustSweeper" config={swapConfig as any} />
              </div>
            )}

            {/* SAFETY */}
            {activeTab === 'safety' && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                {safetyStep !== 'result' ? (
                  <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.015] p-6 text-center shadow-2xl sm:p-8">
                    {safetyStep === 'scanning' && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#09090b]/85 backdrop-blur-md">
                        <div className="mb-4 h-14 w-14 animate-spin rounded-full border-2 border-purple-400/20 border-t-purple-400" />
                        <p className="text-sm font-bold text-purple-300">Fetching data from GoPlus...</p>
                        <p className="mt-2 text-xs text-gray-500">Checking BNB Chain, Polygon, Ethereum, Arbitrum, Optimism and Base</p>
                      </div>
                    )}

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-3xl shadow-[0_0_35px_rgba(139,92,246,0.12)]">🛡️</div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300">Token contract data</span>
                    <h2 className="mt-2 text-2xl font-black text-white">Token contract data</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">View contract and token indicators returned by GoPlus. Dust Sweeper does not classify or recommend tokens.</p>

                    <div className="mx-auto mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row">
                      <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/25 shadow-inner shadow-black/20">
                        <input
                          type="text"
                          placeholder="Token contract address (0x...)"
                          value={tokenToScan}
                          onChange={(e) => {
                            setTokenToScan(e.target.value);
                            if (safetyError) setSafetyError('');
                          }}
                          className="h-[56px] w-full bg-transparent px-5 font-mono text-sm text-white outline-none placeholder:text-gray-600"
                        />
                      </div>
                      <button
                        onClick={handleSafetyScan}
                        disabled={safetyStep === 'scanning'}
                        className="inline-flex h-[56px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_32px_rgba(109,40,217,0.30)] transition hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_16px_38px_rgba(109,40,217,0.42)] focus:outline-none focus:ring-2 focus:ring-purple-400/40 disabled:cursor-not-allowed disabled:opacity-50 shrink-0 sm:min-w-[170px]"
                      >
                        {safetyStep === 'scanning' ? 'Checking...' : 'Scan token →'}
                      </button>
                    </div>

                    {safetyError && (
                      <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-4 text-left">
                        <p className="text-sm font-semibold text-amber-200">Unable to verify</p>
                        <p className="mt-1 text-xs leading-5 text-gray-400">{safetyError}</p>
                      </div>
                    )}

                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Data provided by GoPlus</p>
                  </div>
                ) : (
                  <div className="space-y-5 animate-in zoom-in-95 duration-500">
                    <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6 shadow-2xl sm:p-8">
                      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">GoPlus token contract data</p>
                          <h3 className="mt-2 text-3xl font-black text-white">TOKEN DETAILS</h3>
                          {safetyResult?.tokenName && <p className="mt-2 text-sm text-gray-400">{safetyResult.tokenName} <span className="text-white">({safetyResult.tokenSymbol || '—'})</span></p>}
                        </div>
                        <button onClick={() => { setSafetyStep('initial'); setSafetyResult(null); setSafetyError(''); }} className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition hover:bg-white/10 hover:text-white">Scan another</button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {[
                          ['Honeypot', safetyResult?.isHoneypot === '1' ? 'YES' : safetyResult?.isHoneypot === '0' ? 'NO' : 'No data'],
                          ['Buy Tax', safetyResult?.buyTax !== undefined && safetyResult?.buyTax !== null && String(safetyResult.buyTax).trim() !== '' ? `${(parseFloat(safetyResult.buyTax) * 100).toFixed(1)}%` : 'No data'],
                          ['Sell Tax', safetyResult?.sellTax !== undefined && safetyResult?.sellTax !== null && String(safetyResult.sellTax).trim() !== '' ? `${(parseFloat(safetyResult.sellTax) * 100).toFixed(1)}%` : 'No data'],
                          ['Mintable', safetyResult?.isMintable === '1' ? 'YES' : safetyResult?.isMintable === '0' ? 'NO' : 'No data'],
                          ['Blacklist', safetyResult?.isBlacklisted === '1' ? 'YES' : safetyResult?.isBlacklisted === '0' ? 'NO' : 'No data'],
                          ['Proxy', safetyResult?.isProxy === '1' ? 'YES' : safetyResult?.isProxy === '0' ? 'NO' : 'No data'],
                          ['Open Source', safetyResult?.isOpenSource === '1' ? 'YES' : safetyResult?.isOpenSource === '0' ? 'NO' : 'No data'],
                          ['Hidden Owner', safetyResult?.hiddenOwner === '1' ? 'YES' : safetyResult?.hiddenOwner === '0' ? 'NO' : 'No data'],
                          ['Transfer Pause', safetyResult?.transferPausable === '1' ? 'YES' : safetyResult?.transferPausable === '0' ? 'NO' : 'No data'],
                        ].map(([label, value]) => (
                          <div key={String(label)} className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">{label}</p>
                            <p className={`mt-2 text-sm font-black ${value === 'No data' ? 'text-gray-500' : 'text-white'}`}>{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Holders</p>
                          <p className={`mt-2 text-lg font-black ${safetyResult?.holderCount ? 'text-white' : 'text-gray-500'}`}>{safetyResult?.holderCount ? Number(safetyResult.holderCount).toLocaleString() : 'No data'}</p>
                        </div>
                        <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Network</p>
                          <p className="mt-2 text-lg font-black text-white">{safetyResult?.detectedNetwork || 'No data'}</p>
                        </div>
                      </div>

                      {Array.isArray(safetyResult?.networksFound) && safetyResult.networksFound.length > 1 && (
                        <div className="mt-3 rounded-2xl border border-blue-400/10 bg-blue-400/[0.04] p-4 text-left">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Contract found on multiple networks</p>
                          <p className="mt-1 text-xs leading-5 text-gray-400">The same contract address returned data on: {safetyResult.networksFound.map((item: any) => item.name).join(', ')}. The details above are from {safetyResult.detectedNetwork}.</p>
                        </div>
                      )}

                      {Array.isArray(safetyResult?.failedNetworks) && safetyResult.failedNetworks.length > 0 && (
                        <div className="mt-3 rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-4 text-left">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Partial network check</p>
                          <p className="mt-1 text-xs leading-5 text-gray-400">GoPlus could not return data for: {safetyResult.failedNetworks.join(', ')}. The displayed data may therefore be incomplete.</p>
                        </div>
                      )}

                      <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-left">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Verify independently</p>
                        <p className="mt-1 text-xs leading-5 text-gray-400">GoPlus is a third-party data source. Data can be incomplete or inaccurate. Dust Sweeper does not classify or recommend tokens.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Array.isArray(safetyResult?.networksFound) && safetyResult.networksFound.map((item: any) => (
                            <a
                              key={item.id}
                              href={`${({ '1':'https://etherscan.io/address/', '56':'https://bscscan.com/address/', '137':'https://polygonscan.com/address/', '42161':'https://arbiscan.io/address/', '10':'https://optimistic.etherscan.io/address/', '8453':'https://basescan.org/address/' } as Record<string,string>)[item.id] || ''}${tokenToScan}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition hover:bg-white/10 hover:text-white"
                            >
                              View {item.name} contract ↗
                            </a>
                          ))}
                        </div>
                      </div>

                      {safetyResult && (
                        <div className="mt-7 rounded-2xl border border-amber-400/20 p-4">
                          <p className="font-bold text-amber-100">A risk scan is not a recommendation to buy.</p>
                          <p className="mt-2 text-sm leading-6 text-gray-300">Data may be incomplete and a token may be impossible to sell. Review the network, contract and every warning before choosing a trade.</p>
                          {(safetyResult.isHoneypot === '1' || safetyResult.isBlacklisted === '1') ? (
                            <p className="mt-3 text-sm font-semibold text-red-300">A honeypot or blacklist signal was reported. The purchase widget is not shown for this result.</p>
                          ) : (
                            <>
                              <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 text-sm text-gray-300"><input type="checkbox" checked={safetyAcknowledged} onChange={e => setSafetyAcknowledged(e.target.checked)} className="mt-1 h-5 w-5" />I understand that this scan does not establish safety or sellability. Show trade options.</label>
                              {safetyAcknowledged && <div className="mt-4 rounded-2xl border border-white/10 bg-[#09090b]"><p className="p-4 text-sm text-gray-400">Review the amount you receive and the transaction details before confirming.</p><LiFiWidget integrator="DustSweeper" config={safetyBuyConfig as any} /></div>}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer notices are relevant after scanning, not on the landing form. */}
        {scanStep === 'result' && <div className="mt-5 grid gap-3 text-sm leading-relaxed text-gray-400 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mr-2">ℹ️</span>All wallet assets with a positive balance are shown regardless of value. Tokens with no reliable price or liquidity may still be unavailable for routing.</div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mr-2">⚠️</span>If you see “No Routes Available”, LI.FI may not have an executable route for that asset or amount. Dust Sweeper does not impose a $1 minimum.</div>
        </div>}

        <footer className="py-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-700">Dust Sweeper · Recover · Swap · Bridge · Verify</p>
        </footer>
      </main>
    </div>
  );
}
