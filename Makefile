# Makefile para API Gateway Docker
# Uso: make <target>

# Variáveis
IMAGE_NAME = api-gateway
IMAGE_TAG = latest
CONTAINER_NAME = api-gateway
PORT = 3000
REGISTRY = 

# Cores para output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Funções de output colorido
define print_info
	@echo "$(BLUE)[INFO]$(NC) $1"
endef

define print_success
	@echo "$(GREEN)[SUCCESS]$(NC) $1"
endef

define print_warning
	@echo "$(YELLOW)[WARNING]$(NC) $1"
endef

define print_error
	@echo "$(RED)[ERROR]$(NC) $1"
endef

# Target padrão
.DEFAULT_GOAL := help

# Ajuda
.PHONY: help
help: ## Mostra esta ajuda
	@echo "Comandos disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# Verificações
.PHONY: check-docker
check-docker: ## Verifica se o Docker está rodando
	@if ! docker info > /dev/null 2>&1; then \
		echo "$(RED)[ERROR]$(NC) Docker não está rodando. Inicie o Docker e tente novamente."; \
		exit 1; \
	fi
	$(call print_success,Docker está rodando)

# Build
.PHONY: build
build: check-docker ## Faz build da imagem Docker
	$(call print_info,Fazendo build da imagem Docker...)
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	$(call print_success,Imagem buildada com sucesso!)

.PHONY: build-no-cache
build-no-cache: check-docker ## Faz build da imagem Docker sem cache
	$(call print_info,Fazendo build da imagem Docker sem cache...)
	docker build --no-cache -t $(IMAGE_NAME):$(IMAGE_TAG) .
	$(call print_success,Imagem buildada com sucesso!)

# Run
.PHONY: run
run: check-docker ## Executa o container da API Gateway
	$(call print_info,Executando container da API Gateway...)
	@if docker ps -q -f name=$(CONTAINER_NAME) | grep -q .; then \
		echo "$(YELLOW)[WARNING]$(NC) Container já está rodando. Use 'make stop' para parar primeiro."; \
		exit 1; \
	fi
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):$(PORT) \
		-e NODE_ENV=production \
		-e PORT=$(PORT) \
		-e LOG_LEVEL=info \
		-e CORS_ORIGIN=http://localhost:3005 \
		-e WEATHER_SERVICE_URL=http://localhost:3001 \
		-e AUTH_SERVICE_URL=http://localhost:3002 \
		-e CACHE_SERVICE_URL=http://localhost:3003 \
		-e ALERT_SERVICE_URL=http://localhost:3004 \
		-e RATE_LIMIT_WINDOW_MS=900000 \
		-e RATE_LIMIT_MAX_REQUESTS=100 \
		-e HEALTH_CHECK_INTERVAL=30000 \
		-v $(PWD)/logs:/app/logs \
		--restart unless-stopped \
		$(IMAGE_NAME):$(IMAGE_TAG)
	$(call print_success,Container executado com sucesso na porta $(PORT)!)

# Run com modo interativo
.PHONY: run-interactive
run-interactive: check-docker ## Executa o container em modo interativo
	$(call print_info,Executando container em modo interativo...)
	docker run -it \
		--name $(CONTAINER_NAME)-interactive \
		-p $(PORT):$(PORT) \
		-e NODE_ENV=development \
		-e PORT=$(PORT) \
		-e LOG_LEVEL=debug \
		-e CORS_ORIGIN=http://localhost:3005 \
		-e WEATHER_SERVICE_URL=http://localhost:3001 \
		-e AUTH_SERVICE_URL=http://localhost:3002 \
		-e CACHE_SERVICE_URL=http://localhost:3003 \
		-e ALERT_SERVICE_URL=http://localhost:3004 \
		-v $(PWD)/src:/app/src \
		-v $(PWD)/logs:/app/logs \
		$(IMAGE_NAME):$(IMAGE_TAG) /bin/sh

# Stop
.PHONY: stop
stop: check-docker ## Para o container da API Gateway
	$(call print_info,Parando container da API Gateway...)
	@if docker ps -q -f name=$(CONTAINER_NAME) | grep -q .; then \
		docker stop $(CONTAINER_NAME); \
		$(call print_success,Container parado com sucesso!); \
	else \
		$(call print_warning,Container não está rodando.); \
	fi

# Remove
.PHONY: remove
remove: check-docker ## Remove o container da API Gateway
	$(call print_info,Removendo container da API Gateway...)
	@if docker ps -aq -f name=$(CONTAINER_NAME) | grep -q .; then \
		docker rm $(CONTAINER_NAME); \
		$(call print_success,Container removido com sucesso!); \
	else \
		$(call print_warning,Container não existe.); \
	fi

# Stop e remove
.PHONY: clean
clean: stop remove ## Para e remove o container

# Logs
.PHONY: logs
logs: check-docker ## Mostra logs do container
	$(call print_info,Mostrando logs do container...)
	@if docker ps -q -f name=$(CONTAINER_NAME) | grep -q .; then \
		docker logs -f $(CONTAINER_NAME); \
	else \
		$(call print_error,Container não está rodando.); \
		exit 1; \
	fi

# Status
.PHONY: status
status: check-docker ## Mostra status do container
	$(call print_info,Status do container:)
	@if docker ps -q -f name=$(CONTAINER_NAME) | grep -q .; then \
		docker ps -f name=$(CONTAINER_NAME); \
	else \
		echo "Container não está rodando."; \
	fi

