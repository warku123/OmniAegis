'use client';

import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useGuardianContract } from "@/hooks/useGuardianContract";
import {
  useSecurityRegistry,
  CHAIN_NAMES,
  type ChainSecurity as RegistryChainSecurity,
} from "@/hooks/useSecurityRegistry";
import {
  GUARDIAN_CONTRACT_ADDRESS,
  STRATEGY_REGISTRY_ADDRESS,
  STRATEGY_REGISTRY_ABI,
} from "@/lib/contract";
import type { DefenseAction } from "@/hooks/useGuardianContract";

type StrategyMode = "conservative" | "balanced" | "aggressive";
type DashboardTab = "overview" | "assets" | "strategy" | "incidents";

const mockChains = [
  {
    name: "Ethereum",
    value: "$52,430",
    health: "良好",
    risk: 32,
  },
  {
    name: "ZetaChain",
    value: "$18,920",
    health: "优",
    risk: 21,
  },
  {
    name: "Bitcoin (Native)",
    value: "$73,580",
    health: "良好",
    risk: 28,
  },
];

const mockAlerts = [
  {
    title: "借贷仓位健康度下降",
    desc: "某链借贷仓位健康因子在 30 分钟内从 1.6 降至 1.25 · 建议降低杠杆并跨链再平衡。",
    level: "高",
  },
  {
    title: "协议利用率异常升高",
    desc: "某借贷协议利用率 > 90% 且资金集中度过高 · 建议分散至其他协议。",
    level: "中",
  },
];

const mockGlobalRisk = {
  score: 54,
  label: "中等 · 可防御",
  comment: "当前组合风险可控，已启用自动防御策略。如市场波动加剧，将自动触发跨链“逃生”计划。",
};

const STRATEGY_MODES: { id: StrategyMode; label: string; desc: string }[] = [
  { id: "conservative", label: "保守", desc: "优先保本，提前减仓" },
  { id: "balanced", label: "均衡", desc: "风险收益平衡" },
  { id: "aggressive", label: "激进", desc: "追求收益，容忍波动" },
];

type AssetChainConfig = {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
};

type AssetState = {
  balance: string | null; // 原生资产余额（格式化后的字符串）
  loading: boolean;
  error: string | null;
};

type UserStrategy = {
  mode: StrategyMode;
  overallThreshold: number; // 总体安全分低于多少触发（0-100）
  protocolRiskThreshold: number; // 任一链协议风险高于多少触发（0-100）
  autoExecute: boolean; // 是否允许 AI 自动执行（否则仅提示 + 一键确认）
  transferRatio: number; // 触发时建议调整的仓位比例（0-100）
  protectStablecoins: boolean; // 是否优先保护稳定币仓位
  protectBlueChips: boolean; // 是否优先保护蓝筹资产
  perChainOverallThresholds: Record<number, number>; // 针对每条链单独配置的总体安全分阈值（可覆盖全局）
  perChainProtocolThresholds: Record<number, number>; // 每条链单独的协议风险阈值
  perChainTransferRatios: Record<number, number>; // 每条链单独的调仓比例
  // 跨链执行相关偏好
  primarySafeChainId: number | null; // 首选逃生链
  secondarySafeChainId: number | null; // 备选逃生链
  minCrossChainValueUsd: number; // 最小跨链规模（USD 估值）
  maxDailyExitCount: number; // 每日最大自动执行次数
  maxSlippagePercent: number; // 允许的最大滑点（百分比）
  maxBridgeFeePercent: number; // 允许的最大跨链手续费占比（百分比）
  preferNativeBridgeOnly: boolean; // 是否只使用原生跨链通道
  avoidChainIds: number[]; // 不希望作为落地点的链
};

const ASSET_CHAINS: AssetChainConfig[] = [
  {
    id: 7001,
    name: "ZetaChain Athens",
    symbol: "ZETA",
    rpcUrl: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
  },
  {
    id: 11155111,
    name: "Ethereum Sepolia",
    symbol: "ETH",
    rpcUrl: "https://sepolia.gateway.tenderly.co", // 公共测试网 RPC，可根据需要替换
  },
  {
    id: 80002,
    name: "Polygon Amoy",
    symbol: "MATIC",
    rpcUrl: "https://rpc-amoy.polygon.technology",
  },
  {
    id: 97,
    name: "BNB Smart Chain Testnet",
    symbol: "tBNB",
    rpcUrl: "https://bsc-testnet-rpc.publicnode.com",
  },
];

const DASHBOARD_TABS: { id: DashboardTab; label: string; desc: string }[] = [
  { id: "overview", label: "总览", desc: "全局风险与防御状态" },
  { id: "assets", label: "各链资产", desc: "按链查看资产与风险" },
  { id: "strategy", label: "策略配置", desc: "AI 风控与逃生策略" },
  { id: "incidents", label: "安全事件", desc: "告警与演练记录" },
];

export default function DashboardPage() {
  const [currentMode, setCurrentMode] = useState<StrategyMode>("balanced");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [assetStates, setAssetStates] = useState<Record<number, AssetState>>({});
  const [userStrategy, setUserStrategy] = useState<UserStrategy | null>(null);
  const [activeThresholdChainId, setActiveThresholdChainId] =
    useState<number>(7001); // 默认在 ZetaChain 上配置
  const [syncingGlobalConfig, setSyncingGlobalConfig] = useState(false);
  const [syncingChainThresholds, setSyncingChainThresholds] = useState(false);
  const [globalConfigError, setGlobalConfigError] = useState<string | null>(null);
  const [chainThresholdsError, setChainThresholdsError] = useState<string | null>(null);
  const loadingStrategyRef = useRef(false); // 防止重复加载策略
  const {
    account,
    isGuardian,
    isOwner,
    actionsCount,
    loading,
    error,
    setGuardian,
    executeDefense,
    getAction,
    refresh,
  } = useGuardianContract();
  const { chainSecurities } = useSecurityRegistry();

  const [defenseHistory, setDefenseHistory] = useState<DefenseAction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // 加载防御历史记录
  useEffect(() => {
    if (actionsCount > 0) {
      loadHistory();
    }
  }, [actionsCount]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const history: DefenseAction[] = [];
      for (let i = 0; i < actionsCount; i++) {
        const action = await getAction(i);
        if (action) history.push(action);
      }
      setDefenseHistory(history.reverse()); // 最新的在前
    } catch (err) {
      console.error("加载历史记录失败:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSetGuardian = async () => {
    if (!account) return;
    try {
      const hash = await setGuardian(account, true);
      setTxHash(hash);
      await refresh();
      alert(`成功！交易哈希: ${hash}`);
    } catch (err: any) {
      alert(`失败: ${err.message}`);
    }
  };

  const handleExecuteDefense = async () => {
    if (!account) return;
    try {
      const actionType = "CROSS_CHAIN_EXIT";
      const metadata = JSON.stringify({
        reason: "AI 检测到高风险，触发自动防御",
        riskScore: 84,
        timestamp: Date.now(),
      });
      const hash = await executeDefense(actionType, metadata);
      setTxHash(hash);
      await refresh();
      await loadHistory();
      alert(`防御动作已执行！交易哈希: ${hash}`);
    } catch (err: any) {
      alert(`失败: ${err.message}`);
    }
  };

  const shortAddress = (addr: string) =>
    addr.slice(0, 6) + "..." + addr.slice(-4);

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("zh-CN");
  };

  // 初始化用户策略（从链上读取）
  useEffect(() => {
    const loadStrategy = async () => {
      if (!account) {
        setUserStrategy(null);
        return;
      }
      // 防止重复执行
      if (loadingStrategyRef.current) {
        return;
      }
      loadingStrategyRef.current = true;
      try {
        // 1. 默认全 0 策略
        const base: UserStrategy = {
          mode: "balanced",
          overallThreshold: 0,
          protocolRiskThreshold: 0,
          autoExecute: false,
          transferRatio: 0,
          protectStablecoins: false,
          protectBlueChips: false,
          perChainOverallThresholds: {},
          perChainProtocolThresholds: {},
          perChainTransferRatios: {},
          primarySafeChainId: 7001,
          secondarySafeChainId: 0,
          minCrossChainValueUsd: 0,
          maxDailyExitCount: 0,
          maxSlippagePercent: 0,
          maxBridgeFeePercent: 0,
          preferNativeBridgeOnly: true,
          avoidChainIds: [],
        };

        // 2. 从链上加载（如果有 StrategyRegistry 地址）
        if (
          STRATEGY_REGISTRY_ADDRESS &&
          STRATEGY_REGISTRY_ADDRESS !==
            "0x0000000000000000000000000000000000000000"
        ) {
          const { ethereum } = window as any;
          if (ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const contract = new ethers.Contract(
              STRATEGY_REGISTRY_ADDRESS,
              STRATEGY_REGISTRY_ABI,
              provider
            );
            const cfg = await contract.getGlobalConfig(account);
            if (cfg.exists) {
              base.mode =
                cfg.riskMode === 0
                  ? "conservative"
                  : cfg.riskMode === 2
                  ? "aggressive"
                  : "balanced";
              base.autoExecute = cfg.autoExecute;
              base.protectStablecoins = cfg.protectStablecoins;
              base.protectBlueChips = cfg.protectBlueChips;
              base.overallThreshold = Number(cfg.defaultOverallThreshold);
              base.protocolRiskThreshold = Number(
                cfg.defaultProtocolThreshold
              );
              base.transferRatio = Number(cfg.defaultTransferRatio);
              base.primarySafeChainId = Number(cfg.primarySafeChainId);
              base.secondarySafeChainId = Number(cfg.secondarySafeChainId);
              base.minCrossChainValueUsd = Number(cfg.minCrossChainValueUsd);
              base.maxDailyExitCount = Number(cfg.maxDailyExitCount);
              base.maxSlippagePercent = Number(cfg.maxSlippageBps) / 100;
              base.maxBridgeFeePercent = Number(cfg.maxBridgeFeeBps) / 100;
              base.preferNativeBridgeOnly = cfg.preferNativeBridgeOnly;
            }

            // 加载每条链的阈值
            const perOverall: Record<number, number> = {};
            const perProtocol: Record<number, number> = {};
            const perRatio: Record<number, number> = {};
            for (const c of ASSET_CHAINS) {
              const th = await contract.getChainThreshold(account, c.id);
              if (th.exists) {
                perOverall[c.id] = Number(th.overallThreshold);
                perProtocol[c.id] = Number(th.protocolThreshold);
                perRatio[c.id] = Number(th.transferRatio);
              }
            }
            base.perChainOverallThresholds = perOverall;
            base.perChainProtocolThresholds = perProtocol;
            base.perChainTransferRatios = perRatio;
          }
        }

        setUserStrategy(base);
        setCurrentMode(base.mode);
      } catch (e) {
        console.error("从链上加载策略失败:", e);
        setUserStrategy(null);
      } finally {
        loadingStrategyRef.current = false;
      }
    };

    loadStrategy().catch((e) => {
      console.error("加载策略时出错:", e);
      loadingStrategyRef.current = false;
    });
  }, [account]);

  const saveStrategy = (strategy: UserStrategy) => {
    setUserStrategy(strategy);
  };

  // 加载各测试网的原生资产余额（仅在有账户时触发）
  useEffect(() => {
    if (!account) return;

    let cancelled = false;

    const loadBalances = async () => {
      // 先把所有链标记为 loading
      setAssetStates((prev) => {
        const next: Record<number, AssetState> = { ...prev };
        for (const chain of ASSET_CHAINS) {
          next[chain.id] = {
            balance: prev[chain.id]?.balance ?? null,
            loading: true,
            error: null,
          };
        }
        return next;
      });

      for (const chain of ASSET_CHAINS) {
        try {
          const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
          const balanceBigint = await provider.getBalance(account);
          if (cancelled) return;
          const formatted = ethers.formatEther(balanceBigint);
          setAssetStates((prev) => ({
            ...prev,
            [chain.id]: {
              balance: formatted,
              loading: false,
              error: null,
            },
          }));
        } catch (err) {
          if (cancelled) return;
          const message =
            err instanceof Error ? err.message : "查询余额失败，请稍后重试";
          setAssetStates((prev) => ({
            ...prev,
            [chain.id]: {
              balance: null,
              loading: false,
              error: message,
            },
          }));
        }
      }
    };

    void loadBalances();

    return () => {
      cancelled = true;
    };
  }, [account]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-6xl gap-6 px-6 py-8 md:px-10 md:py-10">
        {/* 左侧 Tab 导航 */}
        <aside className="hidden w-52 shrink-0 flex-col gap-3 md:flex">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              OmniAegis
            </p>
            <p className="mt-1 text-sm font-medium text-slate-100">
              防御控制台
            </p>
          </div>
          <nav className="space-y-1">
            {DASHBOARD_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full rounded-2xl px-3 py-2 text-left text-xs transition ${
                    active
                      ? "bg-sky-500/15 text-sky-100 ring-1 ring-sky-500/40"
                      : "text-slate-300 hover:bg-slate-900/60 hover:text-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{tab.label}</span>
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {tab.desc}
                  </p>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 右侧内容区域 */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                风险监控与策略控制台
              </h1>
              <p className="mt-2 text-xs text-slate-300/80 sm:text-sm">
                实时洞察你在多条链上的资产风险，配置 AI 风控与 ZetaChain 跨链执行策略。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <WalletConnectButton variant="compact" showError={false} />
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-medium text-emerald-300">
                自动防御 · 已开启
              </span>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">
                当前风险偏好：{" "}
                <span className="font-semibold text-sky-300">
                  {currentMode === "conservative"
                    ? "保守"
                    : currentMode === "balanced"
                    ? "均衡"
                    : "激进"}
                </span>
              </span>
            </div>
          </div>

          {/* 总览 Tab 内容 */}
          {activeTab === "overview" && (
            <>
              <section className="grid gap-5 md:grid-cols-[1.2fr,1fr]">
                {/* Global risk card */}
                <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Global Risk
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-50">
                        全链组合风险评分
                      </p>
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <span className="text-2xl font-semibold text-amber-300">
                        {mockGlobalRisk.score}
                      </span>
                      <span className="text-xs text-slate-300">
                        {mockGlobalRisk.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                    {mockGlobalRisk.comment}
                  </p>

                  <div className="mt-3 grid gap-3 text-xs text-slate-200 sm:grid-cols-3 sm:text-sm">
                    <div className="rounded-2xl bg-slate-900/80 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        协议风险
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-50">
                        中等
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        部分借贷与流动性协议利用率偏高，已开启分散与限额策略。
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-900/80 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        链级风险
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-50">
                        偏低
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        主要资产分布在蓝筹链，监控重点为临时性拥堵与 Gas 异常。
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-900/80 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        市场波动
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-50">
                        正常
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        波动率处于近 30 天均值附近，暂不触发大规模仓位调整。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Strategy control */}
                <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Strategy
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-50">
                        风险偏好与自动策略
                      </p>
                    </div>
                    <span className="rounded-full bg-sky-500/20 px-3 py-1 text-[11px] font-medium text-sky-200">
                      Demo · 前端 Mock，无真实链上操作
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STRATEGY_MODES.map((mode) => {
                      const active = currentMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setCurrentMode(mode.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs sm:text-sm ${
                            active
                              ? "border-sky-400 bg-sky-500/20 text-sky-100"
                              : "border-slate-700 text-slate-200 hover:border-slate-400"
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2 text-xs text-slate-200 sm:text-sm">
                    <label className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-3 py-2.5">
                      <div>
                        <p className="font-medium">自动跨链“逃生”</p>
                        <p className="text-[11px] text-slate-400">
                          当清算风险或协议风险超过阈值时，自动触发跨链仓位迁移。
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        已启用
                      </span>
                    </label>

                    <label className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-3 py-2.5">
                      <div>
                        <p className="font-medium">Gas 危机资产撤离</p>
                        <p className="text-[11px] text-slate-400">
                          当链上 Gas 异常、严重拥堵时，将高价值资产转移到更稳定链。
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        已启用
                      </span>
                    </label>

                    <label className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-3 py-2.5">
                      <div>
                        <p className="font-medium">智能跨链保险补仓</p>
                        <p className="text-[11px] text-slate-400">
                          检测到保障缺口时，自动为核心仓位一键补齐跨链保险。
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-700/60 px-3 py-1 text-[11px] font-semibold text-slate-200">
                        计划中
                      </span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Chains & alerts */}
              <section className="grid gap-5 md:grid-cols-[1.2fr,1fr]">
                <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-50">
                      多链资产与风险视图
                    </p>
                    <span className="text-xs text-slate-400">
                      数据示意 · 后续通过 ZetaChain 读取链上真实状态
                    </span>
                  </div>
                  <div className="divide-y divide-slate-800/80 text-xs text-slate-200 sm:text-sm">
                    {mockChains.map((chain) => (
                      <div
                        key={chain.name}
                        className="flex items-center justify-between py-3"
                      >
                        <div>
                          <p className="font-medium">{chain.name}</p>
                          <p className="text-[11px] text-slate-400 sm:text-xs">
                            健康度：{chain.health}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm text-slate-50">
                            {chain.value}
                          </p>
                          <p className="text-[11px] text-amber-300 sm:text-xs">
                            风险评分：{chain.risk}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                  <p className="text-sm font-medium text-slate-50">
                    实时告警流
                  </p>
                  <div className="space-y-3 text-xs text-slate-200 sm:text-sm">
                    {mockAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl bg-slate-900/85 p-3 ring-1 ring-slate-800/80"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{alert.title}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              alert.level === "高"
                                ? "bg-rose-500/20 text-rose-200"
                                : "bg-amber-500/20 text-amber-200"
                            }`}
                          >
                            {alert.level} 优先级
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-300 sm:text-xs">
                          {alert.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 合约交互卡片 */}
              {account && (
                <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        ZetaChain Contract
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-50">
                        链上防御执行记录
                      </p>
                    </div>
                    <a
                      href={`https://zetachain-athens-3.blockscout.com/address/${GUARDIAN_CONTRACT_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:text-sky-300"
                    >
                      查看合约 →
                    </a>
                  </div>

                  <div className="mb-4 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>合约地址:</span>
                      <span className="font-mono text-slate-200">
                        {shortAddress(GUARDIAN_CONTRACT_ADDRESS)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>当前账户:</span>
                      <span className="font-mono text-slate-200">
                        {shortAddress(account)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Guardian 权限:</span>
                      <span
                        className={`font-semibold ${
                          isGuardian ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {isGuardian ? "✅ 已授权" : "❌ 未授权"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>防御记录总数:</span>
                      <span className="font-semibold text-sky-300">
                        {actionsCount}
                      </span>
                    </div>
                  </div>

                  {!isGuardian && isOwner && (
                    <button
                      onClick={handleSetGuardian}
                      disabled={loading}
                      className="mb-3 w-full rounded-full border border-sky-500/50 bg-sky-500/10 px-4 py-2 text-xs font-medium text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "处理中..." : "授权当前账户为 Guardian"}
                    </button>
                  )}

                  {isGuardian && (
                    <button
                      onClick={handleExecuteDefense}
                      disabled={loading}
                      className="mb-3 w-full rounded-full bg-sky-500 px-4 py-2 text-xs font-medium text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "执行中..." : "🚀 触发防御动作（Demo）"}
                    </button>
                  )}

                  {error && (
                    <p className="mb-3 text-[11px] text-rose-300">{error}</p>
                  )}

                  {txHash && (
                    <a
                      href={`https://zetachain-athens-3.blockscout.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-3 block text-[11px] text-sky-400 hover:text-sky-300"
                    >
                      查看交易: {shortAddress(txHash)} →
                    </a>
                  )}

                  {/* 防御历史记录 */}
                  {actionsCount > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-slate-400">
                        最近防御记录
                      </p>
                      {loadingHistory ? (
                        <p className="text-xs text-slate-400">加载中...</p>
                      ) : (
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                          {defenseHistory.map((action, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-[11px]"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-200">
                                  {action.actionType}
                                </span>
                                <span className="text-slate-400">
                                  {formatTime(action.timestamp)}
                                </span>
                              </div>
                              <p className="mt-1 text-slate-400">
                                触发者: {shortAddress(action.triggeredBy)}
                              </p>
                              {action.metadata && (
                                <p className="mt-1 truncate text-slate-500">
                                  {action.metadata}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          {/* 各链资产 Tab */}
          {activeTab === "assets" && (
            <section className="space-y-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-sm font-semibold text-slate-50">
                    各链资产与风险分布
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    按链聚合你的资产头寸，并结合安全指数（未来接入）评估每条链的暴露风险。
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="rounded-full border border-slate-700 px-2.5 py-1">
                    当前地址：{account ? shortAddress(account) : "未连接"}
                  </span>
                  <span className="rounded-full border border-slate-700 px-2.5 py-1">
                    数据来源：各测试网 RPC 原生余额 · 后续接入 DeFi 头寸与 AI 聚合
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {ASSET_CHAINS.map((chain) => {
                  const registryData: RegistryChainSecurity | undefined =
                    chainSecurities.get(chain.id);
                  const state = assetStates[chain.id];
                  const loadingBalance = !!state?.loading;
                  const hasError = !!state?.error;
                  const balance =
                    state?.balance !== null && state?.balance !== undefined
                      ? state.balance
                      : account
                      ? "--"
                      : "-";

                  const numericBalance = state?.balance
                    ? Number(state.balance)
                    : 0;
                  const overallScore = registryData?.score.overall ?? null;

                  let health: string;
                  let riskScore: number;

                  if (overallScore !== null) {
                    riskScore = overallScore;
                    if (overallScore >= 80) health = "优";
                    else if (overallScore >= 60) health = "良好";
                    else if (overallScore >= 40) health = "一般";
                    else health = "低";
                  } else {
                    if (numericBalance > 5) {
                      health = "优";
                      riskScore = 20;
                    } else if (numericBalance > 1) {
                      health = "良好";
                      riskScore = 30;
                    } else if (numericBalance > 0) {
                      health = "一般";
                      riskScore = 45;
                    } else {
                      health = "低";
                      riskScore = 65;
                    }
                  }

                  const chainMeta = CHAIN_NAMES[chain.id];

                  return (
                    <div
                      key={chain.id}
                      className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-50">
                            {chainMeta?.name ?? chain.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {chainMeta?.symbol ? `${chainMeta.symbol} · ` : ""}
                            健康度：{health} · 安全分{" "}
                            {overallScore !== null
                              ? `${overallScore} / 100`
                              : "暂未上链"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm text-slate-50">
                            {loadingBalance
                              ? "加载中..."
                              : hasError
                              ? "查询失败"
                              : balance}{" "}
                            {account && !hasError && !loadingBalance
                              ? chain.symbol
                              : ""}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            原生资产余额（Testnet）
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-[11px] text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">资产类型分布</span>
                          <span className="text-slate-500">示意</span>
                        </div>
                        <div className="flex h-2 overflow-hidden rounded-full bg-slate-900">
                          <div className="h-full flex-1 bg-sky-500/80" />
                          <div className="h-full flex-[0.6] bg-emerald-500/80" />
                          <div className="h-full flex-[0.4] bg-amber-500/80" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>现货 & LP</span>
                          <span>借贷头寸</span>
                          <span>其他衍生敞口</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <div>
                          <p className="text-slate-400">AI 风控建议（示意）</p>
                          <p className="mt-0.5">
                            {overallScore !== null
                              ? overallScore >= 70
                                ? "该链安全分较高，可作为主要防御落地点或资产承载链。"
                                : "该链安全分一般，建议只保留必要仓位，更多作为中转链使用。"
                              : "该链安全分暂未写入 SecurityRegistry，目前仅基于余额做简单评估。"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                        <button className="rounded-full border border-slate-700 px-3 py-1 text-slate-200 transition hover:border-sky-400 hover:text-sky-200">
                          查看安全详情
                        </button>
                        <button className="rounded-full border border-slate-700 px-3 py-1 text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200">
                          仅对该链执行防御（Demo）
                        </button>
                      </div>

                      {hasError && (
                        <p className="pt-1 text-[10px] text-rose-400">
                          查询失败：{assetStates[chain.id]?.error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 策略配置 Tab */}
          {activeTab === "strategy" && (
            <section className="space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  策略配置中心
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  为当前地址设置 AI 风控的触发阈值与优先执行的防御动作（当前策略仅保存在本地，后续可上链到 Strategy 合约）。
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    触发阈值（按链）
                  </p>
                  <div className="space-y-3 text-[11px] text-slate-300">
                    {/* 选择要配置的链 */}
                    <div className="flex flex-wrap gap-1.5">
                      {ASSET_CHAINS.map((chain) => {
                        const chainMeta = CHAIN_NAMES[chain.id];
                        const active = activeThresholdChainId === chain.id;
                        return (
                          <button
                            key={chain.id}
                            onClick={() => setActiveThresholdChainId(chain.id)}
                            className={`rounded-full border px-2.5 py-1 text-[11px] ${
                              active
                                ? "border-sky-400 bg-sky-500/20 text-sky-100"
                                : "border-slate-700 text-slate-300 hover:border-slate-500"
                            }`}
                          >
                            {chainMeta?.symbol ?? chain.symbol}
                          </button>
                        );
                      })}
                    </div>

                    {(() => {
                      if (!userStrategy) return null;
                      const chainId = activeThresholdChainId;
                      const chainMeta = CHAIN_NAMES[chainId];

                      const baseOverall = userStrategy.overallThreshold ?? 60;
                      const baseProtocol =
                        userStrategy.protocolRiskThreshold ?? 75;
                      const baseRatio = userStrategy.transferRatio ?? 50;

                      const perOverall =
                        userStrategy.perChainOverallThresholds?.[chainId];
                      const perProtocol =
                        userStrategy.perChainProtocolThresholds?.[chainId];
                      const perRatio =
                        userStrategy.perChainTransferRatios?.[chainId];

                      const chainOverall = perOverall ?? baseOverall;
                      const chainProtocol = perProtocol ?? baseProtocol;
                      const chainRatio = perRatio ?? baseRatio;

                      return (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-400">
                            当前配置链：{" "}
                            <span className="font-semibold text-slate-100">
                              {chainMeta?.name ?? `Chain ${chainId}`}
                            </span>
                          </p>

                          {/* 该链总体安全分阈值 */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span>该链总体安全分低于</span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={chainOverall}
                                  onChange={(e) => {
                                    const v = Math.min(
                                      100,
                                      Math.max(0, Number(e.target.value) || 0)
                                    );
                                    saveStrategy({
                                      ...userStrategy,
                                      perChainOverallThresholds: {
                                        ...userStrategy.perChainOverallThresholds,
                                        [chainId]: v,
                                      },
                                    });
                                  }}
                                  className="w-14 rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-right font-mono text-amber-300 outline-none focus:border-amber-400"
                                />
                                <span className="text-slate-500">/ 100</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={chainOverall}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                saveStrategy({
                                  ...userStrategy,
                                  perChainOverallThresholds: {
                                    ...userStrategy.perChainOverallThresholds,
                                    [chainId]: v,
                                  },
                                });
                              }}
                              className="w-full accent-amber-400"
                            />
                          </div>

                          {/* 该链协议风险阈值 */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span>该链协议风险高于</span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={chainProtocol}
                                  onChange={(e) => {
                                    const v = Math.min(
                                      100,
                                      Math.max(0, Number(e.target.value) || 0)
                                    );
                                    saveStrategy({
                                      ...userStrategy,
                                      perChainProtocolThresholds: {
                                        ...userStrategy.perChainProtocolThresholds,
                                        [chainId]: v,
                                      },
                                    });
                                  }}
                                  className="w-14 rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-right font-mono text-rose-300 outline-none focus:border-rose-400"
                                />
                                <span className="text-slate-500">/ 100</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={chainProtocol}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                saveStrategy({
                                  ...userStrategy,
                                  perChainProtocolThresholds: {
                                    ...userStrategy.perChainProtocolThresholds,
                                    [chainId]: v,
                                  },
                                });
                              }}
                              className="w-full accent-rose-400"
                            />
                          </div>

                          {/* 该链调仓比例 */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span>触发时调整该链持仓比例</span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={chainRatio}
                                  onChange={(e) => {
                                    const v = Math.min(
                                      100,
                                      Math.max(0, Number(e.target.value) || 0)
                                    );
                                    saveStrategy({
                                      ...userStrategy,
                                      perChainTransferRatios: {
                                        ...userStrategy.perChainTransferRatios,
                                        [chainId]: v,
                                      },
                                    });
                                  }}
                                  className="w-14 rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-right font-mono text-sky-300 outline-none focus:border-sky-400"
                                />
                                <span className="text-slate-500">%</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={chainRatio}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                saveStrategy({
                                  ...userStrategy,
                                  perChainTransferRatios: {
                                    ...userStrategy.perChainTransferRatios,
                                    [chainId]: v,
                                  },
                                });
                              }}
                              className="w-full accent-sky-400"
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 写入按链配置按钮 */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      disabled={
                        !account ||
                        syncingChainThresholds ||
                        !userStrategy ||
                        !STRATEGY_REGISTRY_ADDRESS ||
                        STRATEGY_REGISTRY_ADDRESS ===
                          "0x0000000000000000000000000000000000000000"
                      }
                      onClick={async () => {
                        if (!account || !userStrategy) return;
                        setChainThresholdsError(null);
                        try {
                          setSyncingChainThresholds(true);
                          const { ethereum } = window as any;
                          if (!ethereum) {
                            throw new Error("未检测到以太坊钱包");
                          }
                          const provider = new ethers.BrowserProvider(ethereum);
                          const signer = await provider.getSigner();
                          const contract = new ethers.Contract(
                            STRATEGY_REGISTRY_ADDRESS,
                            STRATEGY_REGISTRY_ABI,
                            signer
                          );

                          // 写入每条链的单独阈值（按当前 UI 4 条链）
                          const chainIds = ASSET_CHAINS.map((c) => c.id);
                          const overallThresholds = chainIds.map(
                            (id) =>
                              userStrategy.perChainOverallThresholds[id] ??
                              userStrategy.overallThreshold
                          );
                          const protocolThresholds = chainIds.map(
                            (id) =>
                              userStrategy.perChainProtocolThresholds[id] ??
                              userStrategy.protocolRiskThreshold
                          );
                          const transferRatios = chainIds.map(
                            (id) =>
                              userStrategy.perChainTransferRatios[id] ??
                              userStrategy.transferRatio
                          );

                          const tx = await contract.setChainThresholds(
                            chainIds,
                            overallThresholds,
                            protocolThresholds,
                            transferRatios
                          );
                          await tx.wait();
                        } catch (e: unknown) {
                          const err =
                            e instanceof Error
                              ? e.message
                              : "写入按链配置失败";
                          setChainThresholdsError(err);
                        } finally {
                          setSyncingChainThresholds(false);
                        }
                      }}
                      className="rounded-full bg-sky-500 px-4 py-2 text-xs font-medium text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {syncingChainThresholds
                        ? "写入中..."
                        : "写入按链配置"}
                    </button>
                    {chainThresholdsError && (
                      <p className="text-[11px] text-rose-400">
                        {chainThresholdsError}
                      </p>
                    )}
                  </div>
                </div>

              <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-[11px] text-slate-300 sm:text-xs">
                <p className="text-xs font-semibold text-slate-200">
                  全局配置与跨链执行参数
                </p>

                {/* Risk Appetite 部分 */}
                <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Risk Appetite
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STRATEGY_MODES.map((mode) => {
                      const active = currentMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setCurrentMode(mode.id);
                            if (userStrategy) {
                              saveStrategy({ ...userStrategy, mode: mode.id });
                            }
                          }}
                          className={`rounded-full border px-3 py-1.5 text-xs sm:text-sm ${
                            active
                              ? "border-sky-400 bg-sky-500/20 text-sky-100"
                              : "border-slate-700 text-slate-200 hover:border-slate-400"
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    不同风险偏好会影响 AI 对「是否立即触发逃生」的判断阈值（未来后端/合约可以直接读取并执行）。
                  </p>
                </div>

                {/* 跨链执行参数部分 */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    跨链执行参数
                  </p>

                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-900/60 px-3 py-2">
                  <span className="text-[11px] text-slate-400">
                    写入全局配置与跨链执行参数到链上。
                  </span>
                  <button
                    type="button"
                    disabled={
                      !account ||
                      syncingGlobalConfig ||
                      !userStrategy ||
                      !STRATEGY_REGISTRY_ADDRESS ||
                      STRATEGY_REGISTRY_ADDRESS ===
                        "0x0000000000000000000000000000000000000000"
                    }
                    onClick={async () => {
                      if (!account || !userStrategy) return;
                      setGlobalConfigError(null);
                      try {
                        setSyncingGlobalConfig(true);
                        const { ethereum } = window as any;
                        if (!ethereum) {
                          throw new Error("未检测到以太坊钱包");
                        }
                        const provider = new ethers.BrowserProvider(ethereum);
                        const signer = await provider.getSigner();
                        const contract = new ethers.Contract(
                          STRATEGY_REGISTRY_ADDRESS,
                          STRATEGY_REGISTRY_ABI,
                          signer
                        );

                        const riskMode =
                          userStrategy.mode === "conservative"
                            ? 0
                            : userStrategy.mode === "aggressive"
                            ? 2
                            : 1;

                        // 写入全局配置（包括跨链执行参数）
                        const tx = await contract.setGlobalConfig(
                          riskMode,
                          userStrategy.autoExecute,
                          userStrategy.protectStablecoins,
                          userStrategy.protectBlueChips,
                          userStrategy.overallThreshold,
                          userStrategy.protocolRiskThreshold,
                          userStrategy.transferRatio,
                          userStrategy.primarySafeChainId,
                          userStrategy.secondarySafeChainId,
                          userStrategy.minCrossChainValueUsd,
                          userStrategy.maxDailyExitCount,
                          Math.round(userStrategy.maxSlippagePercent * 100),
                          Math.round(userStrategy.maxBridgeFeePercent * 100),
                          userStrategy.preferNativeBridgeOnly
                        );
                        await tx.wait();
                      } catch (e: unknown) {
                        const err =
                          e instanceof Error
                            ? e.message
                            : "写入跨链执行参数失败";
                        setGlobalConfigError(err);
                      } finally {
                        setSyncingGlobalConfig(false);
                      }
                    }}
                    className="rounded-full bg-sky-500 px-4 py-2 text-xs font-medium text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {syncingGlobalConfig
                      ? "写入中..."
                      : "写入跨链执行参数"}
                  </button>
                </div>
                {globalConfigError && (
                  <p className="text-[11px] text-rose-400">
                    {globalConfigError}
                  </p>
                )}

                {/* 落地点选择 */}
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400">
                    选择优先落地点链和备选落地点链（当主链安全分也不达标时可退到备选链）。
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-400">首选落地点链</p>
                      <select
                        value={userStrategy?.primarySafeChainId ?? 7001}
                        onChange={(e) => {
                          if (!userStrategy) return;
                          const v = Number(e.target.value);
                          saveStrategy({
                            ...userStrategy,
                            primarySafeChainId: v,
                          });
                        }}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-sky-400"
                      >
                        {ASSET_CHAINS.map((chain) => {
                          const meta = CHAIN_NAMES[chain.id];
                          return (
                            <option key={chain.id} value={chain.id}>
                              {meta?.name ?? chain.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-400">备选落地点链</p>
                      <select
                        value={userStrategy?.secondarySafeChainId ?? 80002}
                        onChange={(e) => {
                          if (!userStrategy) return;
                          const v = Number(e.target.value);
                          saveStrategy({
                            ...userStrategy,
                            secondarySafeChainId: v,
                          });
                        }}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-sky-400"
                      >
                        <option value="">（无备选）</option>
                        {ASSET_CHAINS.map((chain) => {
                          const meta = CHAIN_NAMES[chain.id];
                          return (
                            <option key={chain.id} value={chain.id}>
                              {meta?.name ?? chain.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 规模与频率控制 */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400">
                      最小跨链规模（USD 估值）
                    </p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={userStrategy?.minCrossChainValueUsd ?? 50}
                        onChange={(e) => {
                          if (!userStrategy) return;
                          const v = Math.max(0, Number(e.target.value) || 0);
                          saveStrategy({
                            ...userStrategy,
                            minCrossChainValueUsd: v,
                          });
                        }}
                        className="w-20 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right font-mono text-slate-100 outline-none focus:border-sky-400"
                      />
                      <span className="text-slate-500">USD</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      小于该数值的风险敞口只告警，不自动跨链，避免 gas 浪费。
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400">
                      每日最大自动防御次数
                    </p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={userStrategy?.maxDailyExitCount ?? 3}
                        onChange={(e) => {
                          if (!userStrategy) return;
                          const v = Math.max(0, Number(e.target.value) || 0);
                          saveStrategy({
                            ...userStrategy,
                            maxDailyExitCount: v,
                          });
                        }}
                        className="w-20 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right font-mono text-slate-100 outline-none focus:border-sky-400"
                      />
                      <span className="text-slate-500">次/天</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      限制 AI 在极端行情下频繁执行，避免“过度交易”。
                    </p>
                  </div>
                </div>

                {/* 执行约束 */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400">
                      最大允许滑点（跨链 + 交易）
                    </p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={userStrategy?.maxSlippagePercent ?? 1}
                        onChange={(e) => {
                          if (!userStrategy) return;
                          const v = Math.min(
                            100,
                            Math.max(0, Number(e.target.value) || 0)
                          );
                          saveStrategy({
                            ...userStrategy,
                            maxSlippagePercent: v,
                          });
                        }}
                        className="w-20 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right font-mono text-amber-300 outline-none focus:border-amber-400"
                      />
                      <span className="text-slate-500">%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400">
                      最大允许跨链手续费占比
                    </p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={userStrategy?.maxBridgeFeePercent ?? 1}
                        onChange={(e) => {
                          if (!userStrategy) return;
                          const v = Math.min(
                            100,
                            Math.max(0, Number(e.target.value) || 0)
                          );
                          saveStrategy({
                            ...userStrategy,
                            maxBridgeFeePercent: v,
                          });
                        }}
                        className="w-20 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right font-mono text-rose-300 outline-none focus:border-rose-400"
                      />
                      <span className="text-slate-500">%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[11px]">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={userStrategy?.preferNativeBridgeOnly ?? true}
                        onChange={(e) => {
                          if (!userStrategy) return;
                          saveStrategy({
                            ...userStrategy,
                            preferNativeBridgeOnly: e.target.checked,
                          });
                        }}
                        className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-sky-500"
                      />
                      <span className="text-slate-300">
                        只使用 ZetaChain 原生跨链通道
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={userStrategy?.autoExecute ?? false}
                        onChange={(e) => {
                          if (!userStrategy) return;
                          saveStrategy({
                            ...userStrategy,
                            autoExecute: e.target.checked,
                          });
                        }}
                        className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-emerald-500"
                      />
                      <span className="text-slate-300">
                        允许 AI 在满足条件时自动执行跨链防御
                      </span>
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    当前页面会优先从链上的 StrategyRegistry 读取策略；如未设置，则默认值为 0
                  </span>
                </div>
                </div>
              </div>
              </div>
            </section>
          )}

          {/* 安全事件 / 演练 Tab */}
          {activeTab === "incidents" && (
            <section className="space-y-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-sm font-semibold text-slate-50">
                    安全事件与防御演练时间线
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    汇总 AI 告警与链上防御执行记录，帮助你回放整个「发现 → 决策 → 执行」过程。
                  </p>
                </div>
                <div className="text-[11px] text-slate-500">
                  {account
                    ? "已连接钱包，可读取真实防御历史记录 + 示例告警。"
                    : "未连接钱包时仅展示示例告警，可连接钱包查看真实防御记录。"}
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs font-semibold text-slate-200">
                  事件时间线（示意）
                </p>
                <div className="space-y-3 text-[11px] text-slate-300 sm:text-xs">
                  {mockAlerts.map((alert, idx) => (
                    <div key={`alert-${idx}`} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-amber-400" />
                        <div className="h-full w-px bg-slate-700" />
                      </div>
                      <div className="flex-1 rounded-2xl bg-slate-900/80 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            AI 告警（示例）
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              alert.level === "高"
                                ? "bg-rose-500/20 text-rose-200"
                                : "bg-amber-500/20 text-amber-200"
                            }`}
                          >
                            {alert.level} 优先级
                          </span>
                        </div>
                        <p className="mt-1 font-medium text-slate-100">
                          {alert.title}
                        </p>
                        <p className="mt-1 text-slate-300">{alert.desc}</p>
                      </div>
                    </div>
                  ))}

                  {account && actionsCount > 0 && (
                    <div className="pt-2">
                      {defenseHistory.map((action, idx) => (
                        <div key={`defense-${idx}`} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-2 w-2 rounded-full bg-sky-400" />
                            {idx < defenseHistory.length - 1 && (
                              <div className="h-full w-px bg-slate-700" />
                            )}
                          </div>
                          <div className="flex-1 rounded-2xl bg-slate-900/80 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-500">
                                链上防御执行
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {formatTime(action.timestamp)}
                              </span>
                            </div>
                            <p className="mt-1 font-medium text-slate-100">
                              {action.actionType}
                            </p>
                            <p className="mt-1 text-slate-400">
                              触发者: {shortAddress(action.triggeredBy)}
                            </p>
                            {action.metadata && (
                              <p className="mt-1 truncate text-slate-500">
                                {action.metadata}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {account && actionsCount === 0 && (
                    <p className="pt-2 text-[11px] text-slate-500">
                      当前地址还没有任何防御执行记录，可以在「总览」中点击
                      「触发防御动作（Demo）」来生成一条演练记录。
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}


