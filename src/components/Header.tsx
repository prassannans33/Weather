import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, RefreshCw, Building2, Check } from 'lucide-react';
import { LocationData } from '../types';
import { searchLocations } from '../services/weatherApi';

interface HeaderProps {
  currentLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  onUseCurrentLocation: () => void;
  isLoadingLocation: boolean;
  unit: 'celsius' | 'fahrenheit';
  onToggleUnit: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  cloudCover: number;
  isDay: boolean;
}

// User specified only Bangalore and Chennai as the 2 home locations
export const MAIN_LOCATIONS: LocationData[] = [
  {
    name: 'Bangalore',
    admin1: 'Karnataka',
    country: 'India',
    country_code: 'IN',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    name: 'Chennai',
    admin1: 'Tamil Nadu',
    country: 'India',
    country_code: 'IN',
    latitude: 12.9941,
    longitude: 80.1709,
  },
];

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  onUseCurrentLocation,
  isLoadingLocation,
  unit,
  onToggleUnit,
  onRefresh,
  isRefreshing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search autocomplete debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (loc: LocationData) => {
    onSelectLocation(loc);
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <header className="w-full pt-4 pb-2 px-4 sm:px-6 max-w-7xl mx-auto" id="main-header">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand, Active Location & Dedicated Bangalore / Chennai Airport Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentLocation.name}
                </h1>
                {currentLocation.country && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white/90">
                    {currentLocation.country_code || currentLocation.country}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/75 font-medium mt-0.5">
                {currentLocation.admin1 ? `${currentLocation.admin1} • ` : ''}
                {currentLocation.latitude.toFixed(2)}°N, {currentLocation.longitude.toFixed(2)}°E
              </p>
            </div>
          </div>

          {/* Primary Home Locations: Bangalore & Chennai */}
          <div className="flex items-center bg-black/35 p-1 rounded-2xl border border-white/20 backdrop-blur-xl shadow-lg self-start sm:self-auto">
            {MAIN_LOCATIONS.map((city) => {
              const isSelected =
                Math.abs(city.latitude - currentLocation.latitude) < 0.05 &&
                Math.abs(city.longitude - currentLocation.longitude) < 0.05;
              return (
                <button
                  key={city.name}
                  id={`btn-location-${city.name.toLowerCase().replace(/[^a-z]/g, '')}`}
                  onClick={() => handleSelect(city)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md border border-white/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-cyan-300'}`} />
                  <span>{city.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search, GPS, Unit toggle & Refresh */}
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2.5">
          {/* Search Box for any place */}
          <div ref={searchRef} className="relative flex-1 sm:w-64">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-white/60 absolute left-3 pointer-events-none" />
              <input
                id="search-city-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsOpen(true);
                }}
                placeholder="Search other cities..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-black/25 hover:bg-black/35 focus:bg-black/50 text-white placeholder-white/50 rounded-xl border border-white/20 focus:border-cyan-400 focus:outline-none backdrop-blur-md transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
            </div>

            {/* Dropdown results */}
            {isOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/95 border border-white/20 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 divide-y divide-white/10 max-h-72 overflow-y-auto">
                {searchResults.map((loc, idx) => (
                  <button
                    key={`${loc.latitude}-${loc.longitude}-${idx}`}
                    onClick={() => handleSelect(loc)}
                    className="w-full px-3.5 py-2.5 text-left text-xs sm:text-sm text-white hover:bg-white/10 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-medium text-white">{loc.name}</span>
                      {loc.admin1 && <span className="text-white/60 text-xs ml-1">({loc.admin1})</span>}
                      <span className="text-white/50 text-[11px] block">{loc.country}</span>
                    </div>
                    <span className="text-[11px] text-white/40 font-mono">
                      {loc.latitude.toFixed(1)}°, {loc.longitude.toFixed(1)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPS Location Button */}
          <button
            id="btn-use-gps"
            onClick={onUseCurrentLocation}
            disabled={isLoadingLocation}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-medium bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 text-white backdrop-blur-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Use Device GPS Location"
          >
            <Navigation className={`w-4 h-4 text-cyan-300 ${isLoadingLocation ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">GPS</span>
          </button>

          {/* Refresh Button */}
          <button
            id="btn-refresh-weather"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 text-white backdrop-blur-md transition-all disabled:opacity-50"
            title="Refresh weather data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Unit Switcher */}
          <div className="flex bg-black/30 p-0.5 rounded-xl border border-white/20 backdrop-blur-md">
            <button
              id="unit-celsius-btn"
              onClick={() => {
                if (unit !== 'celsius') onToggleUnit();
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                unit === 'celsius'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              id="unit-fahrenheit-btn"
              onClick={() => {
                if (unit !== 'fahrenheit') onToggleUnit();
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                unit === 'fahrenheit'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              °F
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
