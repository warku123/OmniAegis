'use client';

import { useState } from "react";
import { WalletConnectButton } from "@/components/WalletConnectButton";

type SecurityScore = {
  overall: number; // 总体安全指数 (0-100)
  protocol: number; // 协议风险 (0-100, 越低越安全)
  chain: number; // 链级风险 (0-100, 越低越安全)
  market: number; // 市场波动风险 (0-100, 越低越安全)
  social: number; // 社交信号风险 (0-100, 越低越安全)
  gas: number; // Gas 稳定性 (0-100, 越高越稳定)
};

type ChainSecurity = {
  chainId: number;
  chainName: string;
  chainSymbol: string;
  icon?: string;
  score: SecurityScore;
  lastUpdated: number; // timestamp
  details: {
    protocolCount: number; // 监控的协议数量
    totalValueLocked: string; // TVL
    activeDefenses: number; // 当前活跃的防御策略数量
  };
};

// Mock 数据 - 后续会从合约读取
const mockChains: ChainSecurity[] = [
  {
    chainId: 1,
    chainName: "Ethereum",
    chainSymbol: "ETH",
    score: {
      overall: 78,
      protocol: 32,
      chain: 15,
      market: 45,
      social: 20,
      gas: 65,
    },
    lastUpdated: Date.now() - 5 * 60 * 1000, // 5分钟前
    details: {
      protocolCount: 12,
      totalValueLocked: "$2.4B",
      activeDefenses: 3,
    },
  },
  {
    chainId: 7001,
    chainName: "ZetaChain",
    chainSymbol: "ZETA",
    score: {
      overall: 85,
      protocol: 25,
      chain: 18,
      market: 40,
      social: 15,
      gas: 80,
    },
    lastUpdated: Date.now() - 2 * 60 * 1000, // 2分钟前
    details: {
      protocolCount: 8,
      totalValueLocked: "$180M",
      activeDefenses: 2,
    },
  },
  {
    chainId: 137,
    chainName: "Polygon",
    chainSymbol: "MATIC",
    score: {
      overall: 72,
      protocol: 38,
      chain: 22,
      market: 50,
      social: 25,
      gas: 70,
    },
    lastUpdated: Date.now() - 8 * 60 * 1000, // 8分钟前
    details: {
      protocolCount: 15,
      totalValueLocked: "$890M",
      activeDefenses: 4,
    },
  },
  {
    chainId: 56,
    chainName: "BNB Chain",
    chainSymbol: "BNB",
    score: {
      overall: 68,
      protocol: 42,
      chain: 28,
      market: 55,
      social: 30,
      gas: 60,
    },
    lastUpdated: Date.now() - 12 * 60 * 1000, // 12分钟前
    details: {
      protocolCount: 18,
      totalValueLocked: "$1.2B",
      activeDefenses: 5,
    },
  },
  {
    chainId: 0, // Bitcoin 特殊标记
    chainName: "Bitcoin (Native)",
    chainSymbol: "BTC",
    score: {
      overall: 92,
      protocol: 10,
      chain: 8,
      market: 35,
      social: 12,
      gas: 95,
    },
    lastUpdated: Date.now() - 1 * 60 * 1000, // 1分钟前
    details: {
      protocolCount: 3,
      totalValueLocked: "$5.8B",
      activeDefenses: 1,
    },
  },
];

const getScoreColor = (score: number, isReverse = false) => {
  // isReverse: true 表示分数越低越好（风险），false 表示分数越高越好（安全）
  const effectiveScore = isReverse ? 100 - score : score;
  if (effectiveScore >= 80) return "text-emerald-300";
  if (effectiveScore >= 60) return "text-amber-300";
  if (effectiveScore >= 40) return "text-orange-300";
  return "text-rose-300";
};

const getScoreBgColor = (score: number, isReverse = false) => {
  const effectiveScore = isReverse ? 100 - score : score;
  if (effectiveScore >= 80) return "bg-emerald-500/20 border-emerald-500/50";
  if (effectiveScore >= 60) return "bg-amber-500/20 border-amber-500/50";
  if (effectiveScore >= 40) return "bg-orange-500/20 border-orange-500/50";
  return "bg-rose-500/20 border-rose-500/50";
};

const formatTimeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
};

export default function SecurityPage() {
  const [selectedChain, setSelectedChain] = useState<ChainSecurity | null>(
    null
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              全链安全指数监控
            </h1>
            <p className="mt-2 text-xs text-slate-300/80 sm:text-sm">
              实时监控各条链的安全态势，包括协议风险、链级稳定性、市场波动等多维度指标。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WalletConnectButton variant="compact" showError={false} />
            <span className="text-xs text-slate-400">
              数据来源：链上监控 + AI 分析（Mock 数据，后续对接合约）
            </span>
          </div>
        </div>

        {/* 链列表概览 */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockChains.map((chain) => (
            <div
              key={chain.chainId}
              onClick={() => setSelectedChain(chain)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                selectedChain?.chainId === chain.chainId
                  ? "border-sky-400 bg-slate-900/80 ring-2 ring-sky-500/30"
                  : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    {chain.chainName}
                  </h3>
                  <p className="text-xs text-slate-400">{chain.chainSymbol}</p>
                </div>
                <div
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getScoreBgColor(
                    chain.score.overall
                  )} ${getScoreColor(chain.score.overall)}`}
                >
                  {chain.score.overall}
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">协议风险</span>
                  <span
                    className={`font-medium ${getScoreColor(
                      chain.score.protocol,
                      true
                    )}`}
                  >
                    {chain.score.protocol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">链级风险</span>
                  <span
                    className={`font-medium ${getScoreColor(
                      chain.score.chain,
                      true
                    )}`}
                  >
                    {chain.score.chain}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">市场波动</span>
                  <span
                    className={`font-medium ${getScoreColor(
                      chain.score.market,
                      true
                    )}`}
                  >
                    {chain.score.market}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                <span>更新于 {formatTimeAgo(chain.lastUpdated)}</span>
                <span>{chain.details.activeDefenses} 个防御策略</span>
              </div>
            </div>
          ))}
        </section>

        {/* 选中链的详细安全指数 */}
        {selectedChain && (
          <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-50">
                  {selectedChain.chainName} 安全指数详情
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  最后更新：{formatTimeAgo(selectedChain.lastUpdated)}
                </p>
              </div>
              <button
                onClick={() => setSelectedChain(null)}
                className="rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-600"
              >
                关闭详情
              </button>
            </div>

            {/* 总体安全指数 */}
            <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Overall Security Score
                  </p>
                  <p className="mt-1 text-sm text-slate-300">总体安全指数</p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-4xl font-bold ${getScoreColor(
                      selectedChain.score.overall
                    )}`}
                  >
                    {selectedChain.score.overall}
                  </div>
                  <p className="text-xs text-slate-400">/ 100</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all ${
                    selectedChain.score.overall >= 80
                      ? "bg-emerald-500"
                      : selectedChain.score.overall >= 60
                      ? "bg-amber-500"
                      : selectedChain.score.overall >= 40
                      ? "bg-orange-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${selectedChain.score.overall}%` }}
                />
              </div>
            </div>

            {/* 细分指标 */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* 协议风险 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-300">
                    协议风险
                  </p>
                  <span
                    className={`text-lg font-bold ${getScoreColor(
                      selectedChain.score.protocol,
                      true
                    )}`}
                  >
                    {selectedChain.score.protocol}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-slate-400">
                  监控 {selectedChain.details.protocolCount} 个协议的健康度
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-rose-500"
                    style={{
                      width: `${selectedChain.score.protocol}%`,
                    }}
                  />
                </div>
              </div>

              {/* 链级风险 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-300">
                    链级风险
                  </p>
                  <span
                    className={`text-lg font-bold ${getScoreColor(
                      selectedChain.score.chain,
                      true
                    )}`}
                  >
                    {selectedChain.score.chain}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-slate-400">
                  网络稳定性、共识机制安全性
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-orange-500"
                    style={{
                      width: `${selectedChain.score.chain}%`,
                    }}
                  />
                </div>
              </div>

              {/* 市场波动 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-300">
                    市场波动
                  </p>
                  <span
                    className={`text-lg font-bold ${getScoreColor(
                      selectedChain.score.market,
                      true
                    )}`}
                  >
                    {selectedChain.score.market}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-slate-400">
                  价格波动率、流动性深度
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${selectedChain.score.market}%`,
                    }}
                  />
                </div>
              </div>

              {/* 社交信号 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-300">
                    社交信号
                  </p>
                  <span
                    className={`text-lg font-bold ${getScoreColor(
                      selectedChain.score.social,
                      true
                    )}`}
                  >
                    {selectedChain.score.social}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-slate-400">
                  Twitter、Discord 等社区情绪分析
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-rose-400"
                    style={{
                      width: `${selectedChain.score.social}%`,
                    }}
                  />
                </div>
              </div>

              {/* Gas 稳定性 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-300">
                    Gas 稳定性
                  </p>
                  <span
                    className={`text-lg font-bold ${getScoreColor(
                      selectedChain.score.gas
                    )}`}
                  >
                    {selectedChain.score.gas}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-slate-400">
                  Gas 价格波动、网络拥堵程度
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${selectedChain.score.gas}%`,
                    }}
                  />
                </div>
              </div>

              {/* 链上数据概览 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="mb-3 text-xs font-semibold text-slate-300">
                  链上数据概览
                </p>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">监控协议数</span>
                    <span className="font-medium text-slate-200">
                      {selectedChain.details.protocolCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">总锁定价值 (TVL)</span>
                    <span className="font-medium text-slate-200">
                      {selectedChain.details.totalValueLocked}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">活跃防御策略</span>
                    <span className="font-medium text-emerald-300">
                      {selectedChain.details.activeDefenses}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 说明文字 */}
        {!selectedChain && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-center text-xs text-slate-400">
            <p>
              点击上方任意链卡片查看详细安全指数。数据将存储在链上合约中，支持实时更新和历史查询。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

