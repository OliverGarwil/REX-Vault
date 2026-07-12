import type { Artifact } from '../types';

const RARITY_LABEL: Record<Artifact['rarity'], string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

interface Props {
  artifact: Artifact;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/** 根据 Artifact 参数渲染唯一视觉 */
export function ArtifactPreview({ artifact, size = 'md', showLabel = true }: Props) {
  const { hue, saturation, lightness, pattern, rarity } = artifact;
  const bg = `hsl(${hue} ${saturation}% ${lightness}%)`;

  return (
    <div className={`artifact-preview artifact-preview-${size}`}>
      <div
        className={`artifact-canvas artifact-pattern-${pattern}`}
        style={{ background: bg }}
        aria-hidden
      />
      {showLabel && (
        <span className={`artifact-rarity artifact-rarity-${rarity}`}>
          {RARITY_LABEL[rarity]}
        </span>
      )}
    </div>
  );
}
