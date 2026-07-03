import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { DEMO_SIGNALS, previewConditionHits, evaluateVault } from '../engine';
import { VAULT_TYPES, FIELD_META, LOGIC_LABEL } from '../templates';
import type { WorldSignal } from '../types';

interface Props {
  vaultId: string;
  onBack: () => void;
}

const RARITY_LABEL: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const EXEC_STEPS = [
  { title: '收到数据', desc: 'Native HTTP 拉 API' },
  { title: '对条件', desc: 'Reactive 判断' },
  { title: 'REX 计算', desc: '规则和稀有度' },
  { title: '开盒', desc: '生成作品' },
];

function formatSignalStats(s: WorldSignal): string {
  return `AQI ${s.aqi} · PM2.5 ${s.pm25} · ${s.temp}°C · ${s.humidity}% · 风 ${s.wind} · UV ${s.uv}`;
}

export function VaultDetail({ vaultId, onBack }: Props) {
  const { vaults, triggerVault } = useStore();
  const vault = useMemo(() => vaults.find(v => v.id === vaultId), [vaults, vaultId]);
  const [execOpen, setExecOpen] = useState(false);
  const [execStep, setExecStep] = useState(0);
  const [execHit, setExecHit] = useState<boolean | null>(null);

  if (!vault) {
    return (
      <main className="page">
        <p>找不到这个盲盒</p>
        <button type="button" className="btn ghost" onClick={onBack}>返回</button>
      </main>
    );
  }

  const tpl = VAULT_TYPES[vault.theme];
  const logic = vault.conditionLogic ?? 'all';
  const statusText = vault.status === 'sealed' ? '等待触发' : vault.status === 'opened' ? '已开' : '未命中';

  function runTrigger(signal: WorldSignal) {
    setExecHit(null);
    setExecStep(0);
    setExecOpen(true);

    const delays = [700, 800, 1200, 800];
    let acc = 0;
    delays.forEach((d, i) => {
      acc += d;
      setTimeout(() => setExecStep(i + 1), acc);
    });

    setTimeout(() => {
      const res = triggerVault(vaultId, signal);
      setExecHit(res.hit);
      setExecStep(5);
    }, acc + 400);
  }

  function hitLabel(signal: WorldSignal): string {
    const hits = previewConditionHits(vault, signal);
    const n = hits.filter(Boolean).length;
    const total = vault.conditions.length;
    const wouldTrigger = evaluateVault(vault, signal);
    return wouldTrigger ? `${n}/${total} 会开` : `${n}/${total}`;
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="h-title">{vault.name}</div>
          <div className="h-sub">
            {tpl.name} · {vault.city} · {statusText}
          </div>
        </div>
        <button type="button" className="btn ghost" onClick={onBack}>返回</button>
      </div>

      <div className="detail-layout">
        <div className="panel vault-cube-wrap">
          <div className="vault-cube">⬡</div>
          <div className="vault-type-info">
            <span className="type-category">{tpl.category}</span>
            <p>{tpl.desc}</p>
            <p className="type-datasource">{tpl.dataSource}</p>
          </div>
        </div>

        <div className="side-panel">
          <div className="rex-box">
            <div className="rex-label">已加密</div>
            <div style={{ fontSize: 13, color: 'var(--tx-2)', marginBottom: 8 }}>
              {vault.conditions.length} 条 · {LOGIC_LABEL[logic]}
            </div>
            <div className="hash">{vault.encryptionHash}</div>
          </div>

          <div className="panel info-block">
            <div className="label">条件</div>
            <p className="field-hint" style={{ marginBottom: 10 }}>{LOGIC_LABEL[logic]}</p>
            {vault.conditions.map((c, i) => (
              <div key={i} className="condition-line">
                <span className="field">{FIELD_META[c.field].label}</span> {c.op}{' '}
                <span className="val">{c.value}{FIELD_META[c.field].unit}</span>
              </div>
            ))}
          </div>

          {vault.artifact && (
            <div className="panel info-block">
              <div className="label">作品</div>
              <div className="value">
                {RARITY_LABEL[vault.artifact.rarity] ?? vault.artifact.rarity}
                <br />
                {formatSignalStats(vault.artifact.triggeredSignal)}
              </div>
            </div>
          )}

          <div className="panel info-block">
            <div className="label">模拟信号</div>
            <p className="field-hint" style={{ marginBottom: 12 }}>
              点一行试触发
            </p>
            {DEMO_SIGNALS.map(s => {
              const wouldHit = evaluateVault(vault, s.signal);
              return (
                <div
                  key={s.label}
                  className={`signal-row ${wouldHit ? 'signal-row-hit' : ''}`}
                  onClick={() => runTrigger(s.signal)}
                >
                  <div>
                    <div>{s.label}</div>
                    <div className="signal-detail">{formatSignalStats(s.signal)}</div>
                  </div>
                  <span className={`hit-badge ${wouldHit ? 'hit-yes' : ''}`}>{hitLabel(s.signal)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {execOpen && (
        <div className="modal-mask" onClick={execStep >= 5 ? () => setExecOpen(false) : undefined}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>
                {execStep >= 5
                  ? execHit ? '开了' : '没开'
                  : '执行中'}
              </h2>
            </div>

            {EXEC_STEPS.map((m, i) => {
              const n = i + 1;
              const state = execStep > n ? 'done' : execStep === n ? 'active' : '';
              return (
                <div key={n} className={`exec-step ${state}`}>
                  <div className={`exec-num ${state}`}>{execStep > n ? '✓' : n}</div>
                  <div>
                    <div className="exec-title">{m.title}</div>
                    <div className="exec-desc">{m.desc}</div>
                  </div>
                </div>
              );
            })}

            {execStep >= 5 && execHit && vault.artifact && (
              <div className="rex-box" style={{ marginTop: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>生成作品</div>
                <div style={{ fontSize: 13, color: 'var(--tx-2)' }}>
                  {RARITY_LABEL[vault.artifact.rarity]} · {vault.artifact.triggeredSignal.city}
                </div>
              </div>
            )}

            {execStep >= 5 && (
              <button
                type="button"
                className="btn primary"
                style={{ width: '100%', marginTop: 20 }}
                onClick={() => setExecOpen(false)}
              >
                关闭
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
