'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useWidgetEvents, WidgetEvent } from '@lifi/widget';

const LiFiWidget = dynamic(() => import('@lifi/widget').then((module) => module.LiFiWidget), { ssr: false });

// --- SUA CARTEIRA PARA RECEBIMENTO DE COMISSÕES / PAGAMENTO ---
const MY_WALLET = '0x6c7934F3d22bff6a2b8Db0FB63F74E7bAb728c4c';

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

  const isNative =
    rawSymbol.toUpperCase() === 'NATIVE' ||
    isPolygonNativeMatic ||
    (!rawSymbol && isZeroAddress);

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
  const display = getTokenDisplay(token);
  const chainId = getTokenChainId(token);
  const rawSymbol = String(token?.symbol ?? token?.tokenSymbol ?? '').trim().toUpperCase();
  const normalizedRawAddress = raw.toLowerCase();
  const isNative =
    rawSymbol === 'NATIVE' ||
    !raw ||
    normalizedRawAddress === '0x0000000000000000000000000000000000000000' ||
    normalizedRawAddress === '0x0000000000000000000000000000000000001010' ||
    (chainId === '137' && rawSymbol === 'MATIC');

  return isNative ? '0x0000000000000000000000000000000000000000' : raw;
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

function formatLiFiAmount(value: unknown, reserveRatio = 0.995): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '0';

  // The Alchemy API already returns `balance` in human-readable token units.
  // We intentionally do NOT divide by decimals again.
  //
  // Use a tiny 0.5% safety buffer so LI.FI does not reject a route because
  // the requested amount is microscopically above the wallet balance after
  // floating-point / token-decimal conversion. There is NO USD minimum:
  // even a $0.01 dust balance is still attempted.
  const spendable = n * reserveRatio;

  const fixed = spendable.toFixed(18);
  return fixed.replace(/\.?0+$/, '');
}


function getTokenDecimals(token: any): number {
  const candidates = [
    token?.decimals,
    token?.tokenDecimals,
    token?.metadata?.decimals,
  ];
  for (const candidate of candidates) {
    const n = Number(candidate);
    if (Number.isInteger(n) && n >= 0 && n <= 36) return n;
  }
  return 18;
}

