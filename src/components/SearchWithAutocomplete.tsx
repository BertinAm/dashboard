'use client';

import { useState, useEffect, useRef } from 'react';
import { XSSScanLog } from '@/lib/api';

interface SearchWithAutocompleteProps {
  logs: XSSScanLog[];
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchWithAutocomplete({
  logs,
  onSearch,
  placeholder = "Search logs...",
  className = ""
}: SearchWithAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate suggestions from logs
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const uniqueSuggestions = new Set<string>();

    logs.forEach(log => {
      // Add URL suggestions
      if (log.url.toLowerCase().includes(searchLower)) {
        uniqueSuggestions.add(log.url);
      }
      
      // Add alert name suggestions
      if (log.alert.toLowerCase().includes(searchLower)) {
        uniqueSuggestions.add(log.alert);
      }
      
      // Add description suggestions (first 50 chars)
      if (log.description.toLowerCase().includes(searchLower)) {
        const descSnippet = log.description.length > 50 
          ? log.description.substring(0, 50) + '...'
          : log.description;
        uniqueSuggestions.add(descSnippet);
      }
    });

    setSuggestions(Array.from(uniqueSuggestions).slice(0, 8)); // Limit to 8 suggestions
  }, [searchTerm, logs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    setShowSuggestions(true);
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-accent/20 text-accent font-semibold">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full p-2 rounded bg-[#101426] border border-[#222b44] text-white focus:outline-none focus:border-accent"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-[#1a1f33] border border-[#222b44] rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-3 py-2 cursor-pointer text-sm ${
                index === selectedIndex
                  ? 'bg-accent text-darkblue'
                  : 'text-gray-300 hover:bg-[#222b44]'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {highlightMatch(suggestion, searchTerm)}
            </div>
          ))}
        </div>
      )}
      
      {searchTerm && (
        <button
          onClick={() => {
            setSearchTerm('');
            onSearch('');
            setSuggestions([]);
            setShowSuggestions(false);
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
} 