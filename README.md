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

### Local
- **[Node](https://nodejs.org/en)**
- **[Postgresql](https://www.postgresql.org)**

### Docker
- **[Docker](https://www.docker.com/)** - Para containerização
- **[Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)** - Extensão do VS Code

## Como Rodar

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/pro4tech-backend.git
cd pro4tech-backend

git checkout -b develop origin/develop
git checkout develop
```
> Lembrar git fetch; git pull;

### 2. Configure as variáveis de ambiente

Crie o arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

> Edite o arquivo `.env` com suas configurações.


### Local
```bash
npm run start:dev #iniciar servidor dev
```


### Docker
### 3. Inicie o Dev Container

No VS Code, procure na barra de pesquisa por:

```
Dev Containers: Rebuild and Reopen in Container
```

### 4. Gerar Prisma Client
```bash
npx prisma generate
```

### 5. Verifique se a aplicação está funcionando

Você pode acompanhar os logs do container de duas formas:

#### Opção 1 — Via Docker CLI (Terminal)

```bash
docker logs -f pro4tech_backend
```

#### Opção 2 — Via Docker Desktop (Interface gráfica)
- Abra o Docker Desktop
- Vá em Containers
- Clique no container pro4tech_backend
- Abra a aba Logs para visualizar os logs em tempo real


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
