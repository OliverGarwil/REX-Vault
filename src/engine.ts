import type { Vault, VaultCondition, WorldSignal, Artifact, VaultTheme } from './types';
import { VAULT_TYPES } from './templates';

export const DEMO_SIGNALS: { label: string; signal: WorldSignal }[] = [
  {
    label: 'Shanghai · hot smog',
    signal: {
      city: 'Shanghai', aqi: 142, pm25: 88, temp: 33, humidity: 78, wind: 12, uv: 7,
      timestamp: Date.now(), source: 'openaq.org/api/v3',
    },
  },
  {
    label: 'Tokyo · cool clear',
    signal: {
      city: 'Tokyo', aqi: 28, pm25: 18, temp: 19, humidity: 55, wind: 8, uv: 4,
      timestamp: Date.now(), source: 'openaq.org/api/v3',
    },
  },
  {
    label: 'Hong Kong · humid',
    signal: {
      city: 'Hong Kong', aqi: 65, pm25: 42, temp: 19, humidity: 92, wind: 10, uv: 3,
      timestamp: Date.now(), source: 'noaa.gov/tides',
    },
  },
  {
    label: 'Dubai · dry heat',
    signal: {
      city: 'Dubai', aqi: 88, pm25: 55, temp: 41, humidity: 24, wind: 18, uv: 11,
      timestamp: Date.now(), source: 'noaa.gov/heat',
    },
  },
  {
    label: 'San Francisco · coastal',
    signal: {
      city: 'San Francisco', aqi: 32, pm25: 15, temp: 16, humidity: 88, wind: 14, uv: 5,
      timestamp: Date.now(), source: 'noaa.gov/coastal',
    },
  },
  {
    label: 'Mumbai · extreme',
    signal: {
      city: 'Mumbai', aqi: 168, pm25: 95, temp: 36, humidity: 70, wind: 72, uv: 9,
      timestamp: Date.now(), source: 'extreme-events.net',
    },
  },
];

export const THEMES = Object.fromEntries(
  Object.entries(VAULT_TYPES).map(([k, v]) => [k, { name: v.name, desc: v.desc, baseHue: 0 }])
) as Record<VaultTheme, { name: string; desc: string; baseHue: number }>;

export function fakeHash(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const hex = (h >>> 0).toString(16).padStart(8, '0');
  return `0x${hex}${hex}${hex}${hex}`.slice(0, 42);
}

export function getSignalValue(signal: WorldSignal, field: VaultCondition['field']): number {
  return signal[field];
}

export function evaluateCondition(c: VaultCondition, signal: WorldSignal): boolean {
  const v = getSignalValue(signal, c.field);
  switch (c.op) {
    case '>': return v > c.value;
    case '<': return v < c.value;
    case '=': return v === c.value;
    case '>=': return v >= c.value;
    case '<=': return v <= c.value;
  }
}

export function evaluateVault(vault: Vault, signal: WorldSignal): boolean {
  if (!vault.conditions.length) return false;
  if (vault.conditionLogic === 'any') {
    return vault.conditions.some(c => evaluateCondition(c, signal));
  }
  return vault.conditions.every(c => evaluateCondition(c, signal));
}

export function previewConditionHits(vault: Vault, signal: WorldSignal): boolean[] {
  return vault.conditions.map(c => evaluateCondition(c, signal));
}

export function generateArtifact(vault: Vault, signal: WorldSignal): Artifact {
  const hashSeed = `${vault.id}|${signal.city}|${JSON.stringify(signal)}|${Date.now()}`;
  const hashNum = parseInt(fakeHash(hashSeed).slice(2, 10), 16);

  const bias = vault.theme === 'storm' ? 12 : 0;
  const rarityRoll = (hashNum + bias) % 100;
  const rarity = rarityRoll < 8 ? 'legendary' : rarityRoll < 22 ? 'epic' : rarityRoll < 50 ? 'rare' : 'common';

  const themeIdx = Object.keys(VAULT_TYPES).indexOf(vault.theme);
  const hue = (themeIdx * 55 + (hashNum % 30)) % 360;
  const saturation = 45 + (hashNum % 35);
  const lightness = 22 + (hashNum % 18);

  const patterns: Artifact['pattern'][] = ['grid', 'wave', 'burst', 'mist'];
  const pattern = patterns[(hashNum + themeIdx) % 4];

  return {
    id: `A${Date.now()}`,
    vaultId: vault.id,
    rarity,
    hue,
    saturation,
    lightness,
    pattern,
    seed: hashNum,
    triggeredSignal: {
      city: signal.city,
      aqi: signal.aqi,
      pm25: signal.pm25,
      temp: signal.temp,
      humidity: signal.humidity,
      wind: signal.wind,
      uv: signal.uv,
    },
  };
}

export function createVault(
  name: string,
  theme: VaultTheme,
  city: string,
  conditions: VaultCondition[],
  conditionLogic: Vault['conditionLogic'],
): Vault {
  const hash = fakeHash(`${name}|${theme}|${city}|${conditionLogic}|${Date.now()}`);
  return {
    id: `V${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    name,
    theme,
    createdAt: Date.now(),
    city,
    conditions,
    conditionLogic,
    encrypted: true,
    encryptionHash: hash,
    status: 'sealed',
  };
}

export function countHits(vault: Vault, signal: WorldSignal): number {
  return previewConditionHits(vault, signal).filter(Boolean).length;
}
