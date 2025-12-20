import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const UNISWAP_ROUTER = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
  const WZETA = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
  // Sepolia ETH ZRC-20 地址 (ZetaChain Athens Testnet)
  // 先转为小写，避免 ethers 报错 bad address checksum
  const ETH_SEPOLIA = ethers.getAddress("0x13A0c5930C03245f9495143372B19e346535979C".toLowerCase());

  console.log("=== 准备兑换 Sepolia ETH (ZRC-20) ===");
  console.log("WZETA 地址:", WZETA);
  console.log("目标 ETH 地址:", ETH_SEPOLIA);

  const [signer] = await ethers.getSigners();
  console.log("当前账户:", signer.address);

  const router = await ethers.getContractAt([
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
  ], UNISWAP_ROUTER, signer);

  const wzeta = await ethers.getContractAt([
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)"
  ], WZETA, signer);

  // 检查余额
  const balance = await wzeta.balanceOf(signer.address);
  console.log("当前 WZETA 余额:", ethers.formatEther(balance));

  const amountIn = ethers.parseEther("0.5"); // 换 0.5 个 ZETA
  if (balance < amountIn) {
      console.log("❌ 余额不足，请先运行 npm run wrap:zeta 包装一些 ZETA");
      return;
  }

  console.log("正在授权 WZETA 给 Router...");
  await (await wzeta.approve(UNISWAP_ROUTER, amountIn)).wait();
  console.log("✅ 授权完成");

  const path = [WZETA, ETH_SEPOLIA];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  console.log("正在执行交换...");
  try {
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      0,
      path,
      signer.address,
      deadline
    );
    console.log("交易已发送:", tx.hash);
    await tx.wait();
    console.log("✅ 兑换成功！现在你已经拥有 Sepolia ETH (ZRC-20) 了。");
  } catch (error: any) {
    console.error("❌ 兑换失败:", error.message);
    if (error.message.includes("EXPIRED")) {
        console.log("提示: 交易超时，请重试。");
    } else if (error.message.includes("INSUFFICIENT_OUTPUT_AMOUNT")) {
        console.log("提示: 滑点过大，请调整 amountOutMin。");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