# Executar comando no container
.PHONY: exec
exec: check-docker ## Executa comando no container rodando
	$(call print_info,Executando comando no container...)
	@if docker ps -q -f name=$(CONTAINER_NAME) | grep -q .; then \
		docker exec -it $(CONTAINER_NAME) $(CMD); \
	else \
		$(call print_error,Container não está rodando.); \
		exit 1; \
	fi

# Shell no container
.PHONY: shell
shell: check-docker ## Abre shell no container rodando
	$(call print_info,Abrindo shell no container...)
	@if docker ps -q -f name=$(CONTAINER_NAME) | grep -q .; then \
		docker exec -it $(CONTAINER_NAME) /bin/sh; \
	else \
		$(call print_error,Container não está rodando.); \
		exit 1; \
	fi

# Health check
.PHONY: health
health: ## Verifica saúde da API Gateway
	$(call print_info,Verificando saúde da API Gateway...)
	@if curl -s http://localhost:$(PORT)/health > /dev/null; then \
		$(call print_success,API Gateway está saudável!); \
	else \
		$(call print_error,API Gateway não está respondendo.); \
		exit 1; \
	fi

# Teste rápido
.PHONY: test
test: ## Testa endpoints da API Gateway
	$(call print_info,Testando endpoints da API Gateway...)
	@echo "Testando endpoint raiz..."
	@curl -s http://localhost:$(PORT)/ | jq . 2>/dev/null || curl -s http://localhost:$(PORT)/
	@echo ""
	@echo "Testando endpoint de saúde..."
	@curl -s http://localhost:$(PORT)/health | jq . 2>/dev/null || curl -s http://localhost:$(PORT)/health

# Rebuild completo
.PHONY: rebuild
rebuild: clean build ## Faz rebuild completo (stop + remove + build)

# Deploy completo
.PHONY: deploy
deploy: rebuild run ## Deploy completo (rebuild + run)

# Limpeza Docker
.PHONY: docker-cleanup
docker-cleanup: check-docker ## Limpa recursos Docker não utilizados
	$(call print_info,Limpando recursos Docker...)
	docker system prune -f
	$(call print_success,Limpeza realizada!)

# Limpeza completa
.PHONY: cleanup
cleanup: clean docker-cleanup ## Limpeza completa (containers + recursos Docker)

# Listar imagens
.PHONY: images
images: check-docker ## Lista imagens Docker relacionadas
	$(call print_info,Imagens Docker relacionadas:)
	docker images | grep $(IMAGE_NAME)

# Listar containers
.PHONY: containers
containers: check-docker ## Lista containers relacionados
	$(call print_info,Containers relacionados:)
	docker ps -a | grep $(CONTAINER_NAME)

# Push para registry (se configurado)
.PHONY: push
push: check-docker ## Faz push da imagem para registry
	@if [ -z "$(REGISTRY)" ]; then \
		echo "$(RED)[ERROR]$(NC) Variável REGISTRY não configurada."; \
		echo "Configure a variável REGISTRY no Makefile ou use: make push REGISTRY=seu-registry.com"; \
		exit 1; \
	fi
	$(call print_info,Fazendo push para registry...)
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker push $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	$(call print_success,Imagem enviada para registry com sucesso!)

# Pull de registry (se configurado)
.PHONY: pull
pull: check-docker ## Faz pull da imagem do registry
	@if [ -z "$(REGISTRY)" ]; then \
		echo "$(RED)[ERROR]$(NC) Variável REGISTRY não configurada."; \
		echo "Configure a variável REGISTRY no Makefile ou use: make pull REGISTRY=seu-registry.com"; \
		exit 1; \
	fi
	$(call print_info,Fazendo pull do registry...)
	docker pull $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker tag $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_NAME):$(IMAGE_TAG)
	$(call print_success,Imagem baixada do registry com sucesso!)

# Informações do sistema
.PHONY: info
info: ## Mostra informações do sistema Docker
	$(call print_info,Informações do sistema Docker:)
	@echo "Docker version:"
	@docker --version
	@echo ""
	@echo "Docker info:"
	@docker info --format '{{.ServerVersion}}' 2>/dev/null || echo "Não disponível"
	@echo ""
	@echo "Espaço em disco:"
	@docker system df

# Desenvolvimento local
.PHONY: dev
dev: ## Executa em modo desenvolvimento (sem Docker)
	$(call print_info,Executando em modo desenvolvimento...)
	npm run dev

# Instalar dependências
.PHONY: install
install: ## Instala dependências do projeto
	$(call print_info,Instalando dependências...)
	npm install
	$(call print_success,Dependências instaladas!)

# Build TypeScript
.PHONY: build-ts
build-ts: ## Faz build TypeScript local
	$(call print_info,Fazendo build TypeScript...)
	npm run build
	$(call print_success,Build TypeScript concluído!)

# Testes
.PHONY: test-local
test-local: ## Executa testes localmente
	$(call print_info,Executando testes...)
	npm test
	$(call print_success,Testes concluídos!)

# Lint
.PHONY: lint
lint: ## Executa linting
	$(call print_info,Executando linting...)
	npm run lint
	$(call print_success,Linting concluído!)

# Lint fix
.PHONY: lint-fix
lint-fix: ## Corrige problemas de linting
	$(call print_info,Corrigindo problemas de linting...)
	npm run lint:fix
	$(call print_success,Problemas de linting corrigidos!)

# Verificar se container está rodando
.PHONY: is-running
is-running: check-docker ## Verifica se o container está rodando
	@if docker ps -q -f name=$(CONTAINER_NAME) | grep -q .; then \
		echo "true"; \
	else \
		echo "false"; \
	fi
