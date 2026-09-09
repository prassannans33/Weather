import React from 'react';
import { CurrentWeather, DailyWeatherPoint } from '../types';
import {
  formatTemp,
  getDewPointComfort,
  getHeatIndexCategory,
} from '../utils/weatherUtils';
import {
  Droplets,
  Flame,
  Cloud,
  Wind,
  Compass,
  SunMedium,
  Sunrise,
  Sunset,
  Gauge,
  Eye,
  ShieldAlert,
} from 'lucide-react';

interface WeatherMetricsGridProps {
  current: CurrentWeather;
  todayDaily?: DailyWeatherPoint;
  unit: 'celsius' | 'fahrenheit';
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({
  current,
  todayDaily,
  unit,
}) => {
  const dewInfo = getDewPointComfort(current.dewPoint);
  const heatInfo = getHeatIndexCategory(current.apparentTemperature);

  // Compass direction name
  const getWindDirectionName = (deg: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(deg / 22.5) % 16;
    return directions[idx];
  };

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="weather-metrics-grid">
      {/* 1. Dew Point Deep Dive */}
      <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex items-center justify-between text-white/75 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-300" />
              <span>Dew Point Metric</span>
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
              {dewInfo.level}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold tracking-tight text-white">
              {formatTemp(current.dewPoint, unit)}
            </div>
            <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
              {dewInfo.description}. Dew point is the temperature to which air must be cooled to become saturated with water vapor.
            </p>
          </div>
        </div>

        {/* Comfort spectrum indicator */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between text-[10px] text-white/60 mb-1">
            <span>Dry (&lt;10°)</span>
            <span>Comfort (15°)</span>
            <span>Muggy (21°+)</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/20 relative overflow-hidden flex">
            <div className="h-full bg-cyan-300 flex-1" />
            <div className="h-full bg-emerald-400 flex-1" />
            <div className="h-full bg-amber-400 flex-1" />
            <div className="h-full bg-rose-400 flex-1" />
          </div>
        </div>
      </div>

      {/* 2. Feels Like / Heat Index */}
      <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex items-center justify-between text-white/75 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Feels Like (Heat Index)</span>
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${heatInfo.bgClass}`}>
              {heatInfo.category}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold tracking-tight text-amber-200">
              {formatTemp(current.apparentTemperature, unit)}
            </div>
            <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
              Calculated using the combined effects of air temperature, humidity, and wind chill factor.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/70 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {current.apparentTemperature > current.temperature
              ? `Feels ${Math.round(current.apparentTemperature - current.temperature)}° warmer due to moisture`
              : `Feels ${Math.round(current.temperature - current.apparentTemperature)}° cooler with air motion`}
          </span>
        </div>
      </div>

      {/* 3. Relative Humidity & Moisture */}
      <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex items-center justify-between text-white/75 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-blue-300" />
              <span>Relative Humidity</span>
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30">
              {current.relativeHumidity > 70 ? 'High Moisture' : current.relativeHumidity < 35 ? 'Arid Air' : 'Optimal'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold tracking-tight text-white">
              {current.relativeHumidity}%
            </div>
            <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
              Current water vapor pressure relative to maximum capacity at current air temperature.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between text-[10px] text-white/60 mb-1">
            <span>0% Arid</span>
            <span>50% Ideal</span>
            <span>100% Saturation</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-300 transition-all duration-700"
              style={{ width: `${current.relativeHumidity}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Cloudiness & Atmospheric Sky */}
      <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex items-center justify-between text-white/75 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-slate-200" />
              <span>Cloudiness Coverage</span>
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
              {current.cloudCover}% Sky Cover
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold tracking-tight text-white">
              {current.cloudCover}%
            </div>
            <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
              Modulates the website atmospheric background from vibrant blue to overcast grey in daytime, and cosmic purple to dark grey at night.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
          <span>Sky Condition:</span>
          <span className="font-semibold text-white">
            {current.cloudCover < 20
              ? 'Clear Horizon'
              : current.cloudCover < 60
              ? 'Scattered Stratus'
              : 'Overcast Deck'}
          </span>
        </div>
      </div>

      {/* 5. Wind Velocity & Direction */}
      <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-white/75 text-xs font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-teal-300" />
            <span>Wind & Gusts</span>
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30">
            {getWindDirectionName(current.windDirection)} ({current.windDirection}°)
          </span>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-white/20 bg-black/20 flex items-center justify-center relative">
            <Compass className="w-8 h-8 text-white/40 absolute" />
            <div
              className="w-1 h-6 bg-teal-300 rounded-full transform origin-bottom transition-transform duration-700"
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-white">
              {Math.round(current.windSpeed)} <span className="text-sm font-normal text-white/70">km/h</span>
            </div>
            <div className="text-xs text-white/70">
              Direction: {getWindDirectionName(current.windDirection)} ({current.windDirection}°)
            </div>
          </div>
        </div>
      </div>

      {/* 6. Surface Barometric Pressure */}
      <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-white/75 text-xs font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-indigo-300" />
            <span>Atmospheric Pressure</span>
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-white">
            {Math.round(current.surfacePressure || 1013)} <span className="text-sm font-normal text-white/70">hPa</span>
          </div>
          <p className="text-xs text-white/70 mt-1">
            {(current.surfacePressure || 1013) > 1015
              ? 'High pressure system (Stable, calm conditions)'
              : (current.surfacePressure || 1013) < 1005
              ? 'Low pressure system (Precipitation possible)'
              : 'Standard nominal sea-level pressure'}
          </p>
        </div>
      </div>

      {/* 7. UV Index Max */}
      <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-white/75 text-xs font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <SunMedium className="w-4 h-4 text-amber-300" />
            <span>Daily UV Index</span>
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-white">
            {todayDaily?.uvIndexMax ? Math.round(todayDaily.uvIndexMax) : 'Low'}
          </div>
          <p className="text-xs text-white/70 mt-1">
            {(todayDaily?.uvIndexMax || 0) > 8
              ? 'Very High: Protection required against sun exposure'
              : (todayDaily?.uvIndexMax || 0) > 5
              ? 'Moderate: Seek shade during midday hours'
              : 'Minimal danger for average person'}
          </p>
        </div>
      </div>

      {/* 8. Sun Cycle (Sunrise / Sunset) */}
      <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-white/75 text-xs font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sunrise className="w-4 h-4 text-amber-300" />
            <span>Solar Cycle</span>
          </span>
          <Sunset className="w-4 h-4 text-rose-300" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-white/60 block">Sunrise</span>
            <span className="text-lg font-bold text-amber-200">{todayDaily?.sunrise || '06:15 AM'}</span>
          </div>
          <div>
            <span className="text-xs text-white/60 block">Sunset</span>
            <span className="text-lg font-bold text-rose-200">{todayDaily?.sunset || '07:45 PM'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
