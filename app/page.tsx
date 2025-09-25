"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DestinationAutocomplete } from "@/components/destination-autocomplete"
import { getDestinationByCode } from "@/data/destinations"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
// Removido useChat por incompatibilidade da versão

export default function Home() {
  const [isDark, setIsDark] = useState(true)
  const [activeSection, setActiveSection] = useState("")
  const sectionsRef = useRef<(HTMLElement | null)[]>([])


  // Travel booking states
  const [searchData, setSearchData] = useState({
    origem: "",
    destino: "",
    dataIda: "",
    dataVolta: ""
  })
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined)
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined)
  const [selectedFlight, setSelectedFlight] = useState<any>(null)
  const [selectedHotel, setSelectedHotel] = useState<any>(null)
  const [showMap, setShowMap] = useState(false)
  const [showFlights, setShowFlights] = useState(false)
  const [showHotels, setShowHotels] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  
  // Mode states
  const [isAIMode, setIsAIMode] = useState(false) // false = Assistido, true = IA
  
  // Chatbot states
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatbotMessages, setChatbotMessages] = useState<Array<{
    id: string
    text: string
    timestamp: Date
    type: 'info' | 'success' | 'guidance'
    isTyping?: boolean
    cardData?: {
      type: 'destination' | 'route' | 'flight' | 'hotel'
      data: any
    }
  }>>([])
  const [isChatbotExpanded, setIsChatbotExpanded] = useState(true)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const [messagesSent, setMessagesSent] = useState<Set<string>>(new Set())
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)

  // Chat IA - Estados manuais
  const [aiMessages, setAiMessages] = useState<Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>>([{
    id: 'welcome',
    role: 'assistant',
    content: 'Olá! Sou a Lívia Assist, sua assistente pessoal de viagem da Sky Travels! ✈️\n\nVou te ajudar a encontrar e reservar a viagem perfeita. Para começar, me conte: para onde você gostaria de viajar? 🌍',
    timestamp: new Date()
  }])
  const [aiInput, setAiInput] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)

  // Função para detectar perguntas e mostrar botões
  const detectQuestionButtons = (messageText: string) => {
    const lowerText = messageText.toLowerCase();
    
    // Detectar pergunta sobre ida e volta (várias variações)
    if ((lowerText.includes('ida e volta') && lowerText.includes('apenas ida')) ||
        (lowerText.includes('ida e volta') && lowerText.includes('somente ida')) ||
        (lowerText.includes('round trip') && lowerText.includes('one way')) ||
        lowerText.includes('gostaria de fazer uma viagem de ida e volta ou apenas ida')) {
      return {
        type: 'trip_type',
        buttons: [
          { text: '✈️ Somente Ida', value: 'somente ida' },
          { text: '🔄 Ida e Volta', value: 'ida e volta' }
        ]
      };
    }

    // Detectar pergunta sobre data de ida
    if (lowerText.includes('data de ida') || 
        lowerText.includes('qual a data da sua viagem') ||
        (lowerText.includes('data') && lowerText.includes('viagem'))) {
      
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);
      const depoisAmanha = new Date(hoje);
      depoisAmanha.setDate(hoje.getDate() + 2);

      const formatarData = (data: Date) => {
        return data.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit',
          year: 'numeric'
        });
      };

      const formatarDataExibicao = (data: Date, label: string) => {
        const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' });
        return `${label} (${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)})`;
      };

      return {
        type: 'departure_date',
        buttons: [
          { 
            text: `📅 Hoje - ${formatarData(hoje)}`, 
            value: `hoje, ${formatarData(hoje)}`,
            displayText: formatarDataExibicao(hoje, 'Hoje')
          },
          { 
            text: `🌅 Amanhã - ${formatarData(amanha)}`, 
            value: `amanhã, ${formatarData(amanha)}`,
            displayText: formatarDataExibicao(amanha, 'Amanhã')
          },
          { 
            text: `🌄 Depois de amanhã - ${formatarData(depoisAmanha)}`, 
            value: `depois de amanhã, ${formatarData(depoisAmanha)}`,
            displayText: formatarDataExibicao(depoisAmanha, 'Depois de amanhã')
          }
        ]
      };
    }

    // Detectar pergunta sobre origem/cidade de saída
    if (lowerText.includes('de onde você estará saindo') || 
        lowerText.includes('de onde você vai partir') ||
        lowerText.includes('qual a cidade de origem') ||
        (lowerText.includes('onde') && lowerText.includes('saindo'))) {
      
      return {
        type: 'origin_city',
        buttons: [
          { text: '🏙️ Belo Horizonte', value: 'Belo Horizonte' },
          { text: '🌆 São Paulo', value: 'São Paulo' },
          { text: '🏖️ Rio de Janeiro', value: 'Rio de Janeiro' },
          { text: '🌴 Salvador', value: 'Salvador' },
          { text: '🏢 Brasília', value: 'Brasília' },
          { text: '🌊 Fortaleza', value: 'Fortaleza' }
        ]
      };
    }

    // Detectar pergunta sobre número de passageiros
    if (lowerText.includes('quantos passageiros') || lowerText.includes('quantas pessoas')) {
      return {
        type: 'passengers',
        buttons: [
          { text: '👤 1 Passageiro', value: '1 passageiro' },
          { text: '👥 2 Passageiros', value: '2 passageiros' },
          { text: '👨‍👩‍👧 3 Passageiros', value: '3 passageiros' },
          { text: '👨‍👩‍👧‍👦 4+ Passageiros', value: '4 ou mais passageiros' }
        ]
      };
    }

    return null;
  };

  // Função para processar dados estruturados da IA
  const processStructuredData = (messageText: string) => {
    try {
      console.log('🔍 Verificando dados estruturados na mensagem...')
      
      // Verificar se a mensagem está completa (tem marcadores de fim)
      const hasCompleteFlights = messageText.includes('**FIM_VOOS_SUGESTOES**');
      const hasCompleteHotels = messageText.includes('**FIM_HOTEIS_SUGESTOES**');
      
      // Detectar seção de voos (com ou sem marcadores ```json)
      let flightsMatch = messageText.match(/\*\*VOOS_SUGESTOES\*\*\s*```json\s*([\s\S]*?)\s*```\s*\*\*FIM_VOOS_SUGESTOES\*\*/);
      
      // Se não encontrar com ```json, tentar sem
      if (!flightsMatch) {
        flightsMatch = messageText.match(/\*\*VOOS_SUGESTOES\*\*\s*([\s\S]*?)\s*\*\*FIM_VOOS_SUGESTOES\*\*/);
      }
      
      if (flightsMatch && hasCompleteFlights) {
        console.log('✈️ Dados de voos encontrados e completos!')
        console.log('🔍 JSON bruto encontrado:', flightsMatch[1])
        try {
          // Limpar o JSON antes de fazer parse
          let jsonStr = flightsMatch[1].trim()
          
          // Remover quebras de linha e espaços extras
          jsonStr = jsonStr.replace(/\n/g, ' ').replace(/\s+/g, ' ')
          
          // Tentar corrigir JSON malformado (aspas simples para duplas, etc)
          jsonStr = jsonStr.replace(/'/g, '"')
          
          console.log('🔧 JSON limpo:', jsonStr)
          
          const flightsData = JSON.parse(jsonStr)
          console.log('📊 Voos parseados:', flightsData)
          
          // Adicionar card de voos ao chat
          setTimeout(() => {
            const cardMessage = {
              id: `flights-structured-${Date.now()}`,
              role: 'assistant' as const,
              content: `Aqui estão os ${flightsData.flights.length} voos disponíveis:`,
              timestamp: new Date(),
              cardData: {
                type: 'flights',
                flights: flightsData.flights,
                summary: {
                  flightCount: flightsData.flights.length,
                  priceRange: {
                    min: Math.min(...flightsData.flights.map((f: any) => f.price)),
                    max: Math.max(...flightsData.flights.map((f: any) => f.price))
                  }
                }
              }
            }
            
            setAiMessages(prev => [...prev, cardMessage])
            console.log('💬 Card de voos adicionado ao chat!')
            
            // Atualizar frontend
            setShowMap(true)
            setShowFlights(true)
            updateActiveSection('flights')
          }, 200)
          
        } catch (parseError) {
          console.error('💥 Erro ao fazer parse dos voos:', parseError)
          console.log('🚨 Tentando parse alternativo...')
          
          // Fallback: criar voos mock baseados na conversa
          const mockFlights = [
            {
              airline: "LATAM Airlines",
              flightNumber: "LA1234",
              origin: "CNF",
              destination: "SAO",
              departureTime: "08:00",
              arrivalTime: "09:15",
              duration: "1h 15min",
              price: 250,
              aircraft: "Boeing 737"
            },
            {
              airline: "Azul",
              flightNumber: "AD5678",
              origin: "CNF",
              destination: "SAO", 
              departureTime: "10:30",
              arrivalTime: "11:45",
              duration: "1h 15min",
              price: 280,
              aircraft: "Airbus A320"
            },
            {
              airline: "LATAM Airlines",
              flightNumber: "LA9876",
              origin: "CNF",
              destination: "SAO",
              departureTime: "14:00",
              arrivalTime: "15:15",
              duration: "1h 15min",
              price: 275,
              aircraft: "Boeing 737"
            },
            {
              airline: "Azul",
              flightNumber: "AD3456",
              origin: "CNF",
              destination: "SAO",
              departureTime: "16:30",
              arrivalTime: "17:45",
              duration: "1h 15min",
              price: 290,
              aircraft: "Embraer E195"
            },
            {
              airline: "LATAM Airlines",
              flightNumber: "LA7777",
              origin: "CNF",
              destination: "SAO",
              departureTime: "19:00",
              arrivalTime: "20:15",
              duration: "1h 15min",
              price: 260,
              aircraft: "Boeing 737"
            }
          ]
          
          console.log('🛫 Usando voos mock como fallback')
          
          // Adicionar card com dados mock
          setTimeout(() => {
            const cardMessage = {
              id: `flights-fallback-${Date.now()}`,
              role: 'assistant' as const,
              content: `Aqui estão os 5 voos disponíveis:`,
              timestamp: new Date(),
              cardData: {
                type: 'flights',
                flights: mockFlights,
                summary: {
                  flightCount: mockFlights.length,
                  priceRange: {
                    min: Math.min(...mockFlights.map(f => f.price)),
                    max: Math.max(...mockFlights.map(f => f.price))
                  }
                }
              }
            }
            
            setAiMessages(prev => [...prev, cardMessage])
            console.log('💬 Card de voos mock adicionado ao chat!')
            
            // Atualizar frontend
            setShowMap(true)
            setShowFlights(true)
            updateActiveSection('flights')
          }, 200)
        }
      }
      
      // Detectar seção de hotéis
      let hotelsMatch = messageText.match(/\*\*HOTEIS_SUGESTOES\*\*\s*```json\s*([\s\S]*?)\s*```\s*\*\*FIM_HOTEIS_SUGESTOES\*\*/);
      
      // Se não encontrar com ```json, tentar sem
      if (!hotelsMatch) {
        hotelsMatch = messageText.match(/\*\*HOTEIS_SUGESTOES\*\*\s*([\s\S]*?)\s*\*\*FIM_HOTEIS_SUGESTOES\*\*/);
      }
      
      if (hotelsMatch && hasCompleteHotels) {
        console.log('🏨 Dados de hotéis encontrados e completos!')
        console.log('🔍 JSON de hotéis bruto:', hotelsMatch[1])
        try {
          // Limpar o JSON antes de fazer parse
          let jsonStr = hotelsMatch[1].trim()
          
          // Remover quebras de linha e espaços extras
          jsonStr = jsonStr.replace(/\n/g, ' ').replace(/\s+/g, ' ')
          
          // Tentar corrigir JSON malformado
          jsonStr = jsonStr.replace(/'/g, '"')
          
          console.log('🔧 JSON de hotéis limpo:', jsonStr)
          
          const hotelsData = JSON.parse(jsonStr)
          console.log('📊 Hotéis parseados:', hotelsData)
          
          // Adicionar card de hotéis ao chat
          setTimeout(() => {
            const cardMessage = {
              id: `hotels-structured-${Date.now()}`,
              role: 'assistant' as const,
              content: `Aqui estão os ${hotelsData.hotels.length} hotéis disponíveis:`,
              timestamp: new Date(),
              cardData: {
                type: 'hotels',
                hotels: hotelsData.hotels,
                summary: {
                  hotelCount: hotelsData.hotels.length,
                  priceRange: {
                    min: Math.min(...hotelsData.hotels.map((h: any) => h.prices?.total || 200)),
                    max: Math.max(...hotelsData.hotels.map((h: any) => h.prices?.total || 800))
                  }
                }
              }
            }
            
            setAiMessages(prev => [...prev, cardMessage])
            console.log('💬 Card de hotéis adicionado ao chat!')
            
            // Atualizar frontend
            setShowHotels(true)
            updateActiveSection('hotels')
          }, 200)
          
        } catch (parseError) {
          console.error('💥 Erro ao fazer parse dos hotéis:', parseError)
          console.log('🚨 Tentando hotéis mock como fallback...')
          
          // Fallback: criar hotéis mock
          const mockHotels = [
            {
              name: "Hotel Premium São Paulo",
              stars: 5,
              rating: 4.8,
              location: { district: "Jardins", city: "São Paulo" },
              prices: { total: 600, currency: "BRL", nights: 2 },
              amenities: ["Wi-Fi Grátis", "Piscina", "Spa", "Academia"],
              category: "Luxo",
              cancellation: "Cancelamento grátis",
              breakfast: "Incluído"
            },
            {
              name: "Grand Hotel Central São Paulo",
              stars: 4,
              rating: 4.3,
              location: { district: "Centro", city: "São Paulo" },
              prices: { total: 400, currency: "BRL", nights: 2 },
              amenities: ["Wi-Fi Grátis", "Academia", "Restaurante"],
              category: "Executivo",
              cancellation: "Cancelamento grátis",
              breakfast: "Incluído"
            },
            {
              name: "City Comfort São Paulo",
              stars: 3,
              rating: 4.0,
              location: { district: "Vila Olímpia", city: "São Paulo" },
              prices: { total: 300, currency: "BRL", nights: 2 },
              amenities: ["Wi-Fi Grátis", "Café da Manhã"],
              category: "Conforto",
              cancellation: "Cancelamento grátis",
              breakfast: "Incluído"
            }
          ]
          
          setTimeout(() => {
            const cardMessage = {
              id: `hotels-fallback-${Date.now()}`,
              role: 'assistant' as const,
              content: `Aqui estão os hotéis disponíveis:`,
              timestamp: new Date(),
              cardData: {
                type: 'hotels',
                hotels: mockHotels,
                summary: {
                  hotelCount: mockHotels.length,
                  priceRange: {
                    min: Math.min(...mockHotels.map(h => h.prices.total)),
                    max: Math.max(...mockHotels.map(h => h.prices.total))
                  }
                }
              }
            }
            
            setAiMessages(prev => [...prev, cardMessage])
            console.log('💬 Card de hotéis mock adicionado ao chat!')
            
            // Atualizar frontend
            setShowHotels(true)
            updateActiveSection('hotels')
          }, 200)
        }
      }
      
    } catch (error) {
      console.error('💥 Erro ao processar dados estruturados:', error)
    }
  }

  // Função para limpar dados estruturados do texto da mensagem
  const cleanMessageText = (text: string) => {
    // Remove todas as ACTIONS do texto
    let cleanText = text.replace(/\[ACTION:[\w]+\]\s*{[\s\S]*?}\s*\[\/ACTION\]/g, '')
    
    // Remove seções de dados estruturados (com ou sem ```json)
    cleanText = cleanText.replace(/\*\*VOOS_SUGESTOES\*\*\s*```json[\s\S]*?```\s*\*\*FIM_VOOS_SUGESTOES\*\*/g, '')
    cleanText = cleanText.replace(/\*\*VOOS_SUGESTOES\*\*[\s\S]*?\*\*FIM_VOOS_SUGESTOES\*\*/g, '')
    cleanText = cleanText.replace(/\*\*HOTEIS_SUGESTOES\*\*\s*```json[\s\S]*?```\s*\*\*FIM_HOTEIS_SUGESTOES\*\*/g, '')
    cleanText = cleanText.replace(/\*\*HOTEIS_SUGESTOES\*\*[\s\S]*?\*\*FIM_HOTEIS_SUGESTOES\*\*/g, '')
    
    return cleanText.trim()
  }

  // Função para atualizar formulários a partir da IA
  const updateFormFromAI = (data: any) => {
    const { field, value, formatted } = data
    
    setSearchData(prev => ({
      ...prev,
      [field === 'destination' ? 'destino' : field === 'origin' ? 'origem' : field]: formatted || value
    }))

    // Atualizar datas se necessário
    if (field === 'departureDate') {
      const date = new Date(value)
      setDepartureDate(date)
      setSearchData(prev => ({ ...prev, dataIda: format(date, 'dd/MM/yyyy') }))
    }
    if (field === 'returnDate') {
      const date = new Date(value)
      setReturnDate(date)
      setSearchData(prev => ({ ...prev, dataVolta: format(date, 'dd/MM/yyyy') }))
    }
  }

  // Função para buscar voos via IA
  const searchFlightsFromAI = async (data: any) => {
    try {
      console.log('🔍 Buscando voos com dados:', data)
      
      const response = await fetch('/api/travel-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'flights', ...data })
      })

      console.log('📡 Response status:', response.status)
      
      const result = await response.json()
      console.log('📊 Resultado da busca:', result)
      
      if (result.success) {
        console.log(`✅ ${result.data.length} voos encontrados!`)
        
        // Atualizar estados para mostrar voos
        setShowMap(true)
        setShowFlights(true)
        updateActiveSection('flights')
        
        // Scroll para seção de voos
        setTimeout(() => {
          const flightsElement = document.getElementById('flights')
          if (flightsElement) {
            flightsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 500)

        // Adicionar card com resumo dos voos no chat IA
        console.log('💬 Adicionando card de voos ao chat IA...')
        const cardMessage = {
          id: `flights-card-${Date.now()}`,
          role: 'assistant' as const,
          content: `Encontrei ${result.data.length} voos disponíveis! 🛫`,
          timestamp: new Date(),
          cardData: {
            type: 'flights',
            flights: result.data.slice(0, 3), // Mostrar apenas 3 melhores
            summary: result.summary
          }
        }
        
        setAiMessages(prev => [...prev, cardMessage])
      } else {
        console.error('❌ Busca falhou:', result.error)
      }
    } catch (error) {
      console.error('💥 Erro ao buscar voos:', error)
    }
  }

  // Função para buscar hotéis via IA
  const searchHotelsFromAI = async (data: any) => {
    try {
      const response = await fetch('/api/travel-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'hotels', ...data })
      })

      const result = await response.json()
      if (result.success) {
        // Atualizar estados para mostrar hotéis
        setShowHotels(true)
        updateActiveSection('hotels')
        
        // Scroll para seção de hotéis
        setTimeout(() => {
          const hotelsElement = document.getElementById('hotels')
          if (hotelsElement) {
            hotelsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 500)

        // Adicionar card com resumo dos hotéis no chat IA
        console.log('💬 Adicionando card de hotéis ao chat IA...')
        const cardMessage = {
          id: `hotels-card-${Date.now()}`,
          role: 'assistant' as const,
          content: `Encontrei ${result.data.length} hotéis perfeitos para você! 🏨`,
          timestamp: new Date(),
          cardData: {
            type: 'hotels',
            hotels: result.data.slice(0, 3), // Mostrar apenas 3 melhores
            summary: result.summary
          }
        }
        
        setAiMessages(prev => [...prev, cardMessage])
      }
    } catch (error) {
      console.error('Erro ao buscar hotéis:', error)
    }
  }

  // Função para mostrar resumo via IA
  const showSummaryFromAI = (data: any) => {
    const { type, data: summaryData } = data
    
    if (type === 'final') {
      setShowCheckout(true)
      updateActiveSection('checkout')
      
      setTimeout(() => {
        const checkoutElement = document.getElementById('checkout')
        if (checkoutElement) {
          checkoutElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 500)
    }
  }

  // Função para lidar com seleção de voo
  const handleFlightSelection = async (flight: any) => {
    console.log('✈️ Voo selecionado:', flight);
    
    // Salvar voo selecionado
    setSelectedFlight(flight);
    
    // Criar mensagem do usuário
    const userMessage = `Escolho o voo ${flight.flightNumber} da ${flight.airline}, saindo às ${flight.departureTime} por R$ ${flight.price}.`;
    
    // Enviar mensagem automaticamente para a IA
    await sendAIMessage(userMessage);
  };

  // Função para lidar com seleção de hotel
  const handleHotelSelection = async (hotel: any) => {
    console.log('🏨 Hotel selecionado:', hotel);
    
    // Salvar hotel selecionado
    setSelectedHotel(hotel);
    
    // Criar mensagem do usuário
    const userMessage = `Escolho o ${hotel.name} por ${hotel.prices?.currency === 'USD' ? '$' : 'R$'} ${hotel.prices?.total?.toLocaleString()} para ${hotel.nights} noites.`;
    
    // Enviar mensagem automaticamente para a IA
    await sendAIMessage(userMessage);
  };

  // Função para enviar mensagem para IA
  const sendAIMessage = async (message: string) => {
    if (!message.trim()) return

    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message,
      timestamp: new Date()
    }
    
    setAiMessages(prev => [...prev, userMessage])
    setAiInput('')
    setIsAILoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...aiMessages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Erro na resposta da API')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Sem leitor de stream')
      }

      let assistantMessage = ''
      const assistantId = (Date.now() + 1).toString()
      
      // Adicionar mensagem vazia da assistente para mostrar loading
      setAiMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }])

      // Ler stream
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('0:')) {
            const text = line.slice(2).replace(/"/g, '')
            assistantMessage += text
            
            // Limpar ACTIONS do texto para exibição
            const cleanedMessage = cleanMessageText(assistantMessage)
            
            // Atualizar mensagem da assistente em tempo real
            setAiMessages(prev => prev.map(msg => 
              msg.id === assistantId 
                ? { ...msg, content: cleanedMessage }
                : msg
            ))
          }
        }
      }

      // Processar dados estruturados e detectar botões após receber a resposta COMPLETA
      if (assistantMessage) {
        // Aguardar um pouco para garantir que a mensagem foi totalmente processada
        setTimeout(() => {
          processStructuredData(assistantMessage)
          
          // Detectar se precisa adicionar botões
          const questionButtons = detectQuestionButtons(assistantMessage)
          if (questionButtons) {
            console.log('🔘 Detectados botões para pergunta:', questionButtons)
            
            // Atualizar a última mensagem da IA para incluir botões
            setAiMessages(prev => prev.map((msg, index) => {
              if (index === prev.length - 1 && msg.role === 'assistant') {
                return { ...msg, questionButtons }
              }
              return msg
            }))
          }
        }, 500)
      }

      // Auto-scroll
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setAiMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date()
      }])
    } finally {
      setIsAILoading(false)
    }
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Priorizar seções mais avançadas no fluxo
        const sectionPriority = {
          'checkout': 6,
          'hotels': 5,
          'flights': 4,
          'map-section': 3,
          'search': 2,
          'intro': 1
        }

        let bestSection = null
        let maxPriority = 0
        let maxRatio = 0

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
            const priority = sectionPriority[entry.target.id as keyof typeof sectionPriority] || 0
            
            // Priorizar por prioridade da seção, depois por ratio de intersecção
            if (priority > maxPriority || (priority === maxPriority && entry.intersectionRatio > maxRatio)) {
              maxPriority = priority
              maxRatio = entry.intersectionRatio
              bestSection = entry.target.id
            }
          }
        })

        if (bestSection) {
          setActiveSection(bestSection)
        }
      },
      { threshold: [0.1, 0.3, 0.5, 0.7], rootMargin: "0px 0px -10% 0px" },
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [showMap, showFlights, showHotels, showCheckout])

  // Auto-scroll das mensagens do chatbot
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatbotMessages])

  // Mensagem do checkout - disparada apenas uma vez quando showCheckout muda para true
  useEffect(() => {
    if (showCheckout && showChatbot) {
      setTimeout(() => {
        addChatbotMessage('Estamos quase lá! Agora preciso que você preencha seus dados pessoais para finalizar a reserva. Preencha todos os campos obrigatórios! 📋', 'info', 'checkout-message')
      }, 500)
    }
  }, [showCheckout, showChatbot])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  // Função para atualizar seção ativa programaticamente
  const updateActiveSection = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  // Effect para garantir que a seção ativa seja atualizada quando elementos aparecem
  useEffect(() => {
    if (showCheckout) {
      setActiveSection('checkout')
    } else if (showHotels && !showCheckout) {
      setActiveSection('hotels')
    } else if (showFlights && !showHotels) {
      setActiveSection('flights')
    } else if (showMap && !showFlights) {
      setActiveSection('map-section')
    }
  }, [showMap, showFlights, showHotels, showCheckout])

  const addChatbotMessage = (text: string, type: 'info' | 'success' | 'guidance' = 'info', messageKey?: string, cardData?: any) => {
    // Se foi fornecida uma chave e já foi enviada, não enviar novamente
    if (messageKey && messagesSent.has(messageKey)) {
      return
    }
    
    const messageId = Date.now().toString()
    const newMessage = {
      id: messageId,
      text: '',
      timestamp: new Date(),
      type,
      isTyping: true,
      cardData
    }
    
    setChatbotMessages(prev => [...prev, newMessage])
    setTypingMessageId(messageId)
    
    // Simular digitação
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setChatbotMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, text: text.slice(0, currentIndex) }
              : msg
          )
        )
        currentIndex++
      } else {
        clearInterval(typingInterval)
        setChatbotMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, isTyping: false }
              : msg
          )
        )
        setTypingMessageId(null)
      }
    }, 15) // Velocidade da digitação
    
    // Marcar mensagem como enviada se foi fornecida uma chave
    if (messageKey) {
      setMessagesSent(prev => new Set([...prev, messageKey]))
    }
  }

  const resetReservation = () => {
    // Reset todos os estados
    setSearchData({
      origem: "",
      destino: "",
      dataIda: "",
      dataVolta: ""
    })
    setDepartureDate(undefined)
    setReturnDate(undefined)
    setSelectedFlight(null)
    setSelectedHotel(null)
    setShowMap(false)
    setShowFlights(false)
    setShowHotels(false)
    setShowCheckout(false)
    
    // Reset do chatbot
    setChatbotMessages([])
    setMessagesSent(new Set())
    setTypingMessageId(null)
    
    // Mensagem de cancelamento
    setTimeout(() => {
      addChatbotMessage('Reserva cancelada! Não se preocupe, você pode começar uma nova busca a qualquer momento. Estou aqui para ajudar! 😊', 'info')
    }, 300)
    
    // Scroll para o topo
    setTimeout(() => {
      document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })
    }, 500)
  }

  // Componente para renderizar cards de resumo
  const renderSummaryCard = (cardData: any) => {
    if (!cardData) return null

    switch (cardData.type) {
      case 'destination':
        return (
          <div className="bg-muted/30 border border-border rounded-lg p-4 mt-3 max-w-[280px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-medium text-muted-foreground">DESTINO CONFIRMADO</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Origem:</span>
                <span className="font-medium">{cardData.data.origem}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Destino:</span>
                <span className="font-medium">{cardData.data.destino}</span>
              </div>
              {cardData.data.dataIda && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data de ida:</span>
                  <span className="font-medium">
                    {new Date(cardData.data.dataIda).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {cardData.data.dataVolta && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data de volta:</span>
                  <span className="font-medium">
                    {new Date(cardData.data.dataVolta).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )

      case 'flights':
        return (
          <div className="mt-4 w-full max-w-[450px] animate-bounce-in">
            {/* Header do Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl p-4 text-white animate-pulse-glow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Voos Disponíveis</h3>
                  <p className="text-white/80 text-sm">{cardData.flights.length} opções encontradas</p>
                </div>
              </div>
            </div>

            {/* Lista de Voos */}
            <div className="bg-white dark:bg-gray-900 rounded-b-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                {cardData.flights.map((flight: any, index: number) => (
                  <div 
                    key={`flight-${index}`} 
                    className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer group animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Header do Voo */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {flight.airline?.slice(0, 2) || 'LA'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {flight.airline || flight.airlineName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Voo {flight.flightNumber}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                          R$ {flight.price?.toLocaleString() || '250'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {flight.duration}
                        </div>
                      </div>
                    </div>

                    {/* Rota */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {flight.departureTime}
                          </div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {flight.origin}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Partida
                          </div>
                        </div>
                        
                        <div className="flex-1 mx-4 relative">
                          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                              </svg>
                            </div>
                          </div>
                          <div className="text-center mt-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {flight.duration}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {flight.arrivalTime}
                          </div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {flight.destination}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Chegada
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detalhes Extras */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        {flight.aircraft && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            {flight.aircraft}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          Bagagem incluída
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlightSelection(flight);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Selecionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer com Resumo */}
              {cardData.summary && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">
                        Preços de R$ {cardData.summary.priceRange?.min} a R$ {cardData.summary.priceRange?.max}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {cardData.flights.length} voos disponíveis
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'hotels':
        return (
          <div className="mt-4 w-full max-w-[450px] animate-bounce-in">
            {/* Header do Card */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-t-xl p-4 text-white animate-pulse-glow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Hotéis Disponíveis</h3>
                  <p className="text-white/80 text-sm">{cardData.hotels.length} acomodações encontradas</p>
                </div>
              </div>
            </div>

            {/* Lista de Hotéis */}
            <div className="bg-white dark:bg-gray-900 rounded-b-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                {cardData.hotels.map((hotel: any, index: number) => (
                  <div 
                    key={`hotel-${index}`} 
                    className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer group animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Header do Hotel */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                            {hotel.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`w-3 h-3 ${i < hotel.stars ? 'text-yellow-400' : 'text-gray-300'}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                ({hotel.rating?.toFixed(1) || '4.0'})
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            📍 {hotel.location?.district || 'Centro'}, {hotel.location?.city || 'Cidade'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                          {hotel.prices?.currency === 'USD' ? '$' : 'R$'} {hotel.prices?.total?.toLocaleString() || '800'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {hotel.nights || 3} noites
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          {hotel.category || 'Luxo'}
                        </div>
                      </div>
                    </div>

                    {/* Amenidades */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Comodidades incluídas:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(hotel.amenities || ['Wi-Fi Grátis', 'Café da Manhã', 'Academia']).slice(0, 4).map((amenity: string, i: number) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                          >
                            {amenity}
                          </span>
                        ))}
                        {(hotel.amenities || []).length > 4 && (
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                            +{(hotel.amenities || []).length - 4} mais
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detalhes e Ações */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {hotel.cancellation || 'Cancelamento grátis'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                          {hotel.breakfast || 'Café opcional'}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHotelSelection(hotel);
                        }}
                        className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-medium hover:bg-purple-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer com Resumo */}
              {cardData.summary && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">
                        Preços de {cardData.summary.priceRange?.min ? `R$ ${cardData.summary.priceRange.min}` : 'R$ 200'} a {cardData.summary.priceRange?.max ? `R$ ${cardData.summary.priceRange.max}` : 'R$ 800'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {cardData.hotels.length} hotéis disponíveis
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'route':
        return (
          <div className="bg-muted/30 border border-border rounded-lg p-4 mt-3 max-w-[280px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-muted-foreground">ROTA CONFIRMADA</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rota:</span>
                <span className="font-medium">{cardData.data.origem} → {cardData.data.destino}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distância:</span>
                <span className="font-medium">{cardData.data.distancia}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tempo:</span>
                <span className="font-medium">{cardData.data.tempo}</span>
              </div>
            </div>
          </div>
        )

      case 'flight':
        return (
          <div className="bg-muted/30 border border-border rounded-lg p-4 mt-3 max-w-[280px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs font-medium text-muted-foreground">VOO SELECIONADO</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Companhia:</span>
                <span className="font-medium">{cardData.data.airline}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Voo:</span>
                <span className="font-medium">{cardData.data.flight}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Horário:</span>
                <span className="font-medium">{cardData.data.departure} - {cardData.data.arrival}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço:</span>
                <span className="font-medium text-green-600">{cardData.data.price}</span>
              </div>
            </div>
          </div>
        )

      case 'hotel':
        return (
          <div className="bg-muted/30 border border-border rounded-lg p-4 mt-3 max-w-[280px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-xs font-medium text-muted-foreground">HOTEL SELECIONADO</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hotel:</span>
                <span className="font-medium">{cardData.data.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Categoria:</span>
                <span className="font-medium">{cardData.data.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Localização:</span>
                <span className="font-medium">{cardData.data.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço:</span>
                <span className="font-medium text-green-600">{cardData.data.price}/noite</span>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Mode Toggle - Top Header */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-full p-1 shadow-lg">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAIMode(false)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                !isAIMode 
                  ? 'bg-foreground text-background shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              Modo Assistido
            </button>
            <button
              onClick={() => {
                setIsAIMode(true)
                setShowChatbot(true)
                setIsChatbotExpanded(true)
              }}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isAIMode 
                  ? 'bg-foreground text-background shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              Modo IA
            </button>
          </div>
        </div>
      </div>

      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-6">
          {/* Seção Inicial */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: "smooth" })}
              className={`w-3 h-8 rounded-full transition-all duration-500 ${
                activeSection === 'intro' ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label="Navigate to intro"
            />
            <span className={`text-sm font-medium transition-opacity duration-500 ${
              activeSection === 'intro' ? 'text-foreground' : 'text-muted-foreground/70'
            }`}>
              Início
            </span>
          </div>

          {/* Busca */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: "smooth" })}
              className={`w-3 h-8 rounded-full transition-all duration-500 ${
                activeSection === 'search' ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label="Navigate to search"
            />
            <span className={`text-sm font-medium transition-opacity duration-500 ${
              activeSection === 'search' ? 'text-foreground' : 'text-muted-foreground/70'
            }`}>
              Destino
            </span>
          </div>

          {/* Mapa - só aparece quando showMap é true */}
          {showMap && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: "smooth" })}
                className={`w-3 h-8 rounded-full transition-all duration-500 ${
                  activeSection === 'map-section' ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                aria-label="Navigate to map"
              />
              <span className={`text-sm font-medium transition-opacity duration-500 ${
                activeSection === 'map-section' ? 'text-foreground' : 'text-muted-foreground/70'
              }`}>
                Rota
              </span>
            </div>
          )}

          {/* Voos - só aparece quando showFlights é true */}
          {showFlights && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => document.getElementById('flights')?.scrollIntoView({ behavior: "smooth" })}
                className={`w-3 h-8 rounded-full transition-all duration-500 ${
                  activeSection === 'flights' ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                aria-label="Navigate to flights"
              />
              <span className={`text-sm font-medium transition-opacity duration-500 ${
                activeSection === 'flights' ? 'text-foreground' : 'text-muted-foreground/70'
              }`}>
                Voos Disponíveis
              </span>
            </div>
          )}

          {/* Hotéis - só aparece quando showHotels é true */}
          {showHotels && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => document.getElementById('hotels')?.scrollIntoView({ behavior: "smooth" })}
                className={`w-3 h-8 rounded-full transition-all duration-500 ${
                  activeSection === 'hotels' ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                aria-label="Navigate to hotels"
              />
              <span className={`text-sm font-medium transition-opacity duration-500 ${
                activeSection === 'hotels' ? 'text-foreground' : 'text-muted-foreground/70'
              }`}>
                Hotéis Disponíveis
              </span>
            </div>
          )}

          {/* Checkout - só aparece quando showCheckout é true */}
          {showCheckout && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => document.getElementById('checkout')?.scrollIntoView({ behavior: "smooth" })}
                className={`w-3 h-8 rounded-full transition-all duration-500 ${
                  activeSection === 'checkout' ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                aria-label="Navigate to checkout"
              />
              <span className={`text-sm font-medium transition-opacity duration-500 ${
                activeSection === 'checkout' ? 'text-foreground' : 'text-muted-foreground/70'
              }`}>
                Checkout
              </span>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
        <header
          id="intro"
          ref={(el) => { sectionsRef.current[0] = el }}
          className="min-h-screen flex items-center opacity-0"
        >
          <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
            <div className="lg:col-span-3 space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-2">
                <div className="text-sm text-muted-foreground font-mono tracking-wider">AGÊNCIA DE VIAGENS / 2025</div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                  Sky
                  <br />
                  <span className="text-muted-foreground">Travels</span>
                </h1>
              </div>

              <div className="space-y-6 max-w-md">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Sua próxima aventura começa aqui. Oferecemos as melhores experiências de
                  <span className="text-foreground"> viagem</span>,<span className="text-foreground"> voos</span>,
                  e
                  <span className="text-foreground"> hospedagem</span>.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Reservas abertas 24/7
                  </div>
                  <div>Brasil & Internacional</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-end space-y-6 sm:space-y-8 mt-8 lg:mt-0">
            <button
              onClick={() => {
                setShowChatbot(true)
                addChatbotMessage('Olá! Sou a Lívia Assist, sua assistente pessoal de viagem. Vou te ajudar durante todo o processo de reserva! 🌟\n\nPara começar, você precisa preencher os campos de origem, destino e data de ida. Vamos começar?', 'info', 'welcome-start-message')
                setTimeout(() => {
                document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })
                  updateActiveSection('search')
                }, 100)
              }}
              className="px-8 py-4 bg-foreground text-background rounded-lg hover:bg-muted-foreground transition-all duration-300 font-medium text-lg group"
            >
              Vamos Começar
              <svg
                className="w-5 h-5 ml-2 inline-block transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>
            </div>
          </div>
        </header>

        <section
          id="search"
          ref={(el) => { sectionsRef.current[1] = el }}
          className="min-h-screen py-20 sm:py-32 animate-fade-in-up"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-light">Para onde você vai?</h2>
              <div className="text-sm text-muted-foreground font-mono">BUSCAR VOOS</div>
            </div>

            <div className="max-w-4xl">
              <div className="p-8 border border-border rounded-2xl bg-background/50 backdrop-blur-sm">
                <div className="space-y-6">
                  {/* Linha 1: Origem */}
                  <DestinationAutocomplete
                    label="Origem"
                    placeholder="De onde você parte?"
                    value={searchData.origem}
                    onValueChange={(value) => {
                      setSearchData({ ...searchData, origem: value })
                      if (value && showChatbot) {
                        addChatbotMessage(`Perfeito! Você selecionou "${value}" como origem. Agora selecione seu destino! ✈️`, 'success', `origem-selected-${value}`)
                      }
                    }}
                  />

                  {/* Linha 2: Destino */}
                  <DestinationAutocomplete
                    label="Destino"
                    placeholder="Para onde você vai?"
                    value={searchData.destino}
                    onValueChange={(value) => {
                      setSearchData({ ...searchData, destino: value })
                      if (value && showChatbot) {
                        addChatbotMessage(`Ótima escolha! "${value}" é um destino incrível! 🌍 Agora selecione a data de ida.`, 'success', `destino-selected-${value}`)
                      }
                    }}
                  />

                  {/* Linha 3: Datas lado a lado */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground font-mono">DATA DE IDA</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-full p-4 bg-background border border-border rounded-lg text-foreground hover:border-muted-foreground/50 transition-colors flex items-center justify-between"
                          >
                            <span className={departureDate ? "text-foreground" : "text-muted-foreground"}>
                              {departureDate 
                                ? format(departureDate, "PPP", { locale: ptBR })
                                : "Selecione a data de ida"
                              }
                            </span>
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background" align="start">
                          <Calendar
                            mode="single"
                            selected={departureDate}
                            onSelect={(date) => {
                              setDepartureDate(date)
                              if (date) {
                                const dateString = format(date, "yyyy-MM-dd")
                                setSearchData({ ...searchData, dataIda: dateString })
                                if (showChatbot) {
                                  // Se já temos origem e destino, mostrar card de resumo
                                  if (searchData.origem && searchData.destino) {
                                    const destinationCard = {
                                      type: 'destination',
                                      data: {
                                        origem: searchData.origem,
                                        destino: searchData.destino,
                                        dataIda: dateString,
                                        dataVolta: searchData.dataVolta
                                      }
                                    }
                                    addChatbotMessage(`Data de ida confirmada! 📅 Se quiser, pode adicionar uma data de volta também.`, 'success', `data-ida-${dateString}`, destinationCard)
                                  } else {
                                    addChatbotMessage(`Data de ida confirmada! 📅 Se quiser, pode adicionar uma data de volta também.`, 'success', `data-ida-${dateString}`)
                                  }
                                }
                                // Se a data de volta for anterior à nova data de ida, limpa ela
                                if (returnDate && returnDate < date) {
                                  setReturnDate(undefined)
                                  setSearchData(prev => ({ ...prev, dataVolta: "" }))
                                }
                              }
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground font-mono">DATA DE VOLTA</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-full p-4 bg-background border border-border rounded-lg text-foreground hover:border-muted-foreground/50 transition-colors flex items-center justify-between"
                            disabled={!departureDate}
                          >
                            <span className={returnDate ? "text-foreground" : "text-muted-foreground"}>
                              {returnDate 
                                ? format(returnDate, "PPP", { locale: ptBR })
                                : departureDate 
                                  ? "Selecione a data de volta (opcional)"
                                  : "Primeiro selecione a data de ida"
                              }
                            </span>
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background" align="start">
                          <Calendar
                            mode="single"
                            selected={returnDate}
                            onSelect={(date) => {
                              setReturnDate(date)
                              if (date) {
                                const dateString = format(date, "yyyy-MM-dd")
                                setSearchData({ ...searchData, dataVolta: dateString })
                                if (showChatbot) {
                                  // Adicionar card de resumo do destino completo
                                  const destinationCard = {
                                    type: 'destination',
                                    data: {
                                      origem: searchData.origem,
                                      destino: searchData.destino,
                                      dataIda: searchData.dataIda,
                                      dataVolta: dateString
                                    }
                                  }
                                  addChatbotMessage(`Perfeito! Data de volta selecionada. Agora você pode buscar os voos! 🎯`, 'success', `data-volta-${dateString}`, destinationCard)
                                }
                              } else {
                                setSearchData({ ...searchData, dataVolta: "" })
                              }
                            }}
                            disabled={(date) => !departureDate || date < departureDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => {
                      console.log('Botão clicado!', searchData)
                      if (searchData.origem && searchData.destino && searchData.dataIda) {
                        console.log('Mostrando mapa...')
                        setShowMap(true)
                        if (showChatbot) {
                          addChatbotMessage('Excelente! Estou processando sua busca e mostrando a rota no mapa. Em seguida, vou mostrar os voos disponíveis! 🗺️', 'info', 'search-processing')
                        }
                        setTimeout(() => {
                          document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })
                          updateActiveSection('map-section')
                        }, 100)
                      } else {
                        console.log('Dados incompletos:', searchData)
                        if (showChatbot) {
                          addChatbotMessage('Ops! Você precisa preencher a origem, destino e data de ida antes de buscar voos. ⚠️', 'guidance', 'search-validation')
                        }
                      }
                    }}
                    disabled={!searchData.origem || !searchData.destino || !searchData.dataIda}
                    className="px-8 py-4 bg-foreground text-background rounded-lg hover:bg-muted-foreground transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Buscar Voos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {showMap && (
          <section
            id="map-section"
            ref={(el) => { sectionsRef.current[2] = el }}
            className="min-h-screen py-20 sm:py-32 animate-fade-in-up"
          >
            <div className="space-y-12 sm:space-y-16">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <h2 className="text-3xl sm:text-4xl font-light">Rota Selecionada</h2>
                <div className="text-sm text-muted-foreground font-mono">
                  CONFIRME SUA VIAGEM
                </div>
              </div>

              <div className="max-w-4xl">
                <div className="p-6 border border-border rounded-2xl bg-background/50 backdrop-blur-sm">
                  <h3 className="text-xl font-medium mb-6 text-center">Rota de Voo</h3>
                  
                  {/* Mapa Simulado */}
                  <div className="relative bg-slate-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                    {/* Grid de fundo simulando mapa */}
                    <div className="absolute inset-0 opacity-20">
                      <svg width="100%" height="100%" className="text-slate-700">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>

                    {/* Continentes simulados */}
                    <div className="absolute inset-0">
                      <svg width="100%" height="100%" className="text-green-900/30">
                        <path d="M 50 100 Q 150 80 250 120 Q 350 140 400 100 Q 450 80 500 100 L 500 200 Q 400 180 300 200 Q 200 220 100 200 Z" fill="currentColor"/>
                        <path d="M 600 150 Q 700 130 800 150 Q 850 170 900 150 L 900 250 Q 800 230 700 250 Q 650 270 600 250 Z" fill="currentColor"/>
                      </svg>
                    </div>

                    {/* Ponto de Origem */}
                    <div className="absolute" style={{ left: '20%', top: '60%' }}>
                      <div className="relative">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white bg-blue-500 px-2 py-1 rounded whitespace-nowrap">
                          {getDestinationByCode(searchData.origem)?.city || searchData.origem}
                        </div>
                      </div>
                    </div>

                    {/* Ponto de Destino */}
                    <div className="absolute" style={{ left: '75%', top: '35%' }}>
                      <div className="relative">
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white bg-red-500 px-2 py-1 rounded whitespace-nowrap">
                          {getDestinationByCode(searchData.destino)?.city || searchData.destino}
                        </div>
                      </div>
                    </div>

                    {/* Linha de Voo Animada */}
                    <svg className="absolute inset-0" width="100%" height="100%">
                      <defs>
                        <linearGradient id="flightPath" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="1"/>
                          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="1"/>
                        </linearGradient>
                      </defs>
                      <path
                        d="M 20% 60% Q 50% 20% 75% 35%"
                        stroke="url(#flightPath)"
                        strokeWidth="3"
                        strokeDasharray="10,5"
                        fill="none"
                        className="animate-pulse"
                      />
                    </svg>

                    {/* Avião Animado */}
                    <div className="absolute animate-bounce" style={{ left: '47%', top: '40%' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="rotate-45">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                      </svg>
                    </div>

                    {/* Informações da Rota */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 rounded-lg p-4 text-white">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-xs text-gray-300">DISTÂNCIA</div>
                            <div className="text-sm font-medium">
                              {(() => {
                                const origem = getDestinationByCode(searchData.origem)
                                const destino = getDestinationByCode(searchData.destino)
                                if (origem && destino) {
                                  const distance = Math.round(Math.sqrt(
                                    Math.pow(destino.coordinates.lat - origem.coordinates.lat, 2) + 
                                    Math.pow(destino.coordinates.lng - origem.coordinates.lng, 2)
                                  ) * 111)
                                  return `${distance.toLocaleString()} km`
                                }
                                return '8.500 km'
                              })()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-300">TEMPO ESTIMADO</div>
                            <div className="text-sm font-medium">
                              {(() => {
                                const origem = getDestinationByCode(searchData.origem)
                                const destino = getDestinationByCode(searchData.destino)
                                if (origem && destino) {
                                  const distance = Math.sqrt(
                                    Math.pow(destino.coordinates.lat - origem.coordinates.lat, 2) + 
                                    Math.pow(destino.coordinates.lng - origem.coordinates.lng, 2)
                                  ) * 111
                                  const hours = Math.floor(distance / 800) + 8
                                  const minutes = Math.round((distance / 800 % 1) * 60)
                                  return `${hours}h ${minutes}m`
                                }
                                return '11h 20m'
                              })()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-300">PAÍSES</div>
                            <div className="text-sm font-medium">
                              {(() => {
                                const origem = getDestinationByCode(searchData.origem)
                                const destino = getDestinationByCode(searchData.destino)
                                if (origem && destino && origem.country !== destino.country) {
                                  return `${origem.country} → ${destino.country}`
                                }
                                return origem?.country || destino?.country || 'Internacional'
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações das Datas */}
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-2 gap-6 text-center">
                      <div>
                        <div className="text-sm text-muted-foreground font-mono">DATA DE IDA</div>
                        <div className="text-lg font-medium mt-1">
                          {new Date(searchData.dataIda).toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      {searchData.dataVolta && (
                        <div>
                          <div className="text-sm text-muted-foreground font-mono">DATA DE VOLTA</div>
                          <div className="text-lg font-medium mt-1">
                            {new Date(searchData.dataVolta).toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão Buscar Voos Disponíveis */}
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => {
                        setShowFlights(true)
                        if (showChatbot) {
                          // Calcular dados da rota
                          const origem = getDestinationByCode(searchData.origem)
                          const destino = getDestinationByCode(searchData.destino)
                          let distancia = '8.500 km'
                          let tempo = '11h 20m'
                          
                          if (origem && destino) {
                            const distance = Math.round(Math.sqrt(
                              Math.pow(destino.coordinates.lat - origem.coordinates.lat, 2) + 
                              Math.pow(destino.coordinates.lng - origem.coordinates.lng, 2)
                            ) * 111)
                            distancia = `${distance.toLocaleString()} km`
                            
                            const hours = Math.floor(distance / 800) + 8
                            const minutes = Math.round((distance / 800 % 1) * 60)
                            tempo = `${hours}h ${minutes}m`
                          }
                          
                          const routeCard = {
                            type: 'route',
                            data: {
                              origem: searchData.origem,
                              destino: searchData.destino,
                              distancia,
                              tempo
                            }
                          }
                          addChatbotMessage('Ótimo! Agora vou mostrar os voos disponíveis para sua rota. Analise as opções e selecione o que mais combina com você! ✈️', 'info', 'show-flights', routeCard)
                        }
                        setTimeout(() => {
                          document.getElementById('flights')?.scrollIntoView({ behavior: 'smooth' })
                          updateActiveSection('flights')
                        }, 100)
                      }}
                      className="px-8 py-4 bg-foreground text-background rounded-lg hover:bg-muted-foreground transition-colors duration-300 font-medium"
                    >
                      Buscar Voos Disponíveis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {showFlights && (
          <section
            id="flights"
            ref={(el) => { sectionsRef.current[3] = el }}
            className="min-h-screen py-20 sm:py-32 animate-fade-in-up"
          >
          <div className="space-y-12 sm:space-y-16">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <h2 className="text-3xl sm:text-4xl font-light">Voos Disponíveis</h2>
                <div className="text-sm text-muted-foreground font-mono">
                  {searchData.origem} → {searchData.destino}
                </div>
              </div>

              <div className="space-y-6">
                {[
                  {
                    airline: "LATAM Airlines",
                    flight: "LA 3030",
                    departure: "08:30",
                    arrival: "14:45",
                    duration: "11h 15m",
                    stops: "1 parada",
                    price: "R$ 2.850",
                    class: "Econômica"
                  },
                  {
                    airline: "Air France",
                    flight: "AF 447",
                    departure: "23:50",
                    arrival: "16:30+1",
                    duration: "10h 40m",
                    stops: "Direto",
                    price: "R$ 3.200",
                    class: "Executiva"
                  },
                  {
                    airline: "Azul Linhas Aéreas",
                    flight: "AD 7182",
                    departure: "15:20",
                    arrival: "07:15+1",
                    duration: "15h 55m",
                    stops: "2 paradas",
                    price: "R$ 2.450",
                    class: "Econômica"
                  },
                  {
                    airline: "Emirates",
                    flight: "EK 246",
                    departure: "02:25",
                    arrival: "19:30",
                    duration: "12h 05m",
                    stops: "1 parada",
                    price: "R$ 4.100",
                    class: "Primeira Classe"
                  },
                ].map((flight, index) => (
                  <div
                  key={index}
                  className="group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg cursor-pointer"
                >
                    <div className="grid lg:grid-cols-12 gap-6 items-center">
                      <div className="lg:col-span-3">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">{flight.airline}</h3>
                          <div className="text-sm text-muted-foreground">{flight.flight}</div>
                          <div className="text-xs px-2 py-1 bg-muted-foreground/10 rounded text-muted-foreground w-fit">
                            {flight.class}
                          </div>
                        </div>
                    </div>

                      <div className="lg:col-span-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xl font-medium">{flight.departure}</div>
                            <div className="text-sm text-muted-foreground">{searchData.origem}</div>
                          </div>
                          <div className="flex-1 relative">
                            <div className="h-px bg-border"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background px-2">
                              {flight.duration}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-medium">{flight.arrival}</div>
                            <div className="text-sm text-muted-foreground">{searchData.destino}</div>
                          </div>
                        </div>
                        <div className="text-center text-sm text-muted-foreground mt-2">
                          {flight.stops}
                        </div>
                      </div>

                      <div className="lg:col-span-3 text-center lg:text-right">
                        <div className="text-2xl font-light text-foreground">{flight.price}</div>
                        <div className="text-sm text-muted-foreground">por pessoa</div>
                      </div>

                      <div className="lg:col-span-2 flex justify-end items-center">
                        <button
                          onClick={() => {
                            setSelectedFlight(flight)
                            setShowHotels(true)
                            if (showChatbot) {
                              const flightCard = {
                                type: 'flight',
                                data: {
                                  airline: flight.airline,
                                  flight: flight.flight,
                                  departure: flight.departure,
                                  arrival: flight.arrival,
                                  price: flight.price,
                                  class: flight.class,
                                  duration: flight.duration
                                }
                              }
                              addChatbotMessage(`Excelente escolha! Você selecionou o voo ${flight.airline} (${flight.flight}) por ${flight.price}. Agora vamos escolher sua hospedagem! 🏨`, 'success', `flight-selected-${flight.flight}`, flightCard)
                            }
                            setTimeout(() => {
                              document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' })
                              updateActiveSection('hotels')
                            }, 100)
                          }}
                          className="px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:bg-muted-foreground transition-colors duration-300 font-medium"
                        >
                          Selecionar
                        </button>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {showHotels && (
          <section
            id="hotels"
            ref={(el) => { sectionsRef.current[4] = el }}
            className="min-h-screen py-20 sm:py-32 animate-fade-in-up"
          >
            <div className="space-y-12 sm:space-y-16">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <h2 className="text-3xl sm:text-4xl font-light">Hotéis Disponíveis</h2>
                <div className="text-sm text-muted-foreground font-mono">
                  {searchData.destino} • {searchData.dataIda}{searchData.dataVolta ? ` - ${searchData.dataVolta}` : ''}
              </div>
            </div>

              <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                {[
                  {
                    name: "Grand Hotel Luxor",
                    category: "5 estrelas",
                    location: "Centro da cidade",
                    amenities: "Wi-Fi, Piscina, Spa, Academia",
                    price: "R$ 480",
                    rating: "9.2",
                    reviews: "1.247 avaliações"
                  },
                  {
                    name: "Hotel Boutique Arte",
                    category: "4 estrelas",
                    location: "Distrito histórico",
                    amenities: "Wi-Fi, Restaurante, Bar, Terraço",
                    price: "R$ 320",
                    rating: "8.9",
                    reviews: "892 avaliações"
                  },
                  {
                    name: "Sky Business Hotel",
                    category: "4 estrelas",
                    location: "Área financeira",
                    amenities: "Wi-Fi, Centro de negócios, Academia",
                    price: "R$ 380",
                    rating: "8.7",
                    reviews: "654 avaliações"
                  },
                  {
                    name: "Comfort Inn Express",
                    category: "3 estrelas",
                    location: "Próximo ao aeroporto",
                    amenities: "Wi-Fi, Café da manhã, Transfer",
                    price: "R$ 180",
                    rating: "8.3",
                    reviews: "423 avaliações"
                  },
                ].map((hotel, index) => (
                  <div
                    key={index}
                    className="group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg cursor-pointer"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg sm:text-xl font-medium">{hotel.name}</h3>
                          <div className="text-sm text-muted-foreground">{hotel.category} • {hotel.location}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-medium">{hotel.rating}</span>
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.943a1 1 0 00.95.69h4.136c.969 0 1.371 1.24.588 1.81l-3.347 2.43a1 1 0 00-.364 1.118l1.286 3.943c.3.921-.755 1.688-1.54 1.118l-3.347-2.43a1 1 0 00-1.176 0l-3.347 2.43c-.784.57-1.838-.197-1.539-1.118l1.286-3.943a1 1 0 00-.364-1.118l-3.347-2.43c-.784-.57-.38-1.81.588-1.81h4.136a1 1 0 00.95-.69l1.286-3.943z"/>
                            </svg>
                          </div>
                          <div className="text-xs text-muted-foreground">{hotel.reviews}</div>
                        </div>
                      </div>

                      <p className="text-muted-foreground leading-relaxed text-sm">{hotel.amenities}</p>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-light text-foreground">{hotel.price}</div>
                          <div className="text-sm text-muted-foreground">por noite</div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedHotel(hotel)
                            setShowCheckout(true)
                            if (showChatbot) {
                              const hotelCard = {
                                type: 'hotel',
                                data: {
                                  name: hotel.name,
                                  category: hotel.category,
                                  location: hotel.location,
                                  price: hotel.price,
                                  rating: hotel.rating,
                                  amenities: hotel.amenities
                                }
                              }
                              addChatbotMessage(`Perfeita escolha! Você selecionou o ${hotel.name} (${hotel.category}) por ${hotel.price}/noite. Agora vamos finalizar sua reserva! 🎉`, 'success', `hotel-selected-${hotel.name}`, hotelCard)
                            }
                            setTimeout(() => {
                              document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' })
                              updateActiveSection('checkout')
                            }, 100)
                          }}
                          className="px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:bg-muted-foreground transition-colors duration-300 font-medium"
                        >
                          Selecionar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {showCheckout && (
          <section id="checkout" ref={(el) => { 
            sectionsRef.current[5] = el
          }} className="py-20 sm:py-32 animate-fade-in-up">
            <div className="space-y-12 sm:space-y-16">
              <h2 className="text-3xl sm:text-4xl font-light">Finalizar Reserva</h2>

              {/* Resumo da Viagem - Largura Total */}
              <div className="w-full">
                <div className="p-8 border border-border rounded-lg bg-background/50 backdrop-blur-sm">
                  <h3 className="text-xl font-medium mb-6">Resumo da Viagem</h3>
                    
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Informações do Voo */}
                    {selectedFlight && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Voo Selecionado</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Companhia</div>
                            <div className="font-medium">{selectedFlight.airline}</div>
                        </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Voo</div>
                            <div className="font-medium">{selectedFlight.flight}</div>
                        </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Rota</div>
                            <div className="font-medium">{searchData.origem} → {searchData.destino}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Horário</div>
                            <div className="font-medium">{selectedFlight.departure} - {selectedFlight.arrival}</div>
                        </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Duração</div>
                            <div className="font-medium">{selectedFlight.duration}</div>
                          </div>
                          <div className="pt-2 border-t border-border">
                            <div className="text-sm text-muted-foreground">Valor</div>
                            <div className="font-medium text-lg text-green-600">{selectedFlight.price}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Informações do Hotel */}
                    {selectedHotel && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Hotel Selecionado</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Hotel</div>
                            <div className="font-medium">{selectedHotel.name}</div>
                        </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Categoria</div>
                            <div className="font-medium">{selectedHotel.category}</div>
                        </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Localização</div>
                            <div className="font-medium">{selectedHotel.location}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Avaliação</div>
                            <div className="font-medium">{selectedHotel.rating} ⭐</div>
                          </div>
                          <div className="pt-2 border-t border-border">
                            <div className="text-sm text-muted-foreground">Valor por noite</div>
                            <div className="font-medium text-lg text-green-600">{selectedHotel.price}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Resumo das Datas e Total */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Detalhes da Viagem</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Data de Ida</div>
                          <div className="font-medium">
                            {new Date(searchData.dataIda).toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        {searchData.dataVolta && (
                          <div>
                            <div className="text-sm text-muted-foreground">Data de Volta</div>
                            <div className="font-medium">
                              {new Date(searchData.dataVolta).toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                        <div className="pt-4 border-t border-border">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <div className="text-sm text-muted-foreground mb-1">Total da Viagem</div>
                            <div className="text-2xl font-bold text-foreground">
                          {selectedFlight && selectedHotel && 
                            `R$ ${(parseInt(selectedFlight.price.replace('R$ ', '').replace('.', '')) + 
                                  parseInt(selectedHotel.price.replace('R$ ', ''))).toLocaleString()}`
                          }
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Voo + Hotel (1 noite)
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Formulário de Dados do Passageiro - Largura Total */}
              <div className="w-full">
                <div className="p-8 border border-border rounded-lg bg-background/50 backdrop-blur-sm">
                    <h3 className="text-xl font-medium mb-6">Dados do Passageiro</h3>
                    
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Coluna da Esquerda */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-muted-foreground font-mono">NOME</label>
                          <input
                            type="text"
                            placeholder="Nome completo"
                            className="w-full p-4 bg-background border border-border rounded-lg text-foreground focus:border-muted-foreground/50 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-muted-foreground font-mono">SOBRENOME</label>
                          <input
                            type="text"
                            placeholder="Sobrenome"
                            className="w-full p-4 bg-background border border-border rounded-lg text-foreground focus:border-muted-foreground/50 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground font-mono">EMAIL</label>
                        <input
                          type="email"
                          placeholder="seu.email@exemplo.com"
                          className="w-full p-4 bg-background border border-border rounded-lg text-foreground focus:border-muted-foreground/50 transition-colors"
                        />
                      </div>
                      </div>

                    {/* Coluna da Direita */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground font-mono">TELEFONE</label>
                        <input
                          type="tel"
                          placeholder="(11) 99999-9999"
                          className="w-full p-4 bg-background border border-border rounded-lg text-foreground focus:border-muted-foreground/50 transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground font-mono">DOCUMENTO</label>
                        <input
                          type="text"
                          placeholder="CPF ou Passaporte"
                          className="w-full p-4 bg-background border border-border rounded-lg text-foreground focus:border-muted-foreground/50 transition-colors"
                        />
                      </div>
                      </div>
                    </div>

                  <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        onClick={() => {
                          if (showChatbot) {
                          addChatbotMessage('🎉 Parabéns! Sua reserva foi confirmada com sucesso! Você receberá todos os detalhes por email. Tenha uma viagem incrível! ✈️🌟', 'success', 'reservation-confirmed')
                          }
                        }}
                      className="flex-1 max-w-sm px-8 py-4 bg-foreground text-background rounded-lg hover:bg-muted-foreground transition-colors duration-300 font-medium text-lg"
                      >
                        Confirmar Reserva
                      </button>
                      
                      <button 
                        onClick={resetReservation}
                      className="flex-1 max-w-sm px-8 py-4 bg-transparent text-muted-foreground border border-border rounded-lg hover:bg-muted/30 hover:text-foreground transition-colors duration-300 font-medium"
                      >
                        Cancelar Reserva
                      </button>
                    </div>

                  <div className="mt-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Ao confirmar, você concorda com nossos termos e condições
                      </p>
                  </div>
              </div>
            </div>
          </div>
        </section>
        )}

        <footer className="py-12 sm:py-16 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">© 2025 Sky Travels. Todos os direitos reservados.</div>
              <div className="text-xs text-muted-foreground">Agência de viagens licenciada • CNPJ: 00.000.000/0001-00</div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              <button className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300">
                <svg
                  className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* Chatbot Lívia Assist */}
      {showChatbot && (activeSection !== 'intro' || isAIMode) && (
        <div className="fixed top-0 right-0 z-50 h-screen">
          <div className={`bg-background border-l border-border shadow-2xl transition-all duration-300 h-full relative ${
            isChatbotExpanded 
              ? 'w-80 sm:w-96' 
              : 'w-16'
          }`}>
            {/* Cabeçalho do Chatbot */}
            <div 
              className="flex items-center justify-between p-4 border-b border-border cursor-pointer"
              onClick={() => setIsChatbotExpanded(!isChatbotExpanded)}
            >
              {isChatbotExpanded ? (
                <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-sm">Lívia Assist</div>
                  <div className="text-xs text-muted-foreground">Assistente de Viagem</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <svg 
                      className="w-4 h-4 text-muted-foreground transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>

            {/* Corpo do Chatbot */}
            {isChatbotExpanded && (
              <>
                {/* Área de Mensagens */}
                <div 
                  ref={chatMessagesRef}
                  className="p-4 overflow-y-auto space-y-4"
                  style={{ height: isAIMode ? 'calc(100vh - 180px)' : 'calc(100vh - 140px)' }}
                >
                  {isAIMode ? (
                    // Modo IA - Mensagens do useChat
                    aiMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-sm py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-base font-medium mb-2 text-foreground">Olá! Sou a Lívia</div>
                      <div className="mb-4">Sua assistente pessoal de viagem</div>
                        <div className="text-xs text-muted-foreground/70 max-w-[250px]">
                          💬 Modo IA ativo! Converse comigo naturalmente sobre sua viagem.
                        </div>
                      </div>
                    ) : (
                      <>
                        
                        {aiMessages.map((message: any) => (
                          <div key={message.id} className="flex gap-3 mb-6 animate-fade-in-up">
                            {message.role === 'assistant' && (
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            
                            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                              <div className={`inline-block p-3 rounded-lg max-w-[85%] ${
                                message.role === 'user' 
                                  ? 'bg-foreground text-background ml-auto' 
                                  : 'bg-muted/30 text-foreground'
                              }`}>
                                <div className="text-sm leading-relaxed whitespace-pre-line">
                                  {message.content}
                                </div>
                              </div>
                              
                              {/* Renderizar card de resumo se existir */}
                              {message.cardData && renderSummaryCard(message.cardData)}
                              
                              {/* Renderizar botões de pergunta se existir */}
                              {message.questionButtons && (
                                <div className="mt-4 space-y-2 animate-fade-in-up">
                                  <div className="text-xs text-muted-foreground/80 mb-2 font-medium">
                                    {message.questionButtons.type === 'departure_date' 
                                      ? '📅 Escolha uma data rápida:' 
                                      : message.questionButtons.type === 'origin_city'
                                      ? '🏙️ Escolha sua cidade de origem:'
                                      : 'Escolha uma opção:'
                                    }
                                  </div>
                                  {message.questionButtons.buttons.map((button: any, index: number) => {
                                    // Estilos diferentes para cada tipo de botão
                                    const isDateButton = message.questionButtons.type === 'departure_date';
                                    const isOriginButton = message.questionButtons.type === 'origin_city';
                                    
                                    let buttonStyle = 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'; // Padrão
                                    let icon = null;
                                    
                                    if (isDateButton) {
                                      buttonStyle = 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700';
                                      icon = (
                                        <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                      );
                                    } else if (isOriginButton) {
                                      buttonStyle = 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700';
                                      icon = (
                                        <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                      );
                                    } else {
                                      icon = (
                                        <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                      );
                                    }
                                    
                                    return (
                                      <button
                                        key={index}
                                        onClick={() => {
                                          // Enviar resposta automaticamente
                                          sendAIMessage(button.value);
                                          
                                          // Remover os botões após clicar
                                          setAiMessages(prev => prev.map(msg => 
                                            msg.id === message.id 
                                              ? { ...msg, questionButtons: undefined }
                                              : msg
                                          ));
                                        }}
                                        className={`group block w-full text-left px-4 py-3 text-white rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 shadow-lg hover:shadow-xl animate-slide-in border border-white/10 ${buttonStyle}`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                      >
                                        <span className="flex items-center justify-between">
                                          <span className="text-sm font-medium flex items-center gap-2">
                                            {button.text}
                                          </span>
                                          {icon}
                                        </span>
                                      </button>
                                    );
                                  })}
                                  <div className="text-xs text-muted-foreground/60 mt-2 text-center">
                                    💡 Ou digite sua resposta manualmente
                                  </div>
                                </div>
                              )}
                              
                              <div className="text-xs text-muted-foreground mt-1">
                                {message.timestamp ? message.timestamp.toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                }) : new Date().toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Indicador de digitação */}
                        {isAILoading && (
                          <div className="flex gap-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="bg-muted/30 text-foreground p-3 rounded-lg">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )
                  ) : (
                    // Modo Assistido - Mensagens antigas
                    chatbotMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-sm py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-base font-medium mb-2 text-foreground">Olá! Sou a Lívia</div>
                        <div className="mb-4">Sua assistente pessoal de viagem</div>
                        <div className="text-xs text-muted-foreground/70 max-w-[250px]">
                        💡 Clique em "Vamos Começar" para iniciarmos sua jornada!
                        <br />
                        Vou te guiar em cada passo da sua reserva.
                      </div>
                    </div>
                  ) : (
                    chatbotMessages.map((message) => (
                        <div key={message.id} className="flex gap-3 mb-6 animate-fade-in-up">
                          {/* Avatar da Lívia */}
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          
                          {/* Conteúdo da mensagem */}
                          <div className="flex-1">
                            <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                          {message.text}
                              {message.isTyping && (
                                <span className="inline-block w-2 h-4 bg-foreground ml-1 animate-pulse"></span>
                              )}
                        </div>
                            
                            {/* Renderizar card de resumo se existir */}
                            {message.cardData && !message.isTyping && renderSummaryCard(message.cardData)}
                            
                            <div className="text-xs text-muted-foreground mt-2">
                          {message.timestamp.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                            </div>
                        </div>
                      </div>
                    ))
                    )
                  )}
                </div>

                {/* Rodapé do Chatbot */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background">
                  {/* Input para Modo IA */}
                  {isAIMode && (
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      sendAIMessage(aiInput)
                    }} className="p-4 border-b border-border">
                      <div className="flex gap-2">
                        <input
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          className="flex-1 p-2 text-sm bg-muted/30 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-muted-foreground/50 transition-colors"
                          disabled={isAILoading}
                        />
                        <button
                          type="submit"
                          disabled={isAILoading || !aiInput.trim()}
                          className="p-2 bg-foreground text-background rounded-lg hover:bg-muted-foreground transition-colors disabled:opacity-50"
                        >
                          {isAILoading ? (
                            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                  
                  {/* Status Bar */}
                  <div className="p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span>{isAIMode ? 'Modo IA Ativo' : 'Modo Assistido'}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowChatbot(false)
                          setIsAIMode(false)
                      }}
                      className="hover:text-foreground transition-colors"
                    >
                      Fechar
                    </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
    </div>
  )
}

