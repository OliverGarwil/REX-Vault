import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const out = join(__dir, '..');

const modules = [
  { id: 'CHAIN', name: 'Rialo链上集成', priority: 'P0', count: 80 },
  { id: 'ORACLE', name: '环境数据Oracle', priority: 'P0', count: 60 },
  { id: 'VAULT', name: 'Vault核心逻辑', priority: 'P0', count: 75 },
  { id: 'ARTIFACT', name: 'Artifact数字藏品', priority: 'P1', count: 65 },
  { id: 'WALLET', name: '钱包与用户', priority: 'P1', count: 55 },
  { id: 'UIUX', name: '前端UI/UX', priority: 'P1', count: 70 },
  { id: 'REALTIME', name: '实时与自动化', priority: 'P1', count: 40 },
  { id: 'SECURITY', name: '安全与隐私', priority: 'P2', count: 60 },
  { id: 'BACKEND', name: '后端与服务', priority: 'P2', count: 70 },
  { id: 'TEST', name: '测试与QA', priority: 'P2', count: 50 },
  { id: 'DEVOPS', name: 'DevOps部署', priority: 'P2', count: 45 },
  { id: 'MONITOR', name: '监控与运维', priority: 'P2', count: 35 },
  { id: 'I18N', name: '国际化与无障碍', priority: 'P3', count: 25 },
  { id: 'BIZ', name: '商业化与运营', priority: 'P3', count: 45 },
  { id: 'LEGAL', name: '合规与法务', priority: 'P3', count: 25 },
];

const templates = {
  CHAIN: ['Rialo RPC连接','Vault合约部署','REX规则上链','Reactive注册','Native HTTP配置','状态机同步','交易签名','Gas估算','测试网切换','主网切换','WS事件监听','Created事件','Triggered事件','Opened事件','Minted事件','Nonce重试','失败提示','ABI生成','合约单测','Proxy升级','多签管理','紧急暂停','Indexer','Subgraph','区块回填','链上缓存','WC链切换','SDK Hook'],
  ORACLE: ['Open-Meteo hardened','OpenAQ v3','NOAA API','WMO源','AQI聚合','PM2.5标准','Freshness检测','Stale拒绝','Geo缓存','城市别名','Rate退避','Key轮换','健康Cron','离线降级','链上Attest','历史存档','自定义坐标','IP定位','UV校验','风速标准'],
  VAULT: ['AND/OR嵌套','范围滑块','模板市场','模板保存','Vault编辑','删除撤销','Vault转让','批量创建','TTL过期','续期','触发历史','接近预警','自动开箱','冷却期','分享链接','JSON导出','JSON导入','搜索','筛选','城市分组','主题分组','实时预览','冲突检测','命名校验'],
  ARTIFACT: ['NFT mint','ERC-721','稀有度验证','SVG生成','Canvas渲染','Reveal动画','画廊','详情页','OpenSea','IPFS','Arweave','转赠','二级市场','版税','Collection','未开证明','合成','Legendary','种子生成','metadata'],
  WALLET: ['MetaMask','WalletConnect','Rialo钱包','持久化','断开清理','Profile','创建历史','开箱历史','站内通知','邮件','Web Push','多地址','ENS','余额显示','交易历史','数据导出','注销','过期处理','引导页','DeepLink'],
  UIUX: ['移动响应式','平板适配','暗色模式','主题跟随','骨架屏','空状态','错误边界','断网Banner','3D动画','Dashboard','Step引导','Onboarding','中文','英文','日文','键盘A11y','ARIA','WCAG','PWA','SW离线','LCP','代码分割','WebP','SEO','OG卡片','Favicon','微交互','Toast','Modal','Form','Token','Storybook','过渡','虚拟列表'],
  REALTIME: ['WebSocket','SSE','轮询配置','Push通知','Cron监控','多城并行','优先级队列','刷新频率','异常检测','Webhook','IFTTT','Telegram','Discord','日志流','全屏Live','多Vault看板'],
  SECURITY: ['合约审计','Slither','XSS','CSRF','Key隔离','防泄露','RateLimit','Phishing','Dependabot','npm audit','渗透','BugBounty','KMS','Timelock','Breaker','CORS','CSP','HSTS','脱敏','JWT'],
  BACKEND: ['Fastify','GraphQL','PG用户','PG Vault','Redis','BullMQ','JWT','OAuth','S3','SendGrid','FCM','Admin','CMS','事件采集','API v1','API v2','Swagger','Migration','Seed','RateLimit','Health'],
  TEST: ['engine单测','liveSignal Mock','Hook测试','Panel测试','Create E2E','Detail E2E','Playwright','Hardhat','Foundry','API集成','视觉回归','k6','混沌','覆盖率','Snapshot','Fuzz'],
  DEVOPS: ['Vercel','CF Pages','Dockerfile','compose','GH Actions','PR Preview','Secrets','CDN','SSL','蓝绿','金丝雀','回滚','Terraform','Staging','分支保护','Build缓存'],
  MONITOR: ['Sentry FE','Sentry BE','Grafana','Prometheus','链上率','P99告警','PagerDuty','ELK','Mixpanel','Datadog','Uptime','成本'],
  I18N: ['i18next','语言检测','RTL','时区','数字格式','Crowdin','动态切换','SkipLink'],
  BIZ: ['定价页','Stripe','Premium','Boost','分成','白标','Public API','API Key','Referral','Affiliate','SLA','Landing','Roadmap','Changelog','Discord','文档','黑客松','Press','反馈','Analytics'],
  LEGAL: ['ToS','Privacy','Cookie','GDPR','CCPA','免责','年龄验证','KYC','税务','审计','DPA','Geo限制'],
};

const rows = [];
let n = 0;
for (const mod of modules) {
  const tpls = templates[mod.id];
  for (let i = 0; i < mod.count; i++) {
    n++;
    const base = tpls[i % tpls.length];
    const suffix = i >= tpls.length ? ` #${Math.floor(i / tpls.length) + 1}` : '';
    rows.push({ id: `REX-${String(n).padStart(4, '0')}`, module: mod.name, priority: mod.priority, title: base + suffix });
  }
}

const csv = 'ID,模块,优先级,功能标题,状态\n' + rows.map(r => `${r.id},"${r.module}",${r.priority},"${r.title}",待开发`).join('\n');
writeFileSync(join(out, 'REX-Vault-800-features.csv'), csv, 'utf8');

let md = `# REX-Vault 功能 Backlog（${rows.length} 项）\n\n> 项目：REX Vault · Rialo 环境触发链上盲盒\n> 生成：2026-07-13 · 当前：v0.1.0 Demo\n\n`;
const stats = {};
rows.forEach(r => { stats[r.priority] = (stats[r.priority] || 0) + 1; });
md += '| 优先级 | 数量 |\n|--------|------|\n';
Object.entries(stats).sort().forEach(([k, v]) => { md += `| ${k} | ${v} |\n`; });
md += `| **合计** | **${rows.length}** |\n\n---\n`;
let cur = '';
rows.forEach(r => {
  if (r.module !== cur) { cur = r.module; md += `\n## ${cur}（${r.priority}）\n\n`; }
  md += `- [ ] **${r.id}** ${r.title}\n`;
});
writeFileSync(join(out, 'REX-Vault-800-features.md'), md, 'utf8');
console.log(`OK: ${rows.length} items -> ${out}`);
