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
# Reconstruir e abrir os containers 
Dev Containers: Rebuild and Reopen in Container
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