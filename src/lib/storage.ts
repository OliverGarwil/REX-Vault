import type { Vault } from '../types';

const KEY = 'rex-vault:vaults';

/** 从 localStorage 读取 Vault 列表 */
export function loadVaults(): Vault[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Vault[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** 持久化 Vault 列表 */
export function saveVaults(vaults: Vault[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(vaults));
  } catch {
    // 存储满或隐私模式时静默失败
  }
}
