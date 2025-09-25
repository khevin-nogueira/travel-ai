-- CreateTable
CREATE TABLE "itineraries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureDate" TEXT NOT NULL,
    "returnDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "flights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pnr" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TICKETED',
    "total" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "passengerName" TEXT NOT NULL,
    "passengerEmail" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "arrivalTime" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "hotels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "total" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "checkin" TEXT NOT NULL,
    "checkout" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "itinerary_flights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itineraryId" TEXT NOT NULL,
    "flightId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "itinerary_flights_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itineraries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "itinerary_flights_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flights" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "itinerary_hotels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itineraryId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "itinerary_hotels_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itineraries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "itinerary_hotels_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "flights_pnr_key" ON "flights"("pnr");

-- CreateIndex
CREATE UNIQUE INDEX "hotels_reservationId_key" ON "hotels"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_flights_itineraryId_flightId_key" ON "itinerary_flights"("itineraryId", "flightId");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_hotels_itineraryId_hotelId_key" ON "itinerary_hotels"("itineraryId", "hotelId");
