const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== Confidential Patent License Platform Deployment ===\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  console.log("\n--- Deployment Configuration ---");
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());

  // Deploy the contract
  console.log("\n--- Deploying ConfidentialPatentLicense Contract ---");
  const ConfidentialPatentLicense = await ethers.getContractFactory("ConfidentialPatentLicense");

  console.log("Starting deployment...");
  const contract = await ConfidentialPatentLicense.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✓ Contract deployed successfully!");
  console.log("Contract address:", contractAddress);

  // Get deployment transaction details
  const deployTx = contract.deploymentTransaction();
  if (deployTx) {
    console.log("Deployment transaction hash:", deployTx.hash);
    console.log("Block number:", deployTx.blockNumber);
  }

  // Verify initial state
  console.log("\n--- Verifying Initial State ---");
  const owner = await contract.owner();
  const nextPatentId = await contract.nextPatentId();
  const nextLicenseId = await contract.nextLicenseId();

  console.log("Contract owner:", owner);
  console.log("Next patent ID:", nextPatentId.toString());
  console.log("Next license ID:", nextLicenseId.toString());

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractName: "ConfidentialPatentLicense",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: deployTx ? deployTx.hash : null,
    blockNumber: deployTx ? deployTx.blockNumber : null,
    owner: owner,
    initialState: {
      nextPatentId: nextPatentId.toString(),
      nextLicenseId: nextLicenseId.toString()
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✓ Deployment information saved to:", deploymentFile);

  // Generate Etherscan link
  if (network.chainId === 11155111n) { // Sepolia
    const etherscanUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;
    console.log("\n--- Etherscan Links ---");
    console.log("Contract:", etherscanUrl);
    console.log("\nRun the following command to verify the contract:");
    console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
  }

  console.log("\n=== Deployment Complete ===\n");

  return {
    contract,
    contractAddress,
    deployer: deployer.address
  };
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("\n❌ Deployment failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
