# Guia de Integração

Este documento descreve como integrar e executar o sistema completo, incluindo a API Gateway, o Frontend e os Microserviços.

## Arquitetura

O sistema é composto por três componentes principais:

1. **Frontend (Next.js)**
   - Porta: 3005
   - Interface web para usuários
   - Comunica-se com a API Gateway

2. **API Gateway**
   - Porta: 3000
   - Gerencia e roteia requisições para microserviços
   - Fornece um ponto único de acesso

3. **Weather Service**
   - Porta: 3001
   - Microserviço para dados meteorológicos
   - Integrado com OpenWeatherMap API

## Configuração

### API Gateway

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Compile o projeto:
   ```bash
   npm run build
   ```

3. Inicie o servidor:
   ```bash
   npm start
   ```

### Weather Service

1. Crie um arquivo `.env`:
   ```env
   PORT=3001
   OPENWEATHER_API_KEY=sua_chave_aqui
   ```

2. Instale as dependências:
   ```bash
   cd weather-service
   npm install
   ```

3. Compile o projeto:
   ```bash
   npm run build
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

### Frontend

1. Instale as dependências:
   ```bash
   cd frontend
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Endpoints

### API Gateway

- `GET /health`: Status dos serviços
- `GET /api/weather/city/:city`: Dados meteorológicos de uma cidade

### Weather Service

- `GET /weather/city/:city`: Dados meteorológicos detalhados
- `GET /weather/current?city=:city`: Dados meteorológicos atuais

## Fluxo de Dados

1. O usuário acessa o frontend em `http://localhost:3005`
2. O frontend faz requisições para a API Gateway em `http://localhost:3000`
3. A API Gateway roteia as requisições para o Weather Service em `http://localhost:3001`
4. O Weather Service busca dados da OpenWeatherMap API
5. Os dados retornam pelo mesmo caminho até o usuário

## Troubleshooting

### Portas em Uso

Se uma porta estiver em uso, você pode:
1. Encerrar o processo usando a porta:
   ```bash
   lsof -i :PORTA
   kill -9 PID
   ```
2. Ou alterar a porta no arquivo de configuração correspondente

### Erros Comuns

1. **"Cannot connect to service"**:
   - Verifique se todos os serviços estão rodando
   - Confirme as portas configuradas

2. **"Invalid API Key"**:
   - Verifique a chave da API no arquivo `.env` do Weather Service

3. **"CORS Error"**:
   - A API Gateway já está configurada para permitir requisições do frontend

## Desenvolvimento

### Estrutura de Arquivos

```
api-gateway/
├── src/
│   ├── services/
│   │   └── proxy.ts       # Lógica de proxy
│   ├── routes/
│   │   └── gateway.ts     # Rotas da API
│   └── index.ts           # Entrada da aplicação
├── frontend/              # Aplicação Next.js
└── weather-service/       # Microserviço de clima
```

### Adicionando Novos Serviços

1. Adicione a configuração do serviço em `src/config/index.ts`
2. Registre as rotas em `src/services/proxy.ts`
3. Atualize a documentação