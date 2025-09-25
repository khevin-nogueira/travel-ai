#!/bin/bash

# Script para executar todos os testes
echo "🧪 Executando testes do Sky Travels..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_status() {
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

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    print_warning "Instalando dependências..."
    npm install
fi

# Executar testes unitários
print_status "Executando testes unitários..."
if npm run test:run; then
    print_success "Testes unitários passaram! ✅"
else
    print_error "Testes unitários falharam! ❌"
    exit 1
fi

# Executar testes E2E
print_status "Executando testes E2E..."
if npm run test:e2e; then
    print_success "Testes E2E passaram! ✅"
else
    print_error "Testes E2E falharam! ❌"
    exit 1
fi

# Executar cobertura de testes
print_status "Executando análise de cobertura..."
if npm run test:coverage; then
    print_success "Análise de cobertura concluída! ✅"
else
    print_warning "Análise de cobertura falhou, mas continuando..."
fi

print_success "Todos os testes foram executados com sucesso! 🎉"
print_status "Verifique os relatórios de cobertura em coverage/index.html"
print_status "Verifique os relatórios E2E em playwright-report/index.html"
