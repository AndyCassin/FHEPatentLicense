const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ConfidentialPatentLicense", function () {
  let contract;
  let owner;
  let patentOwner;
  let licensee;
  let bidder1;
  let bidder2;

  beforeEach(async function () {
    [owner, patentOwner, licensee, bidder1, bidder2] = await ethers.getSigners();

    const ConfidentialPatentLicense = await ethers.getContractFactory("ConfidentialPatentLicense");
    contract = await ConfidentialPatentLicense.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize patent and license IDs to 1", async function () {
      expect(await contract.nextPatentId()).to.equal(1);
      expect(await contract.nextLicenseId()).to.equal(1);
    });
  });

  describe("Patent Registration", function () {
    it("Should register a new patent successfully", async function () {
      const royaltyRate = 1000; // 10%
      const minLicenseFee = ethers.parseEther("1.0");
      const exclusivityPeriod = 180;
      const validityYears = 10;
      const patentHash = "QmTestPatentHash123";
      const territoryCode = 255;
      const isConfidential = true;

      await expect(
        contract.connect(patentOwner).registerPatent(
          royaltyRate,
          minLicenseFee,
          exclusivityPeriod,
          validityYears,
          patentHash,
          territoryCode,
          isConfidential
        )
      ).to.emit(contract, "PatentRegistered")
        .withArgs(1, patentOwner.address, patentHash);

      expect(await contract.nextPatentId()).to.equal(2);
    });

    it("Should reject royalty rate over 100%", async function () {
      const royaltyRate = 10001; // Over 100%

      await expect(
        contract.connect(patentOwner).registerPatent(
          royaltyRate,
          ethers.parseEther("1.0"),
          180,
          10,
          "QmHash",
          255,
          true
        )
      ).to.be.revertedWith("Royalty rate too high");
    });

    it("Should reject invalid validity period", async function () {
      await expect(
        contract.connect(patentOwner).registerPatent(
          1000,
          ethers.parseEther("1.0"),
          180,
          0, // Invalid: 0 years
          "QmHash",
          255,
          true
        )
      ).to.be.revertedWith("Invalid validity period");

      await expect(
        contract.connect(patentOwner).registerPatent(
          1000,
          ethers.parseEther("1.0"),
          180,
          21, // Invalid: over 20 years
          "QmHash",
          255,
          true
        )
      ).to.be.revertedWith("Invalid validity period");
    });

    it("Should track user patents correctly", async function () {
      await contract.connect(patentOwner).registerPatent(
        1000,
        ethers.parseEther("1.0"),
        180,
        10,
        "QmHash1",
        255,
        true
      );

      await contract.connect(patentOwner).registerPatent(
        1500,
        ethers.parseEther("2.0"),
        90,
        15,
        "QmHash2",
        255,
        false
      );

      const userPatents = await contract.getUserPatents(patentOwner.address);
      expect(userPatents.length).to.equal(2);
      expect(userPatents[0]).to.equal(1);
      expect(userPatents[1]).to.equal(2);
    });
  });

  describe("Patent Information Retrieval", function () {
    beforeEach(async function () {
      await contract.connect(patentOwner).registerPatent(
        1000,
        ethers.parseEther("1.0"),
        180,
        10,
        "QmTestHash",
        255,
        true
      );
    });

    it("Should retrieve patent information correctly", async function () {
      const info = await contract.getPatentInfo(1);

      expect(info.patentOwner).to.equal(patentOwner.address);
      expect(info.status).to.equal(0); // Active
      expect(info.isConfidential).to.equal(true);
      expect(info.patentHash).to.equal("QmTestHash");
      expect(info.territoryCode).to.equal(255);
    });

    it("Should revert for invalid patent ID", async function () {
      await expect(
        contract.getPatentInfo(999)
      ).to.be.revertedWith("Invalid patent ID");
    });
  });

  describe("License Requests", function () {
    beforeEach(async function () {
      // Register a patent first
      await contract.connect(patentOwner).registerPatent(
        1000,
        ethers.parseEther("1.0"),
        180,
        10,
        "QmTestHash",
        255,
        true
      );
    });

    it("Should request a license successfully", async function () {
      const proposedFee = ethers.parseEther("1.5");
      const proposedRoyaltyRate = 1000;

      await expect(
        contract.connect(licensee).requestLicense(
          1, // patentId
          proposedFee,
          proposedRoyaltyRate,
          ethers.parseEther("100"), // revenueCap
          365, // durationDays
          false, // requestExclusive
          true, // autoRenewal
          255 // territoryMask
        )
      ).to.emit(contract, "LicenseRequested")
        .withArgs(1, 1, licensee.address);

      expect(await contract.nextLicenseId()).to.equal(2);
    });

    it("Should reject license request for inactive patent", async function () {
      // Suspend the patent
      await contract.connect(patentOwner).updatePatentStatus(1, 1); // Suspended

      await expect(
        contract.connect(licensee).requestLicense(
          1,
          ethers.parseEther("1.5"),
          1000,
          ethers.parseEther("100"),
          365,
          false,
          true,
          255
        )
      ).to.be.revertedWith("Patent not active");
    });

    it("Should reject invalid duration", async function () {
      await expect(
        contract.connect(licensee).requestLicense(
          1,
          ethers.parseEther("1.5"),
          1000,
          ethers.parseEther("100"),
          0, // Invalid duration
          false,
          true,
          255
        )
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should track user licenses", async function () {
      await contract.connect(licensee).requestLicense(
        1,
        ethers.parseEther("1.5"),
        1000,
        ethers.parseEther("100"),
        365,
        false,
        true,
        255
      );

      const userLicenses = await contract.getUserLicenses(licensee.address);
      expect(userLicenses.length).to.equal(1);
      expect(userLicenses[0]).to.equal(1);
    });
  });

  describe("License Approval", function () {
    beforeEach(async function () {
      await contract.connect(patentOwner).registerPatent(
        1000,
        ethers.parseEther("1.0"),
        180,
        10,
        "QmTestHash",
        255,
        true
      );

      await contract.connect(licensee).requestLicense(
        1,
        ethers.parseEther("1.5"),
        1000,
        ethers.parseEther("100"),
        365,
        false,
        true,
        255
      );
    });

    it("Should approve license request", async function () {
      await expect(
        contract.connect(patentOwner).approveLicense(1, 365)
      ).to.emit(contract, "LicenseApproved")
        .withArgs(1, licensee.address, patentOwner.address);
    });

    it("Should only allow licensor to approve", async function () {
      await expect(
        contract.connect(licensee).approveLicense(1, 365)
      ).to.be.revertedWith("Not the licensor");
    });

    it("Should reject approving non-pending license", async function () {
      await contract.connect(patentOwner).approveLicense(1, 365);

      await expect(
        contract.connect(patentOwner).approveLicense(1, 365)
      ).to.be.revertedWith("License not pending");
    });
  });

  describe("Confidential Bidding", function () {
    beforeEach(async function () {
      await contract.connect(patentOwner).registerPatent(
        1000,
        ethers.parseEther("1.0"),
        180,
        10,
        "QmTestHash",
        255,
        true
      );
    });

    it("Should start confidential bidding", async function () {
      await contract.connect(patentOwner).startConfidentialBidding(1, 24);

      expect(await contract.biddingOpen(1)).to.equal(true);
      expect(await contract.isBiddingActive(1)).to.equal(true);
    });

    it("Should only allow patent owner to start bidding", async function () {
      await expect(
        contract.connect(licensee).startConfidentialBidding(1, 24)
      ).to.be.revertedWith("Not patent owner");
    });

    it("Should reject invalid bidding duration", async function () {
      await expect(
        contract.connect(patentOwner).startConfidentialBidding(1, 0)
      ).to.be.revertedWith("Invalid duration");

      await expect(
        contract.connect(patentOwner).startConfidentialBidding(1, 169) // Over 1 week
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should submit confidential bid", async function () {
      await contract.connect(patentOwner).startConfidentialBidding(1, 24);

      await expect(
        contract.connect(bidder1).submitConfidentialBid(1, ethers.parseEther("2.0"))
      ).to.emit(contract, "ConfidentialBidSubmitted")
        .withArgs(1, bidder1.address);
    });

    it("Should reject bid when bidding not open", async function () {
      await expect(
        contract.connect(bidder1).submitConfidentialBid(1, ethers.parseEther("2.0"))
      ).to.be.revertedWith("Bidding not open");
    });

    it("Should reject bid after bidding ended", async function () {
      await contract.connect(patentOwner).startConfidentialBidding(1, 1); // 1 hour

      // Advance time past bidding period
      await time.increase(3601); // 1 hour + 1 second

      await expect(
        contract.connect(bidder1).submitConfidentialBid(1, ethers.parseEther("2.0"))
      ).to.be.revertedWith("Bidding ended");
    });

    it("Should allow multiple bidders", async function () {
      await contract.connect(patentOwner).startConfidentialBidding(1, 24);

      await contract.connect(bidder1).submitConfidentialBid(1, ethers.parseEther("2.0"));
      await contract.connect(bidder2).submitConfidentialBid(1, ethers.parseEther("2.5"));

      // Both bids should be recorded
      const bidders = await contract.bidders(1, 0);
      expect(bidders).to.equal(bidder1.address);
    });
  });

  describe("Royalty Payments", function () {
    beforeEach(async function () {
      await contract.connect(patentOwner).registerPatent(
        1000,
        ethers.parseEther("1.0"),
        180,
        10,
        "QmTestHash",
        255,
        true
      );

      await contract.connect(licensee).requestLicense(
        1,
        ethers.parseEther("1.5"),
        1000,
        ethers.parseEther("100"),
        365,
        false,
        true,
        255
      );

      await contract.connect(patentOwner).approveLicense(1, 365);
    });

    it("Should pay royalties successfully", async function () {
      const reportedRevenue = ethers.parseEther("10");
      const paymentAmount = ethers.parseEther("1.0");

      await expect(
        contract.connect(licensee).payRoyalties(
          1,
          reportedRevenue,
          202501,
          { value: paymentAmount }
        )
      ).to.emit(contract, "RoyaltyPaid")
        .withArgs(1, licensee.address, 202501);

      const paymentCount = await contract.getRoyaltyPaymentCount(1);
      expect(paymentCount).to.equal(1);
    });

    it("Should only allow licensee to pay royalties", async function () {
      await expect(
        contract.connect(bidder1).payRoyalties(
          1,
          ethers.parseEther("10"),
          202501,
          { value: ethers.parseEther("1.0") }
        )
      ).to.be.revertedWith("Not the licensee");
    });

    it("Should reject payment for inactive license", async function () {
      // Suspend the license
      await contract.connect(patentOwner).updateLicenseStatus(1, 2); // Suspended

      await expect(
        contract.connect(licensee).payRoyalties(
          1,
          ethers.parseEther("10"),
          202501,
          { value: ethers.parseEther("1.0") }
        )
      ).to.be.revertedWith("License not active");
    });

    it("Should transfer payment to licensor", async function () {
      const initialBalance = await ethers.provider.getBalance(patentOwner.address);
      const paymentAmount = ethers.parseEther("1.0");

      await contract.connect(licensee).payRoyalties(
        1,
        ethers.parseEther("10"),
        202501,
        { value: paymentAmount }
      );

      const finalBalance = await ethers.provider.getBalance(patentOwner.address);
      expect(finalBalance - initialBalance).to.equal(paymentAmount);
    });
  });

  describe("Patent Status Management", function () {
    beforeEach(async function () {
      await contract.connect(patentOwner).registerPatent(
        1000,
        ethers.parseEther("1.0"),
        180,
        10,
        "QmTestHash",
        255,
        true
      );
    });

    it("Should update patent status", async function () {
      await expect(
        contract.connect(patentOwner).updatePatentStatus(1, 1) // Suspended
      ).to.emit(contract, "PatentStatusChanged")
        .withArgs(1, 1);

      const info = await contract.getPatentInfo(1);
      expect(info.status).to.equal(1);
    });

    it("Should only allow patent owner to update status", async function () {
      await expect(
        contract.connect(licensee).updatePatentStatus(1, 1)
      ).to.be.revertedWith("Not patent owner");
    });
  });

  describe("License Status Management", function () {
    beforeEach(async function () {
      await contract.connect(patentOwner).registerPatent(
        1000,
        ethers.parseEther("1.0"),
        180,
        10,
        "QmTestHash",
        255,
        true
      );

      await contract.connect(licensee).requestLicense(
        1,
        ethers.parseEther("1.5"),
        1000,
        ethers.parseEther("100"),
        365,
        false,
        true,
        255
      );
    });

    it("Should update license status", async function () {
      await expect(
        contract.connect(patentOwner).updateLicenseStatus(1, 4) // Revoked
      ).to.emit(contract, "LicenseStatusChanged")
        .withArgs(1, 4);
    });

    it("Should only allow licensor to update status", async function () {
      await expect(
        contract.connect(licensee).updateLicenseStatus(1, 4)
      ).to.be.revertedWith("Not the licensor");
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      await contract.connect(patentOwner).registerPatent(
        1000,
        ethers.parseEther("1.0"),
        180,
        10,
        "QmTestHash",
        255,
        true
      );
    });

    it("Should allow owner to emergency pause", async function () {
      await contract.connect(owner).emergencyPause(1);

      const info = await contract.getPatentInfo(1);
      expect(info.status).to.equal(1); // Suspended
    });

    it("Should allow owner to emergency resume", async function () {
      await contract.connect(owner).emergencyPause(1);
      await contract.connect(owner).emergencyResume(1);

      const info = await contract.getPatentInfo(1);
      expect(info.status).to.equal(0); // Active
    });

    it("Should only allow owner to use emergency functions", async function () {
      await expect(
        contract.connect(patentOwner).emergencyPause(1)
      ).to.be.revertedWith("Not authorized");

      await expect(
        contract.connect(patentOwner).emergencyResume(1)
      ).to.be.revertedWith("Not authorized");
    });
  });
});
