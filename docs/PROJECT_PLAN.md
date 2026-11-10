# Plano do projeto | Stack Finance

## 1. Visão e limites

Stack Finance será um app financeiro pessoal, offline-first e responsivo. A primeira versão será usada por uma pessoa em cada instalação. Não haverá contas de usuário, backend ou sincronização entre dispositivos. O usuário poderá cadastrar pessoas que participam dos gastos e dividir compras feitas no cartão.

**Fora do MVP:** conexão bancária, importação automática de extratos, cotações automáticas, aconselhamento financeiro e sincronização em nuvem. Esses itens podem ser avaliados depois, sem comprometer o modelo local.

## 2. Escopo funcional inicial

### Painel e movimentações

- Registrar receitas e despesas com valor, data, conta, categoria e descrição.
- Consultar por mês, conta e categoria.
- Apresentar o saldo atual separado das previsões.
- Permitir correção de lançamentos sem perder vínculos com faturas e acertos.

### Contas, cartões e faturas

- Cadastrar contas financeiras e cartões com datas de fechamento e vencimento.
- Acompanhar obrigações futuras, pagas e vencidas, além de recorrências e compras parceladas.
- Marcar uma fatura como paga registrando a liquidação vinculada.
- Não contabilizar o pagamento da fatura novamente como despesa: as compras são as despesas, o pagamento liquida o valor devido no cartão.

### Gastos compartilhados

- Cadastrar pessoas envolvidas nas compras.
- Informar quem fez a compra e dividir o total por valores entre uma ou mais pessoas.
- Validar que as partes somam exatamente o valor da compra, considerando centavos.
- Mostrar valores a receber e a pagar por pessoa.
- Registrar acertos vinculados às partes quitadas.

### Investimentos e planejamento

- Registrar ativo, compra/venda, quantidade, preço, taxas, data e conta de origem.
- Informar manualmente o preço atual para estimar valor de mercado e variação.
- Definir orçamentos por categoria e uma reserva mínima configurável.
- Estimar valor investível usando saldo em dinheiro, obrigações previstas e reserva. Mostrar as parcelas do cálculo e não tratar essa estimativa como recomendação financeira.

## 3. Regras e modelo de dados propostos

Valores monetários serão representados em centavos inteiros (ou tipo decimal exato), nunca em ponto flutuante binário comum. Datas de calendário serão armazenadas sem conversões implícitas de fuso horário. Identificadores estáveis permitirão relacionar operações e itens ao longo do tempo.

Entidades candidatas:

- **Conta:** tipo, moeda e saldo inicial.
- **Cartão:** conta associada, limite opcional, fechamento e vencimento.
- **Pessoa:** pessoa que pode participar de um gasto compartilhado.
- **Categoria:** classificação de entrada ou saída.
- **Movimentação:** entrada, despesa ou transferência, com origem e vínculos relevantes.
- **Fatura/obrigação:** período, vencimento, valor devido e estado de pagamento.
- **Compra e divisão:** compra original e suas parcelas por pessoa, soma validada contra o total.
- **Acerto:** pagamento recebido ou realizado para liquidar valores compartilhados.
- **Ativo e operação:** ativo e operações de compra/venda com quantidade, preço, taxas e data.
- **Cotação manual:** preço e data da informação utilizada para a estimativa.
- **Orçamento e reserva:** período, categoria e limites definidos pela pessoa usuária.

A estrutura detalhada do domínio acompanhará a definição dos fluxos de uso. Pagamentos de cartão, transferências e acertos terão semântica explícita para evitar duplicação em relatórios.

## 4. Direção de arquitetura

A interface será construída com React e TypeScript, usando Vite para desenvolvimento e geração dos builds. O código será organizado por funcionalidade, mantendo as regras financeiras fora dos componentes visuais.

- **Domínio:** tipos/objetos com regras e invariantes, como compra, divisão e posição de investimento.
- **Aplicação:** casos de uso, como registrar compra, pagar fatura, liquidar acerto e calcular o resumo mensal.
- **Infraestrutura:** repositórios IndexedDB, migrações do esquema e serialização/validação de backup.
- **Apresentação:** telas, formulários e componentes acessíveis, adaptados a toque e teclado.

### Aplicação prática de SOLID e POO

- Classes e módulos mantêm responsabilidades coesas, interface, cálculos e armazenamento ficam separados.
- Regras encapsuladas protegem invariantes, por exemplo, divisão que precisa fechar o total e não permitir liquidação duplicada.
- Contratos de repositório separam casos de uso do IndexedDB, permitindo trocar detalhes de armazenamento sem reescrever o domínio.
- Funcionalidades novas devem estender os pontos previstos sem exigir alterações espalhadas por toda a aplicação.
- Classes agrupam estado e comportamento quando isso protege regras do domínio. Tipos e funções simples representam dados sem comportamento, nem todo objeto precisa de uma abstração própria.

## 5. Offline, dispositivos e dados

- Interface responsiva com prioridade de uso em telas pequenas.
- PWA instalável como meta da fundação.
- IndexedDB guarda dados localmente. A cópia em cada navegador/dispositivo é independente.
- Exportação/importação de backup local deve validar versão e estrutura antes de substituir ou mesclar dados.
- Migrações versionadas preservam dados quando o formato local evoluir.
- Nenhum dado financeiro será enviado a serviços externos na primeira versão.

## 6. Etapas e critérios de conclusão

1. **Planejamento e fundação:** definir a arquitetura e a estrutura inicial, configurar TypeScript e preparar a execução local. Critério de conclusão: projeto executável e documentação de arquitetura e execução.
2. **Contas e movimentações:** cadastrar, editar, remover e consultar lançamentos, apresentar totais mensais conferíveis.
3. **Cartões e compartilhamento:** ciclos de fatura, parcelas, divisão exata, estado pago/pendente e acertos sem dupla contagem.
4. **Investimentos:** histórico de operações e posição calculada com preço manual datado.
5. **Planejamento:** orçamento, reserva e cálculo explicado do valor disponível para investir.
6. **Polimento:** responsividade, acessibilidade, backup/recuperação e identidade visual sutil.

Cada etapa termina em um incremento pequeno, coeso e revisável.

## 7. Conventional Commits

O repositório adota o formato `tipo(escopo opcional): descrição curta`, por exemplo `docs: define project scope and architecture` e `feat(transactions): add expense entry`.

## 8. Definições pendentes

- Estratégia exata de instalação PWA e compatibilidade de armazenamento nos navegadores alvo.
- Regras detalhadas de parcelamento, estorno, reembolso e divisão variável.
- Método de custo de ativos e tratamento de vendas parciais.
- Conteúdo e formato do backup e se a importação terá opção de mesclar.
- Direção final de identidade visual e elementos de gamificação discreta.
