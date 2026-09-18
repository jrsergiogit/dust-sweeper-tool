# Dust Sweeper - StarBridge LI.FI Fix

A comparação com o StarBridge funcional encontrou a diferença importante:

StarBridge usa:


e no config do LI.FI:

    providers: [EthereumProvider()],

O Dust Sweeper não tinha esse provider. O widget chegava a abrir, mas os tokens ficavam nos skeletons.

O fix preserva as configurações atuais do Dust Sweeper (integrators, API keys, fees, referrer, temas e abas) e adiciona somente o provider Ethereum usado pelo StarBridge.

## Aplicar

Na raiz do projeto Dust Sweeper:


Depois:

    npm run build

Se passar:

    npm run dev

O script cria automaticamente:

    app/page.tsx.bak-before-starbridge-provider-fix

Não substitua o projeto inteiro pelo StarBridge. A correção é somente no suporte do provider do LI.FI.


INSTALL NOTE:
This version pins LI.FI Widget 3.28.0 with React 18 and Wagmi 2.x for a clean npm dependency tree. Do not install @lifi/widget-provider-ethereum separately.
