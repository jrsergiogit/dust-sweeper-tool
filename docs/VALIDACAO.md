# Validacao deste pacote

## Realizado
- 42 testes locais aprovados: funcoes de cotacao, medicao, quantidades, UX estrutural e adaptacao do formato de eventos. Framework, provedores e chamadas externas simulados.
- Transpilacao de todos os arquivos TypeScript/TSX sem erros de sintaxe.
- Typecheck estrito dos modulos independentes, incluindo filtro e ordenacao dos ativos.
- Renderizacao ISOLADA dos componentes reais, com React/Next/LI.FI simulados, em HTML e CSS Tailwind. Inspecao no Chromium de cinco estados em 320, 390, 768 e 1440 px: sem rolagem horizontal nos 20 cenarios. Botao inicial de scan visivel nas quatro alturas verificadas. Isso nao equivale a um teste do framework ou do widget real.
- Logica de copia do instalador testada com arquivos ficticios: original intacto; .env.local preservado na copia; .git/node_modules excluidos; middleware antigo removido apenas na copia; destinos perigosos rejeitados.

## Ainda precisa ser confirmado
- Nao foi possivel baixar as dependencias do npm neste ambiente (falha de DNS). O build completo e o typecheck com as dependencias reais NAO foram executados aqui.
- O assistente TESTAR.bat realiza instalacao, testes, typecheck e build no computador do usuario. Se houver erro, interrompe sem publicar nem alterar a pasta original.
- A janela de selecao de pasta e a execucao do arquivo .bat precisam ser verificadas no Windows do usuario. A logica Node de copia foi testada separadamente neste ambiente.
- Nenhuma carteira foi conectada, nenhuma transacao foi assinada e nenhuma comissao foi verificada on-chain.
- O Apps Script atualmente publicado nao veio no projeto. Preservamos o formato do envio antigo e a API/tela do painel existente; eventos adicionais podem depender de adaptacao futura do script. Nenhuma migracao ou novo backend foi incluido.

## Configuracoes preservadas
- Mesmas taxas, carteira de comissoes, integradores e redes do scanner.
- Chave LI.FI lida apenas na rota de servidor. Aceita a variavel antiga NEXT_PUBLIC_LIFI_SWEEPER_KEY como fallback para dispensar configuracao manual; o valor nao e passado ao widget nem a modulos client-side.
- Eventos locais e tag de anuncios desativados durante o teste local para nao contaminar conversoes.
- Next e eslint-config-next fixados em 16.3.8; ver release oficial: https://nextjs.org/blog/september-2026-security-release
- O instalador aproveita o lockfile da copia original e npm install o atualiza. Nao e necessario excluir ou editar o lockfile manualmente.

## Referencias tecnicas consultadas
- https://docs.li.fi/api-reference/rate-limits
- https://docs.li.fi/api-reference/introduction
- https://docs.li.fi/widget/widget-events
