# MobiSL — Monitoramento Inteligente do Transporte Público (São Leopoldo/RS)

Aplicativo mobile-first com mapa real de São Leopoldo, frota simulada em movimento e toda a camada de dados isolada para receber, no futuro, posições reais vindas do GPS NEO-6M + Arduino Mega.

## Experiência

- **Mapa em tela cheia** (MapLibre GL + tiles OpenStreetMap) centrado em São Leopoldo: zoom, arrasto, botão "minha localização", rotação desativada para simplicidade.
- **Detalhe por zoom**: afastado mostra rede geral + veículos agrupados; aproximado revela pontos de parada, rótulos e cada ônibus individualmente com ícone orientado pela direção.
- **Ônibus animados**: 18 veículos em 8 linhas, interpolando posição a cada segundo ao longo de itinerários reais desenhados sobre ruas da cidade (Centro, Rio dos Sinos, Campus Unisinos, Scharlau, Feitoria, Rio Branco, Padre Réus, São Miguel).
- **Barra de pesquisa flutuante** sobre o mapa: número/nome de linha, ID de ônibus, ponto, bairro ou destino; ao escolher, a rota é destacada e o mapa faz fly-to.

## Telas (navegação inferior: Mapa · Linhas · Favoritos · Alertas · Perfil)

1. **Mapa** — mapa + busca + botão "Perto de mim" + bottom sheet contextual.
2. **Linhas e Frotas** — lista das 8 linhas com cor, origem→destino, nº de ônibus em circulação; ao abrir: itinerário vertical de paradas, próximos horários, veículos ativos, botão de favoritar e "ver no mapa".
3. **Favoritos** — linhas, pontos e rotas salvos (persistidos no dispositivo).
4. **Alertas** — atrasos, desvios e interrupções simulados, com severidade e linha afetada.
5. **Perfil** — nome, preferências de acessibilidade, notificações, atalhos para favoritos.

## Painéis (bottom sheets)

- **Ônibus**: ID, linha, destino, status, velocidade, próxima parada, chegada estimada e chips de acessibilidade (♿ 🦯 🔊 🦮 🪑 ❄️).
- **Ponto**: nome, linhas que atendem com previsão em minutos (contagem viva), recursos de acessibilidade do ponto, favoritar.
- **Linha**: rota destacada no mapa, sequência de paradas, "Próximos ônibus" (4 previsões).
- **Perto de mim**: pontos ordenados por distância real da geolocalização (fallback para o centro da cidade), com próximas chegadas.

## Design

Identidade própria: verde-azulado profundo + âmbar de sinalização, tipografia geométrica legível, cartões elevados com cantos suaves, ícones de linha em cápsulas coloridas, transições curtas nos sheets. Alto contraste e alvos de toque ≥44px. Nada de estética Uber.

## Detalhes técnicos

- **Mapa**: `maplibre-gl` carregado apenas no cliente (React.lazy dentro de `<ClientOnly>`), estilo raster OSM; dados de linhas/paradas em módulo browser-safe compartilhado com as rotas SSR.
- **Rotas TanStack**: `/` (mapa), `/linhas`, `/linhas/$linhaId`, `/favoritos`, `/alertas`, `/perfil` — cada uma com `head()` próprio.
- **Camada de dados trocável**: `src/lib/transit/` com tipos (`Bus`, `Line`, `Stop`, `RouteShape`, `Alert`, `Accessibility`), um `TransitProvider` de interface única e a implementação `simulationProvider`. Uma futura `firebaseProvider` (nós `/onibus`, `/linhas`, `/pontos`, `/rotas`, `/acessibilidade`, `/alertas`) entra trocando uma linha, sem mexer na UI.
- **Estado**: store leve + TanStack Query para leituras; favoritos e preferências em localStorage lidos dentro de `useEffect`.
- **Dados simulados**: 8 linhas, ~60 paradas, 18 ônibus com velocidades, status e previsões distintas; tick de simulação no cliente.

Nenhum dado real de operação é apresentado — tudo é rotulado como simulação no protótipo.
