"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  SECURITY_REGISTRY_ADDRESS,
  SECURITY_REGISTRY_ABI,
} from "@/lib/contract";

export type SecurityScore = {
  overall: number;
  protocol: number;
  chain: number;
  market: number;
  social: number;
  gas: number;
};

export type ChainDetails = {
  protocolCount: number;
  totalValueLocked: number; // 单位：百万美元
  activeDefenses: number;
};

export type ChainSecurity = {
  score: SecurityScore;
  details: ChainDetails;
  lastUpdated: bigint;
  updatedBy: string;
};

// 链 ID 到链名称的映射（前端显示用）
export const CHAIN_NAMES: Record<number, { name: string; symbol: string }> = {
  1: { name: "Ethereum Mainnet", symbol: "ETH" },
  7001: { name: "ZetaChain Athens Testnet", symbol: "ZETA" },
  11155111: { name: "Ethereum Sepolia Testnet", symbol: "ETH" },
  137: { name: "Polygon Mainnet", symbol: "MATIC" },
  80002: { name: "Polygon Amoy Testnet", symbol: "MATIC" },
  97: { name: "BNB Smart Chain Testnet", symbol: "tBNB" },
  0: { name: "Bitcoin (Native)", symbol: "BTC" },
};

export function useSecurityRegistry() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(
    null
  );
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [supportedChainIds, setSupportedChainIds] = useState<number[]>([]);
  const [chainSecurities, setChainSecurities] = useState<
    Map<number, ChainSecurity>
  >(new Map());

  // 初始化 provider 和合约连接
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { ethereum } = window as any;
    if (!ethereum) return;

    const initProvider = async () => {
      try {
        const browserProvider = new ethers.BrowserProvider(ethereum);
        setProvider(browserProvider);

        const contractInstance = new ethers.Contract(
          SECURITY_REGISTRY_ADDRESS,
          SECURITY_REGISTRY_ABI,
          browserProvider
        );
        setContract(contractInstance);

        // 加载支持的链 ID
        await loadSupportedChains(contractInstance);
      } catch (err: any) {
        console.error("初始化 SecurityRegistry 连接失败:", err);
        setError(err?.message ?? "初始化失败");
      }
    };

    initProvider();
  }, []);

  // 加载支持的链 ID
  const loadSupportedChains = async (contractInstance: ethers.Contract) => {
    try {
      const count = await contractInstance.getSupportedChainCount();
      const chainCount = Number(count);

      // 分页获取所有链 ID（如果还没有任何链，则结果为空数组，前端会有对应文案）
      const allChainIds: number[] = [];
      const pageSize = 50;
      for (let offset = 0; offset < chainCount; offset += pageSize) {
        const limit = Math.min(pageSize, chainCount - offset);
        const chainIds = await contractInstance.getSupportedChainIds(
          offset,
          limit
        );
        allChainIds.push(...chainIds.map((id: bigint) => Number(id)));
      }
      setSupportedChainIds(allChainIds);

      // 加载所有链的安全数据
      await loadAllChainSecurities(contractInstance, allChainIds);
    } catch (err) {
      console.error("加载支持的链失败:", err);
    }
  };

  // 加载所有链的安全数据
  const loadAllChainSecurities = async (
    contractInstance: ethers.Contract,
    chainIds: number[]
  ) => {
    if (chainIds.length === 0) return;

    console.log(
      "[SecurityRegistry] 从合约读取安全数据, address:",
      SECURITY_REGISTRY_ADDRESS,
      "chainIds:",
      chainIds
    );

    setLoading(true);
    try {
      const securities = await contractInstance.getMultipleChainSecurities(
        chainIds
      );

      const newMap = new Map<number, ChainSecurity>();
      for (let i = 0; i < chainIds.length; i++) {
        const chainId = chainIds[i];
        const security = securities[i];

        // 检查数据是否有效（lastUpdated > 0 表示有数据）
        if (security && Number(security.lastUpdated) > 0) {
          console.log(
            "[SecurityRegistry] 读取到链安全数据:",
            chainId,
            {
              overall: Number(security.score.overall),
              protocol: Number(security.score.protocol),
              chain: Number(security.score.chain),
              market: Number(security.score.market),
              social: Number(security.score.social),
              gas: Number(security.score.gas),
            },
            "lastUpdated:",
            Number(security.lastUpdated),
            "updatedBy:",
            security.updatedBy
          );
          newMap.set(chainId, {
            score: {
              overall: Number(security.score.overall),
              protocol: Number(security.score.protocol),
              chain: Number(security.score.chain),
              market: Number(security.score.market),
              social: Number(security.score.social),
              gas: Number(security.score.gas),
            },
            details: {
              protocolCount: Number(security.details.protocolCount),
              totalValueLocked: Number(security.details.totalValueLocked),
              activeDefenses: Number(security.details.activeDefenses),
            },
            lastUpdated: security.lastUpdated,
            updatedBy: security.updatedBy,
          });
        }
      }
      setChainSecurities(newMap);
    } catch (err) {
      console.error("加载安全数据失败:", err);
      setError("加载安全数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const refresh = async () => {
    if (!contract) return;
    await loadSupportedChains(contract);
  };

  // 获取单条链的安全数据
  const getChainSecurity = async (
    chainId: number
  ): Promise<ChainSecurity | null> => {
    if (!contract) return null;
    try {
      const security = await contract.getChainSecurity(chainId);
      if (Number(security.lastUpdated) === 0) return null;

      console.log(
        "[SecurityRegistry] getChainSecurity 直接读取:",
        chainId,
        {
          overall: Number(security.score.overall),
          protocol: Number(security.score.protocol),
          chain: Number(security.score.chain),
          market: Number(security.score.market),
          social: Number(security.score.social),
          gas: Number(security.score.gas),
        },
        "lastUpdated:",
        Number(security.lastUpdated),
        "updatedBy:",
        security.updatedBy
      );

      return {
        score: {
          overall: Number(security.score.overall),
          protocol: Number(security.score.protocol),
          chain: Number(security.score.chain),
          market: Number(security.score.market),
          social: Number(security.score.social),
          gas: Number(security.score.gas),
        },
        details: {
          protocolCount: Number(security.details.protocolCount),
          totalValueLocked: Number(security.details.totalValueLocked),
          activeDefenses: Number(security.details.activeDefenses),
        },
        lastUpdated: security.lastUpdated,
        updatedBy: security.updatedBy,
      };
    } catch (err) {
      console.error("获取链安全数据失败:", err);
      return null;
    }
  };

  return {
    provider,
    contract,
    loading,
    error,
    supportedChainIds,
    chainSecurities,
    refresh,
    getChainSecurity,
  };
}

