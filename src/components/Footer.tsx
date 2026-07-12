/** 全站页脚 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/rex-vault-logo.svg" alt="" className="footer-logo" aria-hidden />
          <div>
            <div className="footer-title">REX Vault</div>
            <div className="footer-tagline">环境数据驱动的链上盲盒 Demo</div>
          </div>
        </div>

        <div className="footer-badges">
          <span className="footer-badge">Native HTTP</span>
          <span className="footer-badge">Reactive</span>
          <span className="footer-badge">REX</span>
        </div>

        <div className="footer-links">
          <a href="https://github.com/OliverGarwil/REX-Vault" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://rialo.io" target="_blank" rel="noreferrer">
            Rialo
          </a>
          <span className="footer-dot">·</span>
          <span className="footer-version">v0.1.1</span>
        </div>

        <p className="footer-note">
          前端 Demo · 链上执行与信号为本地模拟 · 仅供演示
        </p>

        <div className="footer-copy">
          © {year} OliverGarwil · REX Vault
        </div>
      </div>
    </footer>
  );
}
