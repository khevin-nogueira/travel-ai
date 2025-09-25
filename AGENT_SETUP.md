# 🤖 Sistema de Agentes de IA - Sky Travels

## ✨ Funcionalidades Implementadas

### 🎯 **Agente Principal de Viagens**
- **Lívia Assist**: Agente especializado em planejamento de viagens
- **Ferramentas Inteligentes**: Busca de voos, hotéis, informações de destino e cálculos de preço
- **Respostas Estruturadas**: Dados organizados e visualizados de forma elegante

### 🛠️ **Ferramentas Disponíveis**

#### 1. **Busca de Voos** (`search_flights`)
- Busca inteligente de voos entre cidades
- Filtros por data, passageiros e classe
- Validação com Zod para dados consistentes
- Retorna voos com preços, horários e detalhes

#### 2. **Busca de Hotéis** (`search_hotels`)
- Busca de hospedagem por cidade
- Filtros por datas de check-in/out e número de hóspedes
- Informações detalhadas sobre comodidades e avaliações
- Cálculo automático de faixas de preço

#### 3. **Informações de Destino** (`get_destination_info`)
- Dados sobre clima, atrações e cultura
- Informações de segurança e transporte
- Dados específicos para São Paulo e Rio de Janeiro
- Facilmente extensível para novos destinos

#### 4. **Cálculo de Preços** (`calculate_trip_price`)
- Estimativa completa de custos de viagem
- Inclui voos, hospedagem, extras e impostos
- Breakdown detalhado de gastos
- Cálculos precisos com validação

### 🎨 **Interface Visual**

#### **Componentes de Dados Estruturados**
- **Cards de Voos**: Visualização elegante com animações
- **Cards de Hotéis**: Informações completas com avaliações
- **Informações de Destino**: Dados organizados por categoria
- **Cálculos de Preço**: Breakdown detalhado e transparente

#### **Animações Sutis**
- Entrada suave dos elementos
- Hover effects interativos
- Transições fluidas entre estados
- Feedback visual para ações do usuário

## 🚀 **Como Usar**

### 1. **Configuração da API**
```bash
# Adicione sua chave da OpenAI no arquivo .env
OPENAI_API_KEY=sua_chave_aqui
```

### 2. **Exemplos de Uso**

#### **Buscar Voos**
```
"Quero voos de São Paulo para Rio de Janeiro no dia 15/03/2025"
```

#### **Buscar Hotéis**
```
"Preciso de hotéis em São Paulo para 2 pessoas de 15 a 18 de março"
```

#### **Informações de Destino**
```
"Me conte sobre o Rio de Janeiro, especialmente o clima e atrações"
```

#### **Calcular Preços**
```
"Calcule o preço total da viagem incluindo voos e hospedagem"
```

### 3. **Integração com o Chat**

O sistema está integrado ao chat existente e funciona automaticamente:

1. **Modo IA Ativo**: O agente processa mensagens naturalmente
2. **Respostas Inteligentes**: Dados estruturados são exibidos automaticamente
3. **Navegação Automática**: Seções relevantes são mostradas automaticamente
4. **Feedback Visual**: Animações indicam processamento e resultados

## 🔧 **Arquitetura Técnica**

### **Estrutura de Arquivos**
```
lib/
├── agents.ts              # Configuração dos agentes e ferramentas
├── agent-config.ts        # Configuração da API OpenAI
hooks/
├── useTravelAgent.ts      # Hook personalizado para o agente
components/ai/
├── StructuredDataDisplay.tsx  # Componente para exibir dados estruturados
```

### **Tecnologias Utilizadas**
- **@openai/agents**: SDK oficial da OpenAI para agentes
- **Zod**: Validação de schemas TypeScript
- **Framer Motion**: Animações fluidas
- **React Hooks**: Gerenciamento de estado
- **TypeScript**: Tipagem forte e segura

### **Validação de Dados**
Todos os dados são validados com schemas Zod:
- **FlightSearchSchema**: Validação de busca de voos
- **HotelSearchSchema**: Validação de busca de hotéis
- **DestinationInfoSchema**: Validação de informações de destino
- **PriceCalculationSchema**: Validação de cálculos de preço

## 🎯 **Próximos Passos**

### **Melhorias Futuras**
1. **Integração com APIs Reais**: Conectar com provedores de voos e hotéis
2. **Mais Destinos**: Expandir base de dados de cidades
3. **Histórico de Conversas**: Salvar conversas para referência
4. **Personalização**: Adaptar recomendações ao perfil do usuário
5. **Notificações**: Alertas de preços e ofertas especiais

### **Extensibilidade**
O sistema foi projetado para ser facilmente extensível:
- **Novas Ferramentas**: Adicione facilmente novas funcionalidades
- **Novos Agentes**: Crie agentes especializados para diferentes áreas
- **Novos Destinos**: Expanda a base de dados de informações
- **Novos Formatos**: Adicione novos tipos de dados estruturados

## 📚 **Documentação Adicional**

- [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/)
- [Zod Documentation](https://zod.dev/)
- [Framer Motion](https://www.framer.com/motion/)

---

**Desenvolvido com ❤️ para Sky Travels** ✈️
