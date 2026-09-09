// Weather utilities, WMO codes, mathematical color interpolators and comfort metrics

export interface WeatherConditionInfo {
  label: string;
  iconName: string;
}

export function getWeatherCondition(code: number, isDay: boolean = true): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Clear Sky' : 'Clear Night',
        iconName: isDay ? 'Sun' : 'Moon',
      };
    case 1:
      return {
        label: isDay ? 'Mainly Clear' : 'Mostly Clear',
        iconName: isDay ? 'SunMedium' : 'Moon',
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
      };
    case 3:
      return {
        label: 'Overcast',
        iconName: 'Cloud',
      };
    case 45:
      return {
        label: 'Foggy',
        iconName: 'CloudFog',
      };
    case 48:
      return {
        label: 'Depositing Rime Fog',
        iconName: 'CloudFog',
      };
    case 51:
      return {
        label: 'Light Drizzle',
        iconName: 'CloudDrizzle',
      };
    case 53:
      return {
        label: 'Moderate Drizzle',
        iconName: 'CloudDrizzle',
      };
    case 55:
      return {
        label: 'Dense Drizzle',
        iconName: 'CloudDrizzle',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        iconName: 'CloudHail',
      };
    case 61:
      return {
        label: 'Slight Rain',
        iconName: 'CloudRain',
      };
    case 63:
      return {
        label: 'Moderate Rain',
        iconName: 'CloudRain',
      };
    case 65:
      return {
        label: 'Heavy Rain',
        iconName: 'CloudRain',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        iconName: 'CloudHail',
      };
    case 71:
      return {
        label: 'Slight Snow',
        iconName: 'Snowflake',
      };
    case 73:
      return {
        label: 'Moderate Snow',
        iconName: 'Snowflake',
      };
    case 75:
      return {
        label: 'Heavy Snowfall',
        iconName: 'Snowflake',
      };
    case 77:
      return {
        label: 'Snow Grains',
        iconName: 'Snowflake',
      };
    case 80:
      return {
        label: 'Slight Rain Showers',
        iconName: 'CloudRain',
      };
    case 81:
      return {
        label: 'Moderate Showers',
        iconName: 'CloudRain',
      };
    case 82:
      return {
        label: 'Violent Rain Showers',
        iconName: 'CloudRain',
      };
    case 85:
      return {
        label: 'Slight Snow Showers',
        iconName: 'CloudSnow',
      };
    case 86:
      return {
        label: 'Heavy Snow Showers',
        iconName: 'CloudSnow',
      };
    case 95:
      return {
        label: 'Thunderstorm',
        iconName: 'CloudLightning',
      };
    case 96:
    case 99:
      return {
        label: 'Thunderstorm with Hail',
        iconName: 'CloudLightning',
      };
    default:
      return {
        label: 'Variable Clouds',
        iconName: 'Cloud',
      };
  }
}

/**
 * Calculates dynamic background styling based on user location cloudiness (0 to 100%) and day/night.
 * Requirement:
 * - Daytime: Blue (0% cloud) to Grey (100% cloud)
 * - Nighttime: Purple (0% cloud) to Grey (100% cloud)
 */
export interface AtmosphericSkyTheme {
  backgroundCss: string;
  gradientTop: string;
  gradientMid: string;
  gradientBottom: string;
  overlayStyle: string;
  cloudCoverText: string;
  description: string;
  accentBorder: string;
  pillBg: string;
}

function lerpColor(c1: [number, number, number], c2: [number, number, number], factor: number): [number, number, number] {
  const f = Math.max(0, Math.min(1, factor));
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * f),
    Math.round(c1[1] + (c2[1] - c1[1]) * f),
    Math.round(c1[2] + (c2[2] - c1[2]) * f),
  ];
}

