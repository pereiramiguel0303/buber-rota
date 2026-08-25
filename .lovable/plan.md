# Rede real de São Leopoldo: paradas, linhas oficiais e integração no mapa

Manter tudo que já funciona (movimento GPS dos ônibus, ancoragem geográfica, tema, navegação inferior, favoritos, alertas) e substituir a rede fictícia pelos nomes reais das três viações, com pontos de parada interativos e seleção de linha totalmente integrada.

## 1. Rede oficial (dados)

Reescrever `src/lib/transit/network.ts` com as linhas exatamente como nos quadros de horários:

- **Viação Feitoria**: Feitoria, Cohab, Imperatriz, São Geraldo, Feitoria Nova, Seller, Imigrante, Taurus, Jardim Cora, Lomba Grande, Kilombo.
- **Viação Sinoscap**: Sinoscap, Vila Tereza, Industrial (Vila Duque), Est. Unisinos – Parada 14, Itapema, Vila Batista / Santos Dumont, Vila Maria, Cetemp, Boa Saúde, Monte Blanco, Gedore, Paim.
- **Viação Leopoldense**: Leopoldense, Campina, Vila Glória, Antônio Leite, Scharlau, Quimisinos, Jardim Fênix.

Cada linha ganha: operadora, cor por operadora (com variação por linha), sentidos `Bairro → Centro` e `Centro → Bairro`, itinerário de paradas e intervalo médio derivado dos horários dos PDFs enviados.

Paradas com nomes reais/representativos e coordenadas corretas de São Leopoldo: Estação Unisinos, Parada 14, Estação Rio dos Sinos, Praça da Prefeitura, Centro, Hospital Centenário, UPA, Terminal Feitoria, Vila Duque, Santos Dumont, Vila Tereza, Scharlau, Campina, Imperatriz, Cohab, Lomba Grande, Taurus, Gedore, Cetemp, Boa Saúde, Vila Maria, Paim, Itapema etc. (~70 pontos), cada uma com acessibilidade.

## 2. Traçados reais pelas ruas

Regerar `src/lib/transit/shapes.generated.ts` chamando o roteador OSRM para cada linha/sentido, para que a rota siga ruas de verdade (nada de linha reta) e os ônibus continuem circulando exatamente sobre o traçado. O motor de simulação atual é preservado; só passa a receber mais linhas e sentidos.

## 3. Pontos de parada no mapa

- Camada de pontos discreta sempre visível (pequenos círculos sutis, distintos dos ônibus), ancorada às coordenadas — zoom/arraste não desloca nada.
- Área de toque ampliada para o celular; rótulo aparece só em zoom próximo ou quando a parada pertence à linha selecionada.
- Ao tocar numa parada abre um card com: nome, linhas que atendem (nome oficial + operadora), sentido (Bairro–Centro / Centro–Bairro), próximos ônibus com previsão em minutos, e ícones de acessibilidade.

## 4. Seleção de linha integrada

Ao escolher uma linha (na busca, na lista de linhas ou clicando num ônibus):

- rota completa destacada sobre as ruas, com setas de direção do sentido ativo;
- paradas da linha em destaque, numeradas na sequência do itinerário, com marcação de origem e destino;
- somente os ônibus daquela linha em evidência (os demais ficam atenuados, não somem);
- painel inferior com sentido atual, botão para inverter Bairro↔Centro, lista sequencial das paradas e próximos horários;
- ao tocar numa parada da linha, o card prioriza as chegadas dessa linha.

Sem linha selecionada: todos os pontos e ônibus visíveis de forma discreta.

## 5. Telas e mobile

- `/linhas`: agrupada por viação (Feitoria, Sinoscap, Leopoldense), com busca e contagem de veículos em circulação.
- `/linhas/$lineId`: itinerário vertical com sentidos, horários dos quadros oficiais, veículos ativos, favoritar e "ver no mapa".
- Cards em bottom sheet com altura limitada para o mapa continuar visível; alvos de toque ≥44px; layout vertical de celular.

## Detalhes técnicos

- Camadas MapLibre: `stops-circle`, `stops-hit`, `stops-route`, `stops-route-seq`, `stops-route-label`, `stop-selected`, `route-line`, `route-arrows` — todas GeoJSON, portanto geográficas.
- Corrigir as fontes de rótulo para `Noto Sans Regular/Bold` com glyphs do OpenFreeMap (ajuste pendente da última alteração) e ligar o filtro de `stop-selected` ao ponto selecionado.
- Tipos em `src/lib/transit/types.ts` ganham `operator`, `direction` e `Line.directions`; `TransitProvider` continua igual, então a futura troca por Firebase/GPS real segue sendo uma linha.
- Horários oficiais dos PDFs entram como módulo de dados `src/lib/transit/schedules.ts`, usado nas previsões quando não há veículo próximo.
