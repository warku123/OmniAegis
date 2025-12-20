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

  console.log("=== 设置安全状态：正常 (Safe) ===");
  console.log("当前账户:", deployer.address);

  const chainIds = [7001, 11155111, 80002, 97];
  const scores = [
    // ZetaChain Athens Testnet - 非常安全
    { overall: 92, protocol: 10, chain: 12, market: 20, social: 8, gas: 95 },
    // Ethereum Sepolia - 安全
    { overall: 88, protocol: 15, chain: 14, market: 25, social: 10, gas: 90 },
    // Polygon Amoy - 安全
    { overall: 85, protocol: 18, chain: 16, market: 30, social: 12, gas: 85 },
    // BNB Smart Chain Testnet - 较安全
    { overall: 82, protocol: 20, chain: 18, market: 35, social: 15, gas: 80 },
  ];
  const details = [
    { protocolCount: 8, totalValueLocked: 180, activeDefenses: 2 },
    { protocolCount: 10, totalValueLocked: 320, activeDefenses: 3 },
    { protocolCount: 12, totalValueLocked: 260, activeDefenses: 3 },
    { protocolCount: 9, totalValueLocked: 210, activeDefenses: 2 },
  ];

  console.log("\n正在更新安全数据为 [正常] 状态...");
  const tx = await (registry as any).batchUpdateChainSecurity(chainIds, scores, details);
  console.log("交易哈希:", tx.hash);
  await tx.wait();
  console.log("✅ 更新成功！所有链现在处于安全状态。");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

