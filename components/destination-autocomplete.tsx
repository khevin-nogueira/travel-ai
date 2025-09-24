"use client"

import * as React from "react"
import { Check, ChevronsUpDown, MapPin, Plane } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { searchDestinations, getDestinationByCode, type Destination } from "@/data/destinations"

interface DestinationAutocompleteProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  label?: string
}

export function DestinationAutocomplete({
  value,
  onValueChange,
  placeholder = "Buscar destino...",
  label = "Destino"
}: DestinationAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [destinations, setDestinations] = React.useState<Destination[]>([])

  // Debounce para melhorar performance
  const [debouncedQuery, setDebouncedQuery] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Busca destinos quando o query muda (com debounce)
  React.useEffect(() => {
    if (debouncedQuery.length >= 2) {
      const results = searchDestinations(debouncedQuery)
      setDestinations(results)
    } else {
      setDestinations([])
    }
  }, [debouncedQuery])

  // Busca o destino selecionado diretamente pela API
  const selectedDestination = value ? getDestinationByCode(value) : undefined

  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground font-mono">{label.toUpperCase()}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between p-4 bg-background border border-border rounded-lg text-foreground focus:border-muted-foreground/50 transition-colors h-auto"
          >
            {selectedDestination ? (
              <div className="flex items-center gap-3 text-left">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedDestination.code}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{selectedDestination.city}</span>
                  <span className="text-xs text-muted-foreground">{selectedDestination.country}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{placeholder}</span>
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Digite cidade, país ou código..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-none focus:ring-0"
            />
            <CommandList className="max-h-60">
              <CommandEmpty>
                {searchQuery.length < 2 
                  ? "Digite pelo menos 2 caracteres para buscar..."
                  : "Nenhum destino encontrado."
                }
              </CommandEmpty>
              {destinations.length > 0 && (
                <CommandGroup>
                  {destinations.map((destination) => (
                    <CommandItem
                      key={destination.code}
                      value={destination.code}
                      onSelect={(currentValue) => {
                        onValueChange?.(currentValue === value ? "" : currentValue)
                        setOpen(false)
                        setSearchQuery("")
                      }}
                      className="p-3 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Plane className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-mono text-xs font-medium bg-muted px-2 py-1 rounded shrink-0">
                            {destination.code}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{destination.city}</span>
                            <span className="text-xs text-muted-foreground">
                              {destination.country}
                            </span>
                          </div>
                        </div>
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            value === destination.code ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
