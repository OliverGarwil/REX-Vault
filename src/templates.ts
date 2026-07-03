import type { VaultTheme, VaultCondition, ConditionField, ConditionLogic } from './types';

export const FIELD_META: Record<ConditionField, { label: string; unit: string; hint: string }> = {
  aqi: { label: 'AQI', unit: '', hint: '0–500' },
  pm25: { label: 'PM2.5', unit: 'μg/m³', hint: '' },
  temp: { label: '温度', unit: '°C', hint: '' },
  humidity: { label: '湿度', unit: '%', hint: '0–100' },
  wind: { label: '风速', unit: 'km/h', hint: '' },
  uv: { label: 'UV', unit: '', hint: '0–11' },
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
    name: '霓虹污染匣',
    category: '城市大气',
    desc: '污染加高温一起出现才开。',
    dataSource: 'OpenAQ',
    triggerHint: '工业城市夏天',
    defaultLogic: 'all',
    defaultConditions: [
      { field: 'aqi', op: '>', value: 120 },
      { field: 'pm25', op: '>', value: 75 },
      { field: 'temp', op: '>', value: 30 },
    ],
    recommendedCities: ['上海', '北京', '德里'],
  },
  ruin: {
    id: 'ruin',
    name: '遗迹尘埃匣',
    category: '干燥内陆',
    desc: '干、风小、有点灰。',
    dataSource: 'WMO',
    triggerHint: '内陆干燥城市',
    defaultLogic: 'all',
    defaultConditions: [
      { field: 'humidity', op: '<', value: 45 },
      { field: 'wind', op: '<', value: 15 },
      { field: 'aqi', op: '>', value: 60 },
    ],
    recommendedCities: ['迪拜', '开罗', '凤凰城'],
  },
  pulse: {
    id: 'pulse',
    name: '脉冲热浪匣',
    category: '高温',
    desc: '热、晒、干。',
    dataSource: 'NOAA',
    triggerHint: '热浪天',
    defaultLogic: 'all',
    defaultConditions: [
      { field: 'temp', op: '>', value: 35 },
      { field: 'uv', op: '>', value: 8 },
      { field: 'humidity', op: '<', value: 40 },
    ],
    recommendedCities: ['迪拜', '凤凰城', '拉斯维加斯'],
  },
  void: {
    id: 'void',
    name: '虚空寂静匣',
    category: '安静区间',
    desc: '空气干净、温度适中、UV 不高。',
    dataSource: '环境监测',
    triggerHint: '难得的好天气',
    defaultLogic: 'all',
    defaultConditions: [
      { field: 'aqi', op: '<', value: 35 },
      { field: 'temp', op: '>', value: 15 },
      { field: 'temp', op: '<', value: 28 },
      { field: 'uv', op: '<', value: 5 },
    ],
    recommendedCities: ['东京', '温哥华', '苏黎世'],
  },
  tide: {
    id: 'tide',
    name: '潮汐迷雾匣',
    category: '沿海',
    desc: '湿、风小、不太热。',
    dataSource: 'NOAA 沿海',
    triggerHint: '港口城市',
    defaultLogic: 'all',
    defaultConditions: [
      { field: 'humidity', op: '>', value: 85 },
      { field: 'wind', op: '<', value: 20 },
      { field: 'temp', op: '<', value: 22 },
    ],
    recommendedCities: ['香港', '旧金山', '上海'],
  },
  storm: {
    id: 'storm',
    name: '风暴临界匣',
    category: '极端',
    desc: '任一极端指标命中就开，稀有度偏高。',
    dataSource: '多源',
    triggerHint: 'OR 逻辑',
    defaultLogic: 'any',
    defaultConditions: [
      { field: 'aqi', op: '>', value: 150 },
      { field: 'wind', op: '>', value: 60 },
      { field: 'uv', op: '>', value: 10 },
      { field: 'temp', op: '>', value: 40 },
    ],
    recommendedCities: ['上海', '孟买', '迈阿密'],
  },
};

export const VAULT_TYPE_LIST = Object.values(VAULT_TYPES);

export const CITIES = [
  '上海', '北京', '东京', '香港', '迪拜', '旧金山', '温哥华', '苏黎世', '孟买', '迈阿密',
];

export const LOGIC_LABEL: Record<ConditionLogic, string> = {
  all: '全部满足（AND）',
  any: '任一满足（OR）',
};

export function cloneConditions(list: VaultCondition[]): VaultCondition[] {
  return list.map(c => ({ ...c }));
}
