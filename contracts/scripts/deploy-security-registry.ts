import hardhat from "hardhat";

const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("部署账户:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("账户余额:", ethers.formatEther(balance), "ZETA");

  console.log("\n正在部署 SecurityRegistry 合约...");

  const SecurityRegistry = await ethers.getContractFactory("SecurityRegistry");
  const registry = await SecurityRegistry.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log("SecurityRegistry 部署成功，地址:", address);
  console.log(
    "\n在 Blockscout 查看:",
    `https://zetachain-athens-3.blockscout.com/address/${address}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

