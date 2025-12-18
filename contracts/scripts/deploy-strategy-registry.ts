import hardhat from "hardhat";

const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("部署账户:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("账户余额:", ethers.formatEther(balance), "ZETA");

  console.log("正在部署 StrategyRegistry 合约...");
  const StrategyRegistry = await ethers.getContractFactory("StrategyRegistry");
  const registry = await StrategyRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("StrategyRegistry 部署成功，地址:", address);
  console.log(
    "在 Blockscout 查看:",
    `https://zetachain-athens-3.blockscout.com/address/${address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


