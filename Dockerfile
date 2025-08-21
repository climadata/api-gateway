# Multi-stage build para otimizar o tamanho da imagem final
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci --only=production=false

# Copiar código fonte
COPY src/ ./src/

# Build da aplicação TypeScript
RUN npm run build

# Remover arquivos desnecessários após o build
RUN npm prune --production

# Imagem de produção
FROM node:18-alpine AS production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar arquivos buildados da etapa anterior
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copiar arquivos de configuração necessários
COPY --chown=nodejs:nodejs env.example ./

# Criar diretório de logs com permissões corretas
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Mudar para usuário não-root
USER nodejs

# Expor porta da aplicação
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Comando para executar a aplicação
CMD ["npm", "start"]
