import { WalletConnectButton } from "@/components/WalletConnectButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-10 md:px-10 md:py-16">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[1.4fr,1fr] md:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-sky-100 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI-Powered Cross-Chain Defense on ZetaChain
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              动态跨链安全监控与保险
          </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
              OmniAegis 利用大模型对你在全链上的资产组合进行实时监控，结合协议健康度、链安全态势与市场波动，
              在风险超过阈值时通过 ZetaChain 的跨链执行能力，自动触发“逃生”与保险策略，为你的多链资产提供主动防御。
            </p>
            <p className="max-w-xl text-xs text-slate-300/80 sm:text-sm">
              OmniAegis is an AI-native active defense system on ZetaChain that
              perceives risks across chains in real time and executes defensive
              strategies atomically via omnichain smart contracts.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <WalletConnectButton />
              <button className="rounded-full border border-slate-600/80 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-slate-200/90 hover:bg-slate-900/60">
                查看系统架构
              </button>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 text-xs text-slate-300/80">
              <span>✅ 自动跨链“逃生”策略</span>
              <span>✅ 原生 Bitcoin 资产保护</span>
              <span>✅ 多维风险评分 & 自定义风险偏好</span>
            </div>
          </div>

          {/* Right side card: Risk overview mock */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Cross-Chain Risk Pulse
                </p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  全链资产实时防御概览
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                自动防御 · ON
              </span>
            </div>
            <div className="mt-5 grid gap-4 text-xs text-slate-200 sm:text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                <div>
                  <p className="font-medium">跨链清算风险</p>
                  <p className="text-[11px] text-slate-400 sm:text-xs">
                    借贷仓位健康度连续下滑 · 触发预警阈值
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-300">
                  中高 · 72
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                <div>
                  <p className="font-medium">链级安全态势</p>
                  <p className="text-[11px] text-slate-400 sm:text-xs">
                    某借贷协议利用率异常 · 建议减仓并跨链迁移
                  </p>
                </div>
                <span className="rounded-full bg-rose-500/15 px-3 py-1 text-[11px] font-semibold text-rose-300">
                  高 · 84
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                <div>
                  <p className="font-medium">保险覆盖</p>
                  <p className="text-[11px] text-slate-400 sm:text-xs">
                    可用跨链组合保险 · 一键补齐保障缺口
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                  建议开通
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-50 sm:text-xl">
            核心能力 · AI 风控 + ZetaChain 跨链执行
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                Active Threat Response
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-50">
                主动威胁响应
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>· 自动清算保护与跨链再平衡</li>
                <li>· Gas 危机下的资产撤离与迁移</li>
                <li>· 协议“跑路” / 被攻击时快速抽离资金</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                AI Risk Intelligence
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-50">
                AI 风险智能
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>· 协议 / 链 / 市场 / 社交多维风险评分</li>
                <li>· 对新兴攻击与异常行为的预测预警</li>
                <li>· 保守 / 均衡 / 激进等风险画像策略</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                ZetaChain Execution
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-50">
                ZetaChain 驱动执行
              </h3>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>· 单笔交易完成多步骤跨链防御动作</li>
                <li>· 原生 Bitcoin 与多链资产一体化防护</li>
                <li>· 原子执行：要么全部成功，要么全部回滚</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Architecture mini section */}
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
          <h2 className="text-sm font-semibold text-slate-50 sm:text-base">
            感知 · 决策 · 执行 — 三层架构
          </h2>
          <div className="grid gap-4 text-xs text-slate-200 sm:grid-cols-3 sm:text-sm">
            <div>
              <p className="font-semibold text-sky-300">Perception · 感知层</p>
              <p className="mt-1 text-slate-300">
                接入多链状态、协议指标、威胁情报与社交信号，构建实时风险图谱。
              </p>
            </div>
            <div>
              <p className="font-semibold text-emerald-300">
                Decision · 决策引擎
              </p>
              <p className="mt-1 text-slate-300">
                AI 风控模型进行风险评分与策略生成，结合 Gas / 流动性做优化。
              </p>
            </div>
            <div>
              <p className="font-semibold text-violet-300">
                Execution · 执行层
              </p>
              <p className="mt-1 text-slate-300">
                通过 ZetaChain 全链合约与消息传递，原子化执行跨链“逃生”与保险动作。
          </p>
        </div>
        </div>
        </section>

        <footer className="border-t border-slate-800 pt-4 text-xs text-slate-500">
          Built for ZetaChain Hackathon · OmniAegis · MIT License
        </footer>
      </main>
    </div>
  );
}
