# pro4tech-backend

Backend API para o projeto Pro4Tech.

## Como rodar a API

### Pré-requisitos:

- [Docker](https://www.docker.com/)
- [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) no VSCode

### Configure as variáveis de ambiente:

- Crie um arquivo `.env` na raiz do projeto copiando o conteúdo do arquivo `.env.example`. Esse arquivo contém todas as variáveis necessárias para o funcionamento da aplicação.

### Execução do servidor:

- Abra o VSCode, barra de pesquisa, procure e execute:
  - `Dev Containers: Rebuild and Reopen in Container`
- Para abrir o container novamente:
  - `Dev Containers: Reopen in Container`

### Comandos Docker

```bash

# Ver imagens Docker disponíveis localmente.
docker image ls

# Ver todos os containers em execução
docker ps -a

# Ver logs do container backend
docker logs pro4tech_backend

# Acessar o terminal do container
docker exec -it pro4tech_backend sh

# Listar redes docker
docker network ls

# Ver detalhes da rede do projeto
docker network inspect pro4tech_network

# Listar volumes
docker volume ls

# Ver detalhes do volume do PostgreSQL
docker volume inspect pro4tech_postgres_data

# Visualizar logs em tempo real
docker logs -f pro4tech_backend

# Ver últimas 10 linhas do log
docker logs --tail 10 pro4tech_backend
```

### Comandos do .devcontainer

```bash
# Reconstruir e Abrir ( Mudou algo FORA do código )
Dev Containers: Rebuild and Reopen in Container

# Reabrir o container ( Mudou só código )
Dev Containers: Reopen in Container
```

### Comandos Prisma

```bash
# Gerar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Resetar banco de dados
npx prisma migrate reset
```

### Outro comandos

```bash
# Formatar código
npx prettier . --write
```
