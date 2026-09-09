import React from 'react';
import { CurrentWeather, DailyWeatherPoint } from '../types';
import { WeatherIcon } from './WeatherIcon';
import {
  formatTemp,
  getWeatherCondition,
  getHeatIndexCategory,
  getDewPointComfort,
} from '../utils/weatherUtils';
import {
  Thermometer,
  Flame,
  Droplets,
  Cloud,
  ArrowUp,
  ArrowDown,
  Wind,
  Gauge,
} from 'lucide-react';

interface CurrentWeatherCardProps {
  current: CurrentWeather;
  todayDaily?: DailyWeatherPoint;
  unit: 'celsius' | 'fahrenheit';
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  current,
  todayDaily,
  unit,
}) => {
  const condition = getWeatherCondition(current.weatherCode, current.isDay);
  const heatIndex = getHeatIndexCategory(current.apparentTemperature);
  const dewComfort = getDewPointComfort(current.dewPoint);

  return (
    <div
      id="current-weather-card"
      className="w-full rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-7 text-white shadow-xl relative overflow-hidden"
    >
      {/* Subtle atmospheric glow backdrop */}
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Temperature & Main Condition */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/15 border border-white/25 shadow-inner backdrop-blur-md">
              <WeatherIcon
                code={current.weatherCode}
                isDay={current.isDay}
                className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md"
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tighter drop-shadow-sm font-sans">
                  {formatTemp(current.temperature, unit)}
                </span>
              </div>
              <p className="text-lg sm:text-xl font-medium text-white/95 mt-1 flex items-center gap-2">
                <span>{condition.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 border border-white/25 font-normal">
                  {current.isDay ? 'Day' : 'Night'}
                </span>
              </p>
              {todayDaily && (
                <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80 mt-1.5 font-medium">
                  <span className="flex items-center gap-0.5 text-emerald-300">
                    <ArrowUp className="w-3.5 h-3.5" /> High: {formatTemp(todayDaily.tempMax, unit)}
                  </span>
                  <span className="flex items-center gap-0.5 text-sky-200">
                    <ArrowDown className="w-3.5 h-3.5" /> Low: {formatTemp(todayDaily.tempMin, unit)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: The 4 Core Targeted Metrics (Feels Like, Dew Point, Rel Humidity, Cloudiness) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/15 lg:pl-6">
          {/* Feels Like (Heat Index) */}
          <div
            id="metric-feels-like"
            className="p-3.5 rounded-xl bg-black/20 hover:bg-black/25 border border-white/15 backdrop-blur-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-white/75 text-xs">
              <span className="font-medium">Feels Like</span>
              <Flame className="w-4 h-4 text-amber-300" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold tracking-tight text-white">
                {formatTemp(current.apparentTemperature, unit)}
              </div>
              <div className="mt-1 flex items-center">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${heatIndex.bgClass}`}
                >
                  {heatIndex.category}
                </span>
              </div>
            </div>
          </div>

          {/* Dew Point */}
          <div
            id="metric-dew-point"
            className="p-3.5 rounded-xl bg-black/20 hover:bg-black/25 border border-white/15 backdrop-blur-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-white/75 text-xs">
              <span className="font-medium">Dew Point</span>
              <Droplets className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold tracking-tight text-white">
                {formatTemp(current.dewPoint, unit)}
              </div>
              <div className="mt-1">
                <span className={`text-[11px] font-medium block truncate ${dewComfort.colorClass}`}>
                  {dewComfort.level}
                </span>
              </div>
            </div>
          </div>

          {/* Relative Humidity */}
          <div
            id="metric-rel-humidity"
            className="p-3.5 rounded-xl bg-black/20 hover:bg-black/25 border border-white/15 backdrop-blur-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-white/75 text-xs">
              <span className="font-medium">Rel. Humidity</span>
              <Gauge className="w-4 h-4 text-blue-300" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold tracking-tight text-white">
                {current.relativeHumidity}%
              </div>
              {/* Mini progress bar */}
              <div className="w-full bg-white/15 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-300 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, current.relativeHumidity))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cloudiness */}
          <div
            id="metric-cloudiness"
            className="p-3.5 rounded-xl bg-black/20 hover:bg-black/25 border border-white/15 backdrop-blur-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-white/75 text-xs">
              <span className="font-medium">Cloudiness</span>
              <Cloud className="w-4 h-4 text-slate-200" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold tracking-tight text-white">
                {current.cloudCover}%
              </div>
              <div className="w-full bg-white/15 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-slate-200 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, current.cloudCover))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
