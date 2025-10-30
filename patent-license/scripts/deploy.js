const hre = require("hardhat");

async function main() {
  console.log("Deploying ConfidentialPatentLicense contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const ConfidentialPatentLicense = await hre.ethers.getContractFactory(
    "ConfidentialPatentLicense"
  );
  const contract = await ConfidentialPatentLicense.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("ConfidentialPatentLicense deployed to:", address);
  console.log("\nUpdate your frontend with this address:");
  console.log(`CONTRACT_ADDRESS="${address}"`);

  console.log("\nVerify the contract with:");
  console.log(`npx hardhat verify --network sepolia ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
