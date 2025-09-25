# Testing Documentation

## 🧪 Test Strategy

Este projeto implementa uma estratégia de testes abrangente com **testes unitários** (Vitest) e **testes E2E** (Playwright).

## 📁 Estrutura de Testes

```
├── src/
│   ├── components/
│   │   └── __tests__/
│   │       └── StreamingComponents.test.tsx
│   ├── hooks/
│   │   └── __tests__/
│   │       └── useStreamingAgent.test.ts
│   └── test/
│       ├── setup.ts
│       └── vitest.config.ts
├── e2e/
│   ├── travel-booking.spec.ts
│   └── error-handling.spec.ts
├── vitest.config.ts
└── playwright.config.ts
```

## 🔧 Configuração

### Vitest (Testes Unitários)
- **Framework**: Vitest + React Testing Library
- **Ambiente**: jsdom
- **Cobertura**: v8 provider
- **Thresholds**: 80% global coverage

### Playwright (Testes E2E)
- **Browsers**: Chrome, Firefox, Safari, Mobile
- **Modo**: Headless por padrão
- **Screenshots**: Apenas em falhas
- **Videos**: Apenas em falhas

## 🚀 Comandos de Teste

```bash
# Testes unitários
npm run test              # Modo watch
npm run test:run          # Execução única
npm run test:ui           # Interface visual
npm run test:coverage     # Com cobertura

# Testes E2E
npm run test:e2e          # Execução headless
npm run test:e2e:ui       # Interface visual
npm run test:e2e:headed   # Com browser visível

# Todos os testes
npm run test:all          # Unit + E2E
```

## 📋 Testes Implementados

### 1. Testes Unitários

#### `StreamingComponents.test.tsx`
- **FlightCard**: Renderização, seleção, navegação por teclado
- **HotelCard**: Renderização, seleção, informações
- **LoadingComponent**: Estados de carregamento, progresso
- **ErrorComponent**: Mensagens de erro, botão de retry

#### `useStreamingAgent.test.ts`
- **Estado inicial**: Componentes vazios, loading false
- **Adicionar/remover componentes**: Gerenciamento de estado
- **sendMessage**: Processamento de mensagens, fluxos de ferramentas
- **executeTool**: Execução de ferramentas, streaming
- **Tratamento de erros**: Retry, fallbacks
- **Retry de operações**: Funcionalidade de retry

### 2. Testes E2E

#### `travel-booking.spec.ts`
- **Fluxo completo**: Buscar voos → Selecionar → Buscar hotéis → Selecionar → Reservar → Ver resumo → Cancelar
- **Cenários de erro**: Simulação de falhas de rede, retry
- **Acessibilidade**: Navegação por teclado, screen readers, alto contraste
- **Internacionalização**: Troca de idiomas, formatação

#### `error-handling.spec.ts`
- **Erros de rede**: Falhas de conexão, timeouts
- **Erros de validação**: Inputs inválidos, limites
- **Erros de pagamento**: Falhas de processamento
- **Múltiplos erros**: Cenários consecutivos
- **Circuit breaker**: Padrão de circuit breaker

## 🎯 Cenários de Teste

### Fluxo Principal
1. **Abrir chat AI** → Verificar interface
2. **Buscar voos** → Verificar cards de voo
3. **Selecionar voo** → Verificar confirmação
4. **Buscar hotéis** → Verificar cards de hotel
5. **Selecionar hotel** → Verificar confirmação
6. **Reservar viagem** → Verificar confirmação de reserva
7. **Ver resumo** → Verificar página "Minhas Viagens"
8. **Cancelar reserva** → Verificar remoção

### Cenários de Erro
1. **Falha de rede** → Verificar mensagem de erro + retry
2. **Timeout** → Verificar tratamento de timeout
3. **Validação** → Verificar rejeição de inputs inválidos
4. **Pagamento** → Verificar erro de pagamento + retry
5. **Múltiplos erros** → Verificar persistência e recuperação
6. **Circuit breaker** → Verificar bloqueio de serviço

### Acessibilidade
1. **Navegação por teclado** → Tab, Enter, setas
2. **Screen readers** → Anúncios, ARIA labels
3. **Alto contraste** → Visibilidade em modo escuro
4. **Skip links** → Navegação rápida

### Internacionalização
1. **Troca de idiomas** → Português ↔ Inglês
2. **Formatação** → Moeda, datas, números
3. **Mensagens** → Tradução de interface

## 📊 Métricas de Cobertura

### Thresholds Globais
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Cobertura por Módulo
- **Components**: 90%+ (UI crítica)
- **Hooks**: 85%+ (Lógica de negócio)
- **Utils**: 80%+ (Funções utilitárias)
- **Services**: 75%+ (Integrações externas)

## 🔍 Mocks e Stubs

### Mocks Globais
- **Framer Motion**: Componentes simplificados
- **localStorage**: Implementação em memória
- **matchMedia**: Suporte a media queries
- **IntersectionObserver**: Para lazy loading
- **ResizeObserver**: Para responsividade

### Mocks de Serviços
- **StreamingService**: Geradores de componentes
- **ToolExecutor**: Execução de ferramentas
- **ResilienceService**: Simulação de latência/erros
- **I18nService**: Traduções mockadas
- **A11yService**: Anúncios mockados

## 🚨 Tratamento de Erros

### Testes Unitários
- **Try/catch**: Captura de exceções
- **Mock rejections**: Simulação de falhas
- **Error boundaries**: Componentes de erro

### Testes E2E
- **Network mocking**: Interceptação de requests
- **Route mocking**: Simulação de APIs
- **Error injection**: Injeção de falhas

## 📈 Performance

### Testes Unitários
- **Execução rápida**: < 5s para suite completa
- **Paralelização**: Múltiplos workers
- **Cache**: Reutilização de builds

### Testes E2E
- **Execução otimizada**: < 2min para suite completa
- **Reutilização**: Browser contexts
- **Screenshots**: Apenas em falhas

## 🔧 Debugging

### Testes Unitários
```bash
# Debug específico
npm run test -- --reporter=verbose ComponentName

# Debug com breakpoints
npm run test -- --inspect-brk
```

### Testes E2E
```bash
# Debug visual
npm run test:e2e:ui

# Debug com browser
npm run test:e2e:headed

# Debug específico
npm run test:e2e -- --grep "booking flow"
```

## 📝 Boas Práticas

### Testes Unitários
1. **AAA Pattern**: Arrange, Act, Assert
2. **Isolamento**: Um conceito por teste
3. **Nomes descritivos**: O que está sendo testado
4. **Mocks mínimos**: Apenas o necessário
5. **Cleanup**: Limpeza após cada teste

### Testes E2E
1. **Page Object**: Abstração de páginas
2. **Wait strategies**: Esperas explícitas
3. **Data attributes**: Seletores estáveis
4. **Independent tests**: Testes isolados
5. **Error screenshots**: Captura de falhas

## 🚀 CI/CD

### GitHub Actions
```yaml
# Testes em PR
- Unit tests: npm run test:run
- E2E tests: npm run test:e2e
- Coverage: npm run test:coverage
```

### Pre-commit
```bash
# Hooks de pre-commit
npm run test:run -- --changed
npm run lint
```

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

Esta documentação garante que todos os aspectos críticos da aplicação sejam testados, desde componentes individuais até fluxos completos de usuário, com foco em qualidade, confiabilidade e manutenibilidade.
