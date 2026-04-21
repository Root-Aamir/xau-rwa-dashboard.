"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, polygon, bsc } from "wagmi/chains"; // Thodi aur chains add ki hain
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useState, useEffect } from "react";

const config = createConfig(
  getDefaultConfig({
    // 1. Chains setup
    chains: [mainnet, polygon, bsc],
    transports: {
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [bsc.id]: http(),
    },

    // 2. IMPORTANT: Yahan apni ID daalein (cloud.walletconnect.com se free milti hai)
    // Agar abhi nahi hai, toh ise khali string "" na chhodein
    walletConnectProjectId: "3fcc6b446f0338a09f7d365a23ad2026", 

    appName: "XauCore RWA",
    appDescription: "Institutional Gold Tokenization Portal",
    appUrl: "https://xaucore.com",
  }),
);

const queryClient = new QueryClient();

export function Providers({ children }) {
  // 3. Hydration Fix: Ye zaroori hai taaki wallet local par sahi dikhe
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="dark" mode="dark">
          {mounted && children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}