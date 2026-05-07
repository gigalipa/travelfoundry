import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  className?: string;
  required?: boolean;
}

export function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder, 
  icon, 
  className,
  required 
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<{ display_name: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce para evitar saturar la API
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length > 2 && isOpen) {
        searchLocations(value);
      } else {
        setSuggestions([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, isOpen]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (query: string) => {
    setIsLoading(true);
    setHasSearched(false);
    try {
      // Usamos una URL más simple y robusta
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1&accept-language=es`
      );
      
      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      setSuggestions(data);
      setHasSearched(true);
    } catch (error) {
      console.error('Autocomplete Error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (suggestion: { display_name: string }) => {
    onChange(suggestion.display_name);
    setSuggestions([]);
    setIsOpen(false);
    setHasSearched(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-gold animate-spin" />
          ) : (
            icon
          )}
        </div>
        <input
          required={required}
          type="text"
          placeholder={placeholder}
          className={`${className} pl-10`}
          value={value}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
        />
      </div>

      <AnimatePresence>
        {isOpen && value.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-dramatic border border-stone overflow-hidden"
          >
            {isLoading ? (
              <div className="p-4 text-sm text-midnight/50 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
                Buscando lugares...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className="w-full p-4 text-left hover:bg-stone/30 transition-colors flex items-start gap-3 border-b border-stone/50 last:border-0"
                  >
                    <MapPin className="w-4 h-4 text-gold mt-1 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-midnight truncate">
                        {s.display_name.split(',')[0]}
                      </div>
                      <div className="text-xs text-midnight/40 truncate">
                        {s.display_name.split(',').slice(1).join(',').trim()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : hasSearched ? (
              <div className="p-4 text-sm text-midnight/50 text-center">
                No se encontraron resultados
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
