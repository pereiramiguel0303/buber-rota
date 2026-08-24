# BUBER

Crie um aplicativo mobile completo de monitoramento inteligente do transporte público, moderno, bonito, intuitivo e responsivo. A inspiração deve ser a facilidade de utilização de aplicativos de mapas e mobilidade, sem copiar a identidade visual do Uber ou de outros aplicativos.

O objetivo principal é permitir que o usuário visualize toda a rede de transporte público da cidade em um mapa, acompanhe diversos ônibus em tempo real, consulte linhas, rotas, pontos de parada, previsão de chegada, acessibilidade e alertas.

1. MAPA — PRINCIPAL ELEMENTO DO APLICATIVO

A tela inicial deve ser um mapa interativo da cidade, ocupando a maior parte da tela.

O usuário deve conseguir:

 Dar zoom para visualizar bairros específicos;

 Afastar o mapa para visualizar grande parte da cidade;

 Arrastar o mapa livremente;

 Localizar sua própria posição;

 Visualizar pontos de parada;

 Visualizar as rotas dos ônibus;

 Visualizar muitos ônibus circulando simultaneamente.

Conforme o usuário se afasta:

Zoom distante: mostrar a rede geral de transporte e os principais veículos.

Zoom aproximado: mostrar mais detalhes, como pontos de parada, nomes das ruas e ônibus individuais.

Os ônibus devem aparecer como pequenos ícones sobre o mapa e se movimentar conforme suas posições são atualizadas.

Criar uma aparência visual agradável, fazendo com que o mapa seja claramente o centro do aplicativo.

2. MUITOS ÔNIBUS E FROTAS

Não limitar o protótipo a apenas três ônibus.

Criar diversos veículos fictícios, distribuídos por diferentes regiões da cidade.

Por exemplo:

 BUS-101-01

 BUS-101-02

 BUS-102-01

 BUS-102-02

 BUS-203-01

 BUS-203-02

 BUS-301-01

 BUS-301-02

 BUS-302-01

 BUS-302-02

 BUS-410-01

 BUS-410-02

 BUS-505-01

 BUS-505-02

Criar pelo menos 15–20 ônibus simulados, distribuídos pelas diferentes linhas.

Cada ônibus deve possuir:

 ID;

 Linha;

 Rota;

 Destino;

 Latitude;

 Longitude;

 Velocidade;

 Status;

 Próxima parada;

 Previsão de chegada;

 Recursos de acessibilidade.

Os ônibus devem estar em posições diferentes e realistas, evitando que todos apareçam agrupados no mesmo local.

3. MENU DE LINHAS E FROTAS

Criar um menu lateral ou uma área acessível pelo mapa chamada:

🚌 Linhas e Frotas

Nesse menu, mostrar todas as linhas disponíveis.

Exemplo:

LINHAS DE ÔNIBUS

🚌 101 — Centro → Bairro Norte
🚌 102 — Centro → Bairro Sul
🚌 203 — Terminal → Zona Leste
🚌 301 — Centro → Universidade
🚌 302 — Centro → Terminal Norte
🚌 410 — Bairro → Centro
🚌 505 — Terminal → Zona Oeste

Ao selecionar uma linha, o aplicativo deve:

 Destacar sua rota no mapa;

 Mostrar todos os ônibus daquela linha;

 Mostrar os pontos de parada;

 Mostrar o destino;

 Mostrar os próximos horários.

4. EXPLORAÇÃO DA CIDADE

Quero que o aplicativo passe a sensação de que o usuário está explorando o sistema de transporte completo da cidade.

Por exemplo:

O usuário abre o aplicativo e vê o mapa inteiro.

Ao aproximar o zoom de determinado bairro, aparecem:

 Ônibus;

 Pontos;

 Rotas;

 Linhas daquela região.

Ao clicar em uma linha, sua rota inteira é destacada.

Ao clicar em um ônibus, aparecem seus detalhes.

Ao clicar em um ponto, aparecem os próximos ônibus.

Criar essa experiência de exploração de maneira fluida e visualmente bonita.

5. ÔNIBUS SELECIONADO

Ao tocar em um ônibus no mapa, abrir um painel inferior com:

BUS-302-01

Linha: 302
Destino: Terminal Norte
Status: 🟢 Em operação
Velocidade: 38 km/h
Próxima parada: Praça Central
Chegada estimada: 5 min

Também mostrar:

♿ Acessibilidade para cadeira de rodas
🦯 Recursos para deficiência visual
🔊 Informações sonoras
🪑 Assentos preferenciais
❄️ Ar-condicionado

6. ROTAS

Ao selecionar uma linha, destacar sua rota no mapa.

Mostrar claramente:

LINHA 302

Centro
↓
Praça Central
↓
Avenida Brasil
↓
Universidade
↓
Terminal Norte

Mostrar também os ônibus atualmente circulando nessa rota.

7. PREVISÃO DOS PRÓXIMOS ÔNIBUS

Criar uma área:

Próximos ônibus

🚌 BUS-302-01 — 5 min
🚌 BUS-302-02 — 10 min
🚌 BUS-302-03 — 17 min
🚌 BUS-302-04 — 25 min

Esses valores podem ser simulados inicialmente.

8. PONTOS DE PARADA

Ao clicar em um ponto:

📍 Praça Central

Linhas:

302 → 5 min
410 → 8 min
505 → 13 min

Mostrar também os recursos de acessibilidade disponíveis naquele ponto.

9. "PERTO DE MIM"

Criar uma função que utilize a localização do celular para encontrar os pontos mais próximos.

Exemplo:

Transportes próximos

📍 Praça Central — 120 m

302 → 5 min
410 → 9 min

📍 Avenida Brasil — 350 m

203 → 7 min
505 → 15 min

10. ACESSIBILIDADE

Criar informações de acessibilidade para diferentes necessidades.

Mostrar:

♿ Cadeira de rodas
🦯 Deficiência visual
🔊 Informações sonoras
🦮 Cão-guia
🪑 Assentos preferenciais
❄️ Ar-condicionado
♿ Espaço interno

Indicar claramente quais recursos cada veículo possui.

11. ALERTAS E SEGURANÇA

Criar uma área de alertas:

⚠️ Linha 302
Atraso estimado de 8 minutos.

⚠️ Linha 410
Desvio temporário.

⚠️ Linha 505
Interrupção parcial da rota.

Não inventar informações reais; utilizar apenas dados simulados durante o protótipo.

12. FAVORITOS

Permitir favoritar:

 Linhas;

 Pontos;

 Rotas.

Criar uma página:

⭐ Meus favoritos

302 — Centro → Terminal Norte
410 — Bairro → Centro
📍 Praça Central

13. PESQUISA

Adicionar uma barra de pesquisa no mapa.

Permitir pesquisar:

 Número da linha;

 Nome da linha;

 Ônibus;

 Ponto;

 Bairro;

 Destino.

Exemplo:

O usuário digita:

"302"

O aplicativo mostra:

Linha 302 — Centro → Terminal Norte
4 ônibus em circulação

Ao selecionar, destacar toda a rota no mapa.

14. FIREBASE

Preparar o aplicativo para utilizar Firebase Realtime Database.

Estruturar:

/onibus

/linhas

/pontos

/rotas

/acessibilidade

/alertas

Os ônibus devem ser atualizados automaticamente quando sua latitude e longitude forem alteradas.

15. HARDWARE DO PROJETO

O protótipo físico atual utilizará:

Arduino Mega + GPS NEO-6M

O GPS será responsável por obter:

 Latitude;

 Longitude;

 Velocidade;

 Horário.

O Arduino Mega processará essas informações.

Inicialmente, o aplicativo pode utilizar dados simulados, mas toda a estrutura deve ser preparada para futuramente substituir os dados fictícios pelos dados reais enviados pelo hardware.

A arquitetura futura será:

GPS NEO-6M → Arduino Mega → Comunicação → Firebase → Aplicativo

Não é necessário implementar todo o hardware agora; apenas deixar o aplicativo preparado para receber os dados reais posteriormente.

16. DESIGN

Criar uma identidade visual própria relacionada a:

🚌 Transporte + 📍 Localização + 📡 Tecnologia + 🗺️ Mobilidade

Não fazer uma cópia do Uber.

Priorizar:

 Mapa como elemento principal;

 Interface limpa;

 Ícones intuitivos;

 Animações suaves;

 Tipografia legível;

 Informações objetivas;

 Boa acessibilidade visual;

 Aparência moderna e tecnológica.

A interface deve parecer um sistema profissional de gerenciamento e acompanhamento de transporte público.

17. NAVEGAÇÃO

Criar uma barra inferior:

🗺️ MAPA | 🚌 LINHAS | ⭐ FAVORITOS | ⚠️ ALERTAS | 👤 PERFIL

O MAPA deve ser a tela principal.

No perfil:

 Nome;

 Preferências;

 Acessibilidade;

 Notificações;

 Linhas favoritas;

 Pontos favoritos.

18. PROTÓTIPO SIMULADO

Criar uma cidade fictícia ou utilizar uma representação de uma cidade real para demonstração.

Distribuir 15–20 ônibus por diferentes regiões e criar aproximadamente 8–10 linhas, cada uma com seus próprios itinerários e pontos de parada.

Os ônibus devem:

 Estar espalhados pela cidade;

 Pertencer a linhas diferentes;

 Possuir rotas diferentes;

 Ter velocidades diferentes;

 Ter previsões diferentes;

 Movimentar-se pelo mapa.

O objetivo é que, ao abrir o aplicativo, o usuário veja uma verdadeira rede de transporte público funcionando, e não apenas três marcadores parados.

OBJETIVO FINAL

A experiência deve ser:

ABRIR O APLICATIVO → VER A CIDADE → VER OS ÔNIBUS → DAR ZOOM → ESCOLHER UMA LINHA → VER A ROTA → ESCOLHER UM ÔNIBUS → VER ONDE ELE ESTÁ E QUANTO FALTA → CONSULTAR ACESSIBILIDADE E ALERTAS.

O resultado deve ser um protótipo visualmente bonito, funcional e convincente, capaz de demonstrar como um sistema de informações em tempo real pode tornar o transporte público mais acessível, seguro, eficiente e atrativo, incentivando sua utilização e reduzindo a dependência de veículos particulares.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://buber-rota.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5235b0a0-5cf8-4546-b378-945056c1f647).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
