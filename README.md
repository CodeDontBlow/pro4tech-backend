# Pro4Tech Backend

Backend API desenvolvido com NestJS para o projeto Pro4Tech, utilizando arquitetura modular, Prisma ORM para gerenciamento de banco de dados e Docker para containerização.

## Tecnologias Utilizadas

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## Pré-requisitos

- **[Visual Studio Code](https://code.visualstudio.com/)** - Editor de código
- **[Node](https://nodejs.org/en)**
- **[Postgresql](https://www.postgresql.org)**
- **[Docker](https://www.docker.com/)** - ( Opcional )

## Como Rodar

Você pode rodar o backend de duas formas principais:

### Opção 1: PostgreSQL via Docker + Backend Local

1. **Clone o repositório**

   ```bash
   git clone https://github.com/seu-usuario/pro4tech-backend.git
   cd pro4tech-backend
   git checkout -b develop origin/develop
   git checkout develop
   ```

2. **Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env
   DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/seu_banco_de_dados?schema=public"
   # Edite o arquivo .env conforme necessário
   ```

3. **Suba o banco de dados PostgreSQL via Docker**

   ```bash
   docker-compose up -d
   # Isso irá iniciar apenas o banco de dados PostgreSQL

   #docker-compose down para finalizar
   ```

4. **Inicie o backend localmente**

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run seed         # Popular o banco com dados iniciais
   npm run start:dev
   ```

5. **Acessar as Rotas**: http://localhost:3333/api

---

### Opção 2: PostgreSQL Local + Backend Local

Repita os passos 1 e 2 da Opção 1 para clonar o repositório e configurar as variáveis de ambiente.

3. **Certifique-se que o PostgreSQL está rodando localmente**
   - Configure o acesso ao banco no `.env` conforme seu ambiente local.

4. **Gere o Prisma Client e inicie o backend**

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run seed         # Popular o banco com dados iniciais
   npm run start:dev
   ```

5. **Acessar as Rotas**: http://localhost:3333/api

## Estrutura do Projeto

```
pro4tech-backend/
│
├── 📂 .devcontainer/       # Configuração Dev Containers
├── 📂 docs/                # Documentação
│   ├── comandos.md         # Comandos e guias detalhados
│   └── security.md         # Guias de segurança
│
├── 📂 prisma/              # Prisma ORM
│   ├── schema.prisma       # Schema do banco de dados
│   ├── seed.ts             # Script de seed (dados iniciais)
│   └── migrations/         # Histórico de migrations
│
├── 📂 src/                 # Código fonte
│   ├── main.ts             # Entry point e configuração global
│   ├── app.module.ts       # Módulo raiz (agregação de módulos)
│   ├── 📂 common/          # Código compartilhado
│   │   ├── decorators/     # Decoradores customizados
│   │   ├── dtos/           # DTOs globais
│   │   ├── filters/        # Filtros de exceção
│   │   └── interceptors/   # Interceptadores
│   ├── 📂 database/        # Camada de banco de dados
│   │   └── prisma/         # Módulo Prisma
│   └── 📂 modules/         # Módulos de negócio
│       ├── 📂 auth/        # Autenticação e autorização
│       ├── 📂 user/        # Gerenciamento de usuários
│       ├── 📂 agent/       # Gerenciamento de agentes/atendentes
│       ├── 📂 company/     # Gerenciamento de empresas
│       ├── 📂 support-group/ # Grupos de suporte
│       ├── 📂 ticket-subject/ # Assuntos de tickets
│       ├── 📂 triage-rule/   # Regras de triagem automatizada
│       └── 📂 access-code/   # Códigos de acesso
│
├── 📂 test/                # Testes E2E
├── 📄 docker-compose.yml   # Orquestração de containers
├── 📄 Dockerfile           # Imagem Docker
└── 📄 package.json         # Dependências
```

> **Tipo de Arquitetura:** Modular

> **Comandos completos:** Veja [docs/comandos.md](docs/comandos.md)

## Arquitetura

### Padrão de Módulos

Cada módulo de negócio segue o padrão:

- **Controller**: Recebe e trata requisições HTTP
- **Service**: Implementa a lógica de negócio
- **Repository**: Acessa dados no banco (Prisma)
- **DTOs**: Validação e tipagem de dados (entrada/saída)
- **Module**: Agregação e exportação do módulo

### Principais Módulos

#### 🔐 **Auth (Autenticação)**

- Guardiões JWT customizados
- Decoradores de autenticação
- Gerenciamento de permissões

#### 👤 **User (Usuários)**

- CRUD completo de usuários
- Atribuição de papéis (roles)

#### 🤝 **Agent (Agentes/Atendentes)**

- Cadastro de agentes
- Associação com grupos de suporte
- Status e disponibilidade

#### 🏢 **Company (Empresas)**

- Gerenciamento de empresas
- Configurações por empresa

#### 👥 **Support Group (Grupos de Suporte)**

- Organização de agentes em grupos
- Roteamento de tickets

#### 🏷️ **Ticket Subject (Assuntos de Tickets)**

- Categorização de tickets
- Gerenciamento de assuntos disponíveis

#### ⚙️ **Triage Rule (Regras de Triagem)**

- Triagem automatizada de tickets
- Roteamento inteligente para grupos
- Escalação de prioridades

### Banco de Dados

- **ORM**: Prisma
- **Banco**: PostgreSQL
- **Migrations**: Automáticas via Prisma

## Seed (Dados Iniciais)

O projeto inclui um script de seed que popula o banco com dados iniciais para facilitar testes:

### Como executar:

```bash
npm run seed
```

### O que é criado:

- 📊 **Empresas** (companies): 2-3 empresas de exemplo
- 👤 **Usuários**: Usuários de diferentes papéis (admin, agent, support)
- 🤝 **Agentes**: 5-10 agentes de atendimento
- 👥 **Grupos de Suporte**: Grupos organizados por departamento
- 🏷️ **Assuntos**: Categorias de tickets (Suporte Técnico, Faturamento, etc)
- ⚙️ **Regras de Triagem**: Regras de roteamento automático

### Localização:

Veja [prisma/seed.ts](prisma/seed.ts) para detalhes completos.

### Reset do Banco:

Para resetar o banco e reexecutar todas as migrations + seed:

```bash
npx prisma migrate reset --force
# Isso irá:
# 1. Dropar o banco
# 2. Recriar o banco
# 3. Executar todas as migrations
# 4. Executar o seed automaticamente
```

## Comandos Úteis

```bash
# Desenvolvimento
npm run start:dev          # Inicia com hot-reload

# Produção
npm run build              # Build do projeto
npm run start:prod         # Inicia versão otimizada

# Banco de Dados
npm run seed               # Popular dados iniciais
npx prisma studio         # UI visual do banco
npx prisma migrate dev     # Criar nova migration
npx prisma migrate deploy  # Aplicar migrations

# Linting e Testes
npm run lint               # ESLint
npm run test               # Testes unitários
npm run test:e2e           # Testes E2E
```

## Licença

Este projeto está sob a licença especificada no arquivo [LICENSE](LICENSE).
