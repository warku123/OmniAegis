'use client';

import Link from "next/link";
import { WalletConnectButton } from "@/components/WalletConnectButton";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-10 md:px-10 md:py-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              系统架构
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              感知 · 决策 · 执行 — 三层架构设计
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
            >
              返回首页
            </Link>
            <WalletConnectButton variant="compact" showError={false} />
          </div>
        </div>

        {/* Architecture Overview */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-50">
              整体架构概览
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              OmniAegis 采用三层架构设计，将 AI 风控能力与 ZetaChain
              的全链执行能力相结合，实现主动、动态的全链资产防御。
            </p>
          </div>

          {/* Three Layers */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Perception Layer */}
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20">
                  <span className="text-2xl">👁️</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-sky-300">
                    Perception
                  </h3>
                  <p className="text-xs text-slate-400">感知层</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                接入多链状态、协议指标、威胁情报与社交信号，构建实时风险图谱。
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  多链状态监控
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  协议健康度指标
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  威胁情报收集
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  社交信号分析
                </div>
              </div>
            </div>

            {/* Decision Layer */}
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
                  <span className="text-2xl">🧠</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-emerald-300">
                    Decision
                  </h3>
                  <p className="text-xs text-slate-400">决策引擎</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                AI 风控模型进行风险评分与策略生成，结合 Gas /
                流动性做优化。
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  多维风险评分
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  策略生成与优化
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  阈值判断与触发
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  用户偏好匹配
                </div>
              </div>
            </div>

            {/* Execution Layer */}
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-violet-300">
                    Execution
                  </h3>
                  <p className="text-xs text-slate-400">执行层</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                通过 ZetaChain 全链合约与消息传递，原子化执行跨链"逃生"与保险动作。
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  跨链原子执行
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  多链合约交互
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  防御动作记录
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  交易回滚保护
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Components */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-50">
            核心组件
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Smart Contracts */}
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                  <span className="text-xl">📜</span>
                </div>
                <h3 className="text-base font-semibold text-amber-300">
                  智能合约层（ZetaChain）
                </h3>
              </div>
              <div className="space-y-3 pt-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <p className="text-sm font-medium text-slate-200">
                    SecurityRegistry
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    存储多链安全指数（协议风险、链级风险、市场风险等），支持授权更新者批量更新数据，供
                    AI Agent 读取和评估。
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <p className="text-sm font-medium text-slate-200">
                    StrategyRegistry
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    存储用户的风险偏好和防御策略配置（触发阈值、跨链参数等），每个用户只能修改自己的策略。
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <p className="text-sm font-medium text-slate-200">
                    OmniAegisGuardian
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    防御控制器，记录所有防御执行动作。只有 owner 和授权的
                    guardian（如 AI Agent）可以触发防御动作。
                  </p>
                </div>
              </div>
            </div>

            {/* AI & Backend */}
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20">
                  <span className="text-xl">🤖</span>
                </div>
                <h3 className="text-base font-semibold text-rose-300">
                  AI Agent & 后端服务
                </h3>
              </div>
              <div className="space-y-3 pt-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <p className="text-sm font-medium text-slate-200">
                    风险监控服务
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    持续读取 SecurityRegistry
                    中的多链安全数据，结合外部市场数据（价格、波动率、协议利用率等）进行风险评估。
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <p className="text-sm font-medium text-slate-200">
                    策略生成引擎
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    当风险超过阈值时，生成可执行的救援策略（如偿还债务、跨链转移资产），并签名提交到
                    OmniAegisGuardian。
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <p className="text-sm font-medium text-slate-200">
                    数据更新服务
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    定期更新 SecurityRegistry
                    中的安全指数，支持批量更新多条链的数据，提高效率。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Flow */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-50">数据流与交互</h2>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sm font-semibold text-sky-300">
                    1
                  </div>
                  <div className="h-full w-px bg-slate-700" />
                </div>
                <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-sm font-medium text-slate-200">
                    数据采集与存储
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    AI Agent 收集多链状态、协议指标、威胁情报，更新到
                    SecurityRegistry 合约。用户在前端配置策略，保存到
                    StrategyRegistry 合约。
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-300">
                    2
                  </div>
                  <div className="h-full w-px bg-slate-700" />
                </div>
                <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-sm font-medium text-slate-200">
                    风险评估与决策
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    AI Agent 读取 SecurityRegistry 和 StrategyRegistry
                    的数据，结合外部市场信息，评估风险。当风险超过用户设置的阈值时，生成救援策略。
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">
                    3
                  </div>
                  <div className="h-full w-px bg-slate-700" />
                </div>
                <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-sm font-medium text-slate-200">
                    授权与执行
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    用户授权 AI Agent 为 Guardian 后，AI Agent
                    可以调用 OmniAegisGuardian.executeDefense
                    执行防御动作。所有执行记录都会写入链上，可审计、可回放。
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-semibold text-amber-300">
                    4
                  </div>
                </div>
                <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-sm font-medium text-slate-200">
                    前端展示与交互
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    前端控制台从链上读取安全指数、策略配置和执行记录，以多
                    Tab
                    的方式展示给用户：总览、各链资产、安全指数、策略配置、安全事件时间线。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-50">技术栈</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-sky-300">前端</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-400">
                <li>· Next.js 14</li>
                <li>· React + TypeScript</li>
                <li>· Tailwind CSS</li>
                <li>· Ethers.js</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-emerald-300">区块链</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-400">
                <li>· ZetaChain Athens Testnet</li>
                <li>· Solidity 0.8.24</li>
                <li>· Hardhat</li>
                <li>· 跨链消息传递</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-violet-300">AI & 后端</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-400">
                <li>· AI 风险评分模型</li>
                <li>· 多链数据聚合</li>
                <li>· 策略生成引擎</li>
                <li>· 授权更新者服务</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Future Extensions */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-50">未来扩展</h2>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-medium text-slate-200">
                  🔗 真实跨链执行
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  在以太坊上实际与 Aave
                  交互、在 Polygon/比特币等链上落地资产，实现完整的跨链原子防御流程。
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-medium text-slate-200">
                  🛡️ 更多风险场景
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  扩展支持协议漏洞、预言机攻击、Gas
                  费攻击等多种风险场景的检测和防御。
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-medium text-slate-200">
                  💰 DeFi 头寸集成
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  接入 DeFi 协议 API，实时监控用户的借贷仓位、LP
                  头寸等，提供更精准的风险评估。
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-medium text-slate-200">
                  🎯 智能保险购买
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  当检测到高风险时，自动为用户购买跨链组合保险，提供额外的资产保障。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-sky-500 px-6 py-3 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
          >
            前往仪表盘
          </Link>
          <Link
            href="/security"
            className="rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
          >
            查看安全指数
          </Link>
        </div>
      </main>
    </div>
  );
}

