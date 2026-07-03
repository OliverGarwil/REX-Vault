import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Vault, Artifact, WorldSignal, VaultCondition, VaultTheme, ConditionLogic } from './types';
import { createVault, evaluateVault, generateArtifact, DEMO_SIGNALS } from './engine';

interface Store {
  vaults: Vault[];
  createVault: (
    name: string,
    theme: VaultTheme,
    city: string,
    conditions: VaultCondition[],
    conditionLogic: ConditionLogic,
  ) => string;
  triggerVault: (vaultId: string, signal: WorldSignal) => { hit: boolean; artifact?: Artifact };
  getDemoSignals: () => typeof DEMO_SIGNALS;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [vaults, setVaults] = useState<Vault[]>([]);

  const createVaultFn: Store['createVault'] = (name, theme, city, conditions, conditionLogic) => {
    const vault = createVault(name, theme, city, conditions, conditionLogic);
    setVaults(prev => [...prev, vault]);
    return vault.id;
  };

  const triggerVault: Store['triggerVault'] = (vaultId, signal) => {
    let result = { hit: false, artifact: undefined as Artifact | undefined };
    setVaults(prev => prev.map(v => {
      if (v.id !== vaultId || v.status !== 'sealed') return v;
      const hit = evaluateVault(v, signal);
      if (!hit) return { ...v, status: 'triggered' as const, triggeredAt: Date.now() };
      const artifact = generateArtifact(v, signal);
      result = { hit: true, artifact };
      return {
        ...v,
        status: 'opened' as const,
        triggeredAt: Date.now(),
        artifact,
      };
    }));
    return result;
  };

  return (
    <Ctx.Provider value={{ vaults, createVault: createVaultFn, triggerVault, getDemoSignals: () => DEMO_SIGNALS }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be inside StoreProvider');
  return s;
}
