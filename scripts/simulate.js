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

async function simulateFullWorkflow(contract, deployer, licensee) {
  console.log("\n=== Simulating Complete Patent Licensing Workflow ===\n");

  const results = {
    patents: [],
    licenses: [],
    royalties: [],
    bids: []
  };

  // Step 1: Register multiple patents
  console.log("--- Step 1: Registering Patents ---");

  const patents = [
    {
      name: "Advanced AI Algorithm",
      royaltyRate: 1500, // 15%
      minLicenseFee: ethers.parseEther("1.0"),
      exclusivityPeriod: 180,
      validityYears: 10,
      patentHash: "QmAIAlgorithmHash123",
      territoryCode: 255,
      isConfidential: true
    },
    {
      name: "Blockchain Security Protocol",
      royaltyRate: 1000, // 10%
      minLicenseFee: ethers.parseEther("0.5"),
      exclusivityPeriod: 90,
      validityYears: 15,
      patentHash: "QmBlockchainSecurityHash456",
      territoryCode: 1, // US only
      isConfidential: false
    },
    {
      name: "Green Energy Storage System",
      royaltyRate: 2000, // 20%
      minLicenseFee: ethers.parseEther("2.0"),
      exclusivityPeriod: 365,
      validityYears: 20,
      patentHash: "QmGreenEnergyHash789",
      territoryCode: 255,
      isConfidential: true
    }
  ];

  for (let i = 0; i < patents.length; i++) {
    const patent = patents[i];
    console.log(`\nRegistering Patent ${i + 1}: ${patent.name}`);

    const tx = await contract.registerPatent(
      patent.royaltyRate,
      patent.minLicenseFee,
      patent.exclusivityPeriod,
      patent.validityYears,
      patent.patentHash,
      patent.territoryCode,
      patent.isConfidential
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed && parsed.name === "PatentRegistered";
      } catch {
        return false;
      }
    });

    let patentId;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      patentId = parsed.args.patentId.toString();
      console.log(`✓ Patent registered with ID: ${patentId}`);
      results.patents.push({ id: patentId, name: patent.name, tx: tx.hash });
    }
  }

  // Step 2: Request licenses from different account
  console.log("\n--- Step 2: Requesting Licenses ---");

  const licenseRequests = [
    {
      patentId: 1,
      proposedFee: ethers.parseEther("1.2"),
      proposedRoyaltyRate: 1500,
      revenueCap: ethers.parseEther("100"),
      durationDays: 365,
      requestExclusive: false,
      autoRenewal: true,
      territoryMask: 255
    },
    {
      patentId: 2,
      proposedFee: ethers.parseEther("0.6"),
      proposedRoyaltyRate: 1000,
      revenueCap: ethers.parseEther("50"),
      durationDays: 180,
      requestExclusive: false,
      autoRenewal: false,
      territoryMask: 1
    }
  ];

  const licenseeContract = contract.connect(licensee);

  for (const request of licenseRequests) {
    console.log(`\nRequesting license for Patent ${request.patentId}`);

    const tx = await licenseeContract.requestLicense(
      request.patentId,
      request.proposedFee,
      request.proposedRoyaltyRate,
      request.revenueCap,
      request.durationDays,
      request.requestExclusive,
      request.autoRenewal,
      request.territoryMask
    );

    const receipt = await tx.wait();
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
      const licenseId = parsed.args.licenseId.toString();
      console.log(`✓ License requested with ID: ${licenseId}`);
      results.licenses.push({ id: licenseId, patentId: request.patentId, status: "Pending", tx: tx.hash });
    }
  }

  // Step 3: Approve licenses
  console.log("\n--- Step 3: Approving Licenses ---");

  for (const license of results.licenses) {
    console.log(`\nApproving License ${license.id}`);

    const tx = await contract.approveLicense(license.id, 365);
    await tx.wait();

    console.log(`✓ License ${license.id} approved`);
    license.status = "Approved";
    license.approveTx = tx.hash;
  }

  // Step 4: Simulate confidential bidding
  console.log("\n--- Step 4: Simulating Confidential Bidding ---");

  const biddingPatentId = 3;
  console.log(`\nStarting confidential bidding for Patent ${biddingPatentId}`);

  const startBiddingTx = await contract.startConfidentialBidding(biddingPatentId, 24); // 24 hours
  await startBiddingTx.wait();
  console.log("✓ Bidding started");

  // Submit bids from both accounts
  console.log("\nSubmitting confidential bids...");

  const bid1Tx = await contract.submitConfidentialBid(biddingPatentId, ethers.parseEther("3.0"));
  await bid1Tx.wait();
  console.log("✓ Bid 1 submitted (3.0 ETH) from deployer");

  const bid2Tx = await licenseeContract.submitConfidentialBid(biddingPatentId, ethers.parseEther("3.5"));
  await bid2Tx.wait();
  console.log("✓ Bid 2 submitted (3.5 ETH) from licensee");

  results.bids.push(
    { patentId: biddingPatentId, bidder: deployer.address, tx: bid1Tx.hash },
    { patentId: biddingPatentId, bidder: licensee.address, tx: bid2Tx.hash }
  );

  // Step 5: Simulate royalty payment
  console.log("\n--- Step 5: Simulating Royalty Payments ---");

  const royaltyPayment = {
    licenseId: 1,
    reportedRevenue: ethers.parseEther("10"), // 10 ETH revenue
    reportingPeriod: 202501, // January 2025
    paymentAmount: ethers.parseEther("1.5") // 15% royalty
  };

  console.log(`\nPaying royalties for License ${royaltyPayment.licenseId}`);
  console.log(`Reported Revenue: ${ethers.formatEther(royaltyPayment.reportedRevenue)} ETH`);
  console.log(`Payment Amount: ${ethers.formatEther(royaltyPayment.paymentAmount)} ETH`);

  const royaltyTx = await licenseeContract.payRoyalties(
    royaltyPayment.licenseId,
    royaltyPayment.reportedRevenue,
    royaltyPayment.reportingPeriod,
    { value: royaltyPayment.paymentAmount }
  );

  await royaltyTx.wait();
  console.log("✓ Royalty payment submitted");
  results.royalties.push({ licenseId: royaltyPayment.licenseId, tx: royaltyTx.hash });

  // Step 6: Query final state
  console.log("\n--- Step 6: Final State Summary ---");

  const nextPatentId = await contract.nextPatentId();
  const nextLicenseId = await contract.nextLicenseId();
  const deployerPatents = await contract.getUserPatents(deployer.address);
  const licenseeLicenses = await contract.getUserLicenses(licensee.address);

  console.log(`\nTotal Patents Registered: ${Number(nextPatentId) - 1}`);
  console.log(`Total Licenses Created: ${Number(nextLicenseId) - 1}`);
  console.log(`Deployer's Patents: ${deployerPatents.length}`);
  console.log(`Licensee's Licenses: ${licenseeLicenses.length}`);

  // Get detailed info for first patent
  if (deployerPatents.length > 0) {
    const patentInfo = await contract.getPatentInfo(deployerPatents[0]);
    console.log(`\nFirst Patent Details:`);
    console.log(`  Owner: ${patentInfo.patentOwner}`);
    console.log(`  Status: ${["Active", "Suspended", "Expired"][patentInfo.status]}`);
    console.log(`  Confidential: ${patentInfo.isConfidential}`);
    console.log(`  Patent Hash: ${patentInfo.patentHash}`);
  }

  return results;
}

