'use client';

import { useState } from "react";
import { WalletConnectButton } from "@/components/WalletConnectButton";

type StrategyMode = "conservative" | "balanced" | "aggressive";

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

export default function DashboardPage() {
  const [currentMode, setCurrentMode] = useState<StrategyMode>("balanced");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:px-10 md:py-10">
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
                <p className="mt-1 text-sm font-semibold text-slate-50">中等</p>
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
            <p className="text-sm font-medium text-slate-50">实时告警流</p>
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
      </main>
    </div>
  );
}


