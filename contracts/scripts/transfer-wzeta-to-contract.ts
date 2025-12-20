import hardhat from "hardhat";

const { ethers } = hardhat;

/**
 * 将 WZETA 转入 ZetaToAmoyTransfer 合约
 */
async function main() {
  const ZETA_TO_AMOY_TRANSFER_ADDRESS = process.env.ZETA_TO_AMOY_TRANSFER_ADDRESS;
  const ZRC20_ZETA = process.env.ZRC20_ZETA || "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
  const AMOUNT = process.env.AMOUNT || "0.01";

  if (!ZETA_TO_AMOY_TRANSFER_ADDRESS) {
    throw new Error("请设置 ZETA_TO_AMOY_TRANSFER_ADDRESS 环境变量");
  }

  console.log("=== 转入 WZETA 到合约 ===\n");
  console.log("合约地址:", ZETA_TO_AMOY_TRANSFER_ADDRESS);
  console.log("WZETA 地址:", ZRC20_ZETA);
  console.log("转入数量:", AMOUNT, "WZETA");
  console.log("");

  const [signer] = await ethers.getSigners();
  console.log("账户地址:", signer.address);

  const zrc20Abi = [
    "function balanceOf(address) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
  ];

  const wzeta = new ethers.Contract(ZRC20_ZETA, zrc20Abi, signer);
  const balance = await wzeta.balanceOf(signer.address);
  const amount = ethers.parseEther(AMOUNT);

  console.log("账户 WZETA 余额:", ethers.formatEther(balance), "WZETA");

  if (balance < amount) {
    throw new Error(`WZETA 余额不足，需要 ${AMOUNT} WZETA，当前余额: ${ethers.formatEther(balance)} WZETA`);
  }

  console.log("\n正在转入...");
  const tx = await wzeta.transfer(ZETA_TO_AMOY_TRANSFER_ADDRESS, amount);
  console.log("交易哈希:", tx.hash);
  console.log("等待确认...");
  await tx.wait();
  console.log("✅ WZETA 已转入合约！");

  const contractBalance = await wzeta.balanceOf(ZETA_TO_AMOY_TRANSFER_ADDRESS);
  console.log("合约 WZETA 余额:", ethers.formatEther(contractBalance), "WZETA");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

