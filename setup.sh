#!/bin/bash

# ===========================================
# SCRIPT DE SETUP AUTOMATIZADO - API GATEWAY
# ===========================================

echo "Iniciando setup do API Gateway - ClimaHoje..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se Node.js está instalado
print_status "Verificando se Node.js está instalado..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado!"
    print_status "Por favor, instale o Node.js (versão 18 ou superior) em: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versão $NODE_VERSION encontrada. É necessário versão 18 ou superior!"
    exit 1
fi

print_success "Node.js $(node --version) encontrado"

# Verificar se npm está instalado
print_status "Verificando se npm está instalado..."
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado!"
    exit 1
fi

print_success "npm $(npm --version) encontrado"

# Instalar dependências
print_status "Instalando dependências do projeto..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependências instaladas com sucesso!"
else
    print_error "Erro ao instalar dependências!"
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    print_status "Criando arquivo .env..."
    cp env.example .env
    print_success "Arquivo .env criado com configurações padrão"
    print_warning "IMPORTANTE: Revise e ajuste as configurações no arquivo .env conforme necessário"
else
    print_warning "Arquivo .env já existe, mantendo configurações atuais"
fi

# Criar diretório de logs se não existir
if [ ! -d "logs" ]; then
    print_status "Criando diretório de logs..."
    mkdir -p logs
    print_success "Diretório de logs criado"
fi

# Compilar TypeScript
print_status "Compilando código TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Código compilado com sucesso!"
else
    print_error "Erro ao compilar código TypeScript!"
    exit 1
fi

# Executar testes (opcional)
echo ""
read -p "🧪 Deseja executar os testes agora? (y/n): " run_tests
if [[ $run_tests =~ ^[Yy]$ ]]; then
    print_status "Executando testes..."
    npm test
    
    if [ $? -eq 0 ]; then
        print_success "Todos os testes passaram!"
    else
        print_warning "Alguns testes falharam. Verifique os logs acima."
    fi
fi

echo ""
echo "Setup concluído com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Revise o arquivo .env e ajuste as configurações conforme necessário"
echo "2. Certifique-se de que os microsserviços estejam rodando nas portas configuradas:"
echo "   - Serviço de Clima: http://localhost:3001"
echo "   - Serviço de Autenticação: http://localhost:3002"
echo "   - Serviço de Cache: http://localhost:3003"
echo "   - Serviço de Alertas: http://localhost:3004"
echo ""
echo "Para iniciar o servidor:"
echo "   Desenvolvimento: npm run dev"
echo "   Produção: npm start"
echo ""
echo "Para mais informações, consulte o README.md"
echo ""

# Perguntar se deseja iniciar o servidor
read -p "Deseja iniciar o servidor em modo desenvolvimento agora? (y/n): " start_server
if [[ $start_server =~ ^[Yy]$ ]]; then
    print_status "Iniciando servidor em modo desenvolvimento..."
    npm run dev
fi
