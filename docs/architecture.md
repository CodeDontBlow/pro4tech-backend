# Project Structure

```bash
.
├── .devcontainer 
│   └── devcontainer.json
├── docker-compose.yml
├── Dockerfile
├── docs
│   └── architecture.md
├── LICENSE
├── package.json
├── prisma
│   └── schema.prisma
├── prisma.config.ts
├── README.md
├── src
│   ├── app.module.ts
│   ├── main.ts
│   └── prisma
│       ├── prisma.module.ts
│       ├── prisma.service.spec.ts
│       └── prisma.service.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
└── tsconfig.json
```

## Directory Description

### .devcontainer

Configuração do ambiente de desenvolvimento usando Dev Containers.
Permite rodar o projeto em um ambiente padronizado dentro do VS Code.

### docker-compose.yml

Define os serviços necessários para rodar o projeto localmente.
- Node
- Postgresql

### Dockerfile

Imagem Docker usada para construir o container da aplicação.

### docs

Contém a documentação do projeto.

* `architecture.md` → descrição da arquitetura da aplicação.

### prisma

Configuração do ORM Prisma.

* `schema.prisma` → definição do schema do banco de dados.

### prisma.config.ts

Arquivo de configuração do Prisma.

### src

Código principal da aplicação.

* `main.ts` → ponto de entrada da aplicação.
* `app.module.ts` → módulo raiz do NestJS.

**Arquitetura baseado em módulos**


#### src/prisma

Módulo responsável pela integração com o Prisma.

* `prisma.module.ts` → módulo NestJS do Prisma.
* `prisma.service.ts` → serviço que gerencia a conexão com o banco.
* `prisma.service.spec.ts` → testes do serviço Prisma.

### test

Testes end-to-end da aplicação.

* `app.e2e-spec.ts` → testes e2e principais.
* `jest-e2e.json` → configuração do Jest para testes e2e.

### tsconfig.json

Configuração do compilador TypeScript.

### README.md

Documento principal do projeto contendo:

* descrição do projeto
* instruções de instalação
* como rodar o projeto
* links para documentação
