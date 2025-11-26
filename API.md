# API Documentation

## Overview

This document provides comprehensive API documentation for the Confidential Patent License smart contract. All functions, parameters, return values, and events are documented with examples.

## Table of Contents

1. [Contract Deployment](#contract-deployment)
2. [Patent Management](#patent-management)
3. [License Management](#license-management)
4. [Confidential Bidding](#confidential-bidding)
5. [Royalty Payments](#royalty-payments)
6. [Refund Operations](#refund-operations)
7. [Administrative Functions](#administrative-functions)
8. [View Functions](#view-functions)
9. [Events](#events)
10. [Error Codes](#error-codes)

---

## Contract Deployment

### Constructor

```solidity
constructor()
```

**Description**: Initializes the contract with the deployer as owner.

**State Changes**:
- Sets `owner` to `msg.sender`
- Initializes `nextPatentId` to 1
- Initializes `nextLicenseId` to 1

**Example**:
```javascript
const Contract = await ethers.getContractFactory("ConfidentialPatentLicense");
const contract = await Contract.deploy();
await contract.deployed();
```

---

## Patent Management

### registerPatent

```solidity
function registerPatent(
    uint64 royaltyRate,
    uint64 minLicenseFee,
    uint32 exclusivityPeriod,
    uint256 validityYears,
    string calldata patentHash,
    uint8 territoryCode,
    bool isConfidential
) external returns (uint256 patentId)
```

**Description**: Register a new patent with confidential terms using FHE encryption.

**Parameters**:
- `royaltyRate` (uint64): Royalty rate in basis points (0-10000, where 10000 = 100%)
- `minLicenseFee` (uint64): Minimum license fee in wei
- `exclusivityPeriod` (uint32): Days for exclusivity period
- `validityYears` (uint256): Patent validity in years (1-20)
- `patentHash` (string): IPFS hash or reference to patent document
- `territoryCode` (uint8): Geographic territory code
- `isConfidential` (bool): Whether patent terms are fully confidential

**Returns**:
- `patentId` (uint256): The ID of the newly registered patent

**Emits**:
- `PatentRegistered(patentId, owner, patentHash)`

**Requirements**:
- `royaltyRate` must be ≤ 10000
- `validityYears` must be 1-20
- `patentHash` must not be empty

**Example**:
```javascript
const royaltyRate = 500;  // 5%
const minFee = ethers.utils.parseEther("1.0");
const exclusivityPeriod = 365;  // 1 year
const validityYears = 10;
const patentHash = "QmX...";  // IPFS hash
const territoryCode = 1;  // US
const isConfidential = true;

const tx = await contract.registerPatent(
    royaltyRate,
    minFee,
    exclusivityPeriod,
    validityYears,
    patentHash,
    territoryCode,
    isConfidential
);

const receipt = await tx.wait();
const patentId = receipt.events[0].args.patentId;
```

### updatePatentStatus

```solidity
function updatePatentStatus(
    uint256 patentId,
    PatentStatus newStatus
) external
```

**Description**: Update the status of a patent (only patent owner).

**Parameters**:
- `patentId` (uint256): ID of the patent to update
- `newStatus` (PatentStatus): New status (0=Active, 1=Suspended, 2=Expired)

**Emits**:
- `PatentStatusChanged(patentId, newStatus)`

**Requirements**:
- Caller must be patent owner
- Patent must exist

**Example**:
```javascript
const PatentStatus = { Active: 0, Suspended: 1, Expired: 2 };
await contract.updatePatentStatus(patentId, PatentStatus.Suspended);
```

---

## License Management

### requestLicense

```solidity
function requestLicense(
    uint256 patentId,
    uint64 proposedFee,
    uint64 proposedRoyaltyRate,
    uint32 revenueCap,
    uint256 durationDays,
    bool requestExclusive,
    bool autoRenewal,
    uint8 territoryMask
) external returns (uint256 licenseId)
```

**Description**: Request a license for a patent with proposed terms.

**Parameters**:
- `patentId` (uint256): ID of the patent to license
- `proposedFee` (uint64): Proposed license fee in wei
- `proposedRoyaltyRate` (uint64): Proposed royalty rate in basis points
- `revenueCap` (uint32): Revenue cap if any
- `durationDays` (uint256): Desired license duration in days
- `requestExclusive` (bool): Request exclusive license
- `autoRenewal` (bool): Enable automatic renewal
- `territoryMask` (uint8): Allowed territories bitmask

**Returns**:
- `licenseId` (uint256): The ID of the license request

**Emits**:
- `LicenseRequested(licenseId, patentId, licensee)`

**Requirements**:
- Patent must be active
- `durationDays` must be > 0
- `proposedRoyaltyRate` must be ≤ 10000

**Example**:
```javascript
const proposedFee = ethers.utils.parseEther("5.0");
const proposedRoyaltyRate = 300;  // 3%
const revenueCap = 1000000;
const durationDays = 180;  // 6 months
const requestExclusive = false;
const autoRenewal = true;
const territoryMask = 0xFF;  // All territories

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

const receipt = await tx.wait();
const licenseId = receipt.events[0].args.licenseId;
```

### approveLicense

```solidity
function approveLicense(
    uint256 licenseId,
    uint256 durationDays
) external
```

**Description**: Approve a pending license request (only licensor).

**Parameters**:
- `licenseId` (uint256): ID of the license to approve
- `durationDays` (uint256): Approved duration in days

**Emits**:
- `LicenseApproved(licenseId, licensee, licensor)`

**Requirements**:
- Caller must be licensor (patent owner)
- License status must be Pending
- `durationDays` must be > 0

**Example**:
```javascript
const durationDays = 365;  // 1 year
await contract.approveLicense(licenseId, durationDays);
```

### updateLicenseStatus

```solidity
function updateLicenseStatus(
    uint256 licenseId,
    LicenseStatus newStatus
) external
```

**Description**: Update license status (only licensor).

**Parameters**:
- `licenseId` (uint256): ID of the license
- `newStatus` (LicenseStatus): New status (0=Pending, 1=Active, 2=Suspended, 3=Expired, 4=Revoked)

**Emits**:
- `LicenseStatusChanged(licenseId, newStatus)`

**Requirements**:
- Caller must be licensor
- License must exist

**Example**:
```javascript
const LicenseStatus = { Pending: 0, Active: 1, Suspended: 2, Expired: 3, Revoked: 4 };
await contract.updateLicenseStatus(licenseId, LicenseStatus.Suspended);
```

---

## Confidential Bidding

### startConfidentialBidding

```solidity
function startConfidentialBidding(
    uint256 patentId,
    uint256 biddingDurationHours
) external
```

**Description**: Start confidential bidding period for exclusive patent license (only patent owner).

**Parameters**:
- `patentId` (uint256): ID of the patent
- `biddingDurationHours` (uint256): Bidding duration in hours (max 168 = 1 week)

**Requirements**:
- Caller must be patent owner
- Bidding not already open
- `biddingDurationHours` must be 1-168

**Example**:
```javascript
const biddingDurationHours = 72;  // 3 days
await contract.startConfidentialBidding(patentId, biddingDurationHours);
```

### submitConfidentialBid

```solidity
function submitConfidentialBid(
    uint256 patentId,
    uint64 bidAmount
) external payable
```

**Description**: Submit encrypted bid for exclusive license.

**Parameters**:
- `patentId` (uint256): ID of the patent
- `bidAmount` (uint64): Bid amount in wei (will be encrypted)

**Emits**:
- `ConfidentialBidSubmitted(patentId, bidder)`

**Requirements**:
- Bidding must be open
- Before bidding end time
- `bidAmount` must be > 0
- `msg.value` must be ≥ `bidAmount`

**Example**:
```javascript
const bidAmount = ethers.utils.parseEther("10.0");

await contract.submitConfidentialBid(patentId, bidAmount, {
    value: bidAmount
});
```

### finalizeBidding

```solidity
function finalizeBidding(uint256 patentId) external
```

**Description**: Finalize bidding and initiate Gateway callback to determine winner (only patent owner).

**Parameters**:
- `patentId` (uint256): ID of the patent

**Emits**:
- `DecryptionRequested(requestId, requester, timestamp)`

**Requirements**:
- Caller must be patent owner
- Bidding must be open
- Past bidding end time
- Must have bidders

**Gateway Callback**: This function triggers `finalizeBiddingCallback` once Gateway completes decryption.

**Example**:
```javascript
// Wait for bidding period to end
await ethers.provider.send("evm_increaseTime", [72 * 3600]);
await ethers.provider.send("evm_mine");

const tx = await contract.finalizeBidding(patentId);
const receipt = await tx.wait();
const requestId = receipt.events[0].args.requestId;

// Gateway will call finalizeBiddingCallback with decrypted bids
```

### finalizeBiddingCallback

```solidity
function finalizeBiddingCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Description**: Gateway callback to complete bidding process (called by Gateway only).

**Parameters**:
- `requestId` (uint256): Decryption request ID
- `cleartexts` (bytes): Decrypted bid amounts (ABI-encoded uint64[])
- `decryptionProof` (bytes): Cryptographic proof from Gateway

**Emits**:
- `DecryptionCompleted(requestId, success)`
- `ExclusiveLicenseAwarded(patentId, winner, licenseId)`
- `RefundAvailable(bidder, amount)` for non-winners

**Requirements**:
- Valid Gateway signatures
- Request status must be Pending

**Note**: This function is called automatically by the Gateway. Users should not call this directly.

---

## Royalty Payments

### payRoyalties

```solidity
function payRoyalties(
    uint256 licenseId,
    uint64 reportedRevenue,
    uint256 reportingPeriod
) external payable
```

**Description**: Pay royalties with confidential revenue reporting.

**Parameters**:
- `licenseId` (uint256): ID of the license
- `reportedRevenue` (uint64): Reported revenue for period (will be encrypted)
- `reportingPeriod` (uint256): Reporting period identifier

**Emits**:
- `RoyaltyPaid(licenseId, payer, reportingPeriod)`

**Requirements**:
- Caller must be licensee
- License must be active
- `msg.value` must be > 0

**Example**:
```javascript
const reportedRevenue = ethers.utils.parseEther("100.0");
const royaltyAmount = ethers.utils.parseEther("3.0");  // 3%
const reportingPeriod = Math.floor(Date.now() / 1000);

await contract.payRoyalties(
    licenseId,
    reportedRevenue,
    reportingPeriod,
    { value: royaltyAmount }
);
```

### requestRoyaltyVerification

```solidity
function requestRoyaltyVerification(
    uint256 licenseId,
    uint256 paymentIndex
) external
```

**Description**: Request verification of a royalty payment via Gateway callback (only licensor).

**Parameters**:
- `licenseId` (uint256): ID of the license
- `paymentIndex` (uint256): Index of the payment to verify

**Emits**:
- `DecryptionRequested(requestId, requester, timestamp)`

**Requirements**:
- Caller must be licensor
- Valid payment index
- Payment not already verified

**Gateway Callback**: Triggers `processRoyaltyVerificationCallback` once verification completes.

**Example**:
```javascript
const paymentIndex = 0;  // First payment
const tx = await contract.requestRoyaltyVerification(licenseId, paymentIndex);
const receipt = await tx.wait();
const requestId = receipt.events[0].args.requestId;
```

### processRoyaltyVerificationCallback

```solidity
function processRoyaltyVerificationCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Description**: Gateway callback for royalty verification (called by Gateway only).

**Parameters**:
- `requestId` (uint256): Verification request ID
- `cleartexts` (bytes): Decrypted values (revenue, royaltyRate, paidAmount)
- `decryptionProof` (bytes): Cryptographic proof

**Emits**:
- `DecryptionCompleted(requestId, success)` OR
- `DecryptionFailed(requestId, reason)`

**Requirements**:
- Valid Gateway signatures
- Request status must be Pending
- Cleartexts length must be 3

**Verification Logic**:
```solidity
expectedRoyalty = (revenue * royaltyRate) / 10000
isValid = paidAmount >= (expectedRoyalty * 95) / 100  // 5% tolerance
```

**Note**: Called automatically by Gateway. Users should not call directly.

---

## Refund Operations

### claimRefund

```solidity
function claimRefund(uint256 requestId) external
```

**Description**: Claim refund for failed or timed out decryption request.

**Parameters**:
- `requestId` (uint256): Decryption request ID

**Emits**:
- `DecryptionTimedOut(requestId, user)` if timeout
- `RefundProcessed(user, amount, reason)`

**Requirements**:
- Request timed out (> 7 days) OR request failed
- User has pending refunds

**Refund Triggers**:
1. Decryption timeout (>7 days)
2. Decryption failure
3. Non-winning bid
4. Verification failure

**Example**:
```javascript
// After 7 days timeout
await ethers.provider.send("evm_increaseTime", [7 * 24 * 3600]);
await ethers.provider.send("evm_mine");

await contract.claimRefund(requestId);
```

### withdrawRefund

```solidity
function withdrawRefund() external
```

**Description**: Withdraw all pending refunds for the caller.

**Emits**:
- `RefundProcessed(user, amount, "Manual withdrawal")`

**Requirements**:
- Caller has pending refunds > 0

**Example**:
```javascript
const pendingRefund = await contract.getPendingRefund(userAddress);
if (pendingRefund.gt(0)) {
    await contract.withdrawRefund();
}
```

### getPendingRefund

```solidity
function getPendingRefund(address user) external view returns (uint256)
```

**Description**: Get pending refund amount for a user.

**Parameters**:
- `user` (address): User address to check

**Returns**:
- `amount` (uint256): Pending refund amount in wei

**Example**:
```javascript
const refund = await contract.getPendingRefund(userAddress);
console.log(`Pending refund: ${ethers.utils.formatEther(refund)} ETH`);
```

---

## Administrative Functions

### emergencyPause

```solidity
function emergencyPause(uint256 patentId) external
```

**Description**: Emergency pause a patent (only contract owner).

**Parameters**:
- `patentId` (uint256): ID of the patent to pause

**Emits**:
- `PatentStatusChanged(patentId, PatentStatus.Suspended)`

**Requirements**:
- Caller must be contract owner

**Example**:
```javascript
await contract.connect(owner).emergencyPause(patentId);
```

### emergencyResume

```solidity
function emergencyResume(uint256 patentId) external
```

**Description**: Emergency resume a paused patent (only contract owner).

**Parameters**:
- `patentId` (uint256): ID of the patent to resume

**Emits**:
- `PatentStatusChanged(patentId, PatentStatus.Active)`

**Requirements**:
- Caller must be contract owner

**Example**:
```javascript
await contract.connect(owner).emergencyResume(patentId);
```

---

## View Functions

### getPatentInfo

```solidity
function getPatentInfo(uint256 patentId) external view returns (
    address patentOwner,
    uint256 registrationTime,
    uint256 expirationTime,
    PatentStatus status,
    bool isConfidential,
    string memory patentHash,
    uint8 territoryCode
)
```

**Description**: Get public patent information (respects confidentiality).

**Parameters**:
- `patentId` (uint256): ID of the patent

**Returns**:
- `patentOwner` (address): Patent owner address
- `registrationTime` (uint256): Registration timestamp
- `expirationTime` (uint256): Expiration timestamp
- `status` (PatentStatus): Current status
- `isConfidential` (bool): Confidentiality flag
- `patentHash` (string): IPFS hash or reference
- `territoryCode` (uint8): Territory code

**Example**:
```javascript
const [
    owner,
    registrationTime,
    expirationTime,
    status,
    isConfidential,
    patentHash,
    territoryCode
] = await contract.getPatentInfo(patentId);
```

### getUserPatents

```solidity
function getUserPatents(address user) external view returns (uint256[] memory)
```

**Description**: Get all patent IDs owned by a user.

**Parameters**:
- `user` (address): User address

**Returns**:
- `patentIds` (uint256[]): Array of patent IDs

**Example**:
```javascript
const patentIds = await contract.getUserPatents(userAddress);
console.log(`User owns ${patentIds.length} patents`);
```

### getUserLicenses

```solidity
function getUserLicenses(address user) external view returns (uint256[] memory)
```

**Description**: Get all license IDs for a user.

**Parameters**:
- `user` (address): User address

**Returns**:
- `licenseIds` (uint256[]): Array of license IDs

**Example**:
```javascript
const licenseIds = await contract.getUserLicenses(userAddress);
```

### getPatentLicenses

```solidity
function getPatentLicenses(uint256 patentId) external view returns (uint256[] memory)
```

**Description**: Get all licenses for a patent.

**Parameters**:
- `patentId` (uint256): Patent ID

**Returns**:
- `licenseIds` (uint256[]): Array of license IDs

**Example**:
```javascript
const licenseIds = await contract.getPatentLicenses(patentId);
```

### getRoyaltyPaymentCount

```solidity
function getRoyaltyPaymentCount(uint256 licenseId) external view returns (uint256)
```

**Description**: Get number of royalty payments for a license.

**Parameters**:
- `licenseId` (uint256): License ID

**Returns**:
- `count` (uint256): Number of payments

**Example**:
```javascript
const count = await contract.getRoyaltyPaymentCount(licenseId);
```

### isBiddingActive

```solidity
function isBiddingActive(uint256 patentId) external view returns (bool)
```

**Description**: Check if bidding is currently active for a patent.

**Parameters**:
- `patentId` (uint256): Patent ID

**Returns**:
- `active` (bool): True if bidding is active

**Example**:
```javascript
const isActive = await contract.isBiddingActive(patentId);
```

### getDecryptionRequestStatus

```solidity
function getDecryptionRequestStatus(uint256 requestId) external view returns (
    RequestStatus status,
    uint256 timestamp,
    bool canTimeout
)
```

**Description**: Get status of a decryption request.

**Parameters**:
- `requestId` (uint256): Request ID

**Returns**:
- `status` (RequestStatus): Request status (0=None, 1=Pending, 2=Completed, 3=Failed, 4=TimedOut)
- `timestamp` (uint256): Request timestamp
- `canTimeout` (bool): Whether timeout can be triggered

**Example**:
```javascript
const [status, timestamp, canTimeout] = await contract.getDecryptionRequestStatus(requestId);

if (canTimeout) {
    console.log("Request can be timed out. Refund available.");
}
```

---

## Events

### Patent Events

```solidity
event PatentRegistered(
    uint256 indexed patentId,
    address indexed owner,
    string patentHash
);

event PatentStatusChanged(
    uint256 indexed patentId,
    PatentStatus newStatus
);
```

### License Events

```solidity
event LicenseRequested(
    uint256 indexed licenseId,
    uint256 indexed patentId,
    address indexed licensee
);

event LicenseApproved(
    uint256 indexed licenseId,
    address indexed licensee,
    address indexed licensor
);

event LicenseStatusChanged(
    uint256 indexed licenseId,
    LicenseStatus newStatus
);
```

### Bidding Events

```solidity
event ConfidentialBidSubmitted(
    uint256 indexed patentId,
    address indexed bidder
);

event ExclusiveLicenseAwarded(
    uint256 indexed patentId,
    address indexed winner,
    uint256 indexed licenseId
);
```

### Payment Events

```solidity
event RoyaltyPaid(
    uint256 indexed licenseId,
    address indexed payer,
    uint256 reportingPeriod
);
```

### Gateway Callback Events

```solidity
event DecryptionRequested(
    uint256 indexed requestId,
    address indexed requester,
    uint256 timestamp
);

event DecryptionCompleted(
    uint256 indexed requestId,
    bool success
);

event DecryptionFailed(
    uint256 indexed requestId,
    string reason
);

event DecryptionTimedOut(
    uint256 indexed requestId,
    address indexed user
);
```

### Refund Events

```solidity
event RefundProcessed(
    address indexed user,
    uint256 amount,
    string reason
);

event RefundAvailable(
    address indexed user,
    uint256 amount
);
```

---

## Error Codes

### Common Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Not authorized" | Caller is not contract owner | Use owner account |
| "Not patent owner" | Caller is not patent owner | Use patent owner account |
| "Not the licensor" | Caller is not licensor | Use licensor account |
| "Not the licensee" | Caller is not licensee | Use licensee account |
| "Invalid patent ID" | Patent ID doesn't exist | Use valid patent ID |
| "Patent not active" | Patent is suspended/expired | Check patent status |
| "Invalid license ID" | License ID doesn't exist | Use valid license ID |

### Input Validation Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Royalty rate too high" | Rate > 10000 (100%) | Use rate ≤ 10000 |
| "Invalid validity period" | Years not 1-20 | Use 1-20 years |
| "Patent hash required" | Empty patent hash | Provide valid hash |
| "Invalid duration" | Duration is 0 | Use duration > 0 |
| "Invalid royalty rate" | Rate > 10000 | Use rate ≤ 10000 |
| "Invalid bid amount" | Bid is 0 | Use bid > 0 |
| "Insufficient payment" | msg.value < bid | Send enough ETH |

### State Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Bidding already open" | Bidding active | Wait for current bidding to end |
| "Bidding not open" | Bidding not started | Start bidding first |
| "Bidding ended" | Past bidding time | Cannot submit bids |
| "Bidding still active" | Before bidding end | Wait for bidding to end |
| "No bidders" | No bids submitted | Need at least one bid |
| "License not pending" | Wrong license status | Check license status |
| "License not active" | License inactive | Check license status |
| "Already verified" | Payment already verified | No need to verify again |
| "Invalid request status" | Wrong request state | Check request status |

### Refund Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "No refund available" | No pending refunds | Check pending refund amount |
| "Refund transfer failed" | Transfer failed | Check recipient can receive ETH |
| "Reentrancy detected" | Reentrant call | Not possible for users |

---

## Complete Usage Example

```javascript
// 1. Deploy Contract
const Contract = await ethers.getContractFactory("ConfidentialPatentLicense");
const contract = await Contract.deploy();
await contract.deployed();

// 2. Register Patent
const registerTx = await contract.registerPatent(
    500,  // 5% royalty
    ethers.utils.parseEther("1.0"),  // min fee
    365,  // 1 year exclusivity
    10,   // 10 years validity
    "QmPatentHash",
    1,    // US territory
    true  // confidential
);
const registerReceipt = await registerTx.wait();
const patentId = registerReceipt.events[0].args.patentId;

// 3. Start Bidding
await contract.startConfidentialBidding(patentId, 72);  // 3 days

// 4. Submit Bids (from multiple accounts)
const bidAmount = ethers.utils.parseEther("10.0");
await contract.connect(bidder1).submitConfidentialBid(patentId, bidAmount, {
    value: bidAmount
});

await contract.connect(bidder2).submitConfidentialBid(patentId, ethers.utils.parseEther("12.0"), {
    value: ethers.utils.parseEther("12.0")
});

// 5. Wait for bidding to end
await ethers.provider.send("evm_increaseTime", [72 * 3600]);
await ethers.provider.send("evm_mine");

// 6. Finalize Bidding (triggers Gateway callback)
const finalizeTx = await contract.finalizeBidding(patentId);
const finalizeReceipt = await finalizeTx.wait();
const requestId = finalizeReceipt.events[0].args.requestId;

// 7. Gateway calls finalizeBiddingCallback automatically
// Winner gets license, losers get refunds

// 8. Check pending refund (for non-winner)
const refund = await contract.getPendingRefund(bidder1.address);

// 9. Withdraw refund
if (refund.gt(0)) {
    await contract.connect(bidder1).withdrawRefund();
}

// 10. Winner pays royalties
const licenseId = 1;
await contract.connect(winner).payRoyalties(
    licenseId,
    ethers.utils.parseEther("100.0"),  // reported revenue
    Date.now(),
    { value: ethers.utils.parseEther("5.0") }  // 5% royalty
);

// 11. Licensor requests verification
await contract.connect(patentOwner).requestRoyaltyVerification(licenseId, 0);

// 12. Gateway calls processRoyaltyVerificationCallback automatically
// Verification status updated
```

---

## Constants

```solidity
uint256 public constant DECRYPTION_TIMEOUT = 7 days;
uint256 public constant MAX_VALIDITY_YEARS = 20;
uint256 public constant MAX_BIDDING_DURATION = 168 hours;
uint256 public constant MAX_ROYALTY_RATE = 10000;
```

---

## Enums

```solidity
enum PatentStatus { Active, Suspended, Expired }
enum LicenseStatus { Pending, Active, Suspended, Expired, Revoked }
enum RequestStatus { None, Pending, Completed, Failed, TimedOut }
```

---

## Support

For issues and questions:
- Review this API documentation
- Check the ARCHITECTURE.md for system design
- See README.md for getting started
- Review test files for usage examples

---

## Version History

**Version 1.0.0** - Initial Release
- Core patent and license management
- Confidential bidding with Gateway callbacks
- Royalty payment verification
- Refund mechanism
- Timeout protection
