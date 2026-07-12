/** 城市坐标缓存，避免重复 geocoding 请求 */
const coordCache = new Map<string, { lat: number; lon: number }>();

export async function resolveCityCoords(city: string): Promise<{ lat: number; lon: number }> {
  const key = city.trim();
  const cached = coordCache.get(key);
  if (cached) return cached;

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(key)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);

  const data = await res.json() as { results?: { latitude: number; longitude: number }[] };
  const hit = data.results?.[0];
  if (!hit) throw new Error(`City not found: ${key}`);

  const coords = { lat: hit.latitude, lon: hit.longitude };
  coordCache.set(key, coords);
  return coords;
}
