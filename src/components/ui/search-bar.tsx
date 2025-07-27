import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  image: string;
  category: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  initialValue?: string;
  className?: string;
  highlighted?: boolean; // new prop for special styling
}

// Add global styles for animated border
if (typeof window !== 'undefined') {
  const styleId = 'searchbar-animated-border-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes spin-gradient {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      .searchbar-animated-border {
        padding: 3px;
        border-radius: 1rem;
        background: linear-gradient(270deg, #fdba74, #f472b6, #60a5fa, #34d399, #fdba74);
        background-size: 400% 400%;
        animation: spin-gradient 3s linear infinite;
        box-shadow: 0 8px 32px 0 rgba(253,186,116,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2.5rem;
        margin-top: 1.5rem;
      }
      .searchbar-animated-input {
        background: white !important;
        border-radius: 0.9rem !important;
        border: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

export default function SearchBar({ placeholder = 'Search...', onSearch, initialValue = '', className = '', highlighted = false }: SearchBarProps) {
  const [searchInput, setSearchInput] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsListRef = useRef<HTMLUListElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const trending = [
    'Vintage Denim',
    'Retro Dresses',
    'Classic Tees',
    'Eco-Friendly',
    'Unique Style',
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  // Save recent searches to localStorage
  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    let updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Fetch suggestions as user types
  useEffect(() => {
    if (searchInput.trim().length === 0) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }
    setSuggestionsLoading(true);
    const handler = setTimeout(async () => {
      const params = new URLSearchParams({
        search: searchInput,
        limit: '5',
      });
      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      if (data.products) {
        setSuggestions(data.products);
        setShowSuggestions(true);
      }
      setSuggestionsLoading(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Keyboard navigation and close on Escape
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (showSuggestions && highlightedSuggestion >= 0 && suggestions[highlightedSuggestion]) {
        handleSuggestionClick(suggestions[highlightedSuggestion].name);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowSuggestions(true);
      setHighlightedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setShowSuggestions(true);
      setHighlightedSuggestion(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedSuggestion(-1);
    }
  };

  // Auto-scroll to highlighted suggestion
  useEffect(() => {
    if (highlightedSuggestion >= 0 && suggestionsListRef.current) {
      const el = document.getElementById(`suggestion-${highlightedSuggestion}`);
      if (el && suggestionsListRef.current) {
        const listRect = suggestionsListRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        if (elRect.bottom > listRect.bottom) {
          el.scrollIntoView({ block: 'end', behavior: 'smooth' });
        } else if (elRect.top < listRect.top) {
          el.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
      }
    }
  }, [highlightedSuggestion]);

  // Reset highlight when suggestions change
  useEffect(() => {
    setHighlightedSuggestion(-1);
  }, [suggestions]);

  // Outside click closes dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsListRef.current &&
        !suggestionsListRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setHighlightedSuggestion(-1);
      }
    }
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  const handleSearch = () => {
    onSearch(searchInput);
    addRecentSearch(searchInput);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (name: string) => {
    setSearchInput(name);
    onSearch(name);
    addRecentSearch(name);
    setShowSuggestions(false);
    setHighlightedSuggestion(-1);
    inputRef.current?.blur();
  };

  // Animated border for highlighted search bar
  const animatedBorder = highlighted
    ? 'searchbar-animated-border relative bg-white'
    : '';

  return (
    <div className={`relative w-full ${highlighted ? 'z-40' : ''} ${className}`}>
      <div className="relative w-full flex flex-col items-stretch">
        <div className="relative w-full" style={{ zIndex: 2 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchInput}
            onChange={e => {
              setSearchInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleKeyDown}
            className="pl-4 pr-10 py-2 text-base border border-gray-300 rounded-xl w-full bg-gray-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
            style={{ fontSize: '1rem', height: '2.5rem' }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none">
            <SearchIcon className="w-5 h-5" />
          </span>
        </div>
        {/* Suggestion popup below the search bar, not overlapping, only show product suggestions */}
        {showSuggestions && searchInput.trim() !== '' && (
          <ul
            ref={suggestionsListRef}
            className="absolute left-0 right-0 top-full bg-white border border-gray-200 rounded-lg mt-2 max-h-80 overflow-y-auto transition-all duration-200 z-50"
            style={{ minHeight: '40px' }}
          >
            {suggestionsLoading ? (
              <li className="flex items-center justify-center py-4 text-gray-400">
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mr-2"></span>
                Loading...
              </li>
            ) : suggestions.length === 0 ? (
              <li className="px-4 py-3 text-gray-500 text-center">No products found</li>
            ) : (
              suggestions.map((s, idx) => {
                const matchIdx = s.name.toLowerCase().indexOf(searchInput.toLowerCase());
                let before = s.name.slice(0, matchIdx);
                let match = s.name.slice(matchIdx, matchIdx + searchInput.length);
                let after = s.name.slice(matchIdx + searchInput.length);
                return (
                  <li
                    key={s._id}
                    className={`flex items-center gap-3 px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors ${highlightedSuggestion === idx ? 'bg-orange-100' : ''}`}
                    onMouseDown={() => handleSuggestionClick(s.name)}
                    onMouseEnter={() => setHighlightedSuggestion(idx)}
                    id={`suggestion-${idx}`}
                  >
                    <img src={s.image} alt={s.name} className="w-10 h-10 object-cover rounded" />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 text-sm">
                        {matchIdx >= 0 ? (
                          <>
                            {before}
                            <span className="bg-orange-200 text-orange-700 rounded px-1 text-xs">{match}</span>
                            {after}
                          </>
                        ) : (
                          s.name
                        )}
                      </span>
                      <span className="text-xs text-gray-400">{s.category}</span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
} 