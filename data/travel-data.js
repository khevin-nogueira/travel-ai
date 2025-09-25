// Mock de dados estruturados para voos e hotéis
export const destinations = [
  { id: 'sao-paulo', name: 'São Paulo', code: 'SAO', country: 'Brasil' },
  { id: 'belo-horizonte', name: 'Belo Horizonte', code: 'CNF', country: 'Brasil' },
  { id: 'rio-janeiro', name: 'Rio de Janeiro', code: 'RIO', country: 'Brasil' },
  { id: 'paris', name: 'Paris', code: 'CDG', country: 'França' },
  { id: 'nova-york', name: 'Nova York', code: 'JFK', country: 'Estados Unidos' },
  { id: 'londres', name: 'Londres', code: 'LHR', country: 'Reino Unido' },
  { id: 'toquio', name: 'Tóquio', code: 'NRT', country: 'Japão' },
  { id: 'madrid', name: 'Madrid', code: 'MAD', country: 'Espanha' },
  { id: 'barcelona', name: 'Barcelona', code: 'BCN', country: 'Espanha' },
  { id: 'miami', name: 'Miami', code: 'MIA', country: 'Estados Unidos' },
  { id: 'dubai', name: 'Dubai', code: 'DXB', country: 'Emirados Árabes Unidos' }
];

export const airlines = {
  'LATAM': { name: 'LATAM Airlines', code: 'LA', rating: 4.2 },
  'AIR_FRANCE': { name: 'Air France', code: 'AF', rating: 4.1 },
  'AZUL': { name: 'Azul', code: 'AD', rating: 4.0 },
  'EMIRATES': { name: 'Emirates', code: 'EK', rating: 4.5 },
  'TAP': { name: 'TAP Air Portugal', code: 'TP', rating: 3.9 },
  'LUFTHANSA': { name: 'Lufthansa', code: 'LH', rating: 4.3 }
};

// Função para gerar voos baseado na rota
export function getFlights(origin, destination, departureDate, returnDate = null) {
  const originData = destinations.find(d => d.name.toLowerCase().includes(origin.toLowerCase()));
  const destData = destinations.find(d => d.name.toLowerCase().includes(destination.toLowerCase()));
  
  if (!originData || !destData) return [];

  const isInternational = originData.country !== destData.country;
  const distance = calculateDistance(originData, destData);
  
  const flights = [];
  const flightCount = Math.floor(Math.random() * 3) + 2; // 2-4 voos
  
  for (let i = 0; i < flightCount; i++) {
    const airline = getRandomAirline(isInternational);
    const basePrice = calculateBasePrice(distance, isInternational);
    const variation = (Math.random() - 0.5) * 0.4; // ±20% variação
    const price = Math.round(basePrice * (1 + variation));
    
    flights.push({
      id: `${originData.code}-${destData.code}-${Date.now()}-${i}`,
      airline: airline.code,
      airlineName: airline.name,
      flightNumber: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
      origin: {
        code: originData.code,
        name: originData.name,
        country: originData.country
      },
      destination: {
        code: destData.code,
        name: destData.name,
        country: destData.country
      },
      departure: {
        date: departureDate,
        time: generateRandomTime()
      },
      arrival: {
        date: departureDate,
        time: generateArrivalTime(distance)
      },
      duration: formatDuration(calculateFlightDuration(distance)),
      price: price,
      stops: distance > 8000 ? (Math.random() > 0.6 ? 1 : 0) : 0,
      aircraft: getRandomAircraft(),
      class: 'Econômica',
      baggage: isInternational ? '23kg' : '10kg',
      rating: airline.rating
    });
  }

  // Se tem volta, gerar voos de volta
  if (returnDate) {
    for (let i = 0; i < Math.min(flightCount, 3); i++) {
      const airline = getRandomAirline(isInternational);
      const basePrice = calculateBasePrice(distance, isInternational);
      const variation = (Math.random() - 0.5) * 0.4;
      const price = Math.round(basePrice * (1 + variation));
      
      flights.push({
        id: `${destData.code}-${originData.code}-${Date.now()}-${i}`,
        airline: airline.code,
        airlineName: airline.name,
        flightNumber: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
        origin: {
          code: destData.code,
          name: destData.name,
          country: destData.country
        },
        destination: {
          code: originData.code,
          name: originData.name,
          country: originData.country
        },
        departure: {
          date: returnDate,
          time: generateRandomTime()
        },
        arrival: {
          date: returnDate,
          time: generateArrivalTime(distance)
        },
        duration: formatDuration(calculateFlightDuration(distance)),
        price: price,
        stops: distance > 8000 ? (Math.random() > 0.6 ? 1 : 0) : 0,
        aircraft: getRandomAircraft(),
        class: 'Econômica',
        baggage: isInternational ? '23kg' : '10kg',
        rating: airline.rating,
        isReturn: true
      });
    }
  }

  return flights.sort((a, b) => a.price - b.price);
}

