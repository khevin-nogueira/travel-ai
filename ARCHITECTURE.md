# Sky Travels - Architecture Documentation

## 🏗️ Project Structure

```
src/
├── components/           # React Components
│   ├── ai/              # AI-specific components
│   │   ├── StreamingComponents.tsx
│   │   └── StructuredDataDisplay.tsx
│   ├── ui/              # Reusable UI components
│   │   └── Toast.tsx
│   └── forms/           # Form components
├── lib/                 # Core libraries
│   ├── agents/          # AI Agent system
│   │   ├── streaming.ts # Streaming components
│   │   └── tools.ts     # Tool definitions
│   ├── database/        # Database layer (future)
│   └── validation/      # Zod schemas
├── hooks/               # Custom React hooks
│   └── useStreamingAgent.ts
├── services/            # External services
│   └── api/
│       └── resilience.ts
├── types/               # TypeScript definitions
│   ├── agent/           # Agent types
│   ├── api/             # API types
│   └── ui/              # UI types
├── utils/               # Utility functions
│   ├── accessibility.ts
│   └── security.ts
└── config/              # Configuration
    ├── i18n.ts
    └── index.ts
```

## 🎯 Key Features Implemented

### 1. **Generative UI with Streaming** ✅
- **Streaming Components**: Real-time component generation and rendering
- **Progressive Loading**: Components appear as they're generated
- **Type Safety**: Full TypeScript support with Zod validation
- **Error Handling**: Graceful error states with retry mechanisms

### 2. **Typed Tools System** ✅
- **Zod Schemas**: Strict validation for all tool parameters
- **Tool Registry**: Centralized tool management
- **Type Safety**: Compile-time validation of tool calls
- **Error Handling**: Comprehensive error reporting

### 3. **Resilience & Error Handling** ✅
- **Latency Simulation**: 300-1200ms realistic delays
- **Error Simulation**: 15% error rate for testing
- **Retry Logic**: Exponential backoff with circuit breaker
- **Health Checks**: Service monitoring and status reporting

### 4. **Accessibility (A11y)** ✅
- **ARIA Support**: Full ARIA attributes and roles
- **Keyboard Navigation**: Complete keyboard support
- **Screen Reader**: Live regions and announcements
- **Focus Management**: Focus traps and skip links
- **High Contrast**: Automatic high contrast detection

### 5. **Internationalization (i18n)** ✅
- **Multi-language**: Portuguese (pt-BR) and English (en-US)
- **Dynamic Switching**: Runtime language changes
- **Formatting**: Currency, dates, and numbers
- **Accessibility**: Screen reader announcements in user's language

### 6. **Security & Sanitization** ✅
- **HTML Sanitization**: DOMPurify integration
- **Input Validation**: Comprehensive input sanitization
- **XSS Prevention**: Content sanitization for AI responses
- **CSP Headers**: Content Security Policy implementation

## 🔧 Technical Implementation

### Streaming Architecture

```typescript
// Component streaming flow
User Input → Tool Execution → Streaming Generator → UI Components

// Example usage
const { components, sendMessage } = useStreamingAgent()

// Send message triggers streaming
await sendMessage("Buscar voos para São Paulo")

// Components stream in real-time
<StreamingRenderer 
  components={components}
  onFlightSelect={handleFlightSelect}
  onHotelSelect={handleHotelSelect}
/>
```

### Tool System

```typescript
// Tool definition with Zod validation
export const flightSearchTool: ToolDefinition = {
  name: 'search_flights',
  description: 'Busca voos disponíveis',
  parameters: SearchFlightsToolSchema, // Zod schema
  streaming: true,
  async execute(args) {
    // Validated args with full type safety
    return { type: 'streaming', generator: streamFlights(args) }
  }
}
```

### Resilience Pattern

```typescript
// Automatic retry with exponential backoff
const result = await ResilienceService.withRetry(
  () => executeTool(toolName, args),
  3, // max retries
  1000 // base delay
)

// Circuit breaker for failing services
const circuitBreaker = ResilienceService.createCircuitBreaker(
  operation,
  5, // failure threshold
  60000 // timeout
)
```

### Accessibility Integration

```typescript
// Automatic announcements
A11yService.announce('Novo voo encontrado')
A11yService.announceError('Erro ao buscar voos')

// ARIA attributes
<button {...AriaHelper.createButtonProps('Selecionar voo')}>
  Selecionar
</button>

// Focus management
A11yService.focusElement(element)
```

### Internationalization

```typescript
// Translation usage
const message = I18nService.t('ai.welcome')
const price = I18nService.formatCurrency(250, 'BRL')
const date = I18nService.formatDate(new Date())

// Dynamic language switching
I18nService.setLocale('en-US')
```

### Security

```typescript
// Input sanitization
const sanitized = SecurityService.sanitizeText(userInput)
const cleanHTML = SecurityService.sanitizeHTML(aiResponse)

// AI content sanitization
const safeData = AIContentSanitizer.sanitizeStructuredData(aiData)
```

## 🚀 Usage Examples

### Basic Streaming Agent

```typescript
import { useStreamingAgent } from '@/hooks/useStreamingAgent'
import { StreamingRenderer } from '@/components/ai/StreamingComponents'

function TravelPlanner() {
  const { 
    components, 
    sendMessage, 
    isLoading, 
    error 
  } = useStreamingAgent()

  return (
    <div>
      <input 
        onKeyPress={(e) => e.key === 'Enter' && sendMessage(e.target.value)}
        placeholder="Digite sua mensagem..."
      />
      
      <StreamingRenderer 
        components={components}
        onFlightSelect={(flight) => console.log('Selected:', flight)}
        onHotelSelect={(hotel) => console.log('Selected:', hotel)}
      />
      
      {isLoading && <div>Processando...</div>}
      {error && <div>Erro: {error}</div>}
    </div>
  )
}
```

### Tool Execution

```typescript
import { ToolExecutor } from '@/lib/agents/tools'

// Execute tool with validation
const result = await ToolExecutor.execute('search_flights', {
  searchCriteria: {
    origin: 'São Paulo',
    destination: 'Rio de Janeiro',
    departureDate: '2024-12-01',
    passengers: 1,
    class: 'economy'
  }
})
```

### Toast Notifications

```typescript
import { useToast } from '@/components/ui/Toast'

function MyComponent() {
  const { success, error, warning, info } = useToast()

  const handleSuccess = () => {
    success('Reserva confirmada!', 'Sua viagem foi reservada com sucesso')
  }

  const handleError = () => {
    error('Erro na reserva', 'Tente novamente em alguns minutos', {
      label: 'Tentar Novamente',
      onClick: () => retryReservation()
    })
  }

  return (
    <div>
      <button onClick={handleSuccess}>Sucesso</button>
      <button onClick={handleError}>Erro</button>
    </div>
  )
}
```

## 📊 Performance Considerations

### Streaming Optimization
- **Lazy Loading**: Components load only when needed
- **Priority System**: Important components render first
- **Memory Management**: Automatic cleanup of old components

### Resilience Features
- **Circuit Breaker**: Prevents cascade failures
- **Exponential Backoff**: Reduces server load during outages
- **Health Monitoring**: Proactive service monitoring

### Accessibility Performance
- **Reduced Motion**: Respects user preferences
- **High Contrast**: Automatic theme detection
- **Screen Reader**: Optimized announcements

## 🔒 Security Features

### Input Validation
- **Zod Schemas**: Runtime validation
- **Type Safety**: Compile-time checks
- **Sanitization**: XSS prevention

### Content Security
- **DOMPurify**: HTML sanitization
- **CSP Headers**: Content Security Policy
- **Input Filtering**: Malicious input prevention

## 🌍 Internationalization

### Supported Languages
- **Portuguese (pt-BR)**: Default language
- **English (en-US)**: Full translation

### Features
- **Dynamic Switching**: Runtime language changes
- **Formatting**: Locale-specific formatting
- **Accessibility**: Screen reader support

## 🧪 Testing Strategy

### Unit Tests
- **Tool Validation**: Zod schema testing
- **Component Logic**: React component testing
- **Utility Functions**: Pure function testing

### Integration Tests
- **Streaming Flow**: End-to-end streaming
- **Error Handling**: Resilience testing
- **Accessibility**: A11y testing

### E2E Tests
- **User Flows**: Complete user journeys
- **Cross-browser**: Browser compatibility
- **Performance**: Load testing

## 📈 Monitoring & Analytics

### Performance Metrics
- **Core Web Vitals**: LCP, FID, CLS
- **Streaming Performance**: Component render times
- **Error Rates**: Tool execution success rates

### User Experience
- **Accessibility**: Screen reader usage
- **Internationalization**: Language preferences
- **Error Recovery**: Retry success rates

## 🚀 Deployment

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENABLE_STREAMING=true
NEXT_PUBLIC_ENABLE_RESILIENCE=true
NEXT_PUBLIC_ENABLE_ACCESSIBILITY=true
NEXT_PUBLIC_ENABLE_I18N=true
NEXT_PUBLIC_ENABLE_SECURITY=true
```

### Build Optimization
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Lazy loading
- **Bundle Analysis**: Size optimization

## 🔮 Future Enhancements

### Planned Features
- **Database Integration**: PostgreSQL/SQLite persistence
- **Real-time Updates**: WebSocket streaming
- **Advanced AI**: GPT-4 integration
- **Mobile App**: React Native version

### Performance Improvements
- **Service Workers**: Offline support
- **Caching**: Intelligent caching
- **CDN**: Global content delivery

---

This architecture provides a solid foundation for a production-ready AI travel planning application with enterprise-grade features for resilience, accessibility, security, and internationalization.
