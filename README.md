# 🛫 Sky Travels - Sistema de Gestão de Agentes de IA

## 🎨 Inspiração da UI

A UI foi construída a partir da seguinte inspiração:
- **Design System**: https://docs.once-ui.com/magic-docs/quick-start
- **Prototipação do Fluxo**: Stitch AI do Google - Apenas referências do fluxo
- **V0**: Apenas para validação inicial do fluxo iterativo

## 📋 Visão Geral

### Otimização de Reservas com Agente Conversacional e Teste A/B de Usabilidade

**Proposta de Valor Reforçada:**

Desenvolvimento de um Sistema de Planejamento de Viagens com IA que revoluciona a experiência do usuário, permitindo planejar, reservar e gerenciar voos e hotéis através de uma interface conversacional inteligente. O objetivo principal é maximizar a eficiência e a satisfação ao simplificar a coleta de dados de viagem em comparação com os métodos tradicionais.

## 🧪 Estrutura do Projeto (A/B Testing e Justificativa)

A seção sobre a estrutura deve focar na hipótese que você deseja testar.

### Estruturas do Teste A/B

O projeto é dividido em duas estruturas distintas para fins de Teste A/B:

#### 1. Estrutura Comum (Fluxo de Formulário Tradicional)
Atua como o grupo de controle (baseline) para mensurar as métricas de conversão e tempo de preenchimento que os usuários atuais já estão acostumados.

#### 2. Estrutura do Agente Conversacional Inteligente
O grupo de teste, onde a IA facilita a coleta de dados, reservas e gestão em um formato de diálogo natural.

### Justificativa do Teste e Hipótese

A inclusão do fluxo comum é crucial para validar se o agente conversacional realmente gera uma experiência superior. Nossa hipótese é que um **Agente Assistido** (que auxilia no preenchimento do formulário em vez de exigir uma conversa aberta) será mais eficaz e bem-aceito. Isso se deve à idade média dos usuários e sua adaptabilidade, onde a previsibilidade do formulário, combinada com a assistência da IA, pode superar as barreiras de um agente puramente conversacional.

A estrutura do projeto inclui um Teste A/B que compara o fluxo conversacional da IA com o fluxo de formulário tradicional. Essa validação é estratégica, pois prevemos que um Agente Assistido (que guia o preenchimento do formulário) será o modelo ideal para nosso público-alvo, dada a idade média e a preferência por fluxos mais diretos. O objetivo final é provar que a assistência inteligente melhora significativamente o tempo de resposta e a satisfação do usuário, sem a complexidade de um agente conversacional aberto.



## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- pnpm (recomendado) ou npm
- Chave da API OpenAI
- Fazer migrate no Prisma

### 1. Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd 

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

### 2. Configuração do Banco de Dados
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# (Opcional) Visualizar dados
npx prisma studio
```

### 3. Executar Aplicação
```bash
# Desenvolvimento
pnpm run dev

# Build para produção
pnpm run build
pnpm run start
```

### 4. Testes
```bash
# Testes unitários
pnpm run test

# Testes E2E
pnpm run test:e2e

# Todos os testes
pnpm run test:all
```

## 🔧 Configuração (.env.example)

```env
# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key-here

# Database (Prisma)
DATABASE_URL="file:./prisma/sky-travels.db"

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Desenvolvimento
NODE_ENV=development
```

## 🔄 Fluxo de Conversação

1. **Entrada do Usuário** → Processamento de linguagem natural
2. **Detecção de Intenção** → Classificação da solicitação
3. **Seleção de Ferramenta** → Escolha da tool apropriada
4. **Execução** → Chamada da API/tool
5. **Geração de UI** → Renderização de componentes dinâmicos
6. **Resposta** → Feedback ao usuário

## 🛠️ Tabela das Tools

| Tool | Parâmetros | Retorno | Descrição |
|------|------------|---------|-----------|
| `search_flights` | `origin`, `destination`, `departureDate`, `returnDate?`, `passengers`, `class` | `FlightData[]` | Busca voos disponíveis |
| `search_hotels` | `destination`, `checkin`, `checkout`, `guests`, `category?` | `HotelData[]` | Busca hotéis disponíveis |
| `get_destination_info` | `destination` | `DestinationInfo` | Informações sobre destino |
| `calculate_trip_price` | `flights`, `hotels`, `extras?` | `PriceCalculation` | Calcula preço total |
| `book_flight` | `flightId`, `passengerInfo` | `BookingConfirmation` | Reserva voo |
| `book_hotel` | `hotelId`, `guestInfo`, `dates` | `BookingConfirmation` | Reserva hotel |

### Exemplo de Tool Call
```typescript
{
  "tool": "search_flights",
  "parameters": {
    "origin": "São Paulo",
    "destination": "Rio de Janeiro", 
    "departureDate": "2024-02-15",
    "passengers": 2,
    "class": "economy"
  }
}
```

## 🎨 Tabela dos Componentes Generativos

| Componente | Props | Events | Descrição |
|------------|-------|--------|-----------|
| `StreamingText` | `text`, `isTyping` | `onComplete` | Texto com efeito de digitação |
| `StreamingToolCall` | `tool`, `parameters`, `status` | `onComplete`, `onError` | Execução de tool com status |
| `StreamingUI` | `type`, `data` | `onSelect`, `onConfirm` | Componentes interativos |
| `StreamingError` | `error`, `retryable` | `onRetry`, `onDismiss` | Exibição de erros |
| `StreamingConfirmation` | `booking`, `details` | `onConfirm`, `onCancel` | Confirmação de reserva |

### Exemplo de Componente
```typescript
{
  "type": "StreamingUI",
  "data": {
    "type": "flights",
    "flights": [
      {
        "id": "LA1234",
        "airline": "LATAM",
        "price": 250,
        "departureTime": "08:00"
      }
    ]
  }
}
```

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

```sql
-- Itinerários (agrupa voos e hotéis)
itineraries {
  id: String (PK)
  userId: String
  status: String (ACTIVE|CANCELLED|COMPLETED)
  totalAmount: Float
  currency: String
  origin: String
  destination: String
  departureDate: String
  returnDate: String?
  createdAt: DateTime
  updatedAt: DateTime
}

-- Voos
flights {
  id: String (PK)
  pnr: String (UNIQUE)
  status: String (TICKETED|CANCELED)
  total: Float
  currency: String
  passengerName: String
  passengerEmail: String
  departureTime: String
  arrivalTime: String
  origin: String
  destination: String
  flightNumber: String
  airline: String
  createdAt: DateTime
  updatedAt: DateTime
}

-- Hotéis
hotels {
  id: String (PK)
  reservationId: String (UNIQUE)
  status: String (BOOKED|CANCELED)
  total: Float
  currency: String
  guestName: String
  guestEmail: String
  hotelId: String
  hotelName: String
  checkin: String
  checkout: String
  createdAt: DateTime
  updatedAt: DateTime
}
```

## ⚖️ Decisões e Trade-offs

### 1. **ISO Dates vs String Dates**
- **Decisão**: Usar strings para datas (`"2024-02-15"`)
- **Motivo**: Simplicidade na API e compatibilidade com diferentes fusos horários
- **Trade-off**: Menos validação automática, mas mais flexibilidade

### 2. **Retry/Backoff Strategy**
- **Decisão**: Exponential backoff com jitter
- **Implementação**: 300ms → 600ms → 1200ms → falha
- **Motivo**: Balancear latência vs confiabilidade

### 4. **Prisma **)
- **Motivo**: Melhor suporte multiplataforma e TypeScript
- **Trade-off**: Bundle maior, mas melhor DX

### 5. **Streaming vs Batch Processing**
- **Decisão**: Streaming para UX, batch para performance
- **Implementação**: Componentes renderizados incrementalmente
- **Motivo**: Feedback imediato ao usuário

## 🔄 Simulação de Latência e Falhas

### Configuração
```typescript
// src/services/api/resilience.ts
const RESILIENCE_CONFIG = {
  latency: { min: 300, max: 1200 }, // ms
  errorRate: 0.15, // 15%
  retryAttempts: 3,
  backoffMultiplier: 2
}
```

### Comportamento da UI
1. **Loading States**: Skeleton components durante latência
2. **Error Handling**: Toast notifications com retry
3. **Progressive Enhancement**: Funcionalidade básica sempre disponível
4. **Circuit Breaker**: Previne cascata de falhas

### Como Simular
```bash
# Ativar simulação de latência
export SIMULATE_LATENCY=true

# Ativar simulação de erros
export SIMULATE_ERRORS=true

# Configurar taxa de erro
export ERROR_RATE=0.15
```

## 🧪 Testes

### Testes Unitários (Vitest)
```typescript
// src/components/ai/__tests__/StreamingComponents.test.tsx
describe('StreamingComponents', () => {
  it('should render loading state correctly', () => {
    const component = render(<StreamingComponents components={[loadingComponent]} />)
    expect(component.getByTestId('loading-skeleton')).toBeInTheDocument()
  })
  
  it('should render error state with retry button', () => {
    const component = render(<StreamingComponents components={[errorComponent]} />)
    expect(component.getByText('Tentar novamente')).toBeInTheDocument()
  })
})
```

### Testes E2E (Playwright)
```typescript
// e2e/travel-booking.spec.ts
test('complete booking flow with retry scenario', async ({ page }) => {
  // 1. Buscar voos
  await page.fill('[data-testid="origin-input"]', 'São Paulo')
  await page.fill('[data-testid="destination-input"]', 'Rio de Janeiro')
  await page.click('[data-testid="search-flights"]')
  
  // 2. Selecionar voo
  await page.click('[data-testid="flight-card-0"]')
  
  // 3. Simular erro e retry
  await page.route('**/api/bookings', route => {
    if (Math.random() < 0.5) {
      route.fulfill({ status: 500 })
    } else {
      route.continue()
    }
  })
  
  // 4. Confirmar reserva
  await page.click('[data-testid="confirm-booking"]')
  
  // 5. Verificar sucesso
  await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()
})
```

### Testes Específicos
- **Cenários de falha**: Testes de edge cases e recuperação de erros



### Logs e Debugging
```typescript
// Estrutura de logs
{
  "timestamp": "2024-02-15T10:30:00Z",
  "level": "info",
  "service": "booking-service",
  "action": "create_booking",
  "userId": "user-123",
  "duration": 1200,
  "success": true
}
```

## 🔒 Segurança

### Implementações
1. **Sanitização**: DOMPurify para conteúdo HTML
2. **Validação**: Zod schemas para todos os inputs
3. **Rate Limiting**: Proteção contra spam
4. **CORS**: Configuração adequada
5. **HTTPS**: Forçado em produção

## 📚 Documentação Adicional
- [Guia de Testes](./TESTING.md)
- [API Reference](./API.md)

