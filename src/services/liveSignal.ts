import { resolveCityCoords } from '../lib/cityGeo';
import type { WorldSignal } from '../types';

interface WeatherCurrent {
  temperature_2m?: number;
  relative_humidity_2m?: number;
  wind_speed_10m?: number;
  uv_index?: number;
}

interface AirCurrent {
  pm2_5?: number;
  us_aqi?: number;
}

/** 从 Open-Meteo 拉取指定城市的实时环境信号 */
export async function fetchLiveSignal(city: string): Promise<WorldSignal> {
  const { lat, lon } = await resolveCityCoords(city);

  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
  weatherUrl.searchParams.set('latitude', String(lat));
  weatherUrl.searchParams.set('longitude', String(lon));
  weatherUrl.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,uv_index');
  weatherUrl.searchParams.set('wind_speed_unit', 'kmh');
  weatherUrl.searchParams.set('timezone', 'auto');

  const airUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  airUrl.searchParams.set('latitude', String(lat));
  airUrl.searchParams.set('longitude', String(lon));
  airUrl.searchParams.set('current', 'pm2_5,us_aqi');
  airUrl.searchParams.set('timezone', 'auto');

  const [weatherRes, airRes] = await Promise.all([fetch(weatherUrl), fetch(airUrl)]);
  if (!weatherRes.ok) throw new Error(`Weather API failed (${weatherRes.status})`);
  if (!airRes.ok) throw new Error(`Air quality API failed (${airRes.status})`);

  const weather = await weatherRes.json() as { current?: WeatherCurrent };
  const air = await airRes.json() as { current?: AirCurrent };
  const w = weather.current ?? {};
  const a = air.current ?? {};

  return {
    city,
    aqi: Math.round(a.us_aqi ?? 0),
    pm25: Math.round((a.pm2_5 ?? 0) * 10) / 10,
    temp: Math.round((w.temperature_2m ?? 0) * 10) / 10,
    humidity: Math.round(w.relative_humidity_2m ?? 0),
    wind: Math.round((w.wind_speed_10m ?? 0) * 10) / 10,
    uv: Math.round((w.uv_index ?? 0) * 10) / 10,
    timestamp: Date.now(),
    source: 'open-meteo.com · Native HTTP',
  };
}
