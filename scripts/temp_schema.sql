-- Sky Travels Database Schema
-- Initial migration for flights, hotels, and itineraries

-- Tabela de Itinerários (agrupa voos e hotéis)
CREATE TABLE IF NOT EXISTS itineraries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'COMPLETED')),
  total_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date TEXT NOT NULL,
  return_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Voos
CREATE TABLE IF NOT EXISTS flights (
  id TEXT PRIMARY KEY,
  pnr TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'TICKETED' CHECK (status IN ('TICKETED', 'CANCELED')),
  total REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  passenger_name TEXT NOT NULL,
  passenger_email TEXT NOT NULL,
  itinerary_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
);

-- Tabela de Hotéis
CREATE TABLE IF NOT EXISTS hotels (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'BOOKED' CHECK (status IN ('BOOKED', 'CANCELED')),
  total REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  hotel_id TEXT NOT NULL,
  checkin TEXT NOT NULL,
  checkout TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Relacionamento Itinerário-Voo
CREATE TABLE IF NOT EXISTS itinerary_flights (
  id TEXT PRIMARY KEY,
  itinerary_id TEXT NOT NULL,
  flight_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
  FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
);

-- Tabela de Relacionamento Itinerário-Hotel
CREATE TABLE IF NOT EXISTS itinerary_hotels (
  id TEXT PRIMARY KEY,
  itinerary_id TEXT NOT NULL,
  hotel_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_status ON itineraries(status);
CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON itineraries(created_at);
CREATE INDEX IF NOT EXISTS idx_itineraries_departure_date ON itineraries(departure_date);

CREATE INDEX IF NOT EXISTS idx_flights_pnr ON flights(pnr);
CREATE INDEX IF NOT EXISTS idx_flights_itinerary_id ON flights(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_created_at ON flights(created_at);
CREATE INDEX IF NOT EXISTS idx_flights_passenger_email ON flights(passenger_email);

CREATE INDEX IF NOT EXISTS idx_hotels_reservation_id ON hotels(reservation_id);
CREATE INDEX IF NOT EXISTS idx_hotels_hotel_id ON hotels(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels(status);
CREATE INDEX IF NOT EXISTS idx_hotels_checkin ON hotels(checkin);
CREATE INDEX IF NOT EXISTS idx_hotels_guest_email ON hotels(guest_email);

CREATE INDEX IF NOT EXISTS idx_itinerary_flights_itinerary_id ON itinerary_flights(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_flights_flight_id ON itinerary_flights(flight_id);

CREATE INDEX IF NOT EXISTS idx_itinerary_hotels_itinerary_id ON itinerary_hotels(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_hotels_hotel_id ON itinerary_hotels(hotel_id);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_itineraries_updated_at 
  AFTER UPDATE ON itineraries
  BEGIN
    UPDATE itineraries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_flights_updated_at 
  AFTER UPDATE ON flights
  BEGIN
    UPDATE flights SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_hotels_updated_at 
  AFTER UPDATE ON hotels
  BEGIN
    UPDATE hotels SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
