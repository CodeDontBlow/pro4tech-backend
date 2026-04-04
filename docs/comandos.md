### Api

```bash
# Iniciar API
npm run start:dev
```

### Docker

```bash

# Ver imagens Docker disponíveis localmente.
docker image ls

# Ver todos os containers em execução
docker ps -a

# Listar redes docker
docker network ls

# Listar volumes
docker volume ls

# Ver detalhes do volume do PostgreSQL
docker volume inspect pro4tech_postgres_data

# Ver últimas 10 linhas do log
docker logs --tail 10 pro4tech_backend
```

### Comandos Prisma

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar tabelas
npx prisma migrate deploy

# Rodar o seed (lembre-se, o seed limpa o banco antes de popular)
npx prisma db seed

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
