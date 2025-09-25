import { getFlights, getHotels, destinations } from '../../../data/travel-data.js';

export async function POST(req) {
  try {
    const { type, origin, destination, departureDate, returnDate, checkIn, checkOut, guests } = await req.json();

    switch (type) {
      case 'destinations':
        return Response.json({
          success: true,
          data: destinations
        });

      case 'flights':
        if (!origin || !destination || !departureDate) {
          return Response.json({
            success: false,
            error: 'Origem, destino e data de partida são obrigatórios'
          }, { status: 400 });
        }

        const flights = getFlights(origin, destination, departureDate, returnDate);
        return Response.json({
          success: true,
          data: flights,
          summary: {
            route: `${origin} → ${destination}`,
            departureDate,
            returnDate,
            flightCount: flights.length,
            priceRange: flights.length > 0 ? {
              min: Math.min(...flights.map(f => f.price)),
              max: Math.max(...flights.map(f => f.price))
            } : null
          }
        });

      case 'hotels':
        if (!destination || !checkIn || !checkOut) {
          return Response.json({
            success: false,
            error: 'Destino, check-in e check-out são obrigatórios'
          }, { status: 400 });
        }

        const hotels = getHotels(destination, checkIn, checkOut, guests || 1);
        return Response.json({
          success: true,
          data: hotels,
          summary: {
            destination,
            checkIn,
            checkOut,
            guests: guests || 1,
            hotelCount: hotels.length,
            priceRange: hotels.length > 0 ? {
              min: Math.min(...hotels.map(h => h.prices.total)),
              max: Math.max(...hotels.map(h => h.prices.total))
            } : null
          }
        });

      default:
        return Response.json({
          success: false,
          error: 'Tipo de busca não suportado'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro na busca de viagem:', error);
    return Response.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
