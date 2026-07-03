import { useStore } from '../store';
import { VAULT_TYPES } from '../templates';

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

export function VaultWall({ onOpen, onCreate }: Props) {
  const { vaults } = useStore();

  return (
    <main className="page page-wide">
      <section className="hero">
        <h1 className="hero-title">REX Vault</h1>
        <p className="hero-lead">
          用真实环境数据触发链上盲盒。条件写在 Rialo 上，数据走 Native HTTP 进来，
          Reactive 负责唤醒，REX 里跑规则和稀有度，外面只能看到开盒结果。
        </p>
        <div className="hero-actions">
          <button type="button" className="btn primary" onClick={onCreate}>创建盲盒</button>
          {vaults.length > 0 && (
            <button type="button" className="btn ghost" onClick={() => onOpen(vaults[0].id)}>看 Demo</button>
          )}
        </div>
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
              <p>生成作品</p>
            </div>
          </div>
          <div className="principle-note">
            建好盲盒之后不用盯着数据，也不用自己写 Bot。条件到了，链上自己走。
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">Rialo 这边用到的能力</div>
        </div>
        <div className="platform-grid">
          <div className="platform-item">
            <span className="platform-num">01</span>
            <h4>Reactive</h4>
            <p>条件满足就执行，不用链外脚本轮询再签名。</p>
          </div>
          <div className="platform-item">
            <span className="platform-num">02</span>
            <h4>Native HTTP</h4>
            <p>合约侧直接请求 OpenAQ、NOAA 这类 API，少一层预言机。</p>
          </div>
          <div className="platform-item">
            <span className="platform-num">03</span>
            <h4>REX</h4>
            <p>你的阈值和稀有度算法别人看不到，只能看到开出来的东西。</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title">流程</div>
        <div className="flow-steps">
          <div className="flow-step">
            <div className="step-num">1</div>
            <h4>选类型</h4>
            <p>六种模板，自带默认条件</p>
          </div>
          <div className="flow-step">
            <div className="step-num">2</div>
            <h4>改规则</h4>
            <p>城市、AND/OR、加减条件</p>
          </div>
          <div className="flow-step">
            <div className="step-num">3</div>
            <h4>封存</h4>
            <p>写入 REX</p>
          </div>
          <div className="flow-step">
            <div className="step-num">4</div>
            <h4>试触发</h4>
            <p>详情页点模拟信号</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button type="button" className="btn primary" onClick={onCreate}>新建盲盒</button>
        </div>
      </section>

      <section className="section section-last">
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <div className="h-title">我的盲盒</div>
            <div className="h-sub">{vaults.length} 个</div>
          </div>
          <button type="button" className="btn primary" onClick={onCreate}>新建</button>
        </div>

        {vaults.length === 0 ? (
          <div className="empty-state">
            <div>还没有</div>
            <p>建一个之后会出现在这里</p>
          </div>
        ) : (
          <div className="vault-grid">
            {vaults.map(v => {
              const t = VAULT_TYPES[v.theme];
              return (
                <div key={v.id} className="vault-card" onClick={() => onOpen(v.id)}>
                  <div className={`vault-preview ${v.status === 'opened' ? 'vault-preview-dark' : ''}`}>
                    <span className="vault-preview-symbol">⬡</span>
                  </div>
                  <div className="vault-card-body">
                    <span className="type-category" style={{ marginBottom: 6, display: 'inline-block' }}>{t.category}</span>
                    <h3>{v.name}</h3>
                    <div className="meta">{t.name} · {v.city} · {v.conditions.length} 条</div>
                    <div className="tags">
                      <span className="tag">{STATUS_LABEL[v.status] ?? v.status}</span>
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