async function saveSimulationResults(results, network) {
  const resultsDir = path.join(__dirname, "..", "simulation-results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsFile = path.join(resultsDir, `${network}-simulation-${timestamp}.json`);

  const simulationData = {
    network,
    timestamp: new Date().toISOString(),
    results
  };

  fs.writeFileSync(resultsFile, JSON.stringify(simulationData, null, 2));
  console.log(`\n✓ Simulation results saved to: ${resultsFile}`);
}

async function main() {
  console.log("\n=== Patent Licensing Platform - Full Workflow Simulation ===\n");

  // Get network
  const network = hre.network.name;
  console.log("Network:", network);

  // Load deployment or use local
  let contractAddress;

  try {
    const deploymentInfo = await loadDeployment(network);
    contractAddress = deploymentInfo.contractAddress;
    console.log("Using deployed contract at:", contractAddress);
  } catch (error) {
    console.log("No deployment found. Deploying new contract for simulation...");

    // Deploy for simulation
    const ConfidentialPatentLicense = await ethers.getContractFactory("ConfidentialPatentLicense");
    const contract = await ConfidentialPatentLicense.deploy();
    await contract.waitForDeployment();
    contractAddress = await contract.getAddress();
    console.log("Contract deployed at:", contractAddress);
  }

  // Get signers
  const [deployer, licensee] = await ethers.getSigners();
  console.log("\nSimulation Accounts:");
  console.log("Patent Owner (deployer):", deployer.address);
  console.log("Licensee:", licensee.address);

  // Get contract instance
  const contract = await ethers.getContractAt("ConfidentialPatentLicense", contractAddress, deployer);

  // Run simulation
  const results = await simulateFullWorkflow(contract, deployer, licensee);

  // Save results
  await saveSimulationResults(results, network);

  console.log("\n=== Simulation Complete ===\n");
  console.log("Summary:");
  console.log(`- Patents registered: ${results.patents.length}`);
  console.log(`- Licenses requested: ${results.licenses.length}`);
  console.log(`- Royalty payments: ${results.royalties.length}`);
  console.log(`- Confidential bids: ${results.bids.length}`);
}

// Execute simulation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });
