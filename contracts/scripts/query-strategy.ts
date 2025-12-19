import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const { ethers } = hardhat;

// 链 ID 到链名称的映射
const CHAIN_NAMES: Record<number, string> = {
  7001: "ZetaChain Athens Testnet",
  11155111: "Ethereum Sepolia Testnet",
  80002: "Polygon Amoy Testnet",
  97: "BNB Smart Chain Testnet",
};

// 风险偏好映射
const RISK_MODE_NAMES: Record<number, string> = {
  0: "保守",
  1: "均衡",
  2: "激进",
};

async function main() {
  const strategyRegistryAddress = process.env.STRATEGY_REGISTRY_ADDRESS;
  const userAddress = process.argv[2] || process.env.ZETA_ADDRESS;

  if (!strategyRegistryAddress) {
    throw new Error("请设置 STRATEGY_REGISTRY_ADDRESS 环境变量");
  }

  if (!userAddress) {
    throw new Error("请提供用户地址作为命令行参数，或设置 ZETA_ADDRESS 环境变量");
  }

  const [deployer] = await ethers.getSigners();
  console.log("查询账户:", deployer.address);
  console.log("目标用户地址:", userAddress);
  console.log("StrategyRegistry 合约地址:", strategyRegistryAddress);
  console.log("");

  const StrategyRegistry = await ethers.getContractFactory("StrategyRegistry");
  const registry = StrategyRegistry.attach(strategyRegistryAddress);

  // 查询全局配置
  console.log("=".repeat(60));
  console.log("📋 全局配置 (GlobalConfig)");
  console.log("=".repeat(60));

  const globalConfig = await registry.getGlobalConfig(userAddress);

  if (!globalConfig.exists) {
    console.log("❌ 用户尚未配置任何策略");
    console.log("");
    console.log("提示：用户需要先调用 setGlobalConfig 来设置策略");
    return;
  }

  console.log("✅ 策略已配置");
  console.log("");
  console.log("风险偏好:", RISK_MODE_NAMES[globalConfig.riskMode] || `未知(${globalConfig.riskMode})`);
  console.log("自动执行:", globalConfig.autoExecute ? "✅ 已启用" : "❌ 未启用");
  console.log("优先保护稳定币:", globalConfig.protectStablecoins ? "✅" : "❌");
  console.log("优先保护蓝筹资产:", globalConfig.protectBlueChips ? "✅" : "❌");
  console.log("");
  console.log("全局默认阈值:");
  console.log("  - 总体安全分阈值:", globalConfig.defaultOverallThreshold, "/ 100");
  console.log("  - 协议风险阈值:", globalConfig.defaultProtocolThreshold, "/ 100");
  console.log("  - 调仓比例:", globalConfig.defaultTransferRatio, "%");
  console.log("");
  console.log("跨链执行参数:");
  console.log("  - 首选落地点链 ID:", globalConfig.primarySafeChainId.toString());
  console.log("  - 备选落地点链 ID:", globalConfig.secondarySafeChainId.toString());
  console.log("  - 最小跨链价值 (USD):", globalConfig.minCrossChainValueUsd.toString());
  console.log("  - 每日最大自动防御次数:", globalConfig.maxDailyExitCount.toString());
  console.log("  - 最大滑点:", globalConfig.maxSlippageBps.toString(), "bps (", (Number(globalConfig.maxSlippageBps) / 100).toFixed(2), "%)");
  console.log("  - 最大跨链手续费:", globalConfig.maxBridgeFeeBps.toString(), "bps (", (Number(globalConfig.maxBridgeFeeBps) / 100).toFixed(2), "%)");
  console.log("  - 只使用原生跨链通道:", globalConfig.preferNativeBridgeOnly ? "✅" : "❌");

  // 查询各链的单独阈值
  console.log("");
  console.log("=".repeat(60));
  console.log("🔗 各链单独阈值 (ChainThreshold)");
  console.log("=".repeat(60));

  const chainIds = [7001, 11155111, 80002, 97];
  let hasPerChainConfig = false;

  for (const chainId of chainIds) {
    const threshold = await registry.getChainThreshold(userAddress, chainId);
    
    if (threshold.exists) {
      hasPerChainConfig = true;
      const chainName = CHAIN_NAMES[chainId] || `Chain ${chainId}`;
      console.log("");
      console.log(`📌 ${chainName} (Chain ID: ${chainId})`);
      console.log("  - 总体安全分阈值:", threshold.overallThreshold, "/ 100");
      console.log("  - 协议风险阈值:", threshold.protocolThreshold, "/ 100");
      console.log("  - 调仓比例:", threshold.transferRatio, "%");
    }
  }

  if (!hasPerChainConfig) {
    console.log("❌ 用户未配置任何链的单独阈值");
    console.log("提示：将使用全局默认阈值");
  }

  // 查询生效阈值（使用 getEffectiveThreshold）
  console.log("");
  console.log("=".repeat(60));
  console.log("⚡ 生效阈值 (EffectiveThreshold)");
  console.log("=".repeat(60));
  console.log("（显示每条链实际生效的阈值，优先使用单独配置，否则使用全局默认）");
  console.log("");

  for (const chainId of chainIds) {
    const effectiveThreshold = await registry.getEffectiveThreshold(userAddress, chainId);
    const chainName = CHAIN_NAMES[chainId] || `Chain ${chainId}`;
    
    if (effectiveThreshold.exists) {
      console.log(`📌 ${chainName} (Chain ID: ${chainId})`);
      console.log("  - 总体安全分阈值:", effectiveThreshold.overallThreshold, "/ 100");
      console.log("  - 协议风险阈值:", effectiveThreshold.protocolThreshold, "/ 100");
      console.log("  - 调仓比例:", effectiveThreshold.transferRatio, "%");
      console.log("");
    }
  }

  console.log("=".repeat(60));
  console.log("✅ 查询完成");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

