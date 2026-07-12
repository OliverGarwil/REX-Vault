import { useMemo, useState } from 'react';
import { useStore } from '../store';
import {
  VAULT_TYPE_LIST,
  VAULT_TYPES,
  CITIES,
  FIELD_META,
  LOGIC_LABEL,
  cloneConditions,
} from '../templates';
import { useLiveSignal } from '../hooks/useLiveSignal';
import { LiveSignalPanel } from '../components/LiveSignalPanel';
import { createVault } from '../engine';
import type { VaultTheme, VaultCondition, ConditionLogic } from '../types';

interface Props {
  onCreated: (id: string) => void;
  onCancel: () => void;
}

const STEPS = ['选类型', '设规则', '封存'];
const MAX_CONDITIONS = 6;
const OPS = ['>', '<', '>=', '<=', '='] as const;

export function CreateVault({ onCreated, onCancel }: Props) {
  const { createVault: saveVault } = useStore();
  const [step, setStep] = useState<'select' | 'tune' | 'sealing'>('select');
  const [theme, setTheme] = useState<VaultTheme | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('Shanghai');
  const [conditions, setConditions] = useState<VaultCondition[]>([]);
  const [conditionLogic, setConditionLogic] = useState<ConditionLogic>('all');
  const [progress, setProgress] = useState(0);

  const stepIndex = step === 'select' ? 0 : step === 'tune' ? 1 : 2;
  const tpl = theme ? VAULT_TYPES[theme] : null;
  const live = useLiveSignal(step === 'tune' ? city : '', 30_000);

  const draftVault = useMemo(() => {
    if (!theme) return undefined;
    return createVault(name || '预览', theme, city, conditions, conditionLogic);
  }, [theme, name, city, conditions, conditionLogic]);

  function chooseTheme(t: VaultTheme) {
    const type = VAULT_TYPES[t];
    setTheme(t);
    setConditions(cloneConditions(type.defaultConditions));
    setConditionLogic(type.defaultLogic);
    setCity(type.recommendedCities[0] ?? 'Shanghai');
    setName(`${type.name} · ${type.recommendedCities[0] ?? 'Shanghai'}`);
    setStep('tune');
  }

  function updateCond(idx: number, patch: Partial<VaultCondition>) {
    setConditions(prev => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  function addCondition() {
    if (conditions.length >= MAX_CONDITIONS) return;
    setConditions(prev => [...prev, { field: 'aqi', op: '>', value: 100 }]);
  }

  function removeCondition(idx: number) {
    if (conditions.length <= 1) return;
    setConditions(prev => prev.filter((_, i) => i !== idx));
  }

  function resetToDefault() {
    if (!tpl) return;
    setConditions(cloneConditions(tpl.defaultConditions));
    setConditionLogic(tpl.defaultLogic);
  }

  function startSealing() {
    if (!theme || conditions.length === 0) return;
    setStep('sealing');
    setProgress(0);
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setProgress(Math.round((i / 14) * 100));
      if (i >= 14) {
        clearInterval(tick);
        setTimeout(() => {
          const id = saveVault(name || '未命名 Vault', theme, city, conditions, conditionLogic);
          onCreated(id);
        }, 500);
      }
    }, 160);
  }

  return (
    <main className="page page-narrow">
      <div className="page-header">
        <div>
          <div className="h-title">创建 Vault</div>
          <div className="h-sub">类型 → 规则 → 封存上链</div>
        </div>
        <button type="button" className="btn ghost" onClick={onCancel}>返回</button>
      </div>

      <div className="step-bar">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`step-bar-item ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'done' : ''}`}
          >
            {i < stepIndex ? '✓ ' : ''}{s}
          </div>
        ))}
      </div>

      {step === 'select' && (
        <>
          <p className="step-hint">每种类型自带默认条件和数据源，下一步可以按实时数据微调。</p>
          <div className="type-grid">
            {VAULT_TYPE_LIST.map(type => (
              <div key={type.id} className="type-card" onClick={() => chooseTheme(type.id)}>
                <div className="type-card-top">
                  <span className="type-category">{type.category}</span>
                  <span className="type-logic-badge">
                    {type.defaultLogic === 'any' ? 'OR' : 'AND'}
                  </span>
                </div>
                <h3>{type.name}</h3>
                <p className="type-desc">{type.desc}</p>
                <div className="type-meta">
                  <span>{type.dataSource}</span>
                </div>
                <div className="type-conditions-preview">
                  {type.defaultConditions.length} 条默认规则 · {type.triggerHint}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 'tune' && theme && tpl && (
        <>
          <LiveSignalPanel
            vault={draftVault}
            city={city}
            signal={live.signal}
            history={live.history}
            loading={live.loading}
            error={live.error}
            lastUpdated={live.lastUpdated}
            pollSec={30}
            onRefresh={live.refresh}
            compact
          />
          <div className="form-grid">
            <div className="panel form-panel">
              <div className="form-field">
                <label>名称</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="给 Vault 起个名字" />
              </div>

              <div className="form-field">
                <label>城市</label>
                <select
                  value={city}
                  onChange={e => {
                    const newCity = e.target.value;
                    setCity(newCity);
                    setName(`${tpl.name} · ${newCity}`);
                  }}
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="field-hint">推荐：{tpl.recommendedCities.join('、')}</p>
              </div>

              <div className="form-field">
                <div className="condition-header">
                  <label>触发条件</label>
                  <button type="button" className="btn-text" onClick={resetToDefault}>恢复默认</button>
                </div>

                <div className="logic-toggle">
                  {(['all', 'any'] as ConditionLogic[]).map(logic => (
                    <button
                      key={logic}
                      type="button"
                      className={`logic-btn ${conditionLogic === logic ? 'active' : ''}`}
                      onClick={() => setConditionLogic(logic)}
                    >
                      {LOGIC_LABEL[logic]}
                    </button>
                  ))}
                </div>
                <p className="field-hint">
                  {conditionLogic === 'all' ? '全部条件满足才开箱' : '满足任一条件即可开箱'}
                </p>

                <div className="condition-list">
                  {conditions.map((c, i) => (
                    <div key={i} className="condition-row">
                      <select
                        value={c.field}
                        onChange={e => updateCond(i, { field: e.target.value as VaultCondition['field'] })}
                      >
                        {(Object.keys(FIELD_META) as VaultCondition['field'][]).map(f => (
                          <option key={f} value={f}>{FIELD_META[f].label}</option>
                        ))}
                      </select>
                      <select
                        value={c.op}
                        onChange={e => updateCond(i, { op: e.target.value as VaultCondition['op'] })}
                        className="cond-op"
                      >
                        {OPS.map(op => <option key={op} value={op}>{op}</option>)}
                      </select>
                      <input
                        type="number"
                        value={c.value}
                        onChange={e => updateCond(i, { value: Number(e.target.value) })}
                        className="cond-val"
                      />
                      <button
                        type="button"
                        className="cond-remove"
                        onClick={() => removeCondition(i)}
                        disabled={conditions.length <= 1}
                        title="删除条件"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {conditions.length < MAX_CONDITIONS && (
                  <button type="button" className="btn ghost add-cond-btn" onClick={addCondition}>
                    添加条件（{conditions.length}/{MAX_CONDITIONS}）
                  </button>
                )}
              </div>
            </div>

            <div className="panel form-panel">
              <div className="type-summary">
                <span className="type-category">{tpl.category}</span>
                <h3>{tpl.name}</h3>
                <p>{tpl.triggerHint}</p>
              </div>

              <div className="form-field">
                <label>预览</label>
                <div className="vault-cube vault-cube-preview vault-cube-pulse">⬡</div>
              </div>

              <div className="condition-summary panel inner-panel">
                <div className="label subtle-label">{LOGIC_LABEL[conditionLogic]}</div>
                {conditions.map((c, i) => (
                  <div key={i} className="condition-line">
                    <span className="field">{FIELD_META[c.field].label}</span>{' '}
                    {c.op} <span className="val">{c.value}{FIELD_META[c.field].unit}</span>
                  </div>
                ))}
              </div>

              <div className="rex-box">
                <div className="rex-label">REX 加密</div>
                <div className="rex-desc">
                  条件和逻辑加密上链，其他人看不到你的阈值。
                </div>
              </div>

              <button
                type="button"
                className="btn primary btn-block"
                onClick={startSealing}
                disabled={conditions.length === 0}
              >
                封存 Vault
              </button>
            </div>
          </div>
        </>
      )}

      {step === 'sealing' && (
        <div className="panel sealing-panel">
          <div className="vault-cube vault-cube-sealing">⬡</div>
          <div className="rex-label" style={{ marginBottom: 16 }}>写入 REX</div>
          <div className="sealing-percent">{progress}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="sealing-hint">正在模拟 REX 加密写入…</p>
        </div>
      )}
    </main>
  );
}
