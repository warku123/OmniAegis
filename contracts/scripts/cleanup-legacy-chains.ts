import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const { ethers } = hardhat;

/**
 * 清理 SecurityRegistry 中旧的链 ID 数据（例如之前误用的 BNB 主网 56、Bitcoin 0）
 *
 * 说明：
 * - 目前合约没有真正的「删除」接口，只能通过写入“全 0”的结构体来做逻辑清空。
 * - 前端如果需要完全不展示这些链，可以在读取时忽略这些 chainId（例如仅白名单 [1, 7001, 137, 97]）。
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const registryAddress = process.env.SECURITY_REGISTRY_ADDRESS;

  if (!registryAddress) {
    throw new Error("请在 .env 中设置 SECURITY_REGISTRY_ADDRESS");
  }

  const SecurityRegistry = await ethers.getContractFactory("SecurityRegistry");
  const registry = SecurityRegistry.attach(registryAddress);

  console.log("当前账户:", deployer.address);
  console.log("合约地址:", registryAddress);

  const isAuthorized = await registry.authorizedUpdaters(deployer.address);
  console.log("是否已授权为更新者:", isAuthorized);

  if (!isAuthorized) {
    console.log(
      "\n⚠️ 当前账户未被授权为 authorizedUpdater，请先由 owner 调用 setAuthorizedUpdater"
    );
    return;
  }

  // 需要“清空”的旧链 ID：BNB 主网 56、Bitcoin 0
  const legacyChainIds = [56, 0];

  // 全 0 的占位结构体（直接在 TS 里按 Solidity 结构字段顺序构造）
  const zeroScores = legacyChainIds.map(() => ({
    overall: 0,
    protocol: 0,
    chain: 0,
    market: 0,
    social: 0,
    gas: 0,
  }));

  const zeroDetails = legacyChainIds.map(() => ({
    protocolCount: 0,
    totalValueLocked: 0,
    activeDefenses: 0,
  }));

  console.log("\n开始清理旧链 ID 数据: ", legacyChainIds);

  const tx = await registry.batchUpdateChainSecurity(
    legacyChainIds,
    zeroScores,
    zeroDetails
  );
  console.log("交易已发送:", tx.hash);
  console.log("等待确认...");
  await tx.wait();

  console.log("✅ 旧链安全数据已写入为 0（逻辑清空完成）");

  // 简单打印结果确认
  console.log("\n清理后检查:");
  for (const id of legacyChainIds) {
    try {
      const security = await registry.getChainSecurity(id);
      console.log(
        `链 ${id}: overall=${security.score.overall}, lastUpdated=${security.lastUpdated}`
      );
    } catch (err) {
      console.log(`链 ${id}: 读取失败（可能未注册或已出错）`, err);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


