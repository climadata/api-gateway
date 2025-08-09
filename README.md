# API Gateway - ClimaHoje

## Descrição
O **api-gateway** é o ponto de entrada unificado para o sistema **ClimaHoje**. Ele centraliza as requisições do frontend e as direciona para os microsserviços corretos, como autenticação, clima, cache e alertas.

##  Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior) - [Download aqui](https://nodejs.org/)
- **npm** (geralmente vem com o Node.js) ou **yarn**
- **Git** - [Download aqui](https://git-scm.com/)

### Verificar instalações:
```bash
node --version    # deve retornar v18.x.x ou superior
npm --version     # deve retornar uma versão
git --version     # deve retornar uma versão
```

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset JavaScript com tipagem estática
- **Express.js** - Framework web para Node.js
- **Winston** - Biblioteca de logging
- **Axios** - Cliente HTTP
- **Helmet** - Middleware de segurança
- **CORS** - Middleware para Cross-Origin Resource Sharing
- **Express Rate Limit** - Middleware para rate limiting
- **Morgan** - Logger de requisições HTTP
- **Jest** - Framework de testes

## Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd api-gateway
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
vim .env 
```

### 4. Configure os microsserviços
Certifique-se de que os seguintes microsserviços estejam rodando nas portas configuradas:
- **Serviço de Clima**: `http://localhost:3001`
- **Serviço de Autenticação**: `http://localhost:3002`
- **Serviço de Cache**: `http://localhost:3003`
- **Serviço de Alertas**: `http://localhost:3004`

## Como executar

### Desenvolvimento
```bash
# Inicia o servidor em modo de desenvolvimento com hot reload
npm run dev
```

### Produção
```bash
# Compila o TypeScript para JavaScript
npm run build

# Inicia o servidor em modo produção
npm start
```

### Testes
```bash
# Executa todos os testes
npm test

# Executa testes em modo watch
npm run test:watch
```

### Linting
```bash
# Verifica problemas de código
npm run lint

# Corrige problemas automaticamente
npm run lint:fix
```

## Endpoints Disponíveis

### Health Check
```
GET /health
```
Retorna o status de saúde do API Gateway e dos microsserviços conectados.

### Proxy para Microsserviços
```
GET|POST|PUT|DELETE /api/*
```
Todas as requisições para `/api/*` são redirecionadas para os microsserviços apropriados.

## Configurações de Ambiente

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `WEATHER_SERVICE_URL` | URL do serviço de clima | `http://localhost:3001` |
| `AUTH_SERVICE_URL` | URL do serviço de autenticação | `http://localhost:3002` |
| `CACHE_SERVICE_URL` | URL do serviço de cache | `http://localhost:3003` |
| `ALERT_SERVICE_URL` | URL do serviço de alertas | `http://localhost:3004` |
| `CORS_ORIGIN` | URL permitida para CORS | `http://localhost:3005` |
| `RATE_LIMIT_WINDOW_MS` | Janela de tempo para rate limit | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requisições por janela | `100` |
| `LOG_LEVEL` | Nível de log | `info` |
| `HEALTH_CHECK_INTERVAL` | Intervalo de health check | `30000` (30s) |

## Estrutura do Projeto

```
api-gateway/
├── src/
│   ├── config/          # Configurações da aplicação
│   ├── controllers/     # Controladores das rotas
│   ├── middleware/      # Middlewares customizados
│   ├── routes/          # Definição das rotas
│   ├── services/        # Serviços de negócio
│   ├── types/           # Definições de tipos TypeScript
│   ├── utils/           # Utilitários gerais
│   └── index.ts         # Ponto de entrada da aplicação
├── dist/                # Código compilado (gerado automaticamente)
├── logs/                # Arquivos de log
├── examples/            # Exemplos de integração
├── package.json         # Dependências e scripts
├── tsconfig.json        # Configuração do TypeScript
├── jest.config.js       # Configuração dos testes
└── env.example          # Exemplo de variáveis de ambiente
```

## Solução de Problemas

### Erro: "Cannot find module"
```bash
# Limpe o cache do npm e reinstale as dependências
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port already in use"
```bash
# Encontre o processo usando a porta
lsof -i :3000

# Mate o processo (substitua PID pelo número encontrado)
kill -9 PID
```

### Problemas de TypeScript
```bash
# Recompile o projeto
npm run build
```

## Scripts Disponíveis

- `npm run dev` - Inicia em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Inicia em modo produção
- `npm test` - Executa os testes
- `npm run lint` - Verifica o código
- `npm run lint:fix` - Corrige problemas automaticamente

