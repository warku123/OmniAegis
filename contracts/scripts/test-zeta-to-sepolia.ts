import hardhat from "hardhat";
const { ethers } = hardhat;
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const contractAddress = process.env.ZETA_TO_SEPOLIA_TRANSFER_ADDRESS;
  const sepoliaReceiver = process.env.SEPOLIA_RECEIVER || "0xA0ffF55bfa23AF58970f7C4b30DAba3e985eFef7";

  if (!contractAddress) {
    throw new Error("请在 .env 中设置 ZETA_TO_SEPOLIA_TRANSFER_ADDRESS");
  }

  console.log("=== 测试 ZetaToSepoliaTransfer 合约 ===");
  console.log("合约地址:", contractAddress);
  console.log("Sepolia 接收地址:", sepoliaReceiver);

  const [signer] = await ethers.getSigners();
  console.log("测试账户:", signer.address);

  const contract = await ethers.getContractAt("ZetaToSepoliaTransfer", contractAddress);

  // 获取配置
  const gateway = await contract.gateway();
  const zrc20ZETA = await contract.zetaZRC20();

  console.log("合约配置:");
  console.log("  Gateway:", gateway);
  console.log("  ZRC-20 ZETA:", zrc20ZETA);

  // 获取 ZRC-20 合约
  const zetaToken = await ethers.getContractAt("contracts/ZetaToSepoliaTransfer.sol:IZRC20", zrc20ZETA);
  
  // 检查余额
  const callerZetaBalance = await zetaToken.balanceOf(signer.address);
  console.log("调用者余额:");
  console.log("  ZRC-20 ZETA:", ethers.formatEther(callerZetaBalance), "ZETA");

  const amountNeeded = ethers.parseEther("0.01");
  if (callerZetaBalance < amountNeeded) {
    throw new Error("调用者 ZRC-20 ZETA 余额不足 (需要至少 0.01 ZETA)");
  }

  // 授权
  console.log("正在授权 ZETA 给合约...");
  await (await zetaToken.approve(contractAddress, amountNeeded)).wait();
  console.log("✅ 授权完成");

  console.log("测试调用 sendFixedZETAtoSepolia...");
  try {
    const tx = await contract.sendFixedZETAtoSepolia(sepoliaReceiver);
    console.log("交易已发送:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ 交易成功！");
  } catch (error: any) {
    console.error("❌ 交易失败:", error.message);
    if (error.data) {
        console.log("Error Data:", error.data);
    }
  }

  console.log("=== 测试完成 ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
