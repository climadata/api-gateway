#!/bin/bash

# Script para build e execução da API Gateway com Docker

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se o Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker não está rodando. Inicie o Docker e tente novamente."
        exit 1
    fi
    print_success "Docker está rodando"
}

# Função para build da imagem
build_image() {
    print_message "Fazendo build da imagem Docker..."
    docker build -t api-gateway:latest .
    print_success "Imagem buildada com sucesso!"
}

# Função para executar com docker-compose
run_compose() {
    print_message "Iniciando serviços com docker-compose..."
    docker-compose up -d
    print_success "Serviços iniciados com sucesso!"
}

# Função para parar serviços
stop_compose() {
    print_message "Parando serviços..."
    docker-compose down
    print_success "Serviços parados!"
}

# Função para mostrar logs
show_logs() {
    print_message "Mostrando logs da API Gateway..."
    docker-compose logs -f api-gateway
}

# Função para mostrar status dos containers
show_status() {
    print_message "Status dos containers:"
    docker-compose ps
}

# Função para rebuild completo
rebuild() {
    print_message "Fazendo rebuild completo..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Rebuild completo realizado!"
}

# Função para limpar recursos Docker
cleanup() {
    print_message "Limpando recursos Docker..."
    docker-compose down -v
    docker system prune -f
    print_success "Limpeza realizada!"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  build     - Faz build da imagem Docker"
    echo "  run       - Inicia serviços com docker-compose"
    echo "  stop      - Para todos os serviços"
    echo "  logs      - Mostra logs da API Gateway"
    echo "  status    - Mostra status dos containers"
    echo "  rebuild   - Faz rebuild completo (stop + build + start)"
    echo "  cleanup   - Limpa recursos Docker (containers, volumes, networks)"
    echo "  help      - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 build"
    echo "  $0 run"
    echo "  $0 rebuild"
}

# Verificar se o Docker está rodando
check_docker

# Processar argumentos da linha de comando
case "${1:-help}" in
    build)
        build_image
        ;;
    run)
        run_compose
        ;;
    stop)
        stop_compose
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    rebuild)
        rebuild
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando inválido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
