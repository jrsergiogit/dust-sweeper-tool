# Dust Sweeper Tool

Dust Sweeper Tool is a non-custodial multichain wallet toolkit for discovering and analyzing low-value token balances, with integrated swap, bridge, and token-security tools.

## What the application does

- Scans public wallet addresses for supported on-chain token balances.
- Uses Alchemy as blockchain data infrastructure for Dust Finder balance discovery across 7 currently queried networks.
- Uses LI.FI infrastructure for swap, bridge, and supported cross-chain recovery routing across 60+ blockchains.
- Uses GoPlus token-security data for supported token scans.
- Lets users review and confirm transaction actions in their own wallet.

Wallet scanning can be performed with a public wallet address without connecting a wallet. A wallet connection is used when an on-chain transaction needs to be prepared and signed.

## Non-custodial model

Dust Sweeper Tool does not take custody of user funds. Transaction confirmation takes place in the user's wallet. The application does not publish a proprietary smart-contract address; swap and bridge routes may interact with third-party contracts selected by the routing infrastructure.

Always review the transaction and approval details shown by your wallet before signing.

## Infrastructure

- [Alchemy](https://www.alchemy.com/dapps/dust-sweeper-tool) — blockchain data infrastructure and public ecosystem listing.
- [LI.FI](https://li.fi/) — swap and bridge routing infrastructure.
- [GoPlus](https://gopluslabs.io/) — token-security data used by the scanner.
- [DappRadar](https://dappradar.com/dapp/dust-sweeper-tool) — public ecosystem listing.

## Local development

Requirements:

- Node.js
- npm

Install dependencies:

```bash
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Then set `ALCHEMY_API_KEY` in `.env.local`.

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Environment variables

The Alchemy API key is server-side configuration and should never be committed to GitHub.

```text
ALCHEMY_API_KEY=your_key_here
```

Do not commit `.env`, `.env.local`, private keys, seed phrases, wallet credentials, or other secrets.

## Security

See the application's [Security page](https://app.dustsweepertool.com/security) for information about wallet access, transactions, approvals, infrastructure, and independent verification.

For the repository's security practices and responsible disclosure guidance, see [`SECURITY.md`](SECURITY.md).

## License

No open-source license is currently declared for this repository. Unless a license is added, the source code should not be assumed to be licensed for unrestricted reuse.
