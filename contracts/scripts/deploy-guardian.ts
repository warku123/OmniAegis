import hardhat from "hardhat";

const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("部署账户:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("账户余额:", ethers.formatEther(balance), "ZETA");

  const Guardian = await ethers.getContractFactory("OmniAegisGuardian");
  console.log("正在部署 OmniAegisGuardian 合约...");

  const guardian = await Guardian.deploy();
  await guardian.waitForDeployment();

  const address = await guardian.getAddress();
  console.log("OmniAegisGuardian 部署成功，地址:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


