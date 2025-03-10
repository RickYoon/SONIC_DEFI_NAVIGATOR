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
  "app.silo.finance": {
    name: "silo.finance",
    description: "permissionless and risk-isolated lending markets",
    features: ["permissionless", "risk-isolated"],
    category: "Lending",
    tvl: "15.8M SOL",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/silo-finance?w=48&h=48",
    url: "app.silo.finance"
  },
  "beets.fi/stake": {
    name: "beats.fi",
    description: "Flagship LST Hub",
    features: ["LST"],
    category: "Liquid Staking",
    tvl: "15.8M SOL",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/beets?w=48&h=48",
    url: "beets.fi/stake"
  },
  "euler.finance": {
    name: "Euler",
    description: "Non-custodial protocol for permissionless lending and borrowing",
    features: ["permissionless", "lending", "borrowing"],
    category: "Lending",
    tvl: "N/A",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/euler-v2?w=48&h=48",
    url: "https://www.euler.finance/"
  },
  "angles.fi": {
    name: "Angles",
    description: "Angles enhances Sonic with performant and secure LST ($anS). anS is compatible and can be used in DeFi to get maximum yield out of your Sonics",
    features: ["LST", "Sonic", "DeFi"],
    category: "Liquid Staking",
    tvl: "N/A",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/angles?w=48&h=48",
    url: "https://angles.fi"
  },
  "stability.farm/vaults": {
    name: "Stability",
    description: "Permissionless, non-custodial, and AI-powered automatic asset management solution.",
    features: ["permissionless", "non-custodial", "AI-powered", "automatic asset management"],
    category: "Liquidity Manager",
    tvl: "N/A",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/stability?w=48&h=48",
    url: "stability.farm/vaults"
  },
  "app.navigator.exchange/trade#/trade": {
    name: "Navigator",
    description: "Decentralized Liquidity Marketplace for effortless trading and continuous liquidity across Crypto, Forex, and beyond.",
    features: ["decentralized", "liquidity marketplace", "cross-market trading"],
    category: "Derivatives",
    tvl: "N/A",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/navigator?w=48&h=48",
    url: "app.navigator.exchange/trade#/trade"
  },
  "shadow.so/trade": {
    name: "Shadow Exchange",
    description: "A Sonic-native deconcentrated liquidity exchange.",
    features: ["concentrated liquidity", "Sonic-native", "DEX"],
    category: "Dexes",
    tvl: "N/A",
    chains: 1,
    logoUrl: "https://icons.llamao.fi/icons/protocols/shadow-exchange?w=48&h=48",
    url: "shadow.so/trade"
  }
};

export function getServiceByName(name: string): ServiceInfo | undefined {
  return serviceInfoMap[name] || Object.values(serviceInfoMap).find(service => service.name === name);
}

export function getServiceByUrl(url: string): ServiceInfo | undefined {
  return serviceInfoMap[url] || Object.values(serviceInfoMap).find(service => service.url === url);
} 