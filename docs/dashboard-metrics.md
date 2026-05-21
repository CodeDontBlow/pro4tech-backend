# Dashboard Metrics

- Quais funcoes sao usadas.
- O que cada uma mede.
- Por que a consulta foi implementada dessa forma.
- Quais filtros e criterios foram aplicados.

As metricas sao consolidadas em DashboardService e dependem de TicketService, TicketRepository, ChatService e UserRepository.

## Visao Geral do Dashboard

A funcao `getDashboardOverview()` agrega, em paralelo, metricas de tickets, tempo medio de resposta, satisfacao, volume por hora e disponibilidade de agentes. O objetivo e reduzir o tempo total de resposta do endpoint, executando consultas independentes simultaneamente.

## Contagens de Tickets
### Total de Tickets Abertos

Origem: `TicketService.countOpenTickets()`

Logica:
- Conta tickets com `status = OPENED`.
- Exclui tickets deletados (`deletedAt = null`).
- Exclui tickets arquivados (`isArchived = false`).

Por que:
- Tickets abertos representam demanda ativa de atendimento.

### Total de Tickets Fechados

Origem: `TicketService.countClosedTickets()`

Logica:
- Conta tickets com `status IN (CLOSED, RESOLVED)`.
- Exclui deletados e arquivados.

Por que:
- O negocio considera tanto RESOLVED quanto CLOSED como tickets finalizados.

### Total de Tickets em Andamento

Origem: `TicketService.countInProgressTickets()`

Logica:
- Conta tickets com `status IN (TRIAGE, ESCALATED)`.

Por que:
- TRIAGE e ESCALATED representam atendimento ativo ou em triagem.
- Esses status refletem carga operacional corrente.

### Total de Tickets Reabertos

Origem: `TicketService.countReopenedTickets()`

Logica:
- Conta tickets com `status = REOPENED`.

Por que:
- Reaberturas indicam falha de resolucao ou necessidade de acompanhamento.

## Tempo Medio de Primeira Resposta

Origem: `ChatService.getAverageFirstResponseTimeMs()`

Logica:
- Busca todos os tickets ativos (nao deletados e nao arquivados).
- Busca, no MongoDB, a primeira mensagem de agente em cada ticket.
- Calcula `firstResponseAt - ticket.createdAt` por ticket.
- Retorna a media em milissegundos.

Por que:
- A primeira resposta mede rapidez inicial do atendimento.
- Usar o primeiro envio de agente evita contar mensagens internas ou do cliente.
- Media de tickets ativos e suficiente para o indicador global.

Observacoes:
- Tickets sem resposta de agente nao entram no calculo.
- O resultado e convertido para minutos e formatado em `HH:MM` no Dashboard.

## Tempo Medio de Resolucao

Origem: `TicketRepository.getAverageResolutionTimeMs()`

Logica:
- Busca tickets com `closedAt != null`, nao deletados e nao arquivados.
- Calcula `closedAt - createdAt` para cada ticket.
- Retorna a media em milissegundos.

Por que:
- `closedAt` e a fonte confiavel para medir encerramento real.
- Excluir deletados/arquivados evita distorcoes.
- Media simples e suficiente para indicador agregado.

## Distribuicao de Satisfacao

Origem: `TicketRepository.getCustomerSatisfactionDistribution()`

Logica:
- Agrupa tickets por `ratingScore` (apenas nao nulos).
- Conta quantos tickets existem por nota.
- Ordena por nota crescente.

Por que:
- Permite montar grafico de distribuicao por nota.
- Ignorar `ratingScore = null` evita incluir tickets sem avaliacao.
- Ordenacao por nota facilita plotagem no frontend.

## Volume de Tickets por Hora

Origem: `TicketRepository.getTicketVolumeByHour()`

Logica:
- Consulta SQL com `EXTRACT(HOUR FROM createdAt)`.
- Conta tickets por hora.
- Filtra tickets nao deletados e nao arquivados.
- Preenche um bucket com 24 horas (0..23) para garantir ausencia de gaps.

Por que:
- O grafico precisa mostrar todas as horas do dia, mesmo com zero.
- O calculo por hora mostra picos de demanda e ajuda na escala de agentes.
- SQL direto e mais eficiente para agregacao por hora.

## Disponibilidade de Agentes

Origem: `UserRepository.countByChatStatus()`

Logica:
- Conta usuarios com `role = AGENT` e `isActive = true`.
- Para online: `chatStatus IN (ONLINE, BUSY, AWAY)`.
- Para offline: `chatStatus = OFFLINE`.
- Exclui usuarios deletados.

Por que:
- Status `BUSY` e `AWAY` ainda contam como agente logado.
- Separar online/offline suporta indicadores de capacidade atual.

## Qualidade de Atendimento

### Taxa de Reabertura

Origem: `TicketRepository.getReopenRatePercent()`

Logica:
- Busca no historico tickets com `actionType = REOPEN`.
- Aplica filtro opcional `createdAt >= since`.
- Usa `distinct` por `ticketId` para nao duplicar.
- Conta total de tickets fechados no periodo (`status IN CLOSED/RESOLVED` e `closedAt != null`).
- Retorna `reopenedCount / closedCount * 100` com 2 casas.

Por que:
- Considerar apenas tickets fechados no denominador evita inflar o percentual.
- Distinct por ticket impede contar varias reaberturas do mesmo ticket.
- Filtrar por periodo permite comparacao temporal.

### Tickets por Assunto

Origem: `TicketRepository.getTicketsPerSubject(since)`

Logica:
- Junta Ticket com TicketSubject.
- Filtra tickets ativos (nao deletados/arquivados) e com assunto definido.
- Aplica filtro opcional de data.
- Agrupa por assunto e ordena por volume.

Por que:
- Permite identificar principais motivos de abertura.
- Ajuda a priorizar melhorias por assunto com maior impacto.

## Ranking de Empresas

Origem: `TicketRepository.getCompanyTicketStats(...)` e `getCompanyTicketStatsTotal(...)`

Logica:
- Agrupa tickets por empresa.
- Retorna: total de tickets, quantidade de avaliacoes e media de rating.
- Filtra por periodo e prefixo do nome, quando informado.
- Pagina com `LIMIT/OFFSET`.
- Total de paginas calculado via query separada contando empresas distintas.

Por que:
- Ranking por volume de tickets mostra empresas mais demandantes.
- Media e contagem de rating permitem avaliar qualidade por cliente.
- Total separado evita distorcoes de paginacao em agregacoes.

## Ranking de Agentes

Origem: `TicketRepository.getAgentTicketStats(...)` e `getAgentTicketStatsTotal(...)`

Logica:
- Agrupa tickets por agente.
- Retorna: quantidade de fechados, tempo medio de resolucao, media e contagem de rating.
- Usa `FILTER` no SQL para contar somente status fechados.
- Calcula tempo medio por diferenca `closedAt - createdAt`.
- Aplica filtros por periodo e nome.
- Pagina resultados e calcula total por consulta separada.

Por que:
- `FILTER` permite contar fechados sem excluir tickets em outros status.
- Tempo medio de resolucao e indicador operacional por agente.
- Paginar evita consultas muito pesadas em bases grandes.

## Conversao e Apresentacao no Dashboard

No `DashboardService`:
- Valores em ms sao convertidos para minutos e depois para rotulo `HH:MM`.
- Ratings sao arredondados para 2 casas.
- Periodos sao convertidos em `since` apenas se `periodDays` for valido.

Motivos:
- Padroniza visualizacao no frontend.
- Garante que dados invalidos nao quebrem o layout.
- Mantem consistencia de formato entre cards e tabelas.
