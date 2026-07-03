import { useState } from 'react';
import { StoreProvider } from './store';
import { VaultWall } from './pages/VaultWall';
import { CreateVault } from './pages/CreateVault';
import { VaultDetail } from './pages/VaultDetail';

export type View =
  | { kind: 'wall' }
  | { kind: 'create' }
  | { kind: 'detail'; vaultId: string };

export function App() {
  const [view, setView] = useState<View>({ kind: 'wall' });

  return (
    <StoreProvider>
      <div className="app">
        <header className="topbar">
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => setView({ kind: 'wall' })}>
            <div className="brand-mark">
              <img src="/rialo-mark.svg" alt="Rialo" />
            </div>
            <div className="brand-text">
              <b>REX Vault</b>
              <span>Rialo</span>
            </div>
          </div>
          <div className="topbar-right">
            <span className="tag"><span className="dot" /> Testnet</span>
          </div>
        </header>

        {view.kind === 'wall' && (
          <VaultWall
            onOpen={(id) => setView({ kind: 'detail', vaultId: id })}
            onCreate={() => setView({ kind: 'create' })}
          />
        )}
        {view.kind === 'create' && (
          <CreateVault
            onCreated={(id) => setView({ kind: 'detail', vaultId: id })}
            onCancel={() => setView({ kind: 'wall' })}
          />
        )}
        {view.kind === 'detail' && (
          <VaultDetail
            vaultId={view.vaultId}
            onBack={() => setView({ kind: 'wall' })}
          />
        )}
      </div>
    </StoreProvider>
  );
}
