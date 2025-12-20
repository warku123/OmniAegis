"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { GUARDIAN_CONTRACT_ADDRESS, GUARDIAN_ABI } from "@/lib/contract";

export type DefenseAction = {
  triggeredBy: string;
  actionType: string;
  metadata: string;
  timestamp: bigint;
};

export function useGuardianContract() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(
    null
  );
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isGuardian, setIsGuardian] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [actionsCount, setActionsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化 provider 和合约连接
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { ethereum } = window as any;
    if (!ethereum) return;

    const initProvider = async () => {
      try {
        const browserProvider = new ethers.BrowserProvider(ethereum);
        setProvider(browserProvider);

        const accounts = await browserProvider.send("eth_accounts", []);
        if (accounts && accounts.length > 0) {
          const currentSigner = await browserProvider.getSigner();
          setSigner(currentSigner);
          setAccount(accounts[0]);

          const contractInstance = new ethers.Contract(
            GUARDIAN_CONTRACT_ADDRESS,
            GUARDIAN_ABI,
            currentSigner
          );
          setContract(contractInstance);

          // 检查是否是 guardian 和 owner
          const guardianStatus = await contractInstance.guardians(
            accounts[0]
          );
          setIsGuardian(guardianStatus);

          const ownerAddress = await contractInstance.owner();
          setIsOwner(
            ownerAddress.toLowerCase() === accounts[0].toLowerCase()
          );

          // 获取防御记录总数
          const count = await contractInstance.getActionsCount();
          setActionsCount(Number(count));
        }
      } catch (err: any) {
        console.error("初始化合约连接失败:", err);
        setError(err?.message ?? "初始化失败");
      }
    };

    initProvider();

    // 监听账户切换
    ethereum.on?.("accountsChanged", () => {
      window.location.reload();
    });
  }, []);

  // 设置 guardian
  const setGuardian = async (guardianAddress: string, allowed: boolean) => {
    if (!contract || !isOwner) {
      throw new Error("只有合约 owner 可以设置 guardian");
    }
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.setGuardian(guardianAddress, allowed);
      await tx.wait();
      if (guardianAddress.toLowerCase() === account?.toLowerCase()) {
        setIsGuardian(allowed);
      }
      return tx.hash;
    } catch (err: any) {
      const msg = err?.message ?? "设置 guardian 失败";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 执行防御动作
  const executeDefense = async (actionType: string, metadata: string) => {
    if (!contract || !isGuardian) {
      throw new Error("只有 guardian 可以执行防御动作");
    }
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.executeDefense(actionType, metadata);
      await tx.wait();
      // 更新防御记录总数
      const count = await contract.getActionsCount();
      setActionsCount(Number(count));
      return tx.hash;
    } catch (err: any) {
      const msg = err?.message ?? "执行防御动作失败";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 执行防御动作并触发跨链退出（使用新的合约入口）
  const executeDefenseWithCrossChainExit = async (
    metadata: string,
    polygonBalanceHint: bigint
  ) => {
    if (!contract || !isGuardian) {
      throw new Error("只有 guardian 可以执行防御动作");
    }
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.executeDefenseWithCrossChainExit(
        metadata,
        polygonBalanceHint
      );
      await tx.wait();
      const count = await contract.getActionsCount();
      setActionsCount(Number(count));
      return tx.hash as string;
    } catch (err: any) {
      const msg = err?.message ?? "执行防御动作失败";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 获取单条防御记录
  const getAction = async (actionId: number): Promise<DefenseAction | null> => {
    if (!contract) return null;
    try {
      const action = await contract.getAction(actionId);
      return {
        triggeredBy: action.triggeredBy,
        actionType: action.actionType,
        metadata: action.metadata,
        timestamp: action.timestamp,
      };
    } catch (err) {
      console.error("获取防御记录失败:", err);
      return null;
    }
  };

  // 刷新数据
  const refresh = async () => {
    if (!contract || !account) return;
    try {
      const guardianStatus = await contract.guardians(account);
      setIsGuardian(guardianStatus);
      const count = await contract.getActionsCount();
      setActionsCount(Number(count));
    } catch (err) {
      console.error("刷新数据失败:", err);
    }
  };

  return {
    provider,
    signer,
    contract,
    account,
    isGuardian,
    isOwner,
    actionsCount,
    loading,
    error,
    setGuardian,
    executeDefense,
    executeDefenseWithCrossChainExit,
    getAction,
    refresh,
  };
}

