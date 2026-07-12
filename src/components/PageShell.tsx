import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

/** 页面切换淡入容器 */
export function PageShell({ children, className = '' }: Props) {
  return <div className={`page-shell ${className}`.trim()}>{children}</div>;
}
