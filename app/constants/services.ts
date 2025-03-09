interface ServiceInfo {
  name: string;
  description: string;
  features: string[];
  category: string;
  tvl: string;
  chains: number;
  logoUrl: string;
  url: string;
}

export const serviceInfoMap: Record<string, ServiceInfo> = {
  "jito.network": {
    name: "Jito",
    description: "MEV-based staking service",
    features: ["MEV Rewards Sharing", "Liquid Staking"],
    category: "Liquid Staking",
    tvl: "15.8M SOL",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/jito.png",
    url: "jito.network"
  },
  "raydium.io": {
    name: "Raydium AMM",
    description: "AMM-based decentralized exchange",
    features: ["Liquidity Provision", "Trading Optimization"],
    category: "Dexs",
    tvl: "$7.1M",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/raydium?w=48&h=48",
    url: "raydium.io"
  },
  "sanctum.so": {
    name: "Sanctum",
    description: "Deposit and yield generation platform",
    features: ["Optimized Deposits", "Yield Automation"],
    category: "Liquid Staking",
    tvl: "$3.9M",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/sanctum?w=48&h=48",
    url: "sanctum.so"
  },
  "app.drift.trade/SOL-PERP": {
    name: "Drift",
    description: "Decentralized derivatives exchange",
    features: ["Futures Trading", "Advanced Trading Features"],
    category: "PerpDex",
    tvl: "$2.1M",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/drift?w=48&h=48",
    url: "app.drift.trade/SOL-PERP"
  },
  "app.solayer.org": {
    name: "Solayer",
    description: "Solana Restaking Platform",
    features: ["Staking Optimization", "Liquidity Provision"],
    category: "Liquid Staking",
    tvl: "$2.8M",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/solayer?w=48&h=48",
    url: "app.solayer.org"
  },
  "app.fragmetric.xyz/restake/": {
    name: "fragmetric",
    description: "Solana Restaking Platform",
    features: ["Staking Optimization", "Liquidity Provision"],
    category: "Liquid Staking",
    tvl: "$2.8M",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/fragmetric?w=48&h=48",
    url: "app.fragmetric.xyz/restake/"
  },
  "app.rate-x.io/": {
    name: "Rate-X",
    description: "Yield Restaking Platform",
    features: ["Staking Optimization", "Liquidity Provision"],
    category: "YieldTrading",
    tvl: "$2.8M",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/ratex?w=48&h=48",
    url: "app.rate-x.io/"
  },
  "portfolio.jup.ag/": {
    name: "Jupiter Portfolio",
    description: "Portfolio Tracker",
    features: ["portfolio tracking", "yield tracking"],
    category: "Tools",
    tvl: "$2.8M",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/jupiter?w=48&h=48",
    url: "portfolio.jup.ag/"
  }
};

export function getServiceByName(name: string): ServiceInfo | undefined {
  return serviceInfoMap[name] || Object.values(serviceInfoMap).find(service => service.name === name);
}

export function getServiceByUrl(url: string): ServiceInfo | undefined {
  return serviceInfoMap[url] || Object.values(serviceInfoMap).find(service => service.url === url);
} 