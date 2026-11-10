# Stack Finance

Stack Finance é um sistema pessoal de gerenciamento financeiro, desenvolvido em etapas como projeto de portfólio. O app acompanha receitas, despesas, contas e faturas, divisão de gastos entre pessoas e investimentos, com funcionamento offline e suporte a celulares e computadores.

> **Status:** planejamento inicial. As regras e decisões registradas em `docs/PROJECT_PLAN.md` serão refinadas antes da implementação.

## Objetivos

- Acompanhar receitas, despesas, contas futuras e saldo disponível.
- Acompanhar compras de cartão e a parte de cada pessoa em gastos compartilhados.
- Registrar compras e vendas de investimentos, incluindo datas, quantidades, preços e taxas.
- Planejar orçamentos e estimar um valor disponível para investir, com critérios transparentes e configuráveis.

## Direção do produto

A primeira versão será para uma pessoa por instalação, sem login ou sincronização. O modelo de gastos compartilhados permitirá cadastrar outras pessoas e repartir compras. O app deverá funcionar offline. Os dados ficarão no dispositivo, com exportação e importação de backup planejadas.

A interface será responsiva e poderá ser instalável como PWA. A direção visual poderá incluir gamificação discreta e referências a pixel art moderna, mas será tratada depois das regras e fluxos principais.

## Etapas planejadas

1. **Definição e fundação:** validar escopo, regras financeiras, arquitetura e estrutura do projeto.
2. **Contas e movimentações:** receitas, despesas, categorias, contas e visão mensal.
3. **Cartões e despesas compartilhadas:** compras, faturas, parcelas, divisões e acertos.
4. **Investimentos:** ativos, operações e cotações informadas manualmente.
5. **Planejamento:** orçamentos, reserva e estimativa de valor investível.
6. **Acabamento:** experiência mobile, acessibilidade, backup, documentação e identidade visual.

As etapas poderão ser divididas em entregas menores.

## Tecnologias propostas

- TypeScript para modelar os dados e as regras com tipos explícitos.
- Uma interface web responsiva. A biblioteca de interface e as ferramentas serão definidas na etapa de fundação.
- IndexedDB para armazenamento offline no navegador.
- Exportação e importação de backup local, com validação dos dados.

## Desenvolvimento

Veja [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) para escopo, regras iniciais e proposta de arquitetura.


