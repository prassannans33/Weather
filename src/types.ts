export interface LocationData {
  id?: number;
  name: string;
  admin1?: string;
  country: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number; // Feels like / Heat Index
  relativeHumidity: number;
  dewPoint: number;
  cloudCover: number; // Cloudiness in %
  weatherCode: number;
  isDay: boolean;
  windSpeed: number;
  windDirection: number;
  surfacePressure: number;
  precipitation: number;
}

export interface HourlyWeatherPoint {
  time: string;
  formattedTime: string;
  temperature: number;
  apparentTemperature: number; // Feels like (dotted line)
  dewPoint: number;
  relativeHumidity: number;
  cloudCover: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  windSpeed: number;
  isCurrentHour?: boolean;
}

export interface DailyWeatherPoint {
  date: string;
  dayName: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
}

export interface FullWeatherData {
  location: LocationData;
  current: CurrentWeather;
  hourly: HourlyWeatherPoint[];
  daily: DailyWeatherPoint[];
  temperatureUnit: 'celsius' | 'fahrenheit';
}
