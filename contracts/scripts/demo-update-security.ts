import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const { ethers } = hardhat;

// 示例：AI Agent 批量更新安全数据
async function main() {
  const [deployer] = await ethers.getSigners();
  const registryAddress = process.env.SECURITY_REGISTRY_ADDRESS;

  if (!registryAddress) {
    throw new Error("请设置 SECURITY_REGISTRY_ADDRESS 环境变量");
  }

  const SecurityRegistry = await ethers.getContractFactory("SecurityRegistry");
  const registry = SecurityRegistry.attach(registryAddress);

  console.log("当前账户:", deployer.address);
  console.log("合约地址:", registryAddress);

  // 检查是否是授权更新者
  const isAuthorized = await registry.authorizedUpdaters(deployer.address);
  console.log("是否已授权:", isAuthorized);

  if (!isAuthorized) {
    console.log("\n⚠️  当前账户未授权，请先调用 setAuthorizedUpdater");
    return;
  }

  // 模拟 AI 生成的安全数据（仅为当前前端展示的几条测试链写入：
  // ZetaChain Athens Testnet, Ethereum Sepolia, Polygon Amoy, BNB Testnet）
  const chainIds = [7001, 11155111, 80002, 97];
  const scores = [
    // ZetaChain Athens Testnet
    { overall: 85, protocol: 25, chain: 18, market: 40, social: 15, gas: 80 },
    // Ethereum Sepolia
    { overall: 78, protocol: 32, chain: 20, market: 48, social: 22, gas: 70 },
    // Polygon Amoy
    { overall: 72, protocol: 38, chain: 22, market: 50, social: 25, gas: 75 },
    // BNB Smart Chain Testnet
    { overall: 68, protocol: 42, chain: 28, market: 55, social: 30, gas: 65 },
  ];
  const details = [
    // ZetaChain Athens Testnet
    { protocolCount: 8, totalValueLocked: 180, activeDefenses: 2 },
    // Ethereum Sepolia
    { protocolCount: 10, totalValueLocked: 320, activeDefenses: 3 },
    // Polygon Amoy
    { protocolCount: 12, totalValueLocked: 260, activeDefenses: 3 },
    // BNB Smart Chain Testnet
    { protocolCount: 9, totalValueLocked: 210, activeDefenses: 2 },
  ];

  console.log("\n正在批量更新安全数据...");

  const tx = await registry.batchUpdateChainSecurity(chainIds, scores, details);
  console.log("交易已发送:", tx.hash);
  console.log("等待确认...");

  await tx.wait();
  console.log("✅ 安全数据更新成功！");

  // 验证更新结果
  console.log("\n验证更新结果:");
  for (let i = 0; i < chainIds.length; i++) {
    const security = await registry.getChainSecurity(chainIds[i]);
    console.log(
      `链 ${chainIds[i]}: 总体安全指数 = ${security.score.overall}, 最后更新 = ${new Date(
        Number(security.lastUpdated) * 1000
      ).toLocaleString()}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

