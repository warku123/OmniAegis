import hardhat from "hardhat";

const { ethers } = hardhat;

/**
 * 将原生 ZETA 包装为 WZETA (ZRC-20 ZETA)
 */
async function main() {
  const ZRC20_ZETA = process.env.ZRC20_ZETA || "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
  const AMOUNT = process.env.AMOUNT || "0.1"; // 要包装的 ZETA 数量

  console.log("=== 将原生 ZETA 包装为 WZETA ===\n");
  console.log("WZETA 地址:", ZRC20_ZETA);
  console.log("目标数量:", AMOUNT, "ZETA");
  console.log("");

  const [signer] = await ethers.getSigners();
  console.log("账户地址:", signer.address);
  
  const nativeBalance = await ethers.provider.getBalance(signer.address);
  console.log("原生 ZETA 余额:", ethers.formatEther(nativeBalance), "ZETA");

  // WZETA 通常有 deposit() payable 函数
  const wzetaAbi = [
    "function deposit() payable",
    "function balanceOf(address) external view returns (uint256)",
    "function decimals() external view returns (uint8)"
  ];
  
  const wzeta = new ethers.Contract(ZRC20_ZETA, wzetaAbi, signer);
  
  try {
    const zrc20Balance = await wzeta.balanceOf(signer.address);
    console.log("WZETA 余额:", ethers.formatEther(zrc20Balance), "WZETA");
    console.log("");

    const amount = ethers.parseEther(AMOUNT);
    if (nativeBalance < amount) {
      console.log("❌ 原生 ZETA 余额不足！");
      return;
    }

    console.log("正在包装", AMOUNT, "ZETA 为 WZETA...");
    const tx = await wzeta.deposit({ value: amount });
    console.log("交易哈希:", tx.hash);
    console.log("等待确认...");
    await tx.wait();
    console.log("✅ 包装成功！");

    const newBalance = await wzeta.balanceOf(signer.address);
    console.log("新的 WZETA 余额:", ethers.formatEther(newBalance), "WZETA");
  } catch (error: any) {
    console.log("❌ 错误:", error.message);
    console.log("\n可能的原因：");
    console.log("1. WZETA 合约没有 deposit() 函数");
    console.log("2. 需要通过其他方式获取 WZETA");
    console.log("\n建议：");
    console.log("- 从 ZetaChain 测试网水龙头获取 WZETA");
    console.log("- 或从其他账户转账 WZETA");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

