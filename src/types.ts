export type VaultTheme = 'neon' | 'ruin' | 'pulse' | 'void' | 'tide' | 'storm';

export type ConditionField = 'aqi' | 'temp' | 'humidity' | 'pm25' | 'wind' | 'uv';

export type ConditionLogic = 'all' | 'any';

export interface VaultCondition {
  field: ConditionField;
  op: '>' | '<' | '=' | '>=' | '<=';
  value: number;
}

export interface Vault {
  id: string;
  name: string;
  theme: VaultTheme;
  createdAt: number;
  city: string;
  conditions: VaultCondition[];
  conditionLogic: ConditionLogic;
  encrypted: boolean;
  encryptionHash: string;
  status: 'sealed' | 'triggered' | 'opened' | 'minted';
  triggeredAt?: number;
  artifact?: Artifact;
}

export interface Artifact {
  id: string;
  vaultId: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  hue: number;
  saturation: number;
  lightness: number;
  pattern: 'grid' | 'wave' | 'burst' | 'mist';
  seed: number;
  triggeredSignal: WorldSignalSnapshot;
}

export interface WorldSignalSnapshot {
  city: string;
  aqi: number;
  pm25: number;
  temp: number;
  humidity: number;
  wind: number;
  uv: number;
}

export interface WorldSignal extends WorldSignalSnapshot {
  timestamp: number;
  source: string;
}

export interface ExecStep {
  num: number;
  title: string;
  desc: string;
  duration: number;
}
