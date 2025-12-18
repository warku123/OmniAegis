'use client';

import { useMemo, useState } from "react";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import {
  useSecurityRegistry,
  CHAIN_NAMES,
  type ChainSecurity as RegistryChainSecurity,
} from "@/hooks/useSecurityRegistry";

const getScoreColor = (score: number, isReverse = false) => {
  // isReverse: true => 分数越低越好（风险），false => 分数越高越好（安全）
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

const formatTimeAgo = (timestamp: number | bigint) => {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) * 1000 : timestamp;
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
};

export default function SecurityPage() {
  const {
    loading,
    error,
    supportedChainIds,
    chainSecurities,
    refresh,
  } = useSecurityRegistry();

  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);

  // 从合约 Map + CHAIN_NAMES 组装出前端要用的数据结构
  const chainsFromRegistry = useMemo(() => {
    const result: {
      chainId: number;
      name: string;
      symbol: string;
      data: RegistryChainSecurity;
    }[] = [];

    for (const chainId of supportedChainIds) {
      const data = chainSecurities.get(chainId);
      if (!data) continue;
      const meta = CHAIN_NAMES[chainId] ?? {
        name: `Chain ${chainId}`,
        symbol: String(chainId),
      };
      result.push({
        chainId,
        name: meta.name,
        symbol: meta.symbol,
        data,
      });
    }

    return result;
  }, [supportedChainIds, chainSecurities]);

  const selectedChain =
    selectedChainId !== null
      ? chainsFromRegistry.find((c) => c.chainId === selectedChainId) ?? null
      : null;

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
              数据来源：链上合约 SecurityRegistry + 链下 AI Agent 分析 (待实现)
            </span>
          </div>
        </div>

        {/* 状态提示 */}
        {loading && (
          <p className="text-xs text-slate-400">
            正在从 ZetaChain 读取安全数据...
          </p>
        )}
        {error && (
          <p className="text-xs text-rose-400">
            加载失败：{error}（请确认 SecurityRegistry 已写入数据）
          </p>
        )}
        {!loading && !error && chainsFromRegistry.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
            <p>当前合约中还没有任何链的安全数据。</p>
            <p className="mt-1">
              请先在后端/AI 脚本中调用
              <span className="font-mono"> batchUpdateChainSecurity </span>
              写入数据，然后点击下方按钮刷新。
            </p>
            <button
              onClick={refresh}
              className="mt-3 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500"
            >
              刷新数据
            </button>
          </div>
        )}

        {/* 链列表概览 */}
        {chainsFromRegistry.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chainsFromRegistry.map((item) => {
              const { chainId, name, symbol, data } = item;
              return (
                <div
                  key={chainId}
                  onClick={() => setSelectedChainId(chainId)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    selectedChainId === chainId
                      ? "border-sky-400 bg-slate-900/80 ring-2 ring-sky-500/30"
                      : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-50">
                        {name}
                      </h3>
                      <p className="text-xs text-slate-400">{symbol}</p>
                    </div>
                    <div
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getScoreBgColor(
                        data.score.overall
                      )} ${getScoreColor(data.score.overall)}`}
                    >
                      {data.score.overall}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">协议风险</span>
                      <span
                        className={`font-medium ${getScoreColor(
                          data.score.protocol,
                          true
                        )}`}
                      >
                        {data.score.protocol}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">链级风险</span>
                      <span
                        className={`font-medium ${getScoreColor(
                          data.score.chain,
                          true
                        )}`}
                      >
                        {data.score.chain}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">市场波动</span>
                      <span
                        className={`font-medium ${getScoreColor(
                          data.score.market,
                          true
                        )}`}
                      >
                        {data.score.market}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                    <span>更新于 {formatTimeAgo(data.lastUpdated)}</span>
                    <span>{data.details.activeDefenses} 个防御策略</span>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* 选中链的详细安全指数 */}
        {selectedChain && (
          <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-50">
                  {selectedChain.name} 安全指数详情
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  最后更新：{formatTimeAgo(selectedChain.data.lastUpdated)}
                </p>
              </div>
              <button
                onClick={() => setSelectedChainId(null)}
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
                      selectedChain.data.score.overall
                    )}`}
                  >
                    {selectedChain.data.score.overall}
                  </div>
                  <p className="text-xs text-slate-400">/ 100</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all ${
                    selectedChain.data.score.overall >= 80
                      ? "bg-emerald-500"
                      : selectedChain.data.score.overall >= 60
                      ? "bg-amber-500"
                      : selectedChain.data.score.overall >= 40
                      ? "bg-orange-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${selectedChain.data.score.overall}%` }}
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
                      selectedChain.data.score.protocol,
                      true
                    )}`}
                  >
                    {selectedChain.data.score.protocol}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-slate-400">
                  监控 {selectedChain.data.details.protocolCount} 个协议的健康度
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-rose-500"
                    style={{
                      width: `${selectedChain.data.score.protocol}%`,
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
                      selectedChain.data.score.chain,
                      true
                    )}`}
                  >
                    {selectedChain.data.score.chain}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-slate-400">
                  网络稳定性、共识机制安全性
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-orange-500"
                    style={{
                      width: `${selectedChain.data.score.chain}%`,
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
                      selectedChain.data.score.market,
                      true
                    )}`}
                  >
                    {selectedChain.data.score.market}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-slate-400">
                  价格波动率、流动性深度
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${selectedChain.data.score.market}%`,
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
                      selectedChain.data.score.social,
                      true
                    )}`}
                  >
                    {selectedChain.data.score.social}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-slate-400">
                  Twitter、Discord 等社区情绪分析
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-rose-400"
                    style={{
                      width: `${selectedChain.data.score.social}%`,
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
                      selectedChain.data.score.gas
                    )}`}
                  >
                    {selectedChain.data.score.gas}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-slate-400">
                  Gas 价格波动、网络拥堵程度
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${selectedChain.data.score.gas}%`,
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
                      {selectedChain.data.details.protocolCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">总锁定价值 (TVL)</span>
                    <span className="font-medium text-slate-200">
                      {selectedChain.data.details.totalValueLocked}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">活跃防御策略</span>
                    <span className="font-medium text-emerald-300">
                      {selectedChain.data.details.activeDefenses}
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
              点击上方任意链卡片查看详细安全指数。所有数据均来自 ZetaChain 上的
              SecurityRegistry 合约，并可由 AI Agent 定期更新。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}