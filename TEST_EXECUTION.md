# 🧪 Guia de Execução de Testes

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou pnpm
- Dependências instaladas (`npm install`)

## 🚀 Execução Rápida

```bash
# Executar todos os testes
npm run test:all

# Ou executar individualmente
npm run test:run    # Testes unitários
npm run test:e2e    # Testes E2E
```

## 🔧 Testes Unitários (Vitest)

### Comandos Básicos
```bash
# Modo watch (desenvolvimento)
npm run test

# Execução única
npm run test:run

# Interface visual
npm run test:ui

# Com cobertura
npm run test:coverage
```

### Executar Testes Específicos
```bash
# Teste específico
npm run test -- StreamingComponents

# Teste com padrão
npm run test -- --grep "FlightCard"

# Debug mode
npm run test -- --inspect-brk
```

### Exemplo de Saída
```
✓ src/components/ai/__tests__/StreamingComponents.test.tsx (8)
  ✓ FlightCard (4)
    ✓ should render flight card with all information
    ✓ should call onSelect when clicked
    ✓ should call onSelect when Enter key is pressed
    ✓ should not be selectable when selectable is false
  ✓ HotelCard (2)
    ✓ should render hotel card with all information
    ✓ should call onSelect when clicked
  ✓ LoadingComponent (2)
    ✓ should render loading message
    ✓ should render progress bar when progress is provided

✓ src/hooks/__tests__/useStreamingAgent.test.ts (10)
  ✓ should initialize with empty state
  ✓ should add component when addComponent is called
  ✓ should remove component when removeComponent is called
  ✓ should clear all components when clearComponents is called
  ✓ should handle sendMessage with flight search
  ✓ should handle sendMessage with hotel search
  ✓ should handle sendMessage with booking
  ✓ should handle tool execution errors
  ✓ should handle executeTool with streaming response
  ✓ should handle executeTool with non-streaming response

Test Files  2 passed (2)
Tests  18 passed (18)
Start at 14:30:15
Duration  1.2s
```

## 🎭 Testes E2E (Playwright)

### Comandos Básicos
```bash
# Execução headless
npm run test:e2e

# Interface visual
npm run test:e2e:ui

# Com browser visível
npm run test:e2e:headed

# Browser específico
npx playwright test --project=chromium
```

### Executar Testes Específicos
```bash
# Teste específico
npm run test:e2e -- travel-booking

# Teste com padrão
npm run test:e2e -- --grep "booking flow"

# Debug mode
npm run test:e2e -- --debug
```

### Browsers Suportados
- **Chrome** (Desktop)
- **Firefox** (Desktop) 
- **Safari** (Desktop)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

### Exemplo de Saída
```
Running 6 tests using 5 workers

✓ e2e/travel-booking.spec.ts:3:1 › Travel Booking Flow › should complete full booking flow (chromium) (45s)
✓ e2e/travel-booking.spec.ts:3:1 › Travel Booking Flow › should handle error scenarios with retry functionality (chromium) (32s)
✓ e2e/travel-booking.spec.ts:3:1 › Travel Booking Flow › should handle accessibility features (chromium) (28s)
✓ e2e/travel-booking.spec.ts:3:1 › Travel Booking Flow › should handle internationalization (chromium) (15s)
✓ e2e/error-handling.spec.ts:3:1 › Error Handling and Retry Scenarios › should handle network errors with retry (chromium) (38s)
✓ e2e/error-handling.spec.ts:3:1 › Error Handling and Retry Scenarios › should handle timeout errors (chromium) (25s)

6 passed (3m 23s)
```

## 📊 Análise de Cobertura

### Executar Cobertura
```bash
npm run test:coverage
```

### Visualizar Relatório
```bash
# Abrir relatório HTML
open coverage/index.html

# Ou no Windows
start coverage/index.html
```

### Thresholds de Cobertura
- **Branches**: 80%
- **Functions**: 80% 
- **Lines**: 80%
- **Statements**: 80%

### Exemplo de Relatório
```
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   85.2  |   82.1   |   88.9  |   85.0  |
 components/ai      |   92.3  |   90.0   |   95.0  |   92.0  |
  StreamingComponents|   92.3  |   90.0   |   95.0  |   92.0  | 45,67
 hooks              |   88.9  |   85.7   |   90.0  |   88.5  |
  useStreamingAgent |   88.9  |   85.7   |   90.0  |   88.5  | 23,45,67
```

## 🐛 Debugging

### Testes Unitários
```bash
# Debug com breakpoints
npm run test -- --inspect-brk

# Debug específico
npm run test -- --reporter=verbose ComponentName

# Modo watch com foco
npm run test -- --watch ComponentName
```

### Testes E2E
```bash
# Debug visual
npm run test:e2e:ui

# Debug com browser
npm run test:e2e:headed

# Debug específico
npm run test:e2e -- --debug --grep "booking flow"

# Trace mode
npx playwright test --trace on
```

### Screenshots e Videos
- **Screenshots**: Salvos em `test-results/` em caso de falha
- **Videos**: Salvos em `test-results/` em caso de falha
- **Traces**: Salvos em `test-results/` para debug

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# Para testes E2E
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENABLE_STREAMING=true
NEXT_PUBLIC_ENABLE_RESILIENCE=true
```

### Configuração do Playwright
```bash
# Instalar browsers
npx playwright install

# Instalar browsers específicos
npx playwright install chromium firefox
```

## 📈 CI/CD

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:run
      - run: npm run test:e2e
```

### Pre-commit Hooks
```bash
# Instalar husky
npm install --save-dev husky

# Adicionar hook
npx husky add .husky/pre-commit "npm run test:run"
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Testes E2E falham
```bash
# Verificar se o servidor está rodando
npm run dev

# Verificar browsers instalados
npx playwright install

# Executar com debug
npm run test:e2e:headed
```

#### 2. Testes unitários lentos
```bash
# Executar com menos workers
npm run test -- --no-threads

# Executar específico
npm run test -- ComponentName
```

#### 3. Cobertura baixa
```bash
# Verificar arquivos excluídos
cat vitest.config.ts

# Executar com verbose
npm run test:coverage -- --reporter=verbose
```

#### 4. Mocks não funcionam
```bash
# Verificar setup.ts
cat src/test/setup.ts

# Limpar cache
npm run test -- --no-cache
```

## 📚 Recursos Adicionais

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Dica**: Execute `npm run test:all` para uma verificação completa do projeto! 🚀
