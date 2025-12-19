'use client';

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useSecurityRegistry } from "@/hooks/useSecurityRegistry";
import {
  STRATEGY_REGISTRY_ADDRESS,
  STRATEGY_REGISTRY_ABI,
} from "@/lib/contract";

export default function Home() {
  const { chainSecurities } = useSecurityRegistry();
  const [account, setAccount] = useState<string | null>(null);
  const [riskMode, setRiskMode] = useState<string | null>(null);

  // 检测钱包连接状态
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { ethereum } = window as any;
    if (!ethereum) return;

    const checkConnectedWallet = async () => {
      try {
        const provider = new ethers.BrowserProvider(ethereum);
        const accounts = await provider.listAccounts();
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0].address);
        }
      } catch (err) {
        console.error("检查钱包连接状态失败:", err);
      }
    };

    checkConnectedWallet();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        // 这里浏览器事件返回的是字符串数组，直接取第一个地址即可
        setAccount(accounts[0]);
      } else {
        setAccount(null);
        setRiskMode(null);
      }
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, []);

  // 读取用户的风险偏好
  useEffect(() => {
    if (!account) {
      setRiskMode(null);
      return;
    }

    const loadRiskMode = async () => {
      try {
        if (
          !STRATEGY_REGISTRY_ADDRESS ||
          STRATEGY_REGISTRY_ADDRESS ===
            "0x0000000000000000000000000000000000000000"
        ) {
          return;
        }

        const { ethereum } = window as any;
        if (!ethereum) return;

        const provider = new ethers.BrowserProvider(ethereum);
        const contract = new ethers.Contract(
          STRATEGY_REGISTRY_ADDRESS,
          STRATEGY_REGISTRY_ABI,
          provider
        );

        const cfg = await contract.getGlobalConfig(account);
        if (cfg.exists) {
          const riskModeValue = Number(cfg.riskMode);
          const mode =
            riskModeValue === 0
              ? "保守"
              : riskModeValue === 2
              ? "激进"
              : "均衡";
          setRiskMode(mode);
        } else {
          setRiskMode(null);
        }
      } catch (err) {
        console.error("读取风险偏好失败:", err);
        setRiskMode(null);
      }
    };

    loadRiskMode();
  }, [account]);
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
              <Link
                href="/architecture"
                className="rounded-full border border-slate-600/80 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-slate-200/90 hover:bg-slate-900/60"
              >
                查看系统架构
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 text-xs text-slate-300/80">
              <span>✅ 自动跨链“逃生”策略</span>
              <span>✅ 原生 Bitcoin 资产保护</span>
              <span>✅ 多维风险评分 & 自定义风险偏好</span>
            </div>
          </div>

          {/* Right side card: Risk overview */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Cross-Chain Risk Pulse
                </p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  ZetaChain资产实时防御概览
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                {account ? "自动防御 · ON" : "未连接钱包"}
              </span>
            </div>
            <div className="mt-5 grid gap-4 text-xs text-slate-200 sm:text-sm">
              {(() => {
                const zetaChainData = chainSecurities.get(7001);
                const protocolScore = zetaChainData?.score.protocol ?? null;
                const chainScore = zetaChainData?.score.chain ?? null;
                const overallScore = zetaChainData?.score.overall ?? null;

                const getRiskLabel = (score: number | null): string => {
                  if (score === null) return "未评估";
                  if (score >= 80) return "优秀";
                  if (score >= 60) return "良好";
                  if (score >= 40) return "中等";
                  if (score >= 20) return "较差";
                  return "极差";
                };

                const getRiskColor = (score: number | null): string => {
                  if (score === null) return "bg-slate-500/15 text-slate-400";
                  if (score >= 80) return "bg-emerald-500/15 text-emerald-300";
                  if (score >= 60) return "bg-sky-500/15 text-sky-300";
                  if (score >= 40) return "bg-amber-500/15 text-amber-300";
                  return "bg-rose-500/15 text-rose-300";
                };

                return (
                  <>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                      <div>
                        <p className="font-medium">协议风险</p>
                        <p className="text-[11px] text-slate-400 sm:text-xs">
                          {protocolScore !== null
                            ? protocolScore >= 60
                              ? "协议风险可控，各 DeFi 协议运行正常"
                              : protocolScore >= 40
                              ? "部分协议存在风险，建议关注借贷与流动性协议利用率"
                              : "协议风险较高，建议分散资产并降低杠杆"
                            : "正在从链上加载数据..."}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getRiskColor(
                          protocolScore
                        )}`}
                      >
                        {protocolScore !== null
                          ? `${getRiskLabel(protocolScore)} · ${protocolScore}`
                          : "--"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                      <div>
                        <p className="font-medium">链级安全态势</p>
                        <p className="text-[11px] text-slate-400 sm:text-xs">
                          {chainScore !== null
                            ? chainScore >= 60
                              ? "链级风险较低，网络运行稳定，Gas 费用正常"
                              : chainScore >= 40
                              ? "链级风险中等，需关注网络拥堵与 Gas 异常波动"
                              : "链级风险较高，网络可能存在拥堵或异常情况"
                            : "正在从链上加载数据..."}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getRiskColor(
                          chainScore
                        )}`}
                      >
                        {chainScore !== null
                          ? `${getRiskLabel(chainScore)} · ${chainScore}`
                          : "--"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {account ? "当前风险偏好" : "风险偏好"}
                        </p>
                        <p className="text-[11px] text-slate-400 sm:text-xs">
                          {account
                            ? riskMode
                              ? `已设置：${riskMode}策略 · 从链上 StrategyRegistry 读取`
                              : "未设置策略，请前往仪表盘配置"
                            : "连接钱包后可查看和配置风险偏好"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          riskMode
                            ? "bg-sky-500/15 text-sky-300"
                            : "bg-slate-500/15 text-slate-400"
                        }`}
                      >
                        {riskMode || "--"}
                      </span>
                    </div>
                  </>
                );
              })()}
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
