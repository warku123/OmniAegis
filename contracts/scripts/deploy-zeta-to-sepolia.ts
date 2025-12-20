import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const GATEWAY_ZETA = "0x6c533f7fe93fae114d0954697069df33c9b74fd7";
  const ZRC20_ZETA = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";

  console.log("部署 ZetaToSepoliaTransfer 到 ZetaChain Testnet...");
  console.log("Gateway (Zeta):", GATEWAY_ZETA);
  console.log("ZRC-20 ZETA:", ZRC20_ZETA);

  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("账户余额:", ethers.formatEther(balance), "ZETA");

  const ZetaToSepoliaTransfer = await ethers.getContractFactory("ZetaToSepoliaTransfer");
  const contract = await ZetaToSepoliaTransfer.deploy(GATEWAY_ZETA, ZRC20_ZETA);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ ZetaToSepoliaTransfer 部署完成！");
  console.log("合约地址:", address);
  console.log("\n请将以下地址添加到 .env 文件：");
  console.log(`ZETA_TO_SEPOLIA_TRANSFER_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

