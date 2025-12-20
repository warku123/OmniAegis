import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();
  const registryAddress = process.env.SECURITY_REGISTRY_ADDRESS;

  if (!registryAddress) {
    throw new Error("请设置 SECURITY_REGISTRY_ADDRESS 环境变量");
  }

  const SecurityRegistry = await ethers.getContractFactory("SecurityRegistry");
  const registry = SecurityRegistry.attach(registryAddress);

  console.log("=== 设置安全状态：危险 (Dangerous) ===");
  console.log("当前账户:", deployer.address);

  const chainIds = [7001, 11155111, 80002, 97];
  const scores = [
    // ZetaChain Athens Testnet - 警告
    { overall: 45, protocol: 65, chain: 58, market: 70, social: 55, gas: 40 },
    // Ethereum Sepolia - 危险 (触发阈值通常在 20-30 左右)
    { overall: 28, protocol: 82, chain: 75, market: 85, social: 70, gas: 30 },
    // Polygon Amoy - 极度危险
    { overall: 15, protocol: 92, chain: 88, market: 95, social: 85, gas: 15 },
    // BNB Smart Chain Testnet - 风险
    { overall: 52, protocol: 58, chain: 52, market: 65, social: 45, gas: 50 },
  ];
  const details = [
    { protocolCount: 8, totalValueLocked: 180, activeDefenses: 2 },
    { protocolCount: 10, totalValueLocked: 320, activeDefenses: 3 },
    { protocolCount: 12, totalValueLocked: 260, activeDefenses: 3 },
    { protocolCount: 9, totalValueLocked: 210, activeDefenses: 2 },
  ];

  console.log("\n正在更新安全数据为 [危险] 状态...");
  const tx = await (registry as any).batchUpdateChainSecurity(chainIds, scores, details);
  console.log("交易哈希:", tx.hash);
  await tx.wait();
  console.log("✅ 更新成功！Polygon 和 Sepolia 现在处于危险状态，准备触发防御动作。");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

