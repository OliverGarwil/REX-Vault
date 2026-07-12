# REX Vault

An encrypted blind-box demo on [Rialo](https://rialo.io), triggered by real-world environmental data. Users define on-chain conditions; the Reactive engine evaluates them, REX runs rules and rarity in private, and only the open result is visible publicly.

> Frontend demo only: signals and execution are simulated locally to showcase the full Rialo Native HTTP → Reactive → REX pipeline.

## Features

- **Six vault templates** — urban air, extreme heat, coastal weather, and more, each with default conditions and recommended cities
- **Flexible rules** — AQI, PM2.5, temperature, humidity, wind, UV; AND / OR logic; up to 6 conditions
- **REX sealed storage** — rules and thresholds encrypted on-chain; outsiders see only the outcome
- **Four-step execution view** — Native HTTP → Reactive → REX → artifact generation
- **Live API signals** — Open-Meteo weather + air quality polled every 30s with sparkline history
- **Simulated signals** — built-in multi-city samples for one-click demo runs

## Stack

| Layer | Choice |
|-------|--------|
| UI | React 19 + TypeScript |
| Build | Vite 6 |
| State | React Context |
| Chain | Rialo Reactive · Native HTTP · REX Privacy |

## Quick start

**Requires:** Node.js 18+

```bash
git clone https://github.com/OliverGarwil/REX-Vault.git
cd REX-Vault
npm install
npm run dev
```

Dev server: [http://localhost:5175](http://localhost:5175)

**Production build:**

```bash
npm run build
npm run preview
```

## Project layout

```
src/
├── pages/
│   ├── VaultWall.tsx      # Landing + vault list
│   ├── CreateVault.tsx    # Create flow: type → conditions → seal
│   └── VaultDetail.tsx    # Detail: rules + simulated triggers
├── engine.ts              # Evaluation, artifact generation, demo signals
├── templates.ts           # Vault types and default rules
├── store.tsx              # Global state
└── types.ts               # Type definitions
```

## Vault types

| ID | Name | Scenario | Default logic |
|----|------|----------|---------------|
| `neon` | Neon Smog | Pollution + heat | AND |
| `ruin` | Ruin Dust | Dry inland | AND |
| `pulse` | Pulse Heat | Extreme heat | AND |
| `void` | Void Calm | Quiet band | AND |
| `tide` | Tide Mist | Coastal humidity | AND |
| `storm` | Storm Edge | Extreme events | OR |

## Rialo mapping

| Step | Rialo capability | In this demo |
|------|------------------|--------------|
| Fetch data | Native HTTP | Simulated OpenAQ / NOAA responses |
| Match rules | Reactive | On-chain evaluation, no external bot |
| Rules & rarity | REX Privacy | Encrypted logic, public outcome only |
| Artifact | On-chain | Unique output from signal hash |

## License

Private — demo and presentation use only.
