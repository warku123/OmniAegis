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

  // 模拟 AI 生成的安全数据
  const chainIds = [1, 7001, 137, 56, 0]; // Ethereum, ZetaChain, Polygon, BNB, Bitcoin
  const scores = [
    { overall: 79, protocol: 32, chain: 15, market: 45, social: 20, gas: 65 },
    { overall: 85, protocol: 25, chain: 18, market: 40, social: 15, gas: 80 },
    { overall: 72, protocol: 38, chain: 22, market: 50, social: 25, gas: 70 },
    { overall: 68, protocol: 42, chain: 28, market: 55, social: 30, gas: 60 },
    { overall: 92, protocol: 10, chain: 8, market: 35, social: 12, gas: 95 },
  ];
  const details = [
    { protocolCount: 12, totalValueLocked: 2400, activeDefenses: 3 },
    { protocolCount: 8, totalValueLocked: 180, activeDefenses: 2 },
    { protocolCount: 15, totalValueLocked: 890, activeDefenses: 4 },
    { protocolCount: 18, totalValueLocked: 1200, activeDefenses: 5 },
    { protocolCount: 3, totalValueLocked: 5800, activeDefenses: 1 },
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

