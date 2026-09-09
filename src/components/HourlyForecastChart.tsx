import React, { useState, useMemo, useEffect } from 'react';
import { HourlyWeatherPoint } from '../types';
import { WeatherIcon } from './WeatherIcon';
import {
  formatTemp,
  formatTempValueOnly,
  getHeatIndexCategory,
  getDewPointComfort,
} from '../utils/weatherUtils';
import {
  Thermometer,
  Flame,
  Droplets,
  Cloud,
  ChevronRight,
  TrendingUp,
  Info,
} from 'lucide-react';

interface HourlyForecastChartProps {
  hourly: HourlyWeatherPoint[];
  unit: 'celsius' | 'fahrenheit';
}

export const HourlyForecastChart: React.FC<HourlyForecastChartProps> = ({
  hourly,
  unit,
}) => {
  const [activeTab, setActiveTab] = useState<'temp' | 'dew_humidity' | 'clouds'>('temp');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Display all points for today (12 AM today to 12 AM tomorrow)
  const displayHours = useMemo(() => hourly, [hourly]);

  // Find index of current hour
  const currentHourIndex = useMemo(() => {
    return displayHours.findIndex((h) => h.isCurrentHour);
  }, [displayHours]);

  // Default hoveredIndex to current hour if available
  useEffect(() => {
    if (currentHourIndex >= 0) {
      setHoveredIndex(currentHourIndex);
    }
  }, [currentHourIndex]);

  // Calculate min & max for scale
  const { minTemp, maxTemp, tempRange } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    displayHours.forEach((h) => {
      const t = formatTempValueOnly(h.temperature, unit);
      const app = formatTempValueOnly(h.apparentTemperature, unit);
      const dp = formatTempValueOnly(h.dewPoint, unit);
      min = Math.min(min, t, app, dp);
      max = Math.max(max, t, app, dp);
    });

    // Add margin
    const range = Math.max(max - min, 4);
    return {
      minTemp: min - 2,
      maxTemp: max + 2,
      tempRange: range + 4,
    };
  }, [displayHours, unit]);

  // SVG Chart coordinate mapping
  const chartWidth = 860;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const points = useMemo(() => {
    return displayHours.map((h, index) => {
      const x = paddingX + (index / (displayHours.length - 1)) * usableWidth;
      const tVal = formatTempValueOnly(h.temperature, unit);
      const appVal = formatTempValueOnly(h.apparentTemperature, unit);
      const dpVal = formatTempValueOnly(h.dewPoint, unit);

      const yTemp =
        chartHeight -
        paddingY -
        ((tVal - minTemp) / tempRange) * usableHeight;
      const yApp =
        chartHeight -
        paddingY -
        ((appVal - minTemp) / tempRange) * usableHeight;
      const yDew =
        chartHeight -
        paddingY -
        ((dpVal - minTemp) / tempRange) * usableHeight;

      // Cloud cover is 0-100%
      const yCloud = chartHeight - paddingY - (h.cloudCover / 100) * usableHeight;
      // Humidity is 0-100%
      const yHumidity = chartHeight - paddingY - (h.relativeHumidity / 100) * usableHeight;

      return {
        x,
        yTemp,
        yApp,
        yDew,
        yCloud,
        yHumidity,
        data: h,
        tVal,
        appVal,
        dpVal,
      };
    });
  }, [displayHours, unit, minTemp, tempRange, usableWidth, usableHeight]);

  // Build SVG path strings
  const tempPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yTemp}`, '');
  }, [points]);

  const feelsLikePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yApp}`, '');
  }, [points]);

  const dewPointPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yDew}`, '');
  }, [points]);

  const cloudPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yCloud}`, '');
  }, [points]);

  const humidityPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yHumidity}`, '');
  }, [points]);

  const tempAreaPath = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = chartHeight - paddingY;
    return `${tempPath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
  }, [tempPath, points]);

  const selectedPoint = hoveredIndex !== null ? points[hoveredIndex] : points[0];

  return (
    <div
      id="hourly-forecast-container"
      className="w-full rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 text-white shadow-xl"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/15">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-300" />
              <span>Today's Hourly Forecast</span>
            </h2>
          </div>
          <p className="text-xs text-white/70 mt-0.5">
            Hourly progression with dew point, humidity, and heat index dotted line
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-black/25 p-1 rounded-xl border border-white/15 backdrop-blur-md self-start sm:self-auto text-xs">
          <button
            id="tab-temp-feels"
            onClick={() => setActiveTab('temp')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'temp'
                ? 'bg-white/25 text-white shadow-sm border border-white/30'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-white" />
            <span>Temp & Feels Like</span>
          </button>
          <button
            id="tab-dew-humidity"
            onClick={() => setActiveTab('dew_humidity')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'dew_humidity'
                ? 'bg-white/25 text-white shadow-sm border border-white/30'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-cyan-300" />
            <span>Dew Point & Humidity</span>
          </button>
          <button
            id="tab-clouds"
            onClick={() => setActiveTab('clouds')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'clouds'
                ? 'bg-white/25 text-white shadow-sm border border-white/30'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-slate-300" />
            <span>Cloudiness %</span>
          </button>
        </div>
      </div>

      {/* Chart Legend with explicit Dotted Line visual guide */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-1 text-xs text-white/80">
        <div className="flex flex-wrap items-center gap-4">
          {activeTab === 'temp' && (
            <>
              {/* Actual Temp */}
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-white rounded-full inline-block" />
                <span className="text-white font-medium">Actual Temp</span>
              </div>
              {/* Feels Like Dotted Line (Heat Index) */}
              <div className="flex items-center gap-2">
                <span className="w-7 h-0 border-t-2 border-dashed border-amber-400 inline-block" />
                <span className="text-amber-300 font-semibold flex items-center gap-1">
                  <span>Feels Like (Dotted Line / Heat Index)</span>
                </span>
              </div>
              {/* Dew Point reference */}
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-cyan-400/80 rounded-full inline-block" />
                <span className="text-cyan-300 font-medium">Dew Point</span>
              </div>
            </>
          )}

          {activeTab === 'dew_humidity' && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-cyan-400 rounded-full inline-block" />
                <span className="text-cyan-300 font-medium">Dew Point</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-0 border-t-2 border-dashed border-blue-300 inline-block" />
                <span className="text-blue-300 font-medium">Relative Humidity (%)</span>
              </div>
            </>
          )}

          {activeTab === 'clouds' && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-slate-200 rounded-full inline-block" />
                <span className="text-slate-200 font-medium">Cloudiness Cover (%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-0 border-t-2 border-dashed border-sky-300 inline-block" />
                <span className="text-sky-300 font-medium">Precipitation Probability (%)</span>
              </div>
            </>
          )}
        </div>

        {/* Hover inspection readout */}
        {selectedPoint && (
          <div className="bg-black/30 px-3 py-1 rounded-lg border border-white/20 text-xs flex items-center gap-3 backdrop-blur-md">
            <span className="font-semibold text-white">{selectedPoint.data.formattedTime}:</span>
            <span className="text-white">Temp: {selectedPoint.tVal}°{unit === 'fahrenheit' ? 'F' : 'C'}</span>
            <span className="text-amber-300 font-medium">
              Feels: {selectedPoint.appVal}°{unit === 'fahrenheit' ? 'F' : 'C'}
            </span>
            <span className="text-cyan-300 font-medium">
              Dew: {selectedPoint.dpVal}°{unit === 'fahrenheit' ? 'F' : 'C'}
            </span>
            <span className="text-slate-300 font-medium">
              Cloud: {selectedPoint.data.cloudCover}%
            </span>
            <span className="text-blue-300 font-medium">
              Humidity: {selectedPoint.data.relativeHumidity}%
            </span>
          </div>
        )}
      </div>

      {/* Interactive SVG Chart */}
      <div className="w-full mt-2 relative overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 sm:h-52 select-none overflow-visible"
        >
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="cloudGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={chartWidth - paddingX}
            y2={paddingY}
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={chartHeight / 2}
            x2={chartWidth - paddingX}
            y2={chartHeight / 2}
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            stroke="rgba(255,255,255,0.18)"
          />

          {/* Tab 1: Temperature & Feels Like (Dotted) */}
          {activeTab === 'temp' && (
            <>
              {/* Fill under actual temp */}
              <path d={tempAreaPath} fill="url(#tempGradient)" />

              {/* Dew Point Line */}
              <path
                d={dewPointPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.8"
              />

              {/* Actual Temp Line (Solid White) */}
              <path
                d={tempPath}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* FEELS LIKE / HEAT INDEX DOTTED LINE (Requested explicitly: dotted line) */}
              <path
                d={feelsLikePath}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.75"
                strokeDasharray="5 4"
                strokeLinecap="round"
              />

              {/* Interactive points */}
              {points.map((p, idx) => (
                <g key={`pt-${idx}`}>
                  {/* Actual temp dot */}
                  <circle
                    cx={p.x}
                    cy={p.yTemp}
                    r={hoveredIndex === idx ? 5 : 3}
                    fill="#ffffff"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                  {/* Feels like dot */}
                  <circle
                    cx={p.x}
                    cy={p.yApp}
                    r={hoveredIndex === idx ? 5 : 2.5}
                    fill="#fbbf24"
                    stroke="#78350f"
                    strokeWidth="1.5"
                  />
                </g>
              ))}
            </>
          )}

          {/* Tab 2: Dew Point & Humidity */}
          {activeTab === 'dew_humidity' && (
            <>
              {/* Dew Point line */}
              <path
                d={dewPointPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Humidity line (dotted) */}
              <path
                d={humidityPath}
                fill="none"
                stroke="#93c5fd"
                strokeWidth="2.5"
                strokeDasharray="5 4"
                strokeLinecap="round"
              />

              {points.map((p, idx) => (
                <g key={`pt-dew-${idx}`}>
                  <circle
                    cx={p.x}
                    cy={p.yDew}
                    r={hoveredIndex === idx ? 5 : 3}
                    fill="#38bdf8"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={p.x}
                    cy={p.yHumidity}
                    r={hoveredIndex === idx ? 5 : 3}
                    fill="#93c5fd"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                </g>
              ))}
            </>
          )}

          {/* Tab 3: Cloudiness % */}
          {activeTab === 'clouds' && (
            <>
              <path
                d={cloudPath}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {points.map((p, idx) => (
                <circle
                  key={`pt-cloud-${idx}`}
                  cx={p.x}
                  cy={p.yCloud}
                  r={hoveredIndex === idx ? 5 : 3}
                  fill="#e2e8f0"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              ))}
            </>
          )}

          {/* Active hover crosshair */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <g>
              <line
                x1={points[hoveredIndex].x}
                y1={paddingY}
                x2={points[hoveredIndex].x}
                y2={chartHeight - paddingY}
                stroke="rgba(255,255,255,0.4)"
                strokeDasharray="2 2"
              />
            </g>
          )}

          {/* Current Hour Indicator */}
          {currentHourIndex >= 0 && points[currentHourIndex] && (
            <g>
              <line
                x1={points[currentHourIndex].x}
                y1={paddingY}
                x2={points[currentHourIndex].x}
                y2={chartHeight - paddingY}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <rect
                x={points[currentHourIndex].x - 18}
                y={paddingY - 14}
                width={36}
                height={15}
                rx={4}
                fill="#0284c7"
              />
              <text
                x={points[currentHourIndex].x}
                y={paddingY - 3}
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                NOW
              </text>
            </g>
          )}

          {/* Horizontal Hour Ticks along bottom */}
          {points.map((p, idx) => {
            // Show label every 3 hours or for first & last point
            if (idx % 3 !== 0 && idx !== points.length - 1) return null;
            return (
              <text
                key={`tick-${idx}`}
                x={p.x}
                y={chartHeight - 8}
                fill="rgba(255,255,255,0.6)"
                fontSize="10"
                textAnchor="middle"
                fontWeight="500"
              >
                {p.data.formattedTime.replace(' (Tomorrow)', '')}
              </text>
            );
          })}

          {/* Invisible hover scrub slices */}
          {points.map((p, idx) => {
            const sliceWidth = usableWidth / (points.length - 1);
            return (
              <rect
                key={`hit-${idx}`}
                x={p.x - sliceWidth / 2}
                y={0}
                width={sliceWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            );
          })}
        </svg>
      </div>

      {/* Hourly Strip Cards Carousel with All Metrics */}
      <div className="mt-4 pt-3 border-t border-white/15">
        <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Hourly Forecast Timeline</span>
          <span className="text-white/50 text-[11px] font-normal">Click any hour to inspect exact heat index & dew point</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-white/20">
          {displayHours.map((hour, idx) => {
            const isHovered = hoveredIndex === idx;
            const heatInfo = getHeatIndexCategory(hour.apparentTemperature);
            return (
              <button
                key={hour.time}
                onClick={() => setHoveredIndex(idx)}
                onMouseEnter={() => setHoveredIndex(idx)}
                className={`flex-shrink-0 w-24 p-2.5 rounded-xl text-center transition-all border relative ${
                  isHovered
                    ? 'bg-white/25 border-white shadow-lg scale-102'
                    : 'bg-black/20 hover:bg-black/30 border-white/10'
                } ${hour.isCurrentHour ? 'ring-2 ring-cyan-400/80' : ''}`}
              >
                {/* Now Badge */}
                {hour.isCurrentHour && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-cyan-500 text-slate-950 font-extrabold text-[9px] rounded-full uppercase shadow">
                    Now
                  </span>
                )}

                {/* Time */}
                <div className="text-xs font-semibold text-white mt-0.5">{hour.formattedTime}</div>

                {/* Weather Icon */}
                <div className="my-1.5 flex justify-center">
                  <WeatherIcon code={hour.weatherCode} isDay={hour.isDay} className="w-7 h-7" />
                </div>

                {/* Actual Temp */}
                <div className="text-sm font-bold text-white">
                  {formatTemp(hour.temperature, unit)}
                </div>

                {/* Feels like (Heat Index) with dotted indicator styling */}
                <div className="text-[11px] text-amber-300 font-medium mt-0.5 flex items-center justify-center gap-0.5" title="Feels Like (Heat Index)">
                  <Flame className="w-2.5 h-2.5" />
                  <span>{formatTemp(hour.apparentTemperature, unit)}</span>
                </div>

                {/* Dew Point */}
                <div className="text-[10px] text-cyan-300 mt-1 flex items-center justify-center gap-0.5" title="Dew Point">
                  <Droplets className="w-2.5 h-2.5" />
                  <span>{formatTemp(hour.dewPoint, unit)}</span>
                </div>

                {/* Relative Humidity & Cloud Cover */}
                <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-around text-[10px] text-white/70">
                  <span title={`Humidity: ${hour.relativeHumidity}%`}>{hour.relativeHumidity}% RH</span>
                  <span title={`Cloudiness: ${hour.cloudCover}%`}>{hour.cloudCover}% ☁</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
