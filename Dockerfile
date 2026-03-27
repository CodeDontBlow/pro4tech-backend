# FROM node:20-alpine

# WORKDIR /app

# RUN apk add --no-cache python3 make g++

# # Copia dependências primeiro (cache)
# COPY package*.json ./

# # Instala dependências
# RUN npm install

# # Copia código
# COPY . .

# # Build (opcional para dev, necessário para prod)
# # RUN npm run build

# EXPOSE 3333

# # Dev com hot-reload
# CMD ["npm", "run", "start:dev"]