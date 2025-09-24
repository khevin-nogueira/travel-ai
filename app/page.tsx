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
            
            // Atualizar mensagem da assistente em tempo real
            setAiMessages(prev => prev.map(msg => 
              msg.id === assistantId 
                ? { ...msg, content: assistantMessage }
                : msg
            ))
          }
        }
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
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date().toLocaleTimeString('pt-BR', { 
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
