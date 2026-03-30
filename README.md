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
   npm run start:dev
   ```
5. **Acessar as Rotas**: http://localhost:3333/api

## Estrutura do Projeto

```
pro4tech-backend/
│
├── 📂 .devcontainer/       # Configuração Dev Containers
├── 📂 docs/                # Documentação
│   └── comandos.md         # Comandos e guias detalhados
│
├── 📂 prisma/              # Prisma ORM
│   └── schema.prisma       # Schema do banco de dados
│
├── 📂 src/                 # Código fonte
│   ├── main.ts             # Entry point
│   ├── app.module.ts       # Módulo raiz
│   └── 📂 prisma/          # Módulo Prisma
│
├── 📂 test/                # Testes E2E
├── 📄 docker-compose.yml   # Orquestração de containers
├── 📄 Dockerfile           # Imagem Docker
└── 📄 package.json         # Dependências
```

> **Tipo de Arquitetura:** Modular

> **Comandos completos:** Veja [docs/comandos.md](docs/comandos.md)

## Licença

Este projeto está sob a licença especificada no arquivo [LICENSE](LICENSE).
