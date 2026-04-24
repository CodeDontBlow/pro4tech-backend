# Pro4Tech Backend

Backend API desenvolvido com NestJS para o projeto Pro4Tech, utilizando arquitetura modular, Prisma ORM para gerenciamento de banco de dados e Docker para containerizacao.

## Tecnologias Utilizadas

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## Pre-requisitos

- **[Visual Studio Code](https://code.visualstudio.com/)** - Editor de codigo
- **[Node](https://nodejs.org/en)**
- **[PostgreSQL](https://www.postgresql.org)** e **[MongoDB](https://www.mongodb.com/)** (para execucao sem Docker)
- **[Docker](https://www.docker.com/)** - (Opcional)

## Como Rodar

Voce pode rodar o backend de duas formas principais:

### Opcao 1: PostgreSQL e MongoDB via Docker + Backend Local

1. **Clone o repositorio**

   ```bash
   git clone https://github.com/seu-usuario/pro4tech-backend.git
   cd pro4tech-backend
   ```

2. **Configure as variaveis de ambiente**

   ```bash
   cp .env.example .env
   # Edite o arquivo .env conforme necessario
   # DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/seu_banco_de_dados?schema=public"
   # MONGO_URI="mongodb://localhost:27017/orbita-chat"
   ```

3. **Suba os bancos via Docker**

   ```bash
   docker-compose up -d postgres mongo
   # Esse comando sobe os DOIS servicos nomeados: postgres e mongo.
   # Se quiser subir apenas um, passe somente o nome dele (ex.: docker-compose up -d mongo).

   # docker-compose down para finalizar
   ```

4. **Inicie o backend localmente**

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed    # Popular o banco com dados iniciais (opcional)
   npm run start:dev
   ```

5. **Acessar a documentacao da API**: http://localhost:3333/api

---

### Opcao 2: PostgreSQL e MongoDB Locais + Backend Local

Repita os passos 1 e 2 da Opcao 1 para clonar o repositorio e configurar as variaveis de ambiente.

3. **Certifique-se de que PostgreSQL e MongoDB estao rodando localmente**
   - Configure `DATABASE_URL` e `MONGO_URI` no `.env` conforme seu ambiente local.

4. **Gere o Prisma Client e inicie o backend**

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed    # Popular o banco com dados iniciais (opcional)
   npm run start:dev
   ```

5. **Acessar a documentacao da API**: http://localhost:3333/api

## Estrutura do Projeto

```text
pro4tech-backend/
│
├── 📂 .devcontainer/         # Configuracao Dev Containers
├── 📂 docs/                  # Documentacao
│   ├── comandos.md           # Comandos e guias detalhados
│   ├── security.md           # Guias de seguranca
│   └── chat/
│       └── chat-module.md    # Guia do chat em tempo real
│
├── 📂 prisma/                # Prisma ORM
│   ├── schema.prisma         # Schema do banco de dados
│   ├── seed.ts               # Script de seed (dados iniciais)
│   └── migrations/           # Historico de migrations
│
├── 📂 generated/
│   └── prisma/               # Prisma Client gerado
│
├── 📂 src/                   # Codigo fonte
│   ├── main.ts               # Entry point e configuracao global
│   ├── app.module.ts         # Modulo raiz (agregacao de modulos)
│   ├── 📂 common/            # Codigo compartilhado
│   │   ├── decorators/       # Decoradores customizados
│   │   ├── dtos/             # DTOs globais
│   │   ├── filters/          # Filtros de excecao
│   │   └── interceptors/     # Interceptadores
│   ├── 📂 database/          # Camada de banco de dados
│   │   └── prisma/           # Modulo Prisma
│   └── 📂 modules/           # Modulos de negocio
│       ├── 📂 auth/          # Autenticacao e autorizacao
│       ├── 📂 user/          # Gerenciamento de usuarios
│       ├── 📂 agent/         # Gerenciamento de agentes/atendentes
│       ├── 📂 company/       # Gerenciamento de empresas
│       ├── 📂 ticket/        # Gerenciamento de tickets
│       ├── 📂 chat/          # Chat em tempo real (WebSocket)
│       ├── 📂 support-group/ # Grupos de suporte
│       ├── 📂 ticket-subject/# Assuntos de tickets
│       ├── 📂 triage-rule/   # Regras de triagem automatizada
│       └── 📂 accessCode/    # Codigos de acesso
│
├── 📂 test/                  # Testes E2E
├── 📄 docker-compose.yml     # Orquestracao de containers
├── 📄 Dockerfile             # Imagem Docker
└── 📄 package.json           # Dependencias
```

> **Tipo de Arquitetura:** Modular

> **Comandos completos:** Veja [docs/comandos.md](docs/comandos.md)

## Arquitetura

### Padrao de Modulos

Cada modulo de negocio segue o padrao:

- **Controller**: Recebe e trata requisicoes HTTP/WebSocket
- **Service**: Implementa a logica de negocio
- **Repository**: Acessa dados no banco
- **DTOs**: Validacao e tipagem de dados (entrada/saida)
- **Module**: Agregacao e exportacao do modulo

### Principais Modulos

#### **Auth (Autenticacao)**

- Guardioes JWT customizados
- Decoradores de autenticacao
- Gerenciamento de permissoes

#### **User (Usuarios)**

- CRUD completo de usuarios
- Atribuicao de papeis (roles)

#### **Agent (Agentes/Atendentes)**

- Cadastro de agentes
- Associacao com grupos de suporte
- Status e disponibilidade

#### **Company (Empresas)**

- Gerenciamento de empresas
- Configuracoes por empresa

#### **Ticket (Chamados)**

- Ciclo de vida de chamados
- Historico de mudancas e arquivamento
- Controle por perfil (CLIENT, AGENT, ADMIN)

#### **Chat (Tempo Real)**

- Chat por ticket com Socket.IO
- Persistencia de mensagens no MongoDB
- Regras de acesso por perfil e vinculo ao ticket

#### **Support Group (Grupos de Suporte)**

- Organizacao de agentes em grupos
- Roteamento de tickets

#### **Ticket Subject (Assuntos de Tickets)**

- Categorizacao de tickets
- Gerenciamento de assuntos disponiveis

#### **Triage Rule (Regras de Triagem)**

- Triagem automatizada de tickets
- Roteamento inteligente para grupos
- Estrutura de regras em arvore

### Banco de Dados

- **ORM**: Prisma
- **Banco relacional principal**: PostgreSQL
- **Banco para chat**: MongoDB (via Mongoose)
- **Migrations**: Prisma (`prisma/migrations`)

## Seed (Dados Iniciais)

O projeto inclui um seed que popula o banco com dados iniciais para facilitar testes.

### Como executar:

```bash
npx prisma db seed
```

### O que e criado:

- **Empresas**: empresas de exemplo
- **Usuarios**: usuarios com diferentes papeis (admin, agent, client)
- **Agentes**: agentes de atendimento
- **Grupos de Suporte**: grupos organizados por contexto
- **Assuntos**: categorias de tickets
- **Regras de Triagem**: roteamento automatico

### Localizacao:

Veja [prisma/seed.ts](prisma/seed.ts) para detalhes completos.

### Reset do Banco:

Para resetar o banco e reexecutar todas as migrations + seed:

```bash
npx prisma migrate reset --force
# Isso ira:
# 1. Dropar o banco
# 2. Recriar o banco
# 3. Executar todas as migrations
# 4. Executar o seed automaticamente
```

## Comandos Uteis

```bash
# Desenvolvimento
npm run start:dev          # Inicia com hot-reload
npm run start:debug        # Inicia em modo debug

# Producao
npm run build              # Build do projeto
npm run start:prod         # Inicia versao otimizada

# Banco de Dados
npx prisma generate        # Gerar cliente Prisma
npx prisma studio          # UI visual do banco
npx prisma migrate dev --name nome_da_migration  # Criar nova migration
npx prisma migrate deploy  # Aplicar migrations
npx prisma db seed         # Popular dados iniciais

# Linting e Testes
npm run lint               # ESLint
npm run test               # Testes unitarios
npm run test:e2e           # Testes E2E
npm run test:cov           # Cobertura de testes
```

## Documentacao Complementar

- [docs/comandos.md](docs/comandos.md)
- [docs/security.md](docs/security.md)
- [docs/chat/chat-module.md](docs/chat/chat-module.md)

## Licenca

Este projeto esta sob a licenca especificada no arquivo [LICENSE](LICENSE).