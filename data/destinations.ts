export interface Destination {
  code: string
  name: string
  city: string
  country: string
  continent: string
  coordinates: {
    lat: number
    lng: number
  }
}

export const destinations: Destination[] = [
  // Brasil
  { code: "SAO", name: "São Paulo - Guarulhos", city: "São Paulo", country: "Brasil", continent: "América do Sul", coordinates: { lat: -23.4356, lng: -46.4731 } },
  { code: "GIG", name: "Rio de Janeiro - Galeão", city: "Rio de Janeiro", country: "Brasil", continent: "América do Sul", coordinates: { lat: -22.8090, lng: -43.2502 } },
  { code: "BSB", name: "Brasília", city: "Brasília", country: "Brasil", continent: "América do Sul", coordinates: { lat: -15.8715, lng: -47.9182 } },
  { code: "FOR", name: "Fortaleza", city: "Fortaleza", country: "Brasil", continent: "América do Sul", coordinates: { lat: -3.7722, lng: -38.5434 } },
  { code: "SSA", name: "Salvador", city: "Salvador", country: "Brasil", continent: "América do Sul", coordinates: { lat: -12.9100, lng: -38.3318 } },
  { code: "REC", name: "Recife", city: "Recife", country: "Brasil", continent: "América do Sul", coordinates: { lat: -8.1264, lng: -34.9233 } },
  { code: "POA", name: "Porto Alegre", city: "Porto Alegre", country: "Brasil", continent: "América do Sul", coordinates: { lat: -30.0946, lng: -51.1719 } },
  { code: "BEL", name: "Belém", city: "Belém", country: "Brasil", continent: "América do Sul", coordinates: { lat: -1.3793, lng: -48.4763 } },
  { code: "CWB", name: "Curitiba", city: "Curitiba", country: "Brasil", continent: "América do Sul", coordinates: { lat: -25.5284, lng: -49.1777 } },
  { code: "BHZ", name: "Belo Horizonte", city: "Belo Horizonte", country: "Brasil", continent: "América do Sul", coordinates: { lat: -19.8512, lng: -43.9502 } },

  // Estados Unidos
  { code: "JFK", name: "Nova York - JFK", city: "Nova York", country: "Estados Unidos", continent: "América do Norte", coordinates: { lat: 40.6413, lng: -73.7781 } },
  { code: "LAX", name: "Los Angeles", city: "Los Angeles", country: "Estados Unidos", continent: "América do Norte", coordinates: { lat: 34.0522, lng: -118.2437 } },
  { code: "MIA", name: "Miami", city: "Miami", country: "Estados Unidos", continent: "América do Norte", coordinates: { lat: 25.7933, lng: -80.2906 } },
  { code: "LAS", name: "Las Vegas", city: "Las Vegas", country: "Estados Unidos", continent: "América do Norte", coordinates: { lat: 36.0840, lng: -115.1537 } },
  { code: "CHI", name: "Chicago", city: "Chicago", country: "Estados Unidos", continent: "América do Norte", coordinates: { lat: 41.9786, lng: -87.9048 } },
  { code: "SFO", name: "São Francisco", city: "São Francisco", country: "Estados Unidos", continent: "América do Norte", coordinates: { lat: 37.6213, lng: -122.3790 } },
  { code: "BOS", name: "Boston", city: "Boston", country: "Estados Unidos", continent: "América do Norte", coordinates: { lat: 42.3656, lng: -71.0096 } },
  { code: "WAS", name: "Washington D.C.", city: "Washington", country: "Estados Unidos", continent: "América do Norte", coordinates: { lat: 38.8521, lng: -77.0373 } },

  // Europa
  { code: "CDG", name: "Paris - Charles de Gaulle", city: "Paris", country: "França", continent: "Europa", coordinates: { lat: 49.0097, lng: 2.5479 } },
  { code: "LHR", name: "Londres - Heathrow", city: "Londres", country: "Reino Unido", continent: "Europa", coordinates: { lat: 51.4700, lng: -0.4543 } },
  { code: "FCO", name: "Roma - Fiumicino", city: "Roma", country: "Itália", continent: "Europa", coordinates: { lat: 41.8003, lng: 12.2389 } },
  { code: "BCN", name: "Barcelona", city: "Barcelona", country: "Espanha", continent: "Europa", coordinates: { lat: 41.2974, lng: 2.0833 } },
  { code: "MAD", name: "Madrid", city: "Madrid", country: "Espanha", continent: "Europa", coordinates: { lat: 40.4983, lng: -3.5676 } },
  { code: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Alemanha", continent: "Europa", coordinates: { lat: 50.0379, lng: 8.5622 } },
  { code: "MUC", name: "Munique", city: "Munique", country: "Alemanha", continent: "Europa", coordinates: { lat: 48.3538, lng: 11.7861 } },
  { code: "AMS", name: "Amsterdam", city: "Amsterdam", country: "Holanda", continent: "Europa", coordinates: { lat: 52.3105, lng: 4.7683 } },
  { code: "ZUR", name: "Zurique", city: "Zurique", country: "Suíça", continent: "Europa", coordinates: { lat: 47.4582, lng: 8.5556 } },
  { code: "VIE", name: "Viena", city: "Viena", country: "Áustria", continent: "Europa", coordinates: { lat: 48.1103, lng: 16.5697 } },
  { code: "LIS", name: "Lisboa", city: "Lisboa", country: "Portugal", continent: "Europa", coordinates: { lat: 38.7742, lng: -9.1342 } },

  // Ásia
  { code: "NRT", name: "Tóquio - Narita", city: "Tóquio", country: "Japão", continent: "Ásia", coordinates: { lat: 35.7653, lng: 140.3862 } },
  { code: "ICN", name: "Seul", city: "Seul", country: "Coreia do Sul", continent: "Ásia", coordinates: { lat: 37.4602, lng: 126.4407 } },
  { code: "PEK", name: "Pequim", city: "Pequim", country: "China", continent: "Ásia", coordinates: { lat: 40.0799, lng: 116.6031 } },
  { code: "SHA", name: "Xangai", city: "Xangai", country: "China", continent: "Ásia", coordinates: { lat: 31.1443, lng: 121.8083 } },
  { code: "SIN", name: "Singapura", city: "Singapura", country: "Singapura", continent: "Ásia", coordinates: { lat: 1.3644, lng: 103.9915 } },
  { code: "BKK", name: "Bangkok", city: "Bangkok", country: "Tailândia", continent: "Ásia", coordinates: { lat: 13.6900, lng: 100.7501 } },
  { code: "HKG", name: "Hong Kong", city: "Hong Kong", country: "Hong Kong", continent: "Ásia", coordinates: { lat: 22.3080, lng: 113.9185 } },
  { code: "KUL", name: "Kuala Lumpur", city: "Kuala Lumpur", country: "Malásia", continent: "Ásia", coordinates: { lat: 3.1390, lng: 101.6869 } },
  { code: "MNL", name: "Manila", city: "Manila", country: "Filipinas", continent: "Ásia", coordinates: { lat: 14.5086, lng: 120.9853 } },
  { code: "DEL", name: "Nova Délhi", city: "Nova Délhi", country: "Índia", continent: "Ásia", coordinates: { lat: 28.5562, lng: 77.1000 } },

  // Oriente Médio
  { code: "DXB", name: "Dubai", city: "Dubai", country: "Emirados Árabes Unidos", continent: "Oriente Médio", coordinates: { lat: 25.2532, lng: 55.3657 } },
  { code: "DOH", name: "Doha", city: "Doha", country: "Catar", continent: "Oriente Médio", coordinates: { lat: 25.2733, lng: 51.6083 } },
  { code: "AUH", name: "Abu Dhabi", city: "Abu Dhabi", country: "Emirados Árabes Unidos", continent: "Oriente Médio", coordinates: { lat: 24.4539, lng: 54.6511 } },
  { code: "TLV", name: "Tel Aviv", city: "Tel Aviv", country: "Israel", continent: "Oriente Médio", coordinates: { lat: 32.0114, lng: 34.8860 } },

  // África
  { code: "CPT", name: "Cidade do Cabo", city: "Cidade do Cabo", country: "África do Sul", continent: "África", coordinates: { lat: -33.9715, lng: 18.6021 } },
  { code: "JNB", name: "Joanesburgo", city: "Joanesburgo", country: "África do Sul", continent: "África", coordinates: { lat: -26.1392, lng: 28.2460 } },
  { code: "CAI", name: "Cairo", city: "Cairo", country: "Egito", continent: "África", coordinates: { lat: 30.1219, lng: 31.4056 } },
  { code: "CMN", name: "Casablanca", city: "Casablanca", country: "Marrocos", continent: "África", coordinates: { lat: 33.3676, lng: -7.5897 } },

  // Oceania
  { code: "SYD", name: "Sydney", city: "Sydney", country: "Austrália", continent: "Oceania", coordinates: { lat: -33.9399, lng: 151.1753 } },
  { code: "MEL", name: "Melbourne", city: "Melbourne", country: "Austrália", continent: "Oceania", coordinates: { lat: -37.6690, lng: 144.8410 } },
  { code: "AKL", name: "Auckland", city: "Auckland", country: "Nova Zelândia", continent: "Oceania", coordinates: { lat: -36.9985, lng: 174.7910 } },

  // América do Sul (outros países)
  { code: "EZE", name: "Buenos Aires", city: "Buenos Aires", country: "Argentina", continent: "América do Sul", coordinates: { lat: -34.8222, lng: -58.5358 } },
  { code: "SCL", name: "Santiago", city: "Santiago", country: "Chile", continent: "América do Sul", coordinates: { lat: -33.3927, lng: -70.7854 } },
  { code: "LIM", name: "Lima", city: "Lima", country: "Peru", continent: "América do Sul", coordinates: { lat: -12.0219, lng: -77.1143 } },
  { code: "BOG", name: "Bogotá", city: "Bogotá", country: "Colômbia", continent: "América do Sul", coordinates: { lat: 4.7016, lng: -74.1469 } },

  // América Central e Caribe
  { code: "CUN", name: "Cancún", city: "Cancún", country: "México", continent: "América Central", coordinates: { lat: 21.0365, lng: -86.8771 } },
  { code: "MEX", name: "Cidade do México", city: "Cidade do México", country: "México", continent: "América Central", coordinates: { lat: 19.4363, lng: -99.0721 } },
  { code: "PTY", name: "Cidade do Panamá", city: "Cidade do Panamá", country: "Panamá", continent: "América Central", coordinates: { lat: 9.0713, lng: -79.3833 } },

  // Canadá
  { code: "YYZ", name: "Toronto", city: "Toronto", country: "Canadá", continent: "América do Norte", coordinates: { lat: 43.6777, lng: -79.6248 } },
  { code: "YVR", name: "Vancouver", city: "Vancouver", country: "Canadá", continent: "América do Norte", coordinates: { lat: 49.1939, lng: -123.1844 } }
]

// API Functions
export const searchDestinations = (query: string): Destination[] => {
  if (!query || query.length < 2) return []
  
  const searchTerm = query.toLowerCase()
  
  return destinations.filter(destination => 
    destination.city.toLowerCase().includes(searchTerm) ||
    destination.country.toLowerCase().includes(searchTerm) ||
    destination.name.toLowerCase().includes(searchTerm) ||
    destination.code.toLowerCase().includes(searchTerm)
  ).slice(0, 8) // Limita a 8 resultados
}

export const getDestinationByCode = (code: string): Destination | undefined => {
  return destinations.find(dest => dest.code === code)
}

export const getAllDestinations = (): Destination[] => {
  return destinations
}
