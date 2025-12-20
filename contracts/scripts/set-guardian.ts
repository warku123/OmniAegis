import hardhat from "hardhat";

const { ethers } = hardhat;

async function main() {
  const GUARDIAN_ADDRESS = process.env.GUARDIAN_CONTRACT_ADDRESS;
  const USER_ADDRESS = process.env.USER_ADDRESS || "0xA0ffF55bfa23AF58970f7C4b30DAba3e985eFef7";

  if (!GUARDIAN_ADDRESS) {
    throw new Error("请设置 GUARDIAN_CONTRACT_ADDRESS 环境变量");
  }

  console.log("设置用户为 Guardian...");
  console.log("Guardian 地址:", GUARDIAN_ADDRESS);
  console.log("用户地址:", USER_ADDRESS);

  const [signer] = await ethers.getSigners();
  console.log("使用账户:", signer.address);

  const guardianAbi = [
    "function setGuardian(address guardian, bool allowed) external",
    "function owner() external view returns (address)",
  ];

  const guardian = new ethers.Contract(GUARDIAN_ADDRESS, guardianAbi, signer);

  // 检查是否是 owner
  const owner = await guardian.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(
      `当前账户 ${signer.address} 不是 Guardian 的 owner (${owner})`
    );
  }

  // 设置 guardian
  console.log("\n正在设置 Guardian...");
  const tx = await guardian.setGuardian(USER_ADDRESS, true);
  console.log("交易已发送:", tx.hash);
  console.log("等待确认...");

  const receipt = await tx.wait();
  console.log("✅ 交易已确认！");
  console.log("区块号:", receipt.blockNumber);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

