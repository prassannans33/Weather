import React from 'react';
import {
  Sun,
  Moon,
  SunMedium,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudHail,
  Snowflake,
  Wind,
  Droplets,
  ThermometerSun,
  ThermometerSnowflake,
} from 'lucide-react';
import { getWeatherCondition } from '../utils/weatherUtils';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  className = 'w-6 h-6',
  size,
}) => {
  const info = getWeatherCondition(code, isDay);
  const iconProps = { className, size };

  switch (info.iconName) {
    case 'Sun':
      return <Sun {...iconProps} className={`${className} text-amber-300 animate-spin-slow`} />;
    case 'Moon':
      return <Moon {...iconProps} className={`${className} text-indigo-200`} />;
    case 'SunMedium':
      return <SunMedium {...iconProps} className={`${className} text-amber-300`} />;
    case 'CloudSun':
      return <CloudSun {...iconProps} className={`${className} text-amber-200`} />;
    case 'CloudMoon':
      return <CloudMoon {...iconProps} className={`${className} text-indigo-300`} />;
    case 'Cloud':
      return <Cloud {...iconProps} className={`${className} text-slate-200`} />;
    case 'CloudFog':
      return <CloudFog {...iconProps} className={`${className} text-slate-300`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle {...iconProps} className={`${className} text-cyan-300`} />;
    case 'CloudRain':
      return <CloudRain {...iconProps} className={`${className} text-blue-300`} />;
    case 'CloudLightning':
      return <CloudLightning {...iconProps} className={`${className} text-yellow-300`} />;
    case 'CloudSnow':
      return <CloudSnow {...iconProps} className={`${className} text-sky-200`} />;
    case 'CloudHail':
      return <CloudHail {...iconProps} className={`${className} text-teal-200`} />;
    case 'Snowflake':
      return <Snowflake {...iconProps} className={`${className} text-sky-200`} />;
    case 'Wind':
      return <Wind {...iconProps} className={`${className} text-teal-300`} />;
    default:
      return <Cloud {...iconProps} className={`${className} text-slate-300`} />;
  }
};

export {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  ThermometerSun,
  ThermometerSnowflake,
};
