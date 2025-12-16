'use client';

import { useEffect, useState } from "react";
import { ethers } from "ethers";

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

type WalletConnectButtonProps = {
  variant?: "default" | "compact";
  showError?: boolean;
};

const ZETACHAIN_TESTNET_PARAMS = {
  chainId: "0x1B59", // 7001 in hex
  chainName: "ZetaChain Testnet",
  nativeCurrency: {
    name: "ZetaChain",
    symbol: "ZETA",
    decimals: 18,
  },
  rpcUrls: ["https://zetachain-athens-evm.blockpi.network/v1/rpc/public"],
  blockExplorerUrls: ["https://zetachain-athens-3.blockscout.com"],
};

export function WalletConnectButton({
  variant = "default",
  showError = true,
}: WalletConnectButtonProps = {}) {
  const [account, setAccount] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { ethereum } = window as any;
    if (!ethereum) return;

    // 监听账户/网络切换，保持前端状态同步
    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] ?? null);
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const shortAddress = (addr: string) =>
    addr.slice(0, 6) + "..." + addr.slice(-4);

  const ensureZetaChainNetwork = async (provider: any) => {
    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: ZETACHAIN_TESTNET_PARAMS.chainId },
      ]);
    } catch (switchError: any) {
      // 4902: 未添加该网络，则尝试添加
      if (switchError?.code === 4902) {
        await provider.send("wallet_addEthereumChain", [
          ZETACHAIN_TESTNET_PARAMS,
        ]);
      } else {
        console.error("切换网络失败:", switchError);
      }
    }
  };

  const connectWallet = async () => {
    setErrorMsg(null);
    if (typeof window === "undefined") return;
    const { ethereum } = window as any;

    if (!ethereum) {
      setErrorMsg("未检测到以太坊钱包，请先安装 MetaMask 或兼容钱包。");
      return;
    }

    try {
      setStatus("connecting");
      const provider = new ethers.BrowserProvider(ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("未获取到账户");
      }
      await ensureZetaChainNetwork(provider);
      setAccount(accounts[0]);
      setStatus("connected");
    } catch (err: any) {
      console.error("连接钱包失败:", err);
      setStatus("error");
      setErrorMsg(err?.message ?? "连接钱包失败，请稍后重试。");
    }
  };

  const buttonLabel =
    status === "connecting"
      ? "连接中..."
      : account
      ? variant === "compact"
        ? shortAddress(account)
        : `已连接 · ${shortAddress(account)}`
      : variant === "compact"
      ? "连接钱包"
      : "连接钱包 · 启动防御";

  if (variant === "compact") {
    return (
      <div className="relative">
        <button
          onClick={connectWallet}
          disabled={status === "connecting"}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            account
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
              : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-slate-600 hover:bg-slate-900"
          } disabled:cursor-not-allowed disabled:opacity-75`}
        >
          {status === "connecting" ? (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
              连接中
            </span>
          ) : account ? (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {buttonLabel}
            </span>
          ) : (
            buttonLabel
          )}
        </button>
        {showError && errorMsg && (
          <div className="absolute right-0 top-full z-50 mt-1 rounded-lg border border-rose-500/30 bg-slate-900 px-2 py-1 text-[10px] text-rose-300 shadow-lg">
            {errorMsg}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={connectWallet}
        disabled={status === "connecting"}
        className="rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-75"
      >
        {buttonLabel}
      </button>
      {showError && errorMsg && (
        <p className="text-[11px] text-rose-300/90">{errorMsg}</p>
      )}
    </div>
  );
}
