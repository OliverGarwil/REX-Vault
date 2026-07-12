import { FIELD_META } from '../templates';
import { previewConditionHits, evaluateVault } from '../engine';
import type { ConditionField, Vault, WorldSignal } from '../types';

interface Props {
  vault?: Vault;
  city: string;
  signal: WorldSignal | null;
  history: WorldSignal[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  pollSec: number;
  onRefresh: () => void;
  onTrigger?: (signal: WorldSignal) => void;
  compact?: boolean;
}

function Sparkline({ values, active }: { values: number[]; active?: boolean }) {
  if (values.length < 2) {
    return <svg className="sparkline" viewBox="0 0 80 24" aria-hidden><line x1="0" y1="12" x2="80" y2="12" /></svg>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 80;
    const y = 22 - ((v - min) / span) * 18;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg className={`sparkline ${active ? 'sparkline-active' : ''}`} viewBox="0 0 80 24" aria-hidden>
      <polyline points={pts} fill="none" strokeWidth="1.5" />
    </svg>
  );
}

function delta(prev: number | undefined, curr: number): string | null {
  if (prev === undefined) return null;
  const d = Math.round((curr - prev) * 10) / 10;
  if (d === 0) return '→';
  return d > 0 ? `↑${d}` : `↓${Math.abs(d)}`;
}

function MetricSkeleton() {
  return (
    <div className="live-metric live-metric-skeleton">
      <div className="skeleton-line skeleton-sm" />
      <div className="skeleton-line skeleton-lg" />
      <div className="skeleton-line skeleton-chart" />
    </div>
  );
}

const FIELDS: ConditionField[] = ['aqi', 'pm25', 'temp', 'humidity', 'wind', 'uv'];

export function LiveSignalPanel({
  vault,
  city,
  signal,
  history,
  loading,
  error,
  lastUpdated,
  pollSec,
  onRefresh,
  onTrigger,
  compact = false,
}: Props) {
  const prev = history.length >= 2 ? history[history.length - 2] : undefined;
  const wouldTrigger = vault && signal ? evaluateVault(vault, signal) : false;
  const hits = vault && signal ? previewConditionHits(vault, signal) : [];

  return (
    <div className={`live-panel ${compact ? 'live-panel-compact' : ''}`}>
      <div className="live-panel-head">
        <div>
          <div className="label">实时环境信号 · {city}</div>
          <p className="field-hint">
            Open-Meteo · 每 {pollSec} 秒刷新
            {lastUpdated && (
              <> · 更新于 {new Date(lastUpdated).toLocaleTimeString('zh-CN')}</>
            )}
          </p>
        </div>
        <div className="live-panel-actions">
          <button type="button" className="btn ghost live-refresh-btn" onClick={onRefresh} disabled={loading}>
            {loading ? '拉取中…' : '立即刷新'}
          </button>
          {onTrigger && signal && vault?.status === 'sealed' && (
            <button
              type="button"
              className={`btn ${wouldTrigger ? 'primary' : 'ghost'}`}
              onClick={() => onTrigger(signal)}
            >
              {wouldTrigger ? '触发开箱' : '测试触发'}
            </button>
          )}
        </div>
      </div>

      {error && <div className="live-error">{error}</div>}

      {loading && !signal && (
        <div className="live-metrics">
          {FIELDS.map(f => <MetricSkeleton key={f} />)}
        </div>
      )}

      {signal && (
        <>
          {vault && (
            <div className={`live-trigger-banner ${wouldTrigger ? 'live-trigger-yes' : ''}`}>
              {wouldTrigger
                ? `${vault.conditionLogic === 'any' ? '任一' : '全部'}条件已满足 — 可以开箱`
                : `已匹配 ${hits.filter(Boolean).length}/${vault.conditions.length} 条规则`}
            </div>
          )}

          <div className="live-metrics">
            {FIELDS.map(field => {
              const meta = FIELD_META[field];
              const val = signal[field];
              const series = history.map(h => h[field]);
              const condHit = vault
                ? vault.conditions.some((c, idx) => c.field === field && hits[idx])
                : undefined;
              return (
                <div key={field} className={`live-metric ${condHit ? 'live-metric-hit' : ''}`}>
                  <div className="live-metric-top">
                    <span className="live-metric-label">{meta.label}</span>
                    <span className="live-metric-delta">{delta(prev?.[field], val)}</span>
                  </div>
                  <div className="live-metric-val">
                    {val}{meta.unit}
                  </div>
                  <Sparkline values={series} active={condHit === true} />
                </div>
              );
            })}
          </div>

          {!compact && vault && (
            <div className="live-conditions">
              {vault.conditions.map((c, i) => {
                const hit = hits[i];
                const val = signal[c.field];
                return (
                  <div key={i} className={`live-cond-row ${hit ? 'live-cond-hit' : ''}`}>
                    <span>{FIELD_META[c.field].label} {c.op} {c.value}{FIELD_META[c.field].unit}</span>
                    <span className="live-cond-now">当前 {val}{FIELD_META[c.field].unit}</span>
                    <span className={`hit-badge ${hit ? 'hit-yes' : ''}`}>{hit ? '✓' : '—'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
