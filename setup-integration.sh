#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Configurando API Gateway...${NC}"
npm install
npm run build

echo -e "${BLUE}Configurando Weather Service...${NC}"
cd weather-service
npm install
npm run build

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo -e "${GREEN}Criando arquivo .env para Weather Service...${NC}"
    echo "PORT=3001" > .env
    echo "OPENWEATHER_API_KEY=0f863ab16599652132b0d7c013333565" >> .env
fi

echo -e "${BLUE}Configurando Frontend...${NC}"
cd ../frontend
npm install

echo -e "${GREEN}Setup completo!${NC}"
echo -e "Para iniciar os serviços:"
echo -e "1. API Gateway:     cd api-gateway && npm start"
echo -e "2. Weather Service: cd weather-service && npm start"
echo -e "3. Frontend:        cd frontend && npm run dev"