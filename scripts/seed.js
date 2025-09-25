const Database = require('better-sqlite3')
const { v4: uuidv4 } = require('uuid')

// Seed do banco de dados com dados de exemplo
function seedDatabase() {
  console.log('🌱 Seeding database with sample data...')

  const db = new Database('sky-travels.db')
  
  try {
    // Dados de exemplo
    const sampleItineraries = [
      {
        id: uuidv4(),
        user_id: 'user-1',
        status: 'ACTIVE',
        total_amount: 750.00,
        currency: 'BRL',
        origin: 'São Paulo',
        destination: 'Rio de Janeiro',
        departure_date: '2024-12-15',
        return_date: '2024-12-18',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        user_id: 'user-2',
        status: 'COMPLETED',
        total_amount: 1200.00,
        currency: 'BRL',
        origin: 'São Paulo',
        destination: 'Salvador',
        departure_date: '2024-11-20',
        return_date: '2024-11-25',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    const sampleFlights = [
      {
        id: uuidv4(),
        pnr: 'ABC123',
        status: 'TICKETED',
        total: 450.00,
        currency: 'BRL',
        passenger_name: 'João Silva',
        passenger_email: 'joao@email.com',
        itinerary_id: sampleItineraries[0].id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        pnr: 'DEF456',
        status: 'TICKETED',
        total: 600.00,
        currency: 'BRL',
        passenger_name: 'Maria Santos',
        passenger_email: 'maria@email.com',
        itinerary_id: sampleItineraries[1].id,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    const sampleHotels = [
      {
        id: uuidv4(),
        reservation_id: 'HTL001',
        status: 'BOOKED',
        total: 300.00,
        currency: 'BRL',
        guest_name: 'João Silva',
        guest_email: 'joao@email.com',
        hotel_id: 'hotel-plaza-rio',
        checkin: '2024-12-15',
        checkout: '2024-12-18',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        reservation_id: 'HTL002',
        status: 'BOOKED',
        total: 600.00,
        currency: 'BRL',
        guest_name: 'Maria Santos',
        guest_email: 'maria@email.com',
        hotel_id: 'hotel-bahia-salvador',
        checkin: '2024-11-20',
        checkout: '2024-11-25',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Inserir dados
    console.log('📝 Inserting sample itineraries...')
    const insertItinerary = db.prepare(`
      INSERT INTO itineraries (id, user_id, status, total_amount, currency, origin, destination, departure_date, return_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    for (const itinerary of sampleItineraries) {
      insertItinerary.run(
        itinerary.id, itinerary.user_id, itinerary.status, itinerary.total_amount,
        itinerary.currency, itinerary.origin, itinerary.destination, itinerary.departure_date,
        itinerary.return_date, itinerary.created_at, itinerary.updated_at
      )
    }

    console.log('✈️ Inserting sample flights...')
    const insertFlight = db.prepare(`
      INSERT INTO flights (id, pnr, status, total, currency, passenger_name, passenger_email, itinerary_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    for (const flight of sampleFlights) {
      insertFlight.run(
        flight.id, flight.pnr, flight.status, flight.total, flight.currency,
        flight.passenger_name, flight.passenger_email, flight.itinerary_id,
        flight.created_at, flight.updated_at
      )
    }

    console.log('🏨 Inserting sample hotels...')
    const insertHotel = db.prepare(`
      INSERT INTO hotels (id, reservation_id, status, total, currency, guest_name, guest_email, hotel_id, checkin, checkout, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    for (const hotel of sampleHotels) {
      insertHotel.run(
        hotel.id, hotel.reservation_id, hotel.status, hotel.total, hotel.currency,
        hotel.guest_name, hotel.guest_email, hotel.hotel_id, hotel.checkin,
        hotel.checkout, hotel.created_at, hotel.updated_at
      )
    }

    // Criar relacionamentos
    console.log('🔗 Creating relationships...')
    const insertItineraryFlight = db.prepare(`
      INSERT INTO itinerary_flights (id, itinerary_id, flight_id, created_at)
      VALUES (?, ?, ?, ?)
    `)
    
    const insertItineraryHotel = db.prepare(`
      INSERT INTO itinerary_hotels (id, itinerary_id, hotel_id, created_at)
      VALUES (?, ?, ?, ?)
    `)

    // Relacionar voos com itinerários
    insertItineraryFlight.run(uuidv4(), sampleItineraries[0].id, sampleFlights[0].id, new Date().toISOString())
    insertItineraryFlight.run(uuidv4(), sampleItineraries[1].id, sampleFlights[1].id, new Date().toISOString())

    // Relacionar hotéis com itinerários
    insertItineraryHotel.run(uuidv4(), sampleItineraries[0].id, sampleHotels[0].id, new Date().toISOString())
    insertItineraryHotel.run(uuidv4(), sampleItineraries[1].id, sampleHotels[1].id, new Date().toISOString())

    console.log('✅ Database seeded successfully!')
    
    // Verificar dados inseridos
    const itineraryCount = db.prepare('SELECT COUNT(*) as count FROM itineraries').get()
    const flightCount = db.prepare('SELECT COUNT(*) as count FROM flights').get()
    const hotelCount = db.prepare('SELECT COUNT(*) as count FROM hotels').get()
    
    console.log(`📊 Data summary:`)
    console.log(`   - Itineraries: ${itineraryCount.count}`)
    console.log(`   - Flights: ${flightCount.count}`)
    console.log(`   - Hotels: ${hotelCount.count}`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }
