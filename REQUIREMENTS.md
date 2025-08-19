# Requisitos de Sistema - API Gateway

## Requisitos de Software

### Obrigatórios
- **Node.js**: versão 18.0.0 ou superior
- **npm**: versão 8.0.0 ou superior (geralmente vem com Node.js)
- **Git**: para clonagem do repositório


## Requisitos de Rede

### Portas Necessárias
- **3000**: Porta principal do API Gateway (configurável via `PORT`)
- **3001**: Serviço de Clima (configurável via `WEATHER_SERVICE_URL`)
- **3002**: Serviço de Autenticação (configurável via `AUTH_SERVICE_URL`)
- **3003**: Serviço de Cache (configurável via `CACHE_SERVICE_URL`)
- **3004**: Serviço de Alertas (configurável via `ALERT_SERVICE_URL`)
- **3005**: Frontend (configurável via `CORS_ORIGIN`)

### Conectividade
- Acesso à internet para instalação de dependências
- Conectividade entre microsserviços (se em servidores diferentes)

## Dependências de Produção

As seguintes dependências são instaladas automaticamente via `npm install`:

### Core
```json
"express": "^4.18.2"         // Framework web
"typescript": "^5.3.2"       // Linguagem de programação
```

### Middleware & Segurança
```json
"cors": "^2.8.5"             // Cross-Origin Resource Sharing
"helmet": "^7.1.0"           // Middleware de segurança
"express-rate-limit": "^7.1.5" // Rate limiting
"compression": "^1.7.4"      // Compressão de resposta
```

### Logging & Monitoramento
```json
"morgan": "^1.10.0"          // Logger de requisições HTTP
"winston": "^3.11.0"         // Sistema de logging avançado
```

### HTTP & Utilitários
```json
"axios": "^1.6.2"           // Cliente HTTP
"dotenv": "^16.3.1"         // Gerenciamento de variáveis de ambiente
```

##  Dependências de Desenvolvimento

```json
"@types/express": "^4.17.21"           // Tipos TypeScript para Express
"@types/cors": "^2.8.17"               // Tipos TypeScript para CORS
"@types/morgan": "^1.9.9"              // Tipos TypeScript para Morgan
"@types/compression": "^1.7.5"         // Tipos TypeScript para Compression
"@types/node": "^20.10.0"              // Tipos TypeScript para Node.js
"@types/jest": "^29.5.8"               // Tipos TypeScript para Jest
"@typescript-eslint/eslint-plugin": "^6.13.0"  // Plugin ESLint para TypeScript
"@typescript-eslint/parser": "^6.13.0"         // Parser ESLint para TypeScript
"eslint": "^8.54.0"                    // Linter de código
"jest": "^29.7.0"                      // Framework de testes
"ts-jest": "^29.1.1"                   // Integração Jest com TypeScript
"ts-node-dev": "^2.0.0"                // Desenvolvimento com hot reload
```

## 🔐 Variáveis de Ambiente

Consulte o arquivo `env.example` para a lista completa de variáveis de ambiente necessárias.

### Obrigatórias
- Nenhuma (todas têm valores padrão)

### Recomendadas para Produção
- `NODE_ENV=production`
- `PORT` (se diferente de 3000)
- URLs dos microsserviços (se diferentes dos padrões)
- `LOG_LEVEL=warn` ou `LOG_LEVEL=error`

## Verificação de Requisitos

Execute o seguinte comando para verificar se todos os requisitos estão atendidos:

```bash
# Verificar versões
node --version    # deve retornar v18.x.x ou superior
npm --version     # deve retornar v8.x.x ou superior
git --version     # deve retornar uma versão

# Verificar conectividade de rede (opcional)
ping google.com

```


## Suporte

Se você encontrar problemas relacionados aos requisitos:

1. Verifique se todas as versões estão corretas
2. Consulte a seção "Solução de Problemas" no README.md
3. Limpe o cache do npm: `npm cache clean --force`
4. Reinstale as dependências: `rm -rf node_modules && npm install`