function rgbStr(c: [number, number, number]): string {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function getAtmosphericTheme(cloudCover: number, isDay: boolean): AtmosphericSkyTheme {
  const clampedCloud = Math.max(0, Math.min(100, cloudCover));
  const t = clampedCloud / 100;

  // Day Colors:
  // Clear Day (t=0): Radiant Azure / Sky Blue
  // Overcast Day (t=1): Cool Slate Grey / Muted Overcast
  const dayClearTop: [number, number, number] = [30, 114, 196]; // Deep sky blue
  const dayClearMid: [number, number, number] = [59, 140, 235]; // Azure blue
  const dayClearBot: [number, number, number] = [125, 185, 245]; // Soft light blue

  const dayOvercastTop: [number, number, number] = [51, 65, 85]; // Slate 700
  const dayOvercastMid: [number, number, number] = [71, 85, 105]; // Slate 600
  const dayOvercastBot: [number, number, number] = [100, 116, 139]; // Slate 500

  // Night Colors:
  // Clear Night (t=0): Cosmic Indigo & Royal Purple
  // Overcast Night (t=1): Deep Foggy Charcoal Dark Grey
  const nightClearTop: [number, number, number] = [24, 18, 56]; // Dark purple-indigo
  const nightClearMid: [number, number, number] = [59, 15, 95]; // Deep purple
  const nightClearBot: [number, number, number] = [88, 28, 135]; // Royal purple glow

  const nightOvercastTop: [number, number, number] = [15, 23, 42]; // Slate 900
  const nightOvercastMid: [number, number, number] = [30, 41, 59]; // Slate 800
  const nightOvercastBot: [number, number, number] = [51, 65, 85]; // Slate 700

  const topColor = isDay ? lerpColor(dayClearTop, dayOvercastTop, t) : lerpColor(nightClearTop, nightOvercastTop, t);
  const midColor = isDay ? lerpColor(dayClearMid, dayOvercastMid, t) : lerpColor(nightClearMid, nightOvercastMid, t);
  const botColor = isDay ? lerpColor(dayClearBot, dayOvercastBot, t) : lerpColor(nightClearBot, nightOvercastBot, t);

  const topStr = rgbStr(topColor);
  const midStr = rgbStr(midColor);
  const botStr = rgbStr(botColor);

  const backgroundCss = `linear-gradient(175deg, ${topStr} 0%, ${midStr} 50%, ${botStr} 100%)`;

  let cloudCoverText = 'Clear';
  if (clampedCloud > 85) cloudCoverText = 'Overcast';
  else if (clampedCloud > 60) cloudCoverText = 'Mostly Cloudy';
  else if (clampedCloud > 30) cloudCoverText = 'Partly Cloudy';
  else if (clampedCloud > 10) cloudCoverText = 'Scattered Clouds';

  const description = isDay
    ? `${cloudCoverText} Sky (${clampedCloud}%) • Day Blue to Grey`
    : `${cloudCoverText} Night (${clampedCloud}%) • Night Purple to Grey`;

  return {
    backgroundCss,
    gradientTop: topStr,
    gradientMid: midStr,
    gradientBottom: botStr,
    overlayStyle: isDay ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.25)',
    cloudCoverText,
    description,
    accentBorder: isDay
      ? `rgba(255, 255, 255, ${0.2 + (1 - t) * 0.15})`
      : `rgba(216, 180, 254, ${0.2 + (1 - t) * 0.2})`,
    pillBg: isDay
      ? `rgba(255, 255, 255, 0.22)`
      : `rgba(147, 51, 234, 0.25)`,
  };
}

/**
 * Dew point comfort description
 */
export function getDewPointComfort(dewPointC: number): {
  level: string;
  description: string;
  colorClass: string;
} {
  if (dewPointC < 10) {
    return { level: 'Dry / Crisp', description: 'Very low moisture, dry feel', colorClass: 'text-cyan-300' };
  }
  if (dewPointC <= 15) {
    return { level: 'Comfortable', description: 'Pleasant, optimal moisture level', colorClass: 'text-emerald-300' };
  }
  if (dewPointC <= 18) {
    return { level: 'Moderate', description: 'Noticeable moisture in the air', colorClass: 'text-blue-300' };
  }
  if (dewPointC <= 21) {
    return { level: 'Humid / Muggy', description: 'Getting uncomfortable & sticky', colorClass: 'text-amber-300' };
  }
  if (dewPointC <= 24) {
    return { level: 'Very Humid', description: 'Oppressive moisture & sweat accumulation', colorClass: 'text-orange-400' };
  }
  return { level: 'Severely Oppressive', description: 'Tropical, miserable humidity level', colorClass: 'text-rose-400' };
}

/**
 * Heat Index / Feels Like warning category
 */
export function getHeatIndexCategory(apparentTempC: number): {
  category: string;
  cautionLevel: 'normal' | 'caution' | 'extreme_caution' | 'danger';
  colorClass: string;
  bgClass: string;
} {
  if (apparentTempC < 27) {
    return {
      category: 'Comfortable Range',
      cautionLevel: 'normal',
      colorClass: 'text-emerald-300',
      bgClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    };
  }
  if (apparentTempC <= 32) {
    return {
      category: 'Caution',
      cautionLevel: 'caution',
      colorClass: 'text-yellow-300',
      bgClass: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
    };
  }
  if (apparentTempC <= 41) {
    return {
      category: 'Extreme Caution',
      cautionLevel: 'extreme_caution',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
    };
  }
  return {
    category: 'Danger / Extreme Heat',
    cautionLevel: 'danger',
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
  };
}

export function formatTemp(tempC: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') {
    const f = Math.round((tempC * 9) / 5 + 32);
    return `${f}°F`;
  }
  return `${Math.round(tempC)}°C`;
}

export function formatTempValueOnly(tempC: number, unit: 'celsius' | 'fahrenheit'): number {
  if (unit === 'fahrenheit') {
    return Math.round((tempC * 9) / 5 + 32);
  }
  return Math.round(tempC);
}

export function formatHourTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
  } catch {
    return isoString.slice(11, 16);
  }
}

export function formatDayName(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return isoDate;
  }
}
