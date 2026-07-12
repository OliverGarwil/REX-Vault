import type { VaultTheme, VaultCondition, ConditionField, ConditionLogic } from './types';

export const FIELD_META: Record<ConditionField, { label: string; unit: string; hint: string }> = {
  aqi: { label: 'AQI', unit: '', hint: '0–500' },
  pm25: { label: 'PM2.5', unit: 'μg/m³', hint: '' },
  temp: { label: '温度', unit: '°C', hint: '' },
  humidity: { label: '湿度', unit: '%', hint: '0–100' },
  wind: { label: '风速', unit: 'km/h', hint: '' },
  uv: { label: 'UV 指数', unit: '', hint: '0–11' },
};

export interface VaultTypeTemplate {
  id: VaultTheme;
  name: string;
  category: string;
  desc: string;
  dataSource: string;
  triggerHint: string;
  defaultLogic: ConditionLogic;
  defaultConditions: VaultCondition[];
  recommendedCities: string[];
}

export const VAULT_TYPES: Record<VaultTheme, VaultTypeTemplate> = {
  neon: {
    id: 'neon',
    name: 'Neon Smog Vault',
    category: 'Urban air',
    desc: 'Opens when pollution and heat spike together.',
    dataSource: 'OpenAQ',
    triggerHint: 'Industrial summer days',
    defaultLogic: 'all',
    defaultConditions: [
      { field: 'aqi', op: '>', value: 120 },
      { field: 'pm25', op: '>', value: 75 },
      { field: 'temp', op: '>', value: 30 },
    ],
    recommendedCities: ['Shanghai', 'Beijing', 'Delhi'],
  },
  ruin: {
    id: 'ruin',
    name: 'Ruin Dust Vault',
    category: 'Dry inland',
    desc: 'Dry air, low wind, light haze.',
    dataSource: 'WMO',
    triggerHint: 'Inland dry cities',
    defaultLogic: 'all',
    defaultConditions: [
      { field: 'humidity', op: '<', value: 45 },
      { field: 'wind', op: '<', value: 15 },
      { field: 'aqi', op: '>', value: 60 },
    ],
    recommendedCities: ['Dubai', 'Cairo', 'Phoenix'],
  },
  pulse: {
    id: 'pulse',
    name: 'Pulse Heat Vault',
    category: 'Extreme heat',
    desc: 'Hot, sunny, and dry.',
    dataSource: 'NOAA',
    triggerHint: 'Heat wave days',
    defaultLogic: 'all',
    defaultConditions: [
      { field: 'temp', op: '>', value: 35 },
      { field: 'uv', op: '>', value: 8 },
      { field: 'humidity', op: '<', value: 40 },
    ],
    recommendedCities: ['Dubai', 'Phoenix', 'Las Vegas'],
  },
  void: {
    id: 'void',
    name: 'Void Calm Vault',
    category: 'Quiet band',
    desc: 'Clean air, mild temps, low UV.',
    dataSource: 'Environmental monitoring',
    triggerHint: 'Rare clear days',
    defaultLogic: 'all',
    defaultConditions: [
      { field: 'aqi', op: '<', value: 35 },
      { field: 'temp', op: '>', value: 15 },
      { field: 'temp', op: '<', value: 28 },
      { field: 'uv', op: '<', value: 5 },
    ],
    recommendedCities: ['Tokyo', 'Vancouver', 'Zurich'],
  },
  tide: {
    id: 'tide',
    name: 'Tide Mist Vault',
    category: 'Coastal',
    desc: 'Humid, calm wind, cool.',
    dataSource: 'NOAA Coastal',
    triggerHint: 'Port cities',
    defaultLogic: 'all',
    defaultConditions: [
      { field: 'humidity', op: '>', value: 85 },
      { field: 'wind', op: '<', value: 20 },
      { field: 'temp', op: '<', value: 22 },
    ],
    recommendedCities: ['Hong Kong', 'San Francisco', 'Shanghai'],
  },
  storm: {
    id: 'storm',
    name: 'Storm Edge Vault',
    category: 'Extreme',
    desc: 'Any extreme metric triggers; higher rarity bias.',
    dataSource: 'Multi-source',
    triggerHint: 'OR logic',
    defaultLogic: 'any',
    defaultConditions: [
      { field: 'aqi', op: '>', value: 150 },
      { field: 'wind', op: '>', value: 60 },
      { field: 'uv', op: '>', value: 10 },
      { field: 'temp', op: '>', value: 40 },
    ],
    recommendedCities: ['Shanghai', 'Mumbai', 'Miami'],
  },
};

export const VAULT_TYPE_LIST = Object.values(VAULT_TYPES);

export const CITIES = [
  'Shanghai', 'Beijing', 'Tokyo', 'Hong Kong', 'Dubai',
  'San Francisco', 'Vancouver', 'Zurich', 'Mumbai', 'Miami',
];

export const LOGIC_LABEL: Record<ConditionLogic, string> = {
  all: '全部满足（AND）',
  any: '任一满足（OR）',
};

export function cloneConditions(list: VaultCondition[]): VaultCondition[] {
  return list.map(c => ({ ...c }));
}
