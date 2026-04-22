# Chat Module (WebSocket + MongoDB)

## Objetivo
Implementar no backend um chat em tempo real via WebSocket (Socket.IO), com persistencia de mensagens no MongoDB, para o fluxo de tickets.

A conversa so e liberada apos o agente assumir o ticket, com validacao de acesso por papel (CLIENT, AGENT) e por vinculo com o ticket.

## Changelog

- Adicionado suporte a MongoDB e WebSocket na aplicacao:
  - app.module.ts
  - .env.example
  - docker-compose.yml
  - package.json
  - package-lock.json
- Criado modulo de chat com gateway, service, DTOs e schema:
  - chat.module.ts
  - chat.gateway.ts
  - chat.service.ts
  - join-room.dto.ts
  - send-message.dto.ts
  - chat-message.schema.ts
- Ajustada exportacao de autenticacao para uso do JwtService no ChatGateway:
  - auth.module.ts
- Adicionado endpoint para autoatribuicao do agente no ticket:
  - ticket.controller.ts
  - ticket.service.ts
- Novas regras no fluxo de ticket e chat:
  - Chat so pode ser acessado apos ticket ter agentId.
  - Cliente so acessa chat do proprio ticket.
  - Agente so acessa chat do ticket assumido por ele.
  - Admin pode acessar qualquer chat.
  - Mensagens vazias sao rejeitadas.
- Ajuste de seed para testes:
  - seed.ts
  - agent@agent.com passa a receber todos os grupos de suporte.
  - Seed passa a aceitar multiplos grupos por agente.

## Como testar

### 1. Preparar ambiente e dependencias

Voce pode subir os bancos de dados usando Docker ou configurar manualmente.

#### Opcao A: via Docker
Execute os comandos abaixo na raiz do projeto:

```bash
# Subir os bancos de dados (Postgres e MongoDB)
docker-compose up -d postgres mongo

# Iniciar o backend
npm run start:dev

# Opcional: popular dados de teste (atencao: limpa os dados existentes)
npm run seed
```

#### Opcao B: setup manual (sem Docker)
1. Crie uma copia do arquivo .env.example e renomeie para .env.
2. Configure um banco MongoDB local ou em nuvem:
   - Local: https://www.mongodb.com/try/download/community
   - Nuvem: https://www.mongodb.com/cloud/atlas
3. Atualize a string de conexao no .env (exemplo):
   - MONGO_URI=mongodb://localhost:27017/orbita
4. Inicie o servidor:

```bash
# npx prisma migrate reset
# npx prisma generate
# npx prisma migrate deploy
npx prisma db seed
npm start
```

### 2. Fazer login de cliente e agente
Use o Postman: https://www.postman.com/downloads/

Faça login para obter os access_token e guarde os dois tokens.

#### Login cliente
POST http://localhost:3333/auth/login

```json
{
  "email": "client@client.com",
  "password": "Password@123"
}
```

#### Login agente
POST http://localhost:3333/auth/login

```json
{
  "email": "agent@agent.com",
  "password": "Password@123"
}
```

### 3. Obter folha de triagem e criar ticket

Pegue a primeira pergunta da triagem:

#### Traverse 1
POST http://localhost:3333/triage-rules/traverse

```json
{
  "answerTrigger": "aplicativos-web-mobile"
}
```

Com o id retornado, chame a proxima etapa:

#### Traverse 2
POST http://localhost:3333/triage-rules/{nodeId}/traverse

```json
{
  "answerTrigger": "afeta-apenas-minha-conta"
}
```

Pegue o triageLeafId retornado e crie o ticket autenticado como CLIENT:

#### Criar ticket
POST http://localhost:3333/tickets

Headers:
- Authorization: Bearer CLIENT_TOKEN

```json
{
  "triageLeafId": "LEAF_ID"
}
```

Guarde o ticketId retornado.

### 4. Assumir ticket com agente

Autenticado como AGENT:

#### Assumir
PATCH http://localhost:3333/tickets/{ticketId}/assign-self

Headers:
- Authorization: Bearer AGENT_TOKEN

Esperado:
- O ticket retorna com agentId preenchido.
- O status vira OPENED (se estava em TRIAGE).

### 5. Testar WebSocket (Socket.IO) no Postman

Abra duas conexoes Socket.IO:

- Conexao A (Cliente)
  - URL: http://localhost:3333/chat
  - Auth: CLIENT_TOKEN
- Conexao B (Agente)
  - URL: http://localhost:3333/chat
  - Auth: AGENT_TOKEN

Em ambas, emita o evento joinRoom com payload:

```json
{
  "ticketId": "TICKET_ID"
}
```

Esperado:
- Evento joinedRoom
- Evento chatHistory

### 6. Enviar mensagens em tempo real

Na conexao A (Cliente), emita sendMessage:

```json
{
  "ticketId": "TICKET_ID",
  "content": "Mensagem do cliente"
}
```

Na conexao B (Agente), emita sendMessage:

```json
{
  "ticketId": "TICKET_ID",
  "content": "Mensagem do agente"
}
```

Esperado:
- Ambas as conexoes recebem newMessage em tempo real.

### 7. Validar persistencia no MongoDB

Verifique no banco orbita-chat (ou nome configurado), collection messages.

Esperado:
- Documentos com os campos:
  - ticketId
  - senderId
  - senderRole
  - content
  - createdAt

### 8. Testes de validacao recomendados (edge cases)

- [ ] Tentar joinRoom antes do assign-self (deve bloquear).
- [ ] Tentar enviar mensagem com content vazio (deve retornar erro).
- [ ] Tentar acessar chat de ticket de outro usuario (deve retornar Forbidden).
