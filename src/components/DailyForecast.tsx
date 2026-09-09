import React from 'react';
import { DailyWeatherPoint } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { formatTemp } from '../utils/weatherUtils';
import { Calendar, Droplets } from 'lucide-react';

interface DailyForecastProps {
  daily: DailyWeatherPoint[];
  unit: 'celsius' | 'fahrenheit';
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, unit }) => {
  if (!daily || daily.length === 0) return null;

  // Global min and max across week for relative temperature bars
  let globalMin = Infinity;
  let globalMax = -Infinity;
  daily.forEach((d) => {
    if (d.tempMin < globalMin) globalMin = d.tempMin;
    if (d.tempMax > globalMax) globalMax = d.tempMax;
  });
  const tempSpan = Math.max(1, globalMax - globalMin);

  return (
    <div
      id="daily-forecast-container"
      className="w-full rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 text-white shadow-xl"
    >
      <div className="flex items-center justify-between pb-4 border-b border-white/15">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-300" />
          <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
            7-Day Forecast
          </h2>
        </div>
        <span className="text-xs text-white/60 font-medium">Temperature Outlook</span>
      </div>

      <div className="divide-y divide-white/10 mt-2">
        {daily.map((day, idx) => {
          // Calculate bar position
          const leftPercent = ((day.tempMin - globalMin) / tempSpan) * 100;
          const widthPercent = Math.max(8, ((day.tempMax - day.tempMin) / tempSpan) * 100);

          return (
            <div
              key={day.date}
              className="py-3 flex items-center justify-between gap-3 text-sm hover:bg-white/5 px-2 rounded-xl transition-colors"
            >
              {/* Day name */}
              <div className="w-24 sm:w-28 font-medium text-white truncate">
                {idx === 0 ? 'Today' : day.dayName}
              </div>

              {/* Icon & Rain prob */}
              <div className="flex items-center gap-2 w-20 justify-start">
                <WeatherIcon code={day.weatherCode} isDay={true} className="w-6 h-6" />
                {day.precipitationProbabilityMax > 15 && (
                  <span className="text-[11px] text-cyan-300 font-semibold flex items-center gap-0.5">
                    <Droplets className="w-3 h-3" />
                    {day.precipitationProbabilityMax}%
                  </span>
                )}
              </div>

              {/* Temp range bar */}
              <div className="flex-1 flex items-center gap-3">
                <span className="text-xs text-white/70 w-10 text-right font-medium">
                  {formatTemp(day.tempMin, unit)}
                </span>
                <div className="flex-1 h-2 rounded-full bg-black/30 relative overflow-hidden hidden sm:block">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400 opacity-90"
                    style={{
                      marginLeft: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-white font-semibold w-10 text-left">
                  {formatTemp(day.tempMax, unit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
