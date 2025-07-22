const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function loadDeployment(network) {
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }

  return JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
}

async function displayMenu() {
  console.log("\n=== Contract Interaction Menu ===\n");
  console.log("1.  Register a new patent");
  console.log("2.  Request a license");
  console.log("3.  Approve a license request");
  console.log("4.  Start confidential bidding");
  console.log("5.  Submit confidential bid");
  console.log("6.  Finalize bidding");
  console.log("7.  Pay royalties");
  console.log("8.  Update patent status");
  console.log("9.  Update license status");
  console.log("10. Get patent information");
  console.log("11. Get user patents");
  console.log("12. Get user licenses");
  console.log("13. Get patent licenses");
  console.log("14. Get royalty payment count");
  console.log("15. Check bidding status");
  console.log("16. Get contract state");
  console.log("0.  Exit");
  console.log("\n===============================\n");
}

async function getContractState(contract, deployer) {
  console.log("\n--- Contract State ---");
  const owner = await contract.owner();
  const nextPatentId = await contract.nextPatentId();
  const nextLicenseId = await contract.nextLicenseId();

  console.log("Owner:", owner);
  console.log("Next Patent ID:", nextPatentId.toString());
  console.log("Next License ID:", nextLicenseId.toString());
  console.log("Your address:", deployer.address);

  const userPatents = await contract.getUserPatents(deployer.address);
  const userLicenses = await contract.getUserLicenses(deployer.address);

  console.log("Your patents:", userPatents.length.toString());
  console.log("Your licenses:", userLicenses.length.toString());
}

async function registerPatent(contract) {
  console.log("\n--- Register New Patent ---");

  // Example patent registration
  const royaltyRate = 1000; // 10% (in basis points)
  const minLicenseFee = ethers.parseEther("0.1"); // 0.1 ETH
  const exclusivityPeriod = 180; // 180 days
  const validityYears = 10; // 10 years
  const patentHash = "QmExample123PatentHash"; // IPFS hash
  const territoryCode = 255; // All territories
  const isConfidential = true;

  console.log("Registering patent with parameters:");
  console.log("- Royalty Rate: 10%");
  console.log("- Min License Fee:", ethers.formatEther(minLicenseFee), "ETH");
  console.log("- Exclusivity Period: 180 days");
  console.log("- Validity: 10 years");
  console.log("- Confidential: Yes");

  const tx = await contract.registerPatent(
    royaltyRate,
    minLicenseFee,
    exclusivityPeriod,
    validityYears,
    patentHash,
    territoryCode,
    isConfidential
  );

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✓ Patent registered successfully!");
  console.log("Block number:", receipt.blockNumber);

  // Extract patent ID from events
  const event = receipt.logs.find(log => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed && parsed.name === "PatentRegistered";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = contract.interface.parseLog(event);
    console.log("Patent ID:", parsed.args.patentId.toString());
  }
}

async function requestLicense(contract) {
  console.log("\n--- Request License ---");

  const patentId = 1; // Example patent ID
  const proposedFee = ethers.parseEther("0.15"); // 0.15 ETH
  const proposedRoyaltyRate = 800; // 8%
  const revenueCap = ethers.parseEther("10"); // 10 ETH cap
  const durationDays = 365; // 1 year
  const requestExclusive = false;
  const autoRenewal = false;
  const territoryMask = 255; // All territories

  console.log("Requesting license with parameters:");
  console.log("- Patent ID:", patentId);
  console.log("- Proposed Fee:", ethers.formatEther(proposedFee), "ETH");
  console.log("- Proposed Royalty: 8%");
  console.log("- Duration: 365 days");

  const tx = await contract.requestLicense(
    patentId,
    proposedFee,
    proposedRoyaltyRate,
    revenueCap,
    durationDays,
    requestExclusive,
    autoRenewal,
    territoryMask
  );

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✓ License requested successfully!");

  const event = receipt.logs.find(log => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed && parsed.name === "LicenseRequested";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = contract.interface.parseLog(event);
    console.log("License ID:", parsed.args.licenseId.toString());
  }
}

async function getPatentInfo(contract, patentId) {
  console.log("\n--- Patent Information ---");
  console.log("Patent ID:", patentId);

  try {
    const info = await contract.getPatentInfo(patentId);

    console.log("Owner:", info.patentOwner);
    console.log("Registration Time:", new Date(Number(info.registrationTime) * 1000).toLocaleString());
    console.log("Expiration Time:", new Date(Number(info.expirationTime) * 1000).toLocaleString());
    console.log("Status:", ["Active", "Suspended", "Expired"][info.status]);
    console.log("Confidential:", info.isConfidential);
    console.log("Patent Hash:", info.patentHash);
    console.log("Territory Code:", info.territoryCode.toString());
  } catch (error) {
    console.error("Error getting patent info:", error.message);
  }
}

async function main() {
  console.log("\n=== Confidential Patent License Platform - Interactive Tool ===\n");

  // Load deployment information
  const network = hre.network.name;
  console.log("Network:", network);

  const deploymentInfo = await loadDeployment(network);
  console.log("Contract address:", deploymentInfo.contractAddress);

  // Get contract instance
  const [deployer] = await ethers.getSigners();
  const contract = await ethers.getContractAt(
    "ConfidentialPatentLicense",
    deploymentInfo.contractAddress,
    deployer
  );

  console.log("Connected with account:", deployer.address);

  // Display initial state
  await getContractState(contract, deployer);

  // Interactive mode - uncomment the desired action
  // For this example, we'll just show how to call each function
  console.log("\n--- Example Interactions ---");
  console.log("Uncomment the desired function calls in scripts/interact.js");
  console.log("\nAvailable functions:");
  console.log("- await registerPatent(contract)");
  console.log("- await requestLicense(contract)");
  console.log("- await getPatentInfo(contract, 1)");

  // Example: Uncomment to register a patent
  // await registerPatent(contract);

  // Example: Uncomment to request a license
  // await requestLicense(contract);

  // Example: Uncomment to get patent info
  // await getPatentInfo(contract, 1);

  console.log("\n=== Interaction Complete ===\n");
}

// Execute interaction
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });
