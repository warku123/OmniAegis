'use client';

import { useState, useEffect } from "react";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useGuardianContract } from "@/hooks/useGuardianContract";
import { GUARDIAN_CONTRACT_ADDRESS } from "@/lib/contract";
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

const DASHBOARD_TABS: { id: DashboardTab; label: string; desc: string }[] = [
  { id: "overview", label: "总览", desc: "全局风险与防御状态" },
  { id: "assets", label: "各链资产", desc: "按链查看资产与风险" },
  { id: "strategy", label: "策略配置", desc: "AI 风控与逃生策略" },
  { id: "incidents", label: "安全事件", desc: "告警与演练记录" },
];

export default function DashboardPage() {
  const [currentMode, setCurrentMode] = useState<StrategyMode>("balanced");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
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

          {/* 其他 Tab 先占位，后续逐步实现 */}
          {activeTab === "assets" && (
            <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-xs text-slate-400 sm:text-sm">
              <p>「各链资产情况」视图建设中，稍后我们在这里接入按链分布的资产 + 安全指数。</p>
            </section>
          )}
          {activeTab === "strategy" && (
            <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-xs text-slate-400 sm:text-sm">
              <p>「策略配置」中心建设中，稍后可以在这里配置风险阈值与逃生偏好。</p>
            </section>
          )}
          {activeTab === "incidents" && (
            <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-xs text-slate-400 sm:text-sm">
              <p>「安全事件 / 演练」时间线建设中，可用于展示安全指数变动与防御触发历史。</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}


