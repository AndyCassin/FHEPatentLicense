const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=== Contract Verification Script ===\n");

  // Get network name
  const network = hre.network.name;
  console.log("Network:", network);

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("\nPlease deploy the contract first using:");
    console.log(`npm run deploy:${network === "sepolia" ? "sepolia" : "local"}`);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("Contract address:", contractAddress);
  console.log("Contract name:", deploymentInfo.contractName);

  // Verify on Etherscan
  console.log("\n--- Starting Verification ---");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // No constructor arguments for this contract
      contract: "contracts/ConfidentialPatentLicense.sol:ConfidentialPatentLicense"
    });

    console.log("\n✓ Contract verified successfully!");

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verificationTime = new Date().toISOString();
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    console.log("\nVerification status saved to deployment file.");

    if (deploymentInfo.chainId === "11155111") {
      console.log("\nView verified contract on Etherscan:");
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
    }

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✓ Contract is already verified!");

      if (deploymentInfo.chainId === "11155111") {
        console.log("\nView contract on Etherscan:");
        console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
      }
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);
      process.exit(1);
    }
  }

  console.log("\n=== Verification Complete ===\n");
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification script failed:");
    console.error(error);
    process.exit(1);
  });