// Função para gerar hotéis baseado no destino
export function getHotels(destination, checkIn, checkOut, guests = 1) {
  const destData = destinations.find(d => d.name.toLowerCase().includes(destination.toLowerCase()));
  if (!destData) return [];

  const isInternational = destData.country !== 'Brasil';
  const nights = calculateNights(checkIn, checkOut);
  
  const hotelTemplates = [
    {
      name: 'Hotel Premium Palace',
      stars: 5,
      category: 'Luxo',
      basePrice: isInternational ? 800 : 450,
      amenities: ['Wi-Fi Grátis', 'Piscina', 'Spa', 'Academia', 'Restaurante', 'Room Service 24h'],
      rating: 4.8,
      image: 'luxury-hotel.jpg'
    },
    {
      name: 'Grand Hotel Central',
      stars: 4,
      category: 'Executivo',
      basePrice: isInternational ? 400 : 250,
      amenities: ['Wi-Fi Grátis', 'Academia', 'Restaurante', 'Business Center'],
      rating: 4.3,
      image: 'business-hotel.jpg'
    },
    {
      name: 'City Comfort Inn',
      stars: 3,
      category: 'Conforto',
      basePrice: isInternational ? 200 : 120,
      amenities: ['Wi-Fi Grátis', 'Café da Manhã', 'Reception 24h'],
      rating: 4.0,
      image: 'comfort-hotel.jpg'
    },
    {
      name: 'Budget Stay Hotel',
      stars: 2,
      category: 'Econômico',
      basePrice: isInternational ? 100 : 80,
      amenities: ['Wi-Fi Grátis', 'Reception 24h'],
      rating: 3.7,
      image: 'budget-hotel.jpg'
    }
  ];

  return hotelTemplates.map((template, index) => {
    const variation = (Math.random() - 0.5) * 0.3; // ±15% variação
    const pricePerNight = Math.round(template.basePrice * (1 + variation));
    const totalPrice = pricePerNight * nights * guests;

    return {
      id: `hotel-${destData.id}-${index}`,
      name: template.name.replace('Hotel', `Hotel ${destData.name}`),
      stars: template.stars,
      category: template.category,
      rating: template.rating + (Math.random() - 0.5) * 0.4,
      location: {
        city: destData.name,
        country: destData.country,
        district: getRandomDistrict(destData.name)
      },
      prices: {
        perNight: pricePerNight,
        total: totalPrice,
        currency: isInternational ? 'USD' : 'BRL'
      },
      amenities: template.amenities,
      checkIn: checkIn,
      checkOut: checkOut,
      nights: nights,
      guests: guests,
      image: template.image,
      cancellation: 'Cancelamento grátis até 24h antes',
      breakfast: template.stars >= 3 ? 'Incluído' : 'Opcional'
    };
  }).sort((a, b) => a.prices.total - b.prices.total);
}

// Funções auxiliares
function calculateDistance(origin, dest) {
  // Simulação simples de distância baseada em códigos
  const distances = {
    'SAO-RIO': 350, 'SAO-CDG': 9200, 'SAO-JFK': 7800,
    'RIO-CDG': 9000, 'RIO-JFK': 7600, 'CDG-LHR': 350,
    'JFK-LHR': 5500, 'CDG-NRT': 9700, 'JFK-NRT': 10800
  };
  
  const key1 = `${origin.code}-${dest.code}`;
  const key2 = `${dest.code}-${origin.code}`;
  
  return distances[key1] || distances[key2] || 
         (origin.country === dest.country ? 800 : 8000);
}

function calculateBasePrice(distance, isInternational) {
  if (isInternational) {
    return distance < 5000 ? 1200 : distance < 10000 ? 2500 : 3500;
  }
  return distance < 1000 ? 250 : distance < 2000 ? 400 : 600;
}

function getRandomAirline(isInternational) {
  const domesticAirlines = ['LATAM', 'AZUL'];
  const internationalAirlines = ['LATAM', 'AIR_FRANCE', 'EMIRATES', 'TAP', 'LUFTHANSA'];
  
  const availableAirlines = isInternational ? internationalAirlines : domesticAirlines;
  const airlineCode = availableAirlines[Math.floor(Math.random() * availableAirlines.length)];
  
  return airlines[airlineCode];
}

function generateRandomTime() {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateArrivalTime(distance) {
  const flightHours = Math.floor(distance / 800); // ~800km/h velocidade média
  const flightMinutes = Math.floor((distance % 800) / 13.33); // resto em minutos
  
  const totalMinutes = flightHours * 60 + flightMinutes + Math.floor(Math.random() * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${Math.floor(minutes/15)*15}`;
}

function calculateFlightDuration(distance) {
  const hours = Math.floor(distance / 800);
  const minutes = Math.floor((distance % 800) / 13.33);
  return hours * 60 + minutes;
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}

function getRandomAircraft() {
  const aircraft = ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A330', 'Boeing 787', 'Airbus A350'];
  return aircraft[Math.floor(Math.random() * aircraft.length)];
}

function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getRandomDistrict(city) {
  const districts = {
    'São Paulo': ['Centro', 'Paulista', 'Jardins', 'Vila Olímpia'],
    'Rio de Janeiro': ['Copacabana', 'Ipanema', 'Leblon', 'Centro'],
    'Paris': ['Champs-Élysées', 'Le Marais', 'Montmartre', 'Saint-Germain'],
    'Nova York': ['Manhattan', 'Times Square', 'Central Park', 'SoHo'],
    'Londres': ['Westminster', 'Covent Garden', 'Kensington', 'Camden'],
    'Tóquio': ['Shibuya', 'Shinjuku', 'Ginza', 'Asakusa']
  };
  
  const cityDistricts = districts[city] || ['Centro', 'Zona Turística', 'Área Comercial'];
  return cityDistricts[Math.floor(Math.random() * cityDistricts.length)];
}
