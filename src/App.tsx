import React, { useState, useEffect, useCallback } from 'react';
import { LocationData, FullWeatherData } from './types';
import { fetchWeatherData, reverseGeocode } from './services/weatherApi';
import { getAtmosphericTheme } from './utils/weatherUtils';
import { Header, MAIN_LOCATIONS } from './components/Header';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { HourlyForecastChart } from './components/HourlyForecastChart';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { DailyForecast } from './components/DailyForecast';
import { AlertCircle } from 'lucide-react';

// Default to Bangalore (one of the 2 primary home locations)
const DEFAULT_LOCATION: LocationData = MAIN_LOCATIONS[0];

export default function App() {
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState<FullWeatherData | null>(null);
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load weather data for given location
  const loadWeather = useCallback(
    async (loc: LocationData, currentUnit: 'celsius' | 'fahrenheit' = unit) => {
      setError(null);
      try {
        const data = await fetchWeatherData(loc, currentUnit);
        setWeatherData(data);
      } catch (err: any) {
        console.error('Weather load error:', err);
        setError(err.message || 'Unable to load real-time forecast data. Please try again.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [unit]
  );

  // Initial load
  useEffect(() => {
    loadWeather(DEFAULT_LOCATION, unit);
  }, []);

  // Use GPS current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const geoLoc = await reverseGeocode(latitude, longitude);
        setLocation(geoLoc);
        await loadWeather(geoLoc, unit);
        setIsLoadingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('Could not retrieve device location. You can select Bangalore or Chennai Airport above.');
        setIsLoadingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  // Handle location selection from Bangalore/Chennai switcher or search
  const handleSelectLocation = (loc: LocationData) => {
    setLocation(loc);
    setIsLoading(true);
    loadWeather(loc, unit);
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadWeather(location, unit);
  };

  // Unit toggle
  const handleToggleUnit = () => {
    const nextUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
    setUnit(nextUnit);
  };

  // Compute dynamic atmospheric sky theme strictly based on current location's live cloudiness & day/night
  // Daytime: Blue to Grey | Nighttime: Purple to Grey
  const liveCloudCover = weatherData?.current.cloudCover ?? 25;
  const liveIsDay = weatherData?.current.isDay ?? true;
  const skyTheme = getAtmosphericTheme(liveCloudCover, liveIsDay);

  return (
    <div
      id="app-root"
      className="min-h-screen text-slate-100 font-sans relative transition-colors duration-1000 ease-in-out selection:bg-white/30"
      style={{
        background: skyTheme.backgroundCss,
      }}
    >
      {/* Ambient background depth lights that shift with atmosphere */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 15%, ${skyTheme.gradientMid} 0%, transparent 65%)`,
        }}
      />

      {/* Top Navigation & Location Switcher */}
      <Header
        currentLocation={location}
        onSelectLocation={handleSelectLocation}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLoadingLocation={isLoadingLocation}
        unit={unit}
        onToggleUnit={handleToggleUnit}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        cloudCover={liveCloudCover}
        isDay={liveIsDay}
      />

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 relative z-10">
        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-400/30 backdrop-blur-md text-white flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && !weatherData ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Loading Meteorology Data...</h3>
              <p className="text-xs text-white/70">
                Fetching hourly temperature, heat index dotted line, dew point & humidity
              </p>
            </div>
          </div>
        ) : weatherData ? (
          <>
            {/* 1. Primary Current Weather Hero Card */}
            <CurrentWeatherCard
              current={weatherData.current}
              todayDaily={weatherData.daily[0]}
              unit={unit}
            />

            {/* 2. Hourly Forecast Chart: Heat Index Dotted Line, Dew Point & Relative Humidity */}
            <HourlyForecastChart
              hourly={weatherData.hourly}
              unit={unit}
            />

            {/* 3. Comprehensive Weather Metrics Grid */}
            <WeatherMetricsGrid
              current={weatherData.current}
              todayDaily={weatherData.daily[0]}
              unit={unit}
            />

            {/* 4. 7-Day Extended Forecast */}
            <DailyForecast
              daily={weatherData.daily}
              unit={unit}
            />
          </>
        ) : null}

        {/* Footer */}
        <footer className="pt-8 pb-10 text-center text-xs text-white/60 space-y-1.5 border-t border-white/10">
          <p className="font-semibold text-white/85">
            Personal Weather Dashboard • Bangalore & Chennai
          </p>
          <p>
            Hourly Forecast • Feels Like (Heat Index) Dotted Line • Dew Point & Relative Humidity
          </p>
        </footer>
      </main>
    </div>
  );
}
