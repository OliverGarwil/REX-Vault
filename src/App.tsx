import { lazy, Suspense, useState } from 'react';
import { StoreProvider } from './store';
import { PageShell } from './components/PageShell';

const VaultWall = lazy(() => import('./pages/VaultWall').then(m => ({ default: m.VaultWall })));
const CreateVault = lazy(() => import('./pages/CreateVault').then(m => ({ default: m.CreateVault })));
const VaultDetail = lazy(() => import('./pages/VaultDetail').then(m => ({ default: m.VaultDetail })));

export type View =
  | { kind: 'wall' }
  | { kind: 'create' }
  | { kind: 'detail'; vaultId: string };

const VIEW_TITLE: Record<View['kind'], string> = {
  wall: 'REX Vault',
  create: '创建 Vault',
  detail: 'Vault 详情',
};

function PageFallback() {
  return (
    <main className="page">
      <div className="page-loading">
        <div className="page-loading-spinner" />
        <span>加载中…</span>
      </div>
    </main>
  );
}

export function App() {
  const [view, setView] = useState<View>({ kind: 'wall' });

  return (
    <StoreProvider>
      <div className="app">
        <header className="topbar">
          <div className="brand" onClick={() => setView({ kind: 'wall' })} role="button" tabIndex={0}>
            <div className="brand-mark">
              <img src="/rialo-mark.svg" alt="Rialo" />
            </div>
            <div className="brand-text">
              <b>REX Vault</b>
              <span>Rialo · 环境触发盲盒</span>
            </div>
          </div>
          <div className="topbar-right">
            <span className="topbar-crumb">{VIEW_TITLE[view.kind]}</span>
            <span className="tag tag-live"><span className="dot dot-pulse" /> 实时 API</span>
          </div>
        </header>

        <Suspense fallback={<PageFallback />}>
          {view.kind === 'wall' && (
            <PageShell key="wall">
              <VaultWall
                onOpen={(id) => setView({ kind: 'detail', vaultId: id })}
                onCreate={() => setView({ kind: 'create' })}
              />
            </PageShell>
          )}
          {view.kind === 'create' && (
            <PageShell key="create">
              <CreateVault
                onCreated={(id) => setView({ kind: 'detail', vaultId: id })}
                onCancel={() => setView({ kind: 'wall' })}
              />
            </PageShell>
          )}
          {view.kind === 'detail' && (
            <PageShell key={`detail-${view.vaultId}`}>
              <VaultDetail
                vaultId={view.vaultId}
                onBack={() => setView({ kind: 'wall' })}
              />
            </PageShell>
          )}
        </Suspense>
      </div>
    </StoreProvider>
  );
}
