# 🗄️ Database Documentation

## 📋 Schema Overview

O sistema de persistência utiliza **SQLite** com **Drizzle ORM** para simplicidade e portabilidade.

### Tabelas Principais

#### 1. **itineraries** - Itinerários de Viagem
```sql
id TEXT PRIMARY KEY              -- UUID do itinerário
user_id TEXT NOT NULL           -- ID do usuário
status TEXT NOT NULL            -- ACTIVE|CANCELLED|COMPLETED
total_amount REAL NOT NULL      -- Valor total
currency TEXT NOT NULL          -- Moeda (BRL)
origin TEXT NOT NULL            -- Cidade de origem
destination TEXT NOT NULL       -- Cidade de destino
departure_date TEXT NOT NULL    -- Data de partida
return_date TEXT                -- Data de retorno (opcional)
created_at TEXT NOT NULL        -- Data de criação
updated_at TEXT NOT NULL        -- Data de atualização
```

#### 2. **flights** - Voos
```sql
id TEXT PRIMARY KEY              -- UUID do voo
pnr TEXT NOT NULL UNIQUE        -- Passenger Name Record
status TEXT NOT NULL            -- TICKETED|CANCELED
total REAL NOT NULL             -- Valor do voo
currency TEXT NOT NULL          -- Moeda (BRL)
passenger_name TEXT NOT NULL    -- Nome do passageiro
passenger_email TEXT NOT NULL   -- Email do passageiro
itinerary_id TEXT NOT NULL      -- ID do itinerário
created_at TEXT NOT NULL        -- Data de criação
updated_at TEXT NOT NULL        -- Data de atualização
```

#### 3. **hotels** - Hotéis
```sql
id TEXT PRIMARY KEY              -- UUID da reserva
reservation_id TEXT NOT NULL UNIQUE -- ID da reserva no hotel
status TEXT NOT NULL            -- BOOKED|CANCELED
total REAL NOT NULL             -- Valor do hotel
currency TEXT NOT NULL          -- Moeda (BRL)
guest_name TEXT NOT NULL        -- Nome do hóspede
guest_email TEXT NOT NULL       -- Email do hóspede
hotel_id TEXT NOT NULL          -- ID do hotel no sistema
checkin TEXT NOT NULL           -- Data de check-in
checkout TEXT NOT NULL          -- Data de check-out
created_at TEXT NOT NULL        -- Data de criação
updated_at TEXT NOT NULL        -- Data de atualização
```

#### 4. **itinerary_flights** - Relacionamento Itinerário-Voo
```sql
id TEXT PRIMARY KEY              -- UUID do relacionamento
itinerary_id TEXT NOT NULL      -- ID do itinerário
flight_id TEXT NOT NULL         -- ID do voo
created_at TEXT NOT NULL        -- Data de criação
```

#### 5. **itinerary_hotels** - Relacionamento Itinerário-Hotel
```sql
id TEXT PRIMARY KEY              -- UUID do relacionamento
itinerary_id TEXT NOT NULL      -- ID do itinerário
hotel_id TEXT NOT NULL          -- ID do hotel
created_at TEXT NOT NULL        -- Data de criação
```

## 🚀 Setup e Migração

### Comandos Disponíveis

```bash
# Criar banco e executar migrações
npm run db:migrate

# Resetar banco (deletar e recriar)
npm run db:reset

# Popular com dados de exemplo
npm run db:seed

# Executar todos os comandos
npm run db:reset && npm run db:seed
```

### Estrutura de Arquivos

```
src/lib/database/
├── index.ts                    # Configuração do banco
├── schema.ts                   # Schema Drizzle
├── migrations/
│   └── 001_initial_schema.sql  # Migração inicial
└── repositories/
    ├── flight-repository.ts    # CRUD de voos
    ├── hotel-repository.ts     # CRUD de hotéis
    └── itinerary-repository.ts # CRUD de itinerários
```

## 🔧 Repositórios

### FlightRepository

```typescript
// Criar voo
await FlightRepository.create(flightData)

// Buscar por PNR
await FlightRepository.findByPNR('ABC123')

// Buscar por itinerário
await FlightRepository.findByItineraryId(itineraryId)

// Cancelar voo
await FlightRepository.cancel(flightId)

// Estatísticas
await FlightRepository.getStats()
```

### HotelRepository

```typescript
// Criar reserva
await HotelRepository.create(hotelData)

// Buscar por reservation ID
await HotelRepository.findByReservationId('HTL001')

// Buscar por hotel
await HotelRepository.findByHotelId(hotelId)

// Cancelar reserva
await HotelRepository.cancel(hotelId)

// Próximos check-ins
await HotelRepository.findUpcomingCheckins(7)
```

### ItineraryRepository

```typescript
// Criar itinerário
await ItineraryRepository.create(itineraryData)

// Buscar por usuário
await ItineraryRepository.findByUserId(userId)

// Adicionar voo
await ItineraryRepository.addFlight(itineraryId, flightId)

// Adicionar hotel
await ItineraryRepository.addHotel(itineraryId, hotelId)

// Itinerário completo
await ItineraryRepository.getCompleteItinerary(itineraryId)
```

## 🎯 Serviço de Booking

### BookingService

```typescript
// Processar booking completo
const result = await BookingService.processBooking({
  userId: 'user-1',
  passengerInfo: { firstName: 'João', lastName: 'Silva', email: 'joao@email.com' },
  flightData: { airline: 'LATAM', price: 250, ... },
  hotelData: { name: 'Hotel Plaza', price: 300, ... },
  paymentInfo: { method: 'credit_card', ... }
})

// Buscar por PNR
const booking = await BookingService.getBookingByPNR('ABC123')

// Buscar bookings do usuário
const bookings = await BookingService.getUserBookings('user-1')

// Cancelar booking
await BookingService.cancelBooking(itineraryId)
```

## 🌐 APIs REST

### Endpoints

#### POST /api/bookings
```json
{
  "userId": "user-1",
  "passengerInfo": {
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999"
  },
  "flightData": {
    "airline": "LATAM",
    "flightNumber": "LA1234",
    "origin": "São Paulo",
    "destination": "Rio de Janeiro",
    "price": 250
  },
  "hotelData": {
    "name": "Hotel Plaza",
    "price": 300,
    "checkin": "2024-12-15",
    "checkout": "2024-12-18"
  },
  "paymentInfo": {
    "method": "credit_card",
    "cardNumber": "1234567890123456"
  }
}
```

#### GET /api/bookings?userId=user-1
```json
{
  "success": true,
  "bookings": [
    {
      "itinerary": { "id": "...", "status": "ACTIVE", ... },
      "flight": { "pnr": "ABC123", "status": "TICKETED", ... },
      "hotel": { "reservationId": "HTL001", "status": "BOOKED", ... }
    }
  ]
}
```

#### GET /api/bookings?pnr=ABC123
```json
{
  "success": true,
  "itinerary": { "id": "...", "status": "ACTIVE", ... },
  "flight": { "pnr": "ABC123", "status": "TICKETED", ... },
  "hotel": { "reservationId": "HTL001", "status": "BOOKED", ... }
}
```

#### POST /api/bookings/{id}/cancel
```json
{
  "success": true
}
```

#### GET /api/bookings/stats
```json
{
  "success": true,
  "stats": {
    "flights": { "total": 10, "ticketed": 8, "canceled": 2 },
    "hotels": { "total": 8, "booked": 7, "canceled": 1 },
    "itineraries": { "total": 5, "active": 3, "completed": 2 }
  }
}
```

## 🔗 Integração com Streaming

### BookingIntegration

```typescript
// Processar confirmação com persistência
const component = await BookingIntegration.processReservationConfirmation(
  flightData, hotelData, passengerInfo, paymentInfo, userId
)

// Buscar bookings do usuário
const components = await BookingIntegration.getUserBookingsComponents(userId)

// Cancelar booking
const cancelComponent = await BookingIntegration.cancelBookingComponent(itineraryId)
```

## 📊 Índices e Performance

### Índices Criados

```sql
-- Itinerários
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itineraries_status ON itineraries(status);
CREATE INDEX idx_itineraries_created_at ON itineraries(created_at);

-- Voos
CREATE INDEX idx_flights_pnr ON flights(pnr);
CREATE INDEX idx_flights_itinerary_id ON flights(itinerary_id);
CREATE INDEX idx_flights_status ON flights(status);
CREATE INDEX idx_flights_passenger_email ON flights(passenger_email);

-- Hotéis
CREATE INDEX idx_hotels_reservation_id ON hotels(reservation_id);
CREATE INDEX idx_hotels_hotel_id ON hotels(hotel_id);
CREATE INDEX idx_hotels_status ON hotels(status);
CREATE INDEX idx_hotels_checkin ON hotels(checkin);
```

### Triggers

```sql
-- Atualizar updated_at automaticamente
CREATE TRIGGER update_itineraries_updated_at 
  AFTER UPDATE ON itineraries
  BEGIN
    UPDATE itineraries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
```

## 🧪 Testes

### Testes de Repositório

```typescript
// Testar criação de voo
const flight = await FlightRepository.create(flightData)
expect(flight.pnr).toBeDefined()

// Testar busca por PNR
const found = await FlightRepository.findByPNR('ABC123')
expect(found).toBeTruthy()

// Testar cancelamento
await FlightRepository.cancel(flightId)
const canceled = await FlightRepository.findById(flightId)
expect(canceled.status).toBe('CANCELED')
```

### Testes de API

```typescript
// Testar criação de booking
const response = await fetch('/api/bookings', {
  method: 'POST',
  body: JSON.stringify(bookingRequest)
})
const result = await response.json()
expect(result.success).toBe(true)

// Testar busca de bookings
const bookings = await fetch('/api/bookings?userId=user-1')
const data = await bookings.json()
expect(data.bookings).toHaveLength(1)
```

## 🔒 Segurança

### Validações

- **PNR único**: Evita duplicação de voos
- **Reservation ID único**: Evita duplicação de hotéis
- **Foreign Keys**: Integridade referencial
- **Check constraints**: Status válidos
- **Sanitização**: Inputs sanitizados antes da inserção

### Transações

```typescript
// Booking atômico
const result = await db.transaction(async (tx) => {
  const itinerary = await tx.insert(itineraries).values(itineraryData)
  const flight = await tx.insert(flights).values(flightData)
  await tx.insert(itineraryFlights).values({ itineraryId, flightId })
  return { itinerary, flight }
})
```

## 📈 Monitoramento

### Métricas Disponíveis

- **Total de bookings**: Contagem geral
- **Taxa de cancelamento**: Por voos e hotéis
- **Bookings por usuário**: Histórico individual
- **Receita total**: Soma dos valores
- **Bookings ativos**: Status ACTIVE

### Logs

```typescript
// Log de operações críticas
console.log('✅ Booking created:', { itineraryId, pnr, totalAmount })
console.log('❌ Booking failed:', { error, userId, flightData })
console.log('🔄 Booking cancelled:', { itineraryId, reason })
```

## 🚀 Deploy

### Produção

Para produção, considere migrar para PostgreSQL:

```typescript
// Configuração PostgreSQL
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connection = postgres(process.env.DATABASE_URL)
export const db = drizzle(connection, { schema })
```

### Backup

```bash
# Backup SQLite
cp sky-travels.db backup-$(date +%Y%m%d).db

# Restore
cp backup-20241201.db sky-travels.db
```

---

Este sistema de persistência fornece uma base sólida para o gerenciamento de bookings de viagem, com foco em simplicidade, performance e confiabilidade.
