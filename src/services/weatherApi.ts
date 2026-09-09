import { FullWeatherData, HourlyWeatherPoint, DailyWeatherPoint, LocationData } from '../types';
import { formatHourTime, formatDayName } from '../utils/weatherUtils';

export async function fetchWeatherData(
  location: LocationData,
  unit: 'celsius' | 'fahrenheit' = 'celsius'
): Promise<FullWeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', location.latitude.toString());
  url.searchParams.set('longitude', location.longitude.toString());
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,dew_point_2m'
  );
  url.searchParams.set(
    'hourly',
    'temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,is_day'
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max'
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch weather: ${res.statusText}`);
  }

  const raw = await res.json();
  const currentRaw = raw.current;
  const hourlyRaw = raw.hourly;
  const dailyRaw = raw.daily;

  // Calculate current dew point if not directly returned
  let curDewPoint = currentRaw.dew_point_2m;
  if (curDewPoint === undefined || curDewPoint === null) {
    // Magnus-Tetens approximation
    const T = currentRaw.temperature_2m;
    const RH = currentRaw.relative_humidity_2m;
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * T) / (b + T)) + Math.log(RH / 100.0);
    curDewPoint = Math.round(((b * alpha) / (a - alpha)) * 10) / 10;
  }

  // Parse hourly list: strictly today's graph from 12 AM today to 12 AM tomorrow
  const todayDateStr = dailyRaw.time[0]; // e.g. "2026-09-09"
  const tomorrowDateStr = dailyRaw.time[1] || todayDateStr; // e.g. "2026-09-10"

  const startTarget = `${todayDateStr}T00:00`;
  const endTarget = `${tomorrowDateStr}T00:00`;

  const times: string[] = hourlyRaw.time;
  let startIndex = times.findIndex((t) => t >= startTarget);
  if (startIndex === -1) startIndex = 0;

  let endIndex = times.findIndex((t) => t >= endTarget);
  if (endIndex === -1) {
    endIndex = Math.min(times.length - 1, startIndex + 24);
  }

  // Current hour prefix (e.g. "2026-09-09T14")
  const currentHourPrefix = currentRaw.time.slice(0, 13);

  const hourly: HourlyWeatherPoint[] = [];
  for (let i = startIndex; i <= endIndex && i < times.length; i++) {
    const isNow = times[i].startsWith(currentHourPrefix);
    const isTomorrowMidnight = i === endIndex || times[i].startsWith(`${tomorrowDateStr}T00:00`);

    let label = formatHourTime(times[i]);
    if (isTomorrowMidnight) {
      label = 'Tomorrow';
    }

    hourly.push({
      time: times[i],
      formattedTime: label,
      temperature: hourlyRaw.temperature_2m[i],
      apparentTemperature: hourlyRaw.apparent_temperature[i],
      dewPoint: hourlyRaw.dew_point_2m
        ? hourlyRaw.dew_point_2m[i]
        : hourlyRaw.temperature_2m[i] - (100 - hourlyRaw.relative_humidity_2m[i]) / 5,
      relativeHumidity: hourlyRaw.relative_humidity_2m[i],
      cloudCover: hourlyRaw.cloud_cover[i],
      precipitationProbability: hourlyRaw.precipitation_probability
        ? hourlyRaw.precipitation_probability[i]
        : 0,
      precipitation: hourlyRaw.precipitation[i],
      weatherCode: hourlyRaw.weather_code[i],
      isDay: hourlyRaw.is_day ? hourlyRaw.is_day[i] === 1 : true,
      windSpeed: hourlyRaw.wind_speed_10m[i],
      isCurrentHour: isNow,
    });
  }

  // Parse daily list
  const daily: DailyWeatherPoint[] = [];
  const dayDates: string[] = dailyRaw.time;
  for (let i = 0; i < dayDates.length; i++) {
    daily.push({
      date: dayDates[i],
      dayName: i === 0 ? 'Today' : formatDayName(dayDates[i]),
      weatherCode: dailyRaw.weather_code[i],
      tempMax: dailyRaw.temperature_2m_max[i],
      tempMin: dailyRaw.temperature_2m_min[i],
      sunrise: dailyRaw.sunrise[i] ? formatHourTime(dailyRaw.sunrise[i]) : '',
      sunset: dailyRaw.sunset[i] ? formatHourTime(dailyRaw.sunset[i]) : '',
      uvIndexMax: dailyRaw.uv_index_max ? dailyRaw.uv_index_max[i] : 0,
      precipitationSum: dailyRaw.precipitation_sum ? dailyRaw.precipitation_sum[i] : 0,
      precipitationProbabilityMax: dailyRaw.precipitation_probability_max ? dailyRaw.precipitation_probability_max[i] : 0,
    });
  }

  return {
    location,
    current: {
      time: currentRaw.time,
      temperature: currentRaw.temperature_2m,
      apparentTemperature: currentRaw.apparent_temperature,
      relativeHumidity: currentRaw.relative_humidity_2m,
      dewPoint: curDewPoint,
      cloudCover: currentRaw.cloud_cover,
      weatherCode: currentRaw.weather_code,
      isDay: currentRaw.is_day === 1,
      windSpeed: currentRaw.wind_speed_10m,
      windDirection: currentRaw.wind_direction_10m,
      surfacePressure: currentRaw.surface_pressure,
      precipitation: currentRaw.precipitation,
    },
    hourly,
    daily,
    temperatureUnit: unit,
  };
}

export async function searchLocations(query: string): Promise<LocationData[]> {
  if (!query || query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.results) return [];

  return data.results.map((r: any) => ({
    id: r.id,
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    country_code: r.country_code,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationData> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      return {
        name: data.city || data.locality || data.principalSubdivision || 'My Location',
        admin1: data.principalSubdivision,
        country: data.countryName || '',
        country_code: data.countryCode,
        latitude: lat,
        longitude: lon,
      };
    }
  } catch (err) {
    console.warn('Reverse geocode fallback:', err);
  }

  return {
    name: 'Current Location',
    country: '',
    latitude: lat,
    longitude: lon,
  };
}