function decimalAmountToBaseUnits(value: string, decimals: number): string {
  const normalized = String(value ?? '').trim();
  if (!normalized || !/^\d+(\.\d+)?$/.test(normalized)) return '0';
  const [whole, fraction = ''] = normalized.split('.');
  const padded = `${fraction}${'0'.repeat(decimals)}`.slice(0, decimals);
  const base = `${whole || '0'}${padded}`.replace(/^0+(?=\d)/, '');
  return base || '0';
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


/**
 * LI.FI execution monitor.
 *
 * We deliberately do not block a token before the first attempt: a route can
 * be valid for one token/amount and fail for another. When an on-chain
 * execution actually fails, we learn which LI.FI tool failed and temporarily
 * deny that tool for this exact recovery token so the widget can request an
 * alternative route without reopening Nordstern.
 */
function DustSweeperWidgetMonitor({
  recoveryKey,
  onFailure,
  onCompleted: onCompletedCallback,
}: {
  recoveryKey: string;
  onFailure: (payload: { tool?: string; type?: string; message?: string }) => void;
  onCompleted: () => void;
}) {
  const widgetEvents = useWidgetEvents();

  useEffect(() => {
    const getText = (value: unknown) => {
      try {
        return JSON.stringify(value ?? '').toLowerCase();
      } catch {
        return String(value ?? '').toLowerCase();
      }
    };

    const extractTool = (update: any) => {
      const route = update?.route ?? update;
      const process = update?.process;
      const processStep = process?.step ?? process?.action?.step;
      const failedStep = Array.isArray(route?.steps)
        ? route.steps.find((step: any) => {
            const status = String(step?.execution?.status ?? step?.status ?? '').toUpperCase();
            return status === 'FAILED' || status === 'REVERTED' || status === 'ERROR';
          })
        : undefined;

      return String(
        processStep?.tool ??
          processStep?.toolDetails?.key ??
          processStep?.toolDetails?.name ??
          process?.tool ??
          process?.toolDetails?.key ??
          failedStep?.tool ??
          failedStep?.toolDetails?.key ??
          failedStep?.toolDetails?.name ??
          ''
      ).trim();
    };

    const extractType = (update: any) => {
      const route = update?.route ?? update;
      const process = update?.process;
      const failedStep = Array.isArray(route?.steps)
        ? route.steps.find((step: any) => {
            const status = String(step?.execution?.status ?? step?.status ?? '').toUpperCase();
            return status === 'FAILED' || status === 'REVERTED' || status === 'ERROR';
          })
        : undefined;
      return String(process?.step?.type ?? failedStep?.type ?? '').toLowerCase();
    };

    const extractMessage = (update: any) => {
      const process = update?.process;
      const route = update?.route ?? update;
      return String(
        process?.message ??
          process?.error?.message ??
          process?.error ??
          route?.message ??
          ''
      ).trim();
    };

    const isRealExecutionFailure = (update: any) => {
      const process = update?.process;
      const route = update?.route ?? update;
      const message = extractMessage(update).toLowerCase();
      const blob = `${getText(process)} ${getText(route)}`;

      // Never blacklist a route because the user simply rejected/cancelled it.
      if (
        message.includes('user rejected') ||
        message.includes('user denied') ||
        message.includes('user cancelled') ||
        message.includes('user canceled') ||
        blob.includes('userrejected') ||
        blob.includes('user_denied') ||
        blob.includes('user_cancel')
      ) {
        return false;
      }

      return (
        message.includes('execution reverted') ||
        message.includes('transaction failed') ||
        message.includes('reverted') ||
        blob.includes('"status":"failed"') ||
        blob.includes('"status":"reverted"') ||
        blob.includes('transactionfailed')
      );
    };

    const sameRecovery = (update: any) => {
      if (!recoveryKey) return false;
      const route = update?.route ?? update;
      const routeChain = String(route?.fromChainId ?? route?.action?.fromChainId ?? '');
      const routeToken = String(
        route?.fromToken?.address ??
          route?.action?.fromToken?.address ??
          route?.steps?.[0]?.action?.fromToken?.address ??
          ''
      ).toLowerCase();
      const expected = recoveryKey.split(':');
      return routeChain === expected[0] && routeToken === expected[1];
    };

    const onFailed = (update: any) => {
      if (!sameRecovery(update) || !isRealExecutionFailure(update)) return;
      onFailure({
        tool: extractTool(update) || undefined,
        type: extractType(update) || undefined,
        message: extractMessage(update) || undefined,
      });
    };

    const onCompleted = (route: any) => {
      if (!sameRecovery(route)) return;
      onCompletedCallback();
    };

    widgetEvents.on(WidgetEvent.RouteExecutionFailed, onFailed);
    widgetEvents.on(WidgetEvent.RouteExecutionCompleted, onCompleted);

    return () => {
      widgetEvents.off(WidgetEvent.RouteExecutionFailed, onFailed);
      widgetEvents.off(WidgetEvent.RouteExecutionCompleted, onCompleted);
    };
  }, [widgetEvents, recoveryKey, onFailure, onCompletedCallback]);

  return null;
}

export default function AppPortal() {
  const [activeTab, setActiveTab] = useState('finder');

  // Finder
  const [scanStep, setScanStep] = useState<'initial' | 'scanning' | 'result'>('initial');
  const [userAddressInput, setUserAddressInput] = useState('');
  const [foundBalance, setFoundBalance] = useState('0.00');
  const [foundTokens, setFoundTokens] = useState<any[]>([]);
  const [portfolioTokens, setPortfolioTokens] = useState<any[]>([]);
  const [portfolioTotal, setPortfolioTotal] = useState('0.00');
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioAddress, setPortfolioAddress] = useState('');
  const [portfolioError, setPortfolioError] = useState('');
  const [selectedRecoveryToken, setSelectedRecoveryToken] = useState<any | null>(null);
  const recoverySectionRef = useRef<HTMLDivElement | null>(null);
  const [recoveryFailure, setRecoveryFailure] = useState<{ tool?: string; type?: string; message?: string } | null>(null);
  const [failedRouteTools, setFailedRouteTools] = useState<{ bridges: string[]; exchanges: string[] }>({ bridges: [], exchanges: [] });
  const [routePreflight, setRoutePreflight] = useState<{ status: 'idle' | 'checking' | 'ready' | 'needs-approval' | 'unsafe' | 'no-route' | 'error'; tool?: string; message?: string }>({ status: 'idle' });
  const [recoveryWidgetNonce, setRecoveryWidgetNonce] = useState(0);
  const [routeRetrying, setRouteRetrying] = useState(false);

  // Scam Detector
  const [tokenToScan, setTokenToScan] = useState('');
  const [safetyStep, setSafetyStep] = useState<'initial' | 'scanning' | 'result'>('initial');
  const [safetyResult, setSafetyResult] = useState<any>(null);
  const [safetyError, setSafetyError] = useState('');

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
            { cache: 'no-store' }
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
    setSafetyResult(null);
    setSafetyStep('scanning');

    const result = await checkTokenSafety(normalized);

    if (result?.status === 'error') {
      setSafetyError(
        `GoPlus could not verify this contract right now. Some network requests failed: ${result.failedNetworks.join(', ')}. Please try again later.`
      );
      setSafetyStep('initial');
      return;
    }

    if (result?.status === 'empty') {
      setSafetyError(
        'No GoPlus data was returned for this address on the checked networks. This does not mean the token is safe or unsafe.'
      );
      setSafetyStep('initial');
      return;
    }

    setSafetyResult(result);
    setSafetyStep('result');
  };

  const fetchRealBalances = async (address: string) => {
    try {
      const response = await fetch('/api/alchemy/tokens', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Alchemy request failed');
      return data;
    } catch { return { error: 'ERROR' }; }
  };

  const handleScan = async () => {
    if (!isValidAddress(userAddressInput)) { alert('Invalid address.'); return; }
    setScanStep('scanning');
    const result = await fetchRealBalances(userAddressInput.trim());
    setTimeout(() => {
      if (result?.error) { setScanStep('initial'); alert(result.error === 'ERROR' ? 'Error fetching wallet data.' : result.error); return; }
      const allPositiveAssets = Array.isArray(result.tokens)
      ? result.tokens.filter((token: any) => hasPositiveWalletBalance(token))
      : [];

    const pricedValue = allPositiveAssets.reduce(
      (sum: number, token: any) => sum + Number(token?.valueUsd || 0),
      0
    );

    setFoundTokens(allPositiveAssets);
    setFoundBalance(pricedValue.toFixed(2));
    setPortfolioTotal(Number(result.totalValue || pricedValue || 0).toFixed(2));
    setPortfolioAddress(userAddressInput.trim());
      setScanStep('result');
    }, 700);
  };

  const handleResetScan = () => {
    setScanStep('initial');
    setUserAddressInput('');
    setFoundBalance('0.00');
    setFoundTokens([]);
    setSelectedRecoveryToken(null);
    setRoutePreflight({ status: 'idle' });
    setRecoveryWidgetNonce(0);
    setRouteRetrying(false);
  };

  const recoveryKey = selectedRecoveryToken
    ? `${getTokenChainId(selectedRecoveryToken)}:${getTokenAddress(selectedRecoveryToken).toLowerCase()}`
    : '';


  // Smart economics guard: Dust Sweeper still tries tiny dust. The user controls
  // how much estimated value loss is acceptable; there is no hard-coded 20% rule.
  // A route is blocked only when its estimated total loss exceeds that user limit.
  const normalizeLiFiTool = (tool: string) => String(tool || '').trim().toLowerCase();

  const preflightRecoveryRoute = async (token: any, denyTools: { bridges: string[]; exchanges: string[] }) => {
    const chainId = getTokenChainId(token);
    const tokenAddress = getTokenAddress(token);
    const tokenBalance = getTokenBalanceNumber(token);
    const decimals = getTokenDecimals(token);
    const fromAmountHuman = formatLiFiAmount(tokenBalance, 0.995);
    const fromAmount = decimalAmountToBaseUnits(fromAmountHuman, decimals);
    const walletAddress = (portfolioAddress || userAddressInput || '').trim();

    if (!chainId || !tokenAddress || !walletAddress || !isValidAddress(walletAddress) || fromAmount === '0') {
      setRoutePreflight({ status: 'idle' });
      return;
    }

    setRoutePreflight({ status: 'checking', message: 'Checking the LI.FI route before showing the recovery details…' });

    try {
      // Default recovery stays on the token's own network.
      // This avoids unnecessary cross-chain routes and substantially reduces
      // "No routes available" cases caused by forcing every asset to Polygon.
      const destinationChainId = chainId;
      const params = new URLSearchParams({
        fromChain: chainId,
        toChain: destinationChainId,
        fromToken: isNativeTokenAddress(tokenAddress) ? '0x0000000000000000000000000000000000000000' : tokenAddress,
        toToken: '0x0000000000000000000000000000000000000000',
        fromAddress: walletAddress,
        toAddress: walletAddress,
        fromAmount,
        order: 'CHEAPEST',
        slippage: '0.005',
        integrator: 'DustSweeper',
        fee: '0.01',
        referrer: MY_WALLET,
        maxPriceImpact: '0.15',
        skipSimulation: 'false',
      });

      if (denyTools.bridges.length) params.set('denyBridges', denyTools.bridges.join(','));
      if (denyTools.exchanges.length) params.set('denyExchanges', denyTools.exchanges.join(','));

      const response = await fetch(`https://li.quest/v1/quote?${params.toString()}`, { cache: 'no-store' });
      const quote = await response.json();
      if (!response.ok) throw new Error(quote?.message || quote?.error || 'LI.FI could not return a route.');

      const tool = String(quote?.toolDetails?.key || quote?.tool || '').trim();
      const estimate = quote?.estimate || {};
      const tx = quote?.transactionRequest;

      // LI.FI itself can reject/suppress routes whose price impact is above the
      // threshold. We also refuse obviously incomplete quotes.
      if (!tool || !estimate?.fromAmount || !estimate?.toAmount) {
        setRoutePreflight({ status: 'no-route', message: 'LI.FI did not return a complete executable quote for this asset.' });
        return;
      }

      // If an ERC-20 approval is still required, gas estimation of the final
      // swap/bridge can legitimately fail before approval. Do not call that a
      // bad route; the Widget will request the approval first.
      const approvalAddress = String(estimate?.approvalAddress || '').trim();
      const native = isNativeTokenAddress(tokenAddress);
      let allowanceKnownSufficient = native;

      if (!native && approvalAddress && walletAddress && typeof window !== 'undefined') {
        const ethereum = (window as any).ethereum;
        if (ethereum?.request) {
          try {
            const owner = walletAddress.slice(2).padStart(64, '0');
            const spender = approvalAddress.toLowerCase().replace(/^0x/, '').padStart(64, '0');
            const data = `0xdd62ed3e${owner}${spender}`;
            const allowanceHex = await ethereum.request({
              method: 'eth_call',
              params: [{ to: tokenAddress, data }, 'latest'],
            });
            const allowance = BigInt(allowanceHex || '0x0');
            allowanceKnownSufficient = allowance >= BigInt(fromAmount);
          } catch {
            // Unknown allowance: do not falsely classify the route as broken.
            allowanceKnownSufficient = false;
          }
        }
      }

      if (!tx?.to || !tx?.data) {
        setRoutePreflight({
          status: allowanceKnownSufficient ? 'unsafe' : 'needs-approval',
          tool,
          message: allowanceKnownSufficient
            ? `LI.FI returned ${tool}, but no executable transaction data was returned.`
            : `LI.FI found ${tool}. Gas simulation will be possible after the token approval.`
        });
        return;
      }

      // When allowance is already sufficient, ask the connected wallet provider
      // to simulate the exact transaction that LI.FI returned. This is the
      // closest client-side check to the MetaMask warning we observed.
      if (allowanceKnownSufficient && typeof window !== 'undefined') {
        const ethereum = (window as any).ethereum;
        if (ethereum?.request) {
          try {
            const txForEstimate: any = {
              from: walletAddress,
              to: tx.to,
              data: tx.data,
              value: tx.value || '0x0',
            };
            if (tx.gasLimit) txForEstimate.gas = tx.gasLimit;
            if (tx.gasPrice) txForEstimate.gasPrice = tx.gasPrice;
            await ethereum.request({ method: 'eth_estimateGas', params: [txForEstimate] });
          } catch (error: any) {
            const message = String(error?.message || 'The wallet could not estimate gas for this LI.FI transaction.');
            setRoutePreflight({ status: 'unsafe', tool, message: `LI.FI selected ${tool}, but the wallet could not simulate the final transaction. This route will not be trusted automatically.` });
            return;
          }
        }
      }

      setRoutePreflight({
        status: allowanceKnownSufficient ? 'ready' : 'needs-approval',
        tool,
        message: allowanceKnownSufficient
          ? `Route checked successfully via ${tool}. LI.FI will show the full operation details before you approve it.`
          : `Route available via ${tool}. Review the LI.FI details and approve or cancel the operation.`
      });
    } catch (error: any) {
      setRoutePreflight({ status: 'error', message: String(error?.message || 'Route preflight failed.') });
    }
  };

  const handleRecoveryFailure = (failure: { tool?: string; type?: string; message?: string }) => {
    const tool = String(failure.tool || '').trim();
    const type = String(failure.type || '').toLowerCase();

    setRecoveryFailure(failure);

    // A real on-chain failure is different from a quote error: the selected
    // route has already proven that it cannot complete for this recovery.
    // Immediately deny only the failed LI.FI tool, remount the widget, and
    // let LI.FI search again. Nordstern stays blocked permanently.
    if (tool) {
      const lower = tool.toLowerCase();
      setRouteRetrying(true);
      setRoutePreflight({
        status: 'checking',
        tool,
        message: `The ${tool} route failed on-chain. Searching for another LI.FI route…`,
      });

      setFailedRouteTools((current) => {
        const isBridge =
          type === 'cross' ||
          /gaszip|stargate|across|cbridge|hop|synapse|relay|orbiter|meson|debridge|celer|wormhole|socket|connext|layerzero/i.test(lower);

        if (isBridge) {
          if (current.bridges.some((item) => item.toLowerCase() === lower)) return current;
          return { ...current, bridges: [...current.bridges, tool] };
        }

        if (current.exchanges.some((item) => item.toLowerCase() === lower)) return current;
        return { ...current, exchanges: [...current.exchanges, tool] };
      });

      // The deny-list state above changes the LI.FI config. This nonce forces
      // a fresh widget instance so it does not keep the already-failed route.
      setRecoveryWidgetNonce((n) => n + 1);
    } else {
      setRouteRetrying(false);
    }
  };

  const handleRecoveryCompleted = () => {
    setRecoveryFailure(null);
    setFailedRouteTools({ bridges: [], exchanges: [] });
    setRouteRetrying(false);
    setRoutePreflight({ status: 'ready', message: 'Recovery completed successfully.' });
  };

  const selectRecoveryToken = (token: any) => {
    setRecoveryFailure(null);
    setFailedRouteTools({ bridges: [], exchanges: [] });
    setRouteRetrying(false);
    setRecoveryWidgetNonce((n) => n + 1);
    setRoutePreflight({ status: 'checking', message: 'Checking the LI.FI route…' });
    setSelectedRecoveryToken(token);
    window.setTimeout(() => {
      recoverySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const loadPortfolio = async () => {
    if (!isValidAddress(portfolioAddress)) { setPortfolioError('Enter a valid 0x wallet address.'); return; }
    setPortfolioLoading(true); setPortfolioError('');
    const result = await fetchRealBalances(portfolioAddress.trim());
    setPortfolioLoading(false);
    if (result?.error) { setPortfolioError(result.error === 'ERROR' ? 'Unable to load wallet data.' : result.error); return; }
    setPortfolioTokens(Array.isArray(result.tokens) ? result.tokens : []);
    setPortfolioTotal(Number(result.totalValue || 0).toFixed(2));
    const allPositiveAssets = Array.isArray(result.tokens)
      ? result.tokens.filter((token: any) => hasPositiveWalletBalance(token))
      : [];

    // The headline is intentionally limited to assets for which we have
    // a reliable USD price from the wallet data provider.
    const pricedValue = allPositiveAssets.reduce(
      (sum: number, token: any) => sum + Number(token?.valueUsd || 0),
      0
    );

    setFoundTokens(allPositiveAssets);
    setFoundBalance(pricedValue.toFixed(2));
    setPortfolioTokens(Array.isArray(result.tokens) ? result.tokens : []);
    setPortfolioTotal(Number(result.totalValue || pricedValue || 0).toFixed(2));
  };

  useEffect(() => {
    if (!selectedRecoveryToken) {
      setRoutePreflight({ status: 'idle' });
      setRouteRetrying(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      await preflightRecoveryRoute(selectedRecoveryToken, failedRouteTools);
      setRouteRetrying(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [selectedRecoveryToken, failedRouteTools, portfolioAddress, userAddressInput]);

  // Configuracoes LiFi (mantidas iguais, adaptadas apenas nas cores do theme se necessário)
  const finderConfig = useMemo(() => {
    const chainId = selectedRecoveryToken ? getTokenChainId(selectedRecoveryToken) : '';
    const tokenAddress = selectedRecoveryToken ? getTokenAddress(selectedRecoveryToken) : '';
    const tokenBalance = selectedRecoveryToken ? Number(selectedRecoveryToken?.balance || 0) : 0;
    // Keep 0.5% in the wallet to avoid LI.FI/balance precision rejections.
    // This is NOT a minimum: every positive dust amount is still attempted.
    const fromAmount = formatLiFiAmount(tokenBalance, 0.995);
    const hasTokenBalance = Number.isFinite(tokenBalance) && tokenBalance > 0 && Number(fromAmount) > 0;

    return {
      integrator: 'DustSweeper',
      fee: 0.01,
      referrer: MY_WALLET,
      exchanges: { deny: ['nordstern', ...failedRouteTools.exchanges] },
      bridges: failedRouteTools.bridges.length ? { deny: failedRouteTools.bridges } : undefined,
      // Default destination = the same chain where the asset was found.
      // If no asset is selected yet, keep Polygon as the neutral widget fallback.
      toChain: chainId ? Number(chainId) : 137,
      toToken: '0x0000000000000000000000000000000000000000',
      ...(chainId ? { fromChain: Number(chainId) } : {}),
      ...(tokenAddress ? { fromToken: tokenAddress } : {}),
      ...(hasTokenBalance ? { fromAmount } : {}),
      // Do not impose a USD minimum: Dust Sweeper is specifically designed
      // to attempt recovery of small dust amounts. LI.FI may still reject a
      // route when the network/route economics make a transaction impossible.
      useRelayerRoutes: true,
      slippage: 0.005,
      maxPriceImpact: 0.15,
      routePriority: 'RECOMMENDED' as const,
      formUpdateKey: selectedRecoveryToken
        ? `${chainId}-${tokenAddress}-${fromAmount}-same-chain`
        : 'finder-default',
      appearance: 'dark' as const,
      variant: 'compact' as const,
      theme: { palette: { primary: { main: '#8B5CF6' }, background: { paper: '#121215', default: '#09090b' } } },
      disabledUI: ['walletHeader', 'appearance', 'poweredBy'],
    };
  }, [selectedRecoveryToken, failedRouteTools]);
  const safetyBuyConfig = useMemo(() => ({ integrator: 'DustSweeper', fee: 0.01, referrer: MY_WALLET, exchanges: { deny: ['nordstern'] }, toChain: safetyResult?.detectedChain ? parseInt(safetyResult.detectedChain) : 56, toToken: tokenToScan, appearance: 'dark' as const, variant: 'compact' as const, theme: { palette: { primary: { main: '#8B5CF6' }, background: { paper: '#121215', default: '#09090b' } } } }), [tokenToScan, safetyResult]);
  const swapConfig = useMemo(() => ({ integrator: 'DustSweeper', referrer: MY_WALLET, fee: 0.00, exchanges: { deny: ['nordstern'] }, appearance: 'dark' as const, variant: 'main' as const, subvariant: 'split' as const, subvariantOptions: { split: 'swap' as const }, fromChain: 56, toChain: 56, fromToken: '0x0000000000000000000000000000000000000000', toToken: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', fromAmount: 0.01, slippage: 0.03, routePriority: 'CHEAPEST' as const, theme: { palette: { primary: { main: '#8B5CF6' }, background: { paper: '#121215', default: '#09090b' } } }, disabledUI: ['walletHeader', 'appearance', 'poweredBy'] }), []);
  const bridgeConfig = useMemo(() => ({ integrator: 'DustSweeper_Bridge', fee: 0.005, referrer: MY_WALLET, exchanges: { deny: ['nordstern'] }, appearance: 'dark' as const, variant: 'main' as const, subvariant: 'split' as const, subvariantOptions: { split: 'bridge' as const }, theme: { palette: { primary: { main: '#8B5CF6' }, background: { paper: '#121215', default: '#09090b' } } }, disabledUI: ['walletHeader', 'appearance', 'poweredBy'] }), []);

  const tabs = [
    { id: 'finder', label: 'Dust Finder', icon: '🧹' },
    { id: 'alchemy', label: 'Wallet', icon: '🔎' },
    { id: 'bridge', label: 'Bridge', icon: '🌉' },
    { id: 'swap', label: 'Swap', icon: '🔄' },
    { id: 'safety', label: 'Scam Scan', icon: '🛡️' }
  ];

  return (
    <div className="min-h-screen w-full bg-[#060609] text-gray-100 font-sans relative overflow-x-hidden">
      {/* Premium background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20rem] left-1/2 -translate-x-1/2 w-[48rem] h-[48rem] rounded-full bg-purple-600/[0.09] blur-[130px]" />
        <div className="absolute top-[28rem] left-[-18rem] w-[38rem] h-[38rem] rounded-full bg-blue-600/[0.06] blur-[120px]" />
        <div className="absolute bottom-[-18rem] right-[-12rem] w-[38rem] h-[38rem] rounded-full bg-violet-600/[0.07] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-[1380px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Hero */}
        <section className="relative mb-2 overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#050812] shadow-[0_35px_100px_rgba(0,0,0,0.48)]">
          <div className="relative min-h-[360px] overflow-hidden sm:min-h-[430px] lg:min-h-[500px]">
            <img
              src="/Dust%20Sweeper%20Rescue%20Funds.jpg"
              alt="Find and recover forgotten crypto"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-100 saturate-[1.25] contrast-125 brightness-115"
            />

            {/* Readability on the left only — the right side stays vivid */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050812]/[0.96] via-[#050812]/62 via-45% to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050812]/45 via-transparent to-[#050812]/10" />

            <div className="relative flex min-h-[360px] flex-col justify-center px-7 py-11 sm:min-h-[430px] sm:px-11 lg:min-h-[500px] lg:px-14">
              <div className="max-w-[620px]">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/[0.10] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                  Scan 7 supported networks
                </div>

                <h1 className="text-4xl font-black leading-[0.94] tracking-[-0.06em] text-white sm:text-5xl lg:text-[4.9rem]">
                  Find and recover<br />
                  forgotten crypto
                </h1>

                <p className="mt-5 max-w-[510px] text-base leading-6 text-gray-100 sm:text-lg">
                  Find forgotten crypto. Analyze balances. Bridge and swap across 60+ blockchains through LI.FI.
                </p>

                {/* Official ecosystem badges — kept inside the hero */}
                <div className="mt-5 flex w-full flex-row gap-2.5 lg:absolute lg:right-4 lg:top-1/2 lg:z-20 lg:w-[205px] lg:-translate-y-1/2 lg:flex-col">
                  <a
                    href="https://www.alchemy.com/dapps/dust-sweeper-tool"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Dust Sweeper Tool on Alchemy"
                    className="group w-1/2 rounded-xl border border-blue-400/70 bg-[#07101f]/90 px-3 py-2.5 shadow-[0_0_24px_rgba(59,130,246,0.14)] backdrop-blur-md transition-all duration-300 hover:border-blue-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.24)] lg:w-auto"
                  >
                    <div className="flex items-center justify-center">
                      <img
                        src="/alchemy-logo.png"
                        alt="Alchemy"
                        className="h-8 w-auto max-w-full object-contain"
                      />
                    </div>
                    <div className="mt-1.5 text-center text-[8px] font-semibold uppercase tracking-[0.16em] text-gray-300">
                      Listed on Alchemy
                    </div>
                  </a>

                  <a
                    href="https://dappradar.com/dapp/dust-sweeper-tool"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Dust Sweeper Tool on DappRadar"
                    className="group w-1/2 rounded-xl border border-cyan-400/70 bg-[#07101f]/90 px-3 py-2.5 shadow-[0_0_24px_rgba(34,211,238,0.12)] backdrop-blur-md transition-all duration-300 hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.22)] lg:w-auto"
                  >
                    <div className="flex items-center justify-center">
                      <img
                        src="/dappradar-logo.png"
                        alt="DappRadar"
                        className="h-8 w-auto max-w-full object-contain"
                      />
                    </div>
                    <div className="mt-1.5 text-center text-[8px] font-semibold uppercase tracking-[0.16em] text-gray-300">
                      Ranked on DappRadar
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool switcher */}
        <section className="relative z-20 mb-5 -mt-1 rounded-[24px] border border-white/[0.09] bg-[#0b0e16]/90 p-2 shadow-[0_22px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'finder') setScanStep('initial');
                  if (tab.id === 'safety') setSafetyStep('initial');
                }}
                className={`group min-w-[132px] rounded-xl border px-3 py-3 text-left transition-all duration-300 sm:min-w-0 ${
                  activeTab === tab.id
                    ? 'border-purple-400/30 bg-gradient-to-br from-purple-500/25 to-indigo-500/15 shadow-[0_12px_35px_rgba(88,28,135,0.22)]'
                    : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.045]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base transition-colors ${
                    activeTab === tab.id ? 'border-purple-300/20 bg-purple-400/10' : 'border-white/8 bg-white/[0.035]'
                  }`}>{tab.icon}</span>
                  <div className="min-w-0">
                    <p className={`truncate text-[11px] font-bold uppercase tracking-wider ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{tab.label}</p>
                    <p className="mt-0.5 truncate text-[9px] text-gray-600">
                      {tab.id === 'finder' ? 'Recover dust' : tab.id === 'alchemy' ? 'View balances' : tab.id === 'bridge' ? 'Move chains' : tab.id === 'swap' ? 'Exchange tokens' : 'Check risk'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:items-start">
          {/* Main tool area */}
          <div className="min-w-0">
            {/* FINDER */}
            {activeTab === 'finder' && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                {scanStep !== 'result' ? (
                  <div className="relative overflow-hidden rounded-[30px] border border-white/[0.09] bg-gradient-to-br from-[#11131c] to-[#0b0c12] shadow-[0_28px_80px_rgba(0,0,0,0.40)]">
                    {scanStep === 'scanning' && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#09090b]/85 backdrop-blur-md">
                        <div className="mb-5 h-14 w-14 animate-spin rounded-full border-2 border-purple-400/20 border-t-purple-400" />
                        <p className="text-sm font-bold text-purple-300">Scanning your wallet across networks...</p>
                        <p className="mt-1 text-xs text-gray-500">Checking balances and recoverable dust</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-6 border-b border-white/[0.07] px-6 py-6 sm:px-8">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-400/35 bg-purple-500/15 text-2xl">⌕</div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">Dust Finder</p>
                          <h2 className="mt-1 text-[1.7rem] font-black tracking-[-0.025em] text-white">Find and recover forgotten crypto</h2>
                          <p className="mt-1 text-sm text-gray-500">Connect your wallet or paste any address to scan across 7 supported networks.</p>
                        </div>
                      </div>
                      <div className="hidden shrink-0 items-center gap-3 sm:flex">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">♢</span>
                        <div>
                          <p className="text-xs font-bold text-gray-200">Non-custodial</p>
                          <p className="text-[10px] text-gray-600">You control your funds</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="grid gap-6 lg:grid-cols-[190px_minmax(0,1fr)]">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-300">Step 1</p>
                          <h3 className="mt-2 text-base font-bold text-white">Enter wallet address</h3>
                          <p className="mt-2 text-xs leading-5 text-gray-500">We'll scan 7 supported networks for hidden balances.</p>
                        </div>
                        <div>
                          <div className="flex gap-2 rounded-xl border border-white/10 bg-black/25 p-2">
                            <input
                              type="text"
                              placeholder="Paste wallet address (0x...)"
                              value={userAddressInput}
                              onChange={(e) => setUserAddressInput(e.target.value)}
                              className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-white outline-none placeholder:text-gray-600"
                            />
                            <button
                              onClick={handleScan}
                              className="inline-flex h-[56px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_32px_rgba(109,40,217,0.30)] transition hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_16px_38px_rgba(109,40,217,0.42)] focus:outline-none focus:ring-2 focus:ring-purple-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              ⌕ Scan Wallet
                            </button>
                          </div>
                          <p className="mt-3 text-[11px] text-gray-600">Your address is public and only used for this scan.</p>
                          <div className="mt-4 rounded-xl border border-emerald-400/10 bg-emerald-500/[0.035] p-3.5 text-[11px] leading-relaxed text-gray-500">
                            <p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">Security &amp; privacy</p>
                            Dust Sweeper Tool does not take custody of user funds. Wallet scanning can be performed using a public wallet address without connecting a wallet. Swap and bridge transactions are executed through third-party infrastructure and require confirmation in your own wallet.
                          </div>
                        </div>
                      </div>

                      <div className="my-6 border-t border-white/[0.07]" />

                      <div className="grid gap-6 lg:grid-cols-[190px_minmax(0,1fr)]">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-300">Step 2</p>
                          <h3 className="mt-2 text-base font-bold text-white">Recover your funds</h3>
                          <p className="mt-2 text-xs leading-5 text-gray-500">If we find dust, you'll be able to bridge or swap it.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Total recoverable</p>
                              <p className="mt-1 text-3xl font-black text-white">$0.00</p>
                              <p className="mt-1 text-xs text-gray-600">Run a wallet scan to find recoverable dust.</p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-gray-500">Waiting</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                  <div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0d0e14]/80 p-1.5">
                    <div className="flex min-w-[150px] items-center gap-2 rounded-xl bg-white/[0.035] px-3 py-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-[10px] font-black text-emerald-300">✓</span>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-emerald-300">Step 1 complete</p>
                        <p className="text-[10px] font-bold text-white">Wallet scanned</p>
                      </div>
                    </div>
                    <span className="hidden h-px w-6 shrink-0 bg-purple-400/30 sm:block" />
                    <div className={`flex min-w-[190px] items-center gap-2 rounded-xl border px-3 py-2 ${selectedRecoveryToken ? 'border-emerald-400/25 bg-emerald-500/10' : 'border-purple-400/25 bg-purple-500/10'}`}>
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${selectedRecoveryToken ? 'bg-emerald-500/20 text-emerald-200' : 'bg-purple-500/25 text-purple-200'}`}>{selectedRecoveryToken ? '✓' : '2'}</span>
                      <div>
                        <p className={`text-[8px] font-black uppercase tracking-[0.14em] ${selectedRecoveryToken ? 'text-emerald-300' : 'text-purple-300'}`}>{selectedRecoveryToken ? 'Step 3 active' : 'Step 2 active'}</p>
                        <p className="text-[10px] font-bold text-white">{selectedRecoveryToken ? 'Recover selected asset' : 'Review and choose asset'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="relative overflow-hidden rounded-[30px] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.11] via-transparent to-transparent p-6 shadow-[0_25px_70px_rgba(0,0,0,0.30)] sm:p-8">
                      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
                      <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                            ✓ Scan complete
                          </div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Priced assets</p>
                          <p className={`mt-2 text-4xl font-black tracking-tight sm:text-5xl ${parseFloat(foundBalance) > 0 ? "text-white" : "text-gray-500"}`}>
                            {parseFloat(foundBalance) > 0 ? `$${foundBalance}` : "Price unavailable"}
                          </p>
                          <p className="mt-2 text-[11px] text-gray-500">
                            USD value shown only for assets with a reliable price · {foundTokens.length} asset{foundTokens.length === 1 ? '' : 's'} found
                            {getUnpricedAssetsCount(foundTokens) > 0 ? ` · ${getUnpricedAssetsCount(foundTokens)} without a reliable USD price` : ''}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-gray-600">{shortAddr(portfolioAddress || userAddressInput)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={async () => {
                              const shareText = parseFloat(foundBalance) > 0 ? `I found $${foundBalance} in crypto dust with Dust Sweeper. Check your wallet: https://dustsweepertool.com` : `I found crypto assets with Dust Sweeper. Check your wallet: https://dustsweepertool.com`;
                              if (navigator.share) {
                                try { await navigator.share({ title: 'Dust Sweeper', text: shareText, url: 'https://dustsweepertool.com' }); } catch {}
                              } else {
                                await navigator.clipboard.writeText(shareText);
                                alert('Recovery link copied!');
                              }
                            }}
                            className="rounded-xl border border-purple-400/25 bg-purple-500/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-purple-200 transition hover:bg-purple-500/20"
                          >
                            ↗ Share recovery
                          </button>
                          <button onClick={handleResetScan} className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-300 transition hover:bg-white/10 hover:text-white">
                            New scan
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[30px] border border-white/[0.08] bg-gradient-to-b from-white/[0.035] to-white/[0.018] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.26)] sm:p-6">
                      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-purple-300">Step 2 · Your wallet assets</p>
                          <h3 className="mt-1 text-lg font-black text-white">Choose an asset to recover</h3>
                          <p className="mt-1 text-xs text-gray-500">All assets with a positive balance are shown. Select one to check for a recovery route.</p>
                        </div>
                        <span className="self-start rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-gray-400 sm:self-auto">{foundTokens.length} asset{foundTokens.length === 1 ? '' : 's'} found</span>
                      </div>
                      <div className="max-h-[390px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                        {foundTokens.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center">
                            <p className="text-sm font-semibold text-gray-400">No assets with a positive balance found</p>
                            <p className="mt-1 text-xs text-gray-600">The wallet scan did not return any positive token balances.</p>
                          </div>
                        ) : (
                          foundTokens.map((token, i) => {
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
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/15 bg-purple-500/10 text-xs font-black text-purple-200">
                                        {displayToken.symbol.slice(0, 4)}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="truncate font-bold text-white">{displayToken.symbol}</p>
                                        <p className="truncate text-[11px] text-gray-400">{displayToken.name}</p>
                                      </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                      <span className="rounded-lg border border-white/[0.07] bg-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-500">{networkName}</span>
                                      {tokenAmount > 0 && <span className="text-[10px] font-mono text-gray-500">{tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {displayToken.symbol}</span>}
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                                    {Number(token?.priceUsd || 0) > 0 ? (
                                      <p className="font-mono text-sm font-bold text-emerald-400">${formatUsd(token.valueUsd)}</p>
                                    ) : (
                                      <p className="text-sm font-semibold text-gray-500">Price unavailable</p>
                                    )}
                                    <button
                                      onClick={() => selectRecoveryToken(token)}
                                      disabled={!canRoute}
                                      className={`rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition ${isSelected ? 'border border-purple-300/30 bg-purple-500/25 text-white' : 'border border-purple-400/25 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 hover:text-white'} disabled:cursor-not-allowed disabled:opacity-40`}
                                    >
                                      {isSelected ? 'Selected ✓' : 'Recover'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {foundTokens.length > 0 && (
                      <div ref={recoverySectionRef} className="scroll-mt-6 overflow-hidden rounded-[30px] border border-purple-400/15 bg-gradient-to-br from-purple-500/[0.075] via-transparent to-transparent p-3.5 shadow-[0_28px_85px_rgba(0,0,0,0.36)] sm:p-4">
                        <div className="mb-4 flex items-end justify-between gap-4 px-2 pt-1">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300">Step 3 · Recovery</p>
                            <h3 className="mt-1 text-[1.35rem] font-black tracking-tight text-white sm:text-2xl">Recover your crypto</h3>
                            <p className="mt-1 text-xs text-gray-500">Review the route, costs and estimated amount in the secure LI.FI window. The default destination is the same network where the asset was found.</p>
                          </div>
                          <span className="hidden rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 sm:inline-flex">Powered by LI.FI</span>
                        </div>

                        {selectedRecoveryToken ? (
                          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-purple-400/20 bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-xs font-black text-purple-200">
                                {getTokenDisplay(selectedRecoveryToken).symbol.slice(0, 4)}
                              </div>
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">You are recovering</p>
                                <p className="mt-1 font-black text-white">{getTokenDisplay(selectedRecoveryToken).symbol} <span className="font-medium text-gray-400">· {getNetworkDisplay(selectedRecoveryToken)}</span></p>
                                <p className="mt-1 text-[10px] font-mono text-gray-500">{Number(selectedRecoveryToken?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 12 })} {getTokenDisplay(selectedRecoveryToken).symbol}</p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              {Number(selectedRecoveryToken?.priceUsd || 0) > 0 ? (
                                <p className="font-mono text-lg font-black text-emerald-400">${formatUsd(selectedRecoveryToken.valueUsd)}</p>
                              ) : (
                                <p className="text-sm font-semibold text-gray-500">Price unavailable</p>
                              )}
                              <button onClick={() => setSelectedRecoveryToken(null)} className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-500 transition hover:text-white">Choose another asset</button>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 rounded-2xl border border-dashed border-purple-400/20 bg-black/20 p-5 text-center">
                            <p className="text-sm font-bold text-white">Select an asset above to start recovery</p>
                            <p className="mt-1 text-xs text-gray-500">The selected token will be pre-loaded into the recovery widget.</p>
                          </div>
                        )}

                        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-sm">✦</span>
                            <p className="text-[11px] text-gray-400">LI.FI will show the available route and all estimated costs before you approve.</p>
                          </div>
                          <span className="hidden shrink-0 text-[9px] font-bold uppercase tracking-widest text-gray-600 sm:block">You decide</span>
                        </div>

                        <DustSweeperWidgetMonitor
                          recoveryKey={recoveryKey}
                          onFailure={handleRecoveryFailure}
                          onCompleted={handleRecoveryCompleted}
                        />

                        <div className="overflow-hidden rounded-[24px] border border-white/[0.10] bg-black shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                          <LiFiWidget
                            key={selectedRecoveryToken ? `${getTokenChainId(selectedRecoveryToken)}-${getTokenAddress(selectedRecoveryToken)}-${getTokenDisplay(selectedRecoveryToken).symbol}-${recoveryWidgetNonce}-${failedRouteTools.bridges.join(',')}-${failedRouteTools.exchanges.join(',')}` : `finder-default-${recoveryWidgetNonce}`}
                            integrator="DustSweeper"
                            config={finderConfig as any}
                          />
                        </div>

                        {selectedRecoveryToken && routeRetrying && (
                          <div className="mt-3 rounded-2xl border border-purple-400/20 bg-purple-500/[0.07] p-4">
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 text-base">↻</span>
                              <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-wider text-purple-200">Searching for another route</p>
                                <p className="mt-1 text-[11px] leading-relaxed text-gray-400">Dust Sweeper is asking LI.FI for another option. You can continue using the LI.FI window above and review any available route, token or provider.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {recoveryFailure && (
                          <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-500/[0.08] p-4">
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 text-lg">⚠️</span>
                              <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-wider text-amber-300">We couldn't complete that route</p>
                                <p className="mt-1 text-[11px] leading-relaxed text-gray-400">Dust Sweeper removed the failed route and is looking for another option. Your asset was not intentionally marked as unrecoverable.</p>
                                {recoveryFailure.tool && <p className="mt-2 text-[10px] font-mono text-amber-200/80">Failed route: {recoveryFailure.tool}</p>}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedRecoveryToken && ['unsafe','no-route','error'].includes(routePreflight.status) && (
                          <div className={`mt-3 rounded-2xl border p-4 ${
                            routePreflight.status === 'no-route'
                              ? 'border-white/[0.10] bg-white/[0.03]'
                              : 'border-amber-400/20 bg-amber-500/[0.07]'
                          }`}>
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 text-base">{routePreflight.status === 'no-route' ? 'ⓘ' : '⚠️'}</span>
                              <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-wider text-gray-300">{routePreflight.status === 'no-route' ? 'No route found during the initial check' : 'Recovery check needs attention'}</p>
                                <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{routePreflight.message || 'No route was found during the initial check. LI.FI may still find another route or provider. You can change the token, amount or available route above.'}</p>
                              </div>
                            </div>
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
                    {portfolioError && <p className="mt-3 text-center text-xs text-red-400">{portfolioError}</p>}
                  </div>

                  {portfolioTokens.length === 0 ? (
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
                        <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
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
                              onClick={() => setActiveTab('finder')}
                              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_12px_28px_rgba(109,40,217,0.28)] transition hover:from-purple-500 hover:to-indigo-500"
                            >
                              Find & Recover →
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
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.025] p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="mb-3 flex items-center gap-3 px-4 pt-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-xl">🌉</span>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-purple-300">Cross-chain</p><h2 className="font-black text-white">Bridge assets</h2></div>
                </div>
                <LiFiWidget integrator="DustSweeper_Bridge" config={bridgeConfig as any} />
              </div>
            )}

            {/* SWAP */}
            {activeTab === 'swap' && (
              <div className="min-h-[610px] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.025] p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
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
                        <div className="mt-7">
                          <div className="mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-300">Swap into this token</p>
                            <p className="mt-1 text-sm font-bold text-white">Review the available route with LI.FI</p>
                            <p className="mt-1 text-xs leading-5 text-gray-500">Dust Sweeper does not verify whether this token can be sold. Review the full operation in LI.FI before approving it.</p>
                          </div>
                          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"><LiFiWidget integrator="DustSweeper" config={safetyBuyConfig as any} /></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer notices */}
        <div className="mt-5 grid gap-3 text-[11px] leading-relaxed text-gray-500 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mr-2">ℹ️</span>All wallet assets with a positive balance are shown regardless of value. Tokens with no reliable price or liquidity may still be unavailable for routing.</div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"><span className="mr-2">⚠️</span>If you see “No Routes Available”, LI.FI may not have an executable route for that asset or amount. Dust Sweeper does not impose a $1 minimum.</div>
        </div>

        <footer className="py-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-700">Dust Sweeper · Recover · Swap · Bridge · Verify</p>
        </footer>
      </main>
    </div>
  );
}