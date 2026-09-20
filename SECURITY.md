# Security Policy

## Scope

This repository contains the source code for Dust Sweeper Tool. Security issues may involve application code, API routes, wallet interaction, transaction construction, dependencies, or configuration handling.

## Before reporting an issue

Please do not publish credentials, private keys, seed phrases, or other sensitive information in a public issue.

When reporting a security issue, include enough technical detail to reproduce the problem without exposing secrets or user data.

## Secrets

Server-side API credentials must be supplied through environment variables and must not be committed to the repository. See `.env.example` for the expected configuration name.

## Wallet safety

Dust Sweeper Tool is designed as a non-custodial application. Users should review transaction and token-approval details in their own wallet before signing. Blockchain transactions may be irreversible.

## Responsible disclosure

A public security-contact email is not currently published in this repository. Until a dedicated security contact is added, do not disclose sensitive exploit details publicly. The project should add an official security contact or GitHub private vulnerability-reporting channel before inviting external security reports.


### Routing coverage
Dust Finder balance discovery and LI.FI execution are separate layers. Dust Finder currently queries 7 networks through Alchemy. Swap, bridge, and supported recovery routing use LI.FI across its broader multichain ecosystem. Recovery defaults to the source network when a compatible same-chain route is available; cross-chain execution depends on the selected asset, destination, liquidity, and live route.
