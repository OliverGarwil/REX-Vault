import { useStore } from '../store';
import { VAULT_TYPES } from '../templates';
import { useLiveSignal } from '../hooks/useLiveSignal';
import { LiveSignalPanel } from '../components/LiveSignalPanel';
import { ArtifactPreview } from '../components/ArtifactPreview';

interface Props {
  onOpen: (id: string) => void;
  onCreate: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  sealed: '已封存',
  triggered: '已触发',
  opened: '已开启',
  minted: '已铸造',
};

const STATUS_CLASS: Record<string, string> = {
  sealed: 'status-sealed',
  triggered: 'status-triggered',
  opened: 'status-opened',
  minted: 'status-minted',
};

const DEMO_CITY = 'Shanghai';

export function VaultWall({ onOpen, onCreate }: Props) {
  const { vaults } = useStore();
  const live = useLiveSignal(DEMO_CITY, 30_000);

  return (
    <main className="page page-wide">
      <section className="hero">
        <span className="hero-badge">Rialo Demo</span>
        <h1 className="hero-title">REX Vault</h1>
        <p className="hero-lead">
          用<strong>真实环境数据</strong>触发链上盲盒。条件写在 Rialo 上，数据走 Native HTTP 进来，
          Reactive 负责唤醒，REX 里跑规则和稀有度，外面只能看到开盒结果。
        </p>
        <div className="hero-actions">
          <button type="button" className="btn primary" onClick={onCreate}>创建盲盒</button>
          {vaults.length > 0 && (
            <button type="button" className="btn ghost" onClick={() => onOpen(vaults[0].id)}>查看最近</button>
          )}
        </div>
      </section>

      <section className="section">
        <LiveSignalPanel
          city={DEMO_CITY}
          signal={live.signal}
          history={live.history}
          loading={live.loading}
          error={live.error}
          lastUpdated={live.lastUpdated}
          pollSec={30}
          onRefresh={live.refresh}
          compact
        />
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">怎么跑通</div>
        </div>
        <div className="principle-panel panel">
          <div className="principle-flow">
            <div className="principle-node">
              <h4>1. 拉数据</h4>
              <p>AQI、温度、湿度等</p>
              <span className="principle-badge">Native HTTP</span>
            </div>
            <div className="principle-arrow">→</div>
            <div className="principle-node">
              <h4>2. 对条件</h4>
              <p>链上规则匹配</p>
              <span className="principle-badge">Reactive</span>
            </div>
            <div className="principle-arrow">→</div>
            <div className="principle-node">
              <h4>3. 算结果</h4>
              <p>规则和稀有度在 REX 里算</p>
              <span className="principle-badge">REX</span>
            </div>
            <div className="principle-arrow">→</div>
            <div className="principle-node">
              <h4>4. 开盒</h4>
              <p>生成 Artifact</p>
            </div>
          </div>
          <div className="principle-note">
            建好盲盒之后不用盯着数据，也不用自己写 Bot。条件到了，链上自己走。
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">Rialo 能力</div>
        </div>
        <div className="platform-grid">
          <div className="platform-item">
            <span className="platform-num">01</span>
            <h4>Reactive</h4>
            <p>条件满足自动执行，无需链下轮询或签名 Bot。</p>
          </div>
          <div className="platform-item">
            <span className="platform-num">02</span>
            <h4>Native HTTP</h4>
            <p>合约直接调 OpenAQ、NOAA 等 API，减少 Oracle 层。</p>
          </div>
          <div className="platform-item">
            <span className="platform-num">03</span>
            <h4>REX</h4>
            <p>阈值和规则加密上链，外人只能看到开箱结果。</p>
          </div>
        </div>
      </section>

      <section className="section section-last">
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <div className="h-title">我的 Vault</div>
            <div className="h-sub">共 {vaults.length} 个 · 数据保存在本地</div>
          </div>
          <button type="button" className="btn primary" onClick={onCreate}>新建</button>
        </div>

        {vaults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⬡</div>
            <div>还没有 Vault</div>
            <p>创建一个，实时环境数据满足条件时自动开箱</p>
            <button type="button" className="btn primary" style={{ marginTop: 20 }} onClick={onCreate}>
              创建第一个
            </button>
          </div>
        ) : (
          <div className="vault-grid">
            {vaults.map(v => {
              const t = VAULT_TYPES[v.theme];
              return (
                <div key={v.id} className="vault-card" onClick={() => onOpen(v.id)}>
                  <div className={`vault-preview ${v.status === 'opened' ? 'vault-preview-opened' : ''}`}>
                    {v.artifact ? (
                      <ArtifactPreview artifact={v.artifact} size="sm" showLabel={false} />
                    ) : (
                      <span className="vault-preview-symbol">⬡</span>
                    )}
                  </div>
                  <div className="vault-card-body">
                    <span className="type-category" style={{ marginBottom: 6, display: 'inline-block' }}>{t.category}</span>
                    <h3>{v.name}</h3>
                    <div className="meta">{t.name} · {v.city} · {v.conditions.length} 条规则</div>
                    <div className="tags">
                      <span className={`tag ${STATUS_CLASS[v.status] ?? ''}`}>
                        {STATUS_LABEL[v.status] ?? v.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
