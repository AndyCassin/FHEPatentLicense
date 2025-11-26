# Architecture Documentation

## Overview

The Confidential Patent License Platform is a privacy-preserving patent licensing system built on Ethereum using Zama's Fully Homomorphic Encryption (FHE) technology. The platform enables confidential patent registration, licensing agreements, royalty payments, and encrypted bidding processes.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│                 │          │                 │          │                 │
│   Frontend      │◄────────►│  Smart Contract │◄────────►│  Zama Gateway   │
│   (Web3 DApp)   │          │   (FHE Logic)   │          │  (Decryption)   │
│                 │          │                 │          │                 │
└─────────────────┘          └─────────────────┘          └─────────────────┘
        │                            │                            │
        │                            │                            │
        ▼                            ▼                            ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│   MetaMask      │          │   Ethereum      │          │   FHE Oracle    │
│   Wallet        │          │   Blockchain    │          │   Network       │
└─────────────────┘          └─────────────────┘          └─────────────────┘
```

## Core Components

### 1. Smart Contract Layer

#### ConfidentialPatentLicense.sol

The main contract implements:
- **Patent Management**: Registration, status updates, and lifecycle management
- **License Agreements**: Request, approval, and tracking
- **Confidential Bidding**: Encrypted auction system
- **Royalty Payments**: Privacy-preserving payment verification
- **Gateway Callback System**: Async decryption handling

### 2. FHE (Fully Homomorphic Encryption) Layer

#### Encrypted Data Types

```solidity
euint64  - 64-bit encrypted integers (royalty rates, fees, revenue)
euint32  - 32-bit encrypted integers (exclusivity periods, revenue caps)
euint8   - 8-bit encrypted integers (territory masks)
ebool    - Encrypted booleans (comparison results)
```

#### FHE Operations Used

- `FHE.asEuint64()` - Convert plaintext to encrypted value
- `FHE.allowThis()` - Grant contract access to encrypted value
- `FHE.allow()` - Grant specific address access
- `FHE.toBytes32()` - Convert for decryption request
- `FHE.requestDecryption()` - Initiate Gateway callback
- `FHE.checkSignatures()` - Verify decryption proof

### 3. Gateway Callback Pattern

The platform implements an innovative async decryption pattern:

#### Workflow

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ 1. Submit Encrypted Request  │
│    - Store request state     │
│    - Record timestamp        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ 2. Request Gateway Decrypt   │
│    - Call FHE.requestDecrypt │
│    - Get requestId           │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ 3. Gateway Processes         │
│    - Decrypt data off-chain  │
│    - Sign results            │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ 4. Callback Execution        │
│    - Verify signatures       │
│    - Complete transaction    │
│    - Emit events             │
└──────────────────────────────┘
```

#### Benefits

1. **Privacy**: Data remains encrypted on-chain
2. **Efficiency**: Heavy computation done off-chain
3. **Security**: Cryptographic proofs ensure integrity
4. **Gas Optimization**: Minimal on-chain FHE operations

## Key Features Implementation

### 1. Refund Mechanism

**Purpose**: Handle decryption failures and timeout scenarios

**Implementation**:
```solidity
// Track pending refunds
mapping(address => uint256) public pendingRefunds;

// Store bid amounts for refund capability
mapping(uint256 => mapping(address => uint256)) public bidAmounts;

// Process refund
function claimRefund(uint256 requestId) external nonReentrant {
    // Check timeout or failure
    // Credit pending refunds
    // Transfer funds
}
```

**Refund Triggers**:
- Decryption timeout (> 7 days)
- Decryption failure
- Non-winning bid
- Verification failure

### 2. Timeout Protection

**Purpose**: Prevent permanent fund locks

**Configuration**:
```solidity
uint256 public constant DECRYPTION_TIMEOUT = 7 days;
uint256 public constant MAX_BIDDING_DURATION = 168 hours;
```

**Protection Mechanism**:
```solidity
struct DecryptionRequest {
    uint256 requestId;
    uint256 timestamp;
    RequestStatus status;
    address requester;
    bytes32 dataHash;
}

// Check timeout
bool timedOut = (request.status == RequestStatus.Pending &&
                block.timestamp >= request.timestamp + DECRYPTION_TIMEOUT);
```

### 3. Gateway Callback Pattern

#### Bidding Finalization

**Step 1: Initiate Decryption**
```solidity
function finalizeBidding(uint256 patentId) external {
    // Prepare encrypted bids
    bytes32[] memory cts = new bytes32[](bidders.length);

    // Request Gateway decryption
    uint256 requestId = FHE.requestDecryption(
        cts,
        this.finalizeBiddingCallback.selector
    );

    // Track request for timeout
    decryptionRequests[requestId] = DecryptionRequest({...});
}
```

**Step 2: Callback Execution**
```solidity
function finalizeBiddingCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    // Verify Gateway signatures
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);

    // Decode decrypted bids
    uint64[] memory decryptedBids = abi.decode(cleartexts, (uint64[]));

    // Find winner
    // Award license
    // Process refunds for non-winners
}
```

#### Royalty Verification

**Step 1: Request Verification**
```solidity
function requestRoyaltyVerification(
    uint256 licenseId,
    uint256 paymentIndex
) external {
    // Prepare encrypted data
    bytes32[] memory cts = new bytes32[](3);
    cts[0] = FHE.toBytes32(payment.encryptedRevenue);
    cts[1] = FHE.toBytes32(license.encryptedRoyaltyRate);
    cts[2] = FHE.toBytes32(payment.encryptedAmount);

    // Request verification
    FHE.requestDecryption(
        cts,
        this.processRoyaltyVerificationCallback.selector
    );
}
```

**Step 2: Verification Callback**
```solidity
function processRoyaltyVerificationCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    // Verify signatures
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);

    // Decode values
    (uint64 revenue, uint64 royaltyRate, uint64 paidAmount) =
        abi.decode(cleartexts, (uint64, uint64, uint64));

    // Verify calculation
    uint64 expectedRoyalty = (revenue * royaltyRate) / 10000;
    bool isValid = paidAmount >= (expectedRoyalty * 95) / 100;
}
```

## Security Architecture

### 1. Input Validation

**All external functions validate inputs**:
```solidity
// Rate validation
require(royaltyRate <= MAX_ROYALTY_RATE, "Royalty rate too high");

// Duration validation
require(validityYears > 0 && validityYears <= MAX_VALIDITY_YEARS);

// Required fields
require(bytes(patentHash).length > 0, "Patent hash required");
```

### 2. Access Control

**Role-based permissions**:
```solidity
modifier onlyOwner() { ... }
modifier onlyPatentOwner(uint256 patentId) { ... }
modifier validPatent(uint256 patentId) { ... }
modifier validLicense(uint256 licenseId) { ... }
```

### 3. Overflow Protection

**Safe arithmetic operations**:
```solidity
// Use explicit casting to prevent overflow
uint64 expectedRoyalty = uint64((uint128(revenue) * royaltyRate) / 10000);

// Bounds checking
require(bidAmount > 0, "Invalid bid amount");
require(msg.value >= bidAmount, "Insufficient payment");
```

### 4. Reentrancy Protection

**NonReentrant modifier on critical functions**:
```solidity
uint256 private locked = 1;

modifier nonReentrant() {
    require(locked == 1, "Reentrancy detected");
    locked = 2;
    _;
    locked = 1;
}

// Applied to:
function claimRefund() external nonReentrant { ... }
function withdrawRefund() external nonReentrant { ... }
function payRoyalties() external nonReentrant { ... }
```

## Privacy Solutions

### 1. Division Problem

**Challenge**: FHE division is expensive and can leak information

**Solution**:
- Encrypt both dividend and divisor
- Perform division in Gateway callback
- Use random multipliers for additional privacy
- Store only encrypted results on-chain

```solidity
// On-chain: Store encrypted values
euint64 encryptedRevenue = FHE.asEuint64(reportedRevenue);
euint64 encryptedRoyaltyRate = license.encryptedRoyaltyRate;

// Off-chain: Gateway performs division
uint64 expectedRoyalty = (revenue * royaltyRate) / 10000;

// Result: Only verification result stored
payment.isVerified = true;
```

### 2. Price Leakage Prevention

**Challenge**: Transaction patterns can reveal price information

**Solution**:
- Fuzzing techniques for amounts
- Batch processing where possible
- Delayed revelation via callbacks
- Encrypted comparison without decryption

### 3. Async Processing Benefits

**Gateway Callback Advantages**:
- Complex operations done off-chain
- On-chain gas costs minimized
- Privacy maintained throughout
- Cryptographic proofs ensure correctness

### 4. Gas Optimization (HCU Management)

**HCU** = Homomorphic Compute Unit (FHE operation cost)

**Optimization Strategies**:

1. **Minimize FHE Operations**
```solidity
// Bad: Multiple encryptions
for (uint i = 0; i < n; i++) {
    euint64 enc = FHE.asEuint64(values[i]);
    // ... operations
}

// Good: Batch encrypt
bytes32[] memory cts = new bytes32[](n);
for (uint i = 0; i < n; i++) {
    cts[i] = FHE.toBytes32(encryptedValues[i]);
}
```

2. **Efficient Permission Management**
```solidity
// Centralized permission handling
function _setLicenseFHEPermissions(...) internal {
    FHE.allowThis(encryptedFee);
    FHE.allowThis(encryptedRoyalty);
    FHE.allow(encryptedFee, msg.sender);
    FHE.allow(encryptedFee, patentOwner);
}
```

3. **Offload to Gateway**
```solidity
// Expensive FHE operations done off-chain
FHE.requestDecryption(cts, callback);
```

## Data Flow Examples

### Patent Registration Flow

```
User                 Contract                Gateway
 │                      │                      │
 ├──Register Patent────►│                      │
 │  (plaintext)         │                      │
 │                      │                      │
 │                      ├──Encrypt Data        │
 │                      │  FHE.asEuint64()     │
 │                      │                      │
 │                      ├──Store Encrypted     │
 │                      │  On-Chain            │
 │                      │                      │
 │◄─────PatentId────────┤                      │
 │                      │                      │
```

### Bidding Flow with Callback

```
User                 Contract                Gateway
 │                      │                      │
 ├──Submit Bid─────────►│                      │
 │  (encrypted)         │                      │
 │                      │                      │
 │                      ├──Store Bid           │
 │                      │  Store Payment       │
 │                      │                      │
 ├──Finalize Bidding───►│                      │
 │                      │                      │
 │                      ├──Request Decrypt────►│
 │                      │  (requestId)         │
 │                      │                      │
 │                      │                      ├──Decrypt Bids
 │                      │                      │  Off-Chain
 │                      │                      │
 │                      │◄─────Callback────────┤
 │                      │  (decrypted, proof)  │
 │                      │                      │
 │                      ├──Verify Signatures   │
 │                      │                      │
 │                      ├──Find Winner         │
 │                      │                      │
 │                      ├──Award License       │
 │                      │                      │
 │                      ├──Process Refunds     │
 │                      │                      │
 │◄─────Events──────────┤                      │
 │                      │                      │
```

### Timeout and Refund Flow

```
User                 Contract                Time
 │                      │                      │
 ├──Finalize Bidding───►│                      │
 │                      ├──Request Decrypt     │
 │                      │  timestamp = T       │
 │                      │                      │
 │                      │          ╔═══════════╪═══════════╗
 │                      │          ║  WAITING  │  Period   ║
 │                      │          ║           │           ║
 │                      │          ║           ▼           ║
 │                      │          ║      T + 7 days       ║
 │                      │          ╚═══════════╪═══════════╝
 │                      │                      │
 ├──Claim Refund───────►│                      │
 │                      │                      │
 │                      ├──Check Timeout       │
 │                      │  (T + 7 days passed?)│
 │                      │                      │
 │                      ├──Process Refunds     │
 │                      │  All Bidders         │
 │                      │                      │
 │◄─────ETH Refund──────┤                      │
 │                      │                      │
```

## Event System

### Event Categories

#### 1. Core Operations
```solidity
event PatentRegistered(uint256 indexed patentId, address indexed owner, string patentHash);
event LicenseRequested(uint256 indexed licenseId, uint256 indexed patentId, address indexed licensee);
event LicenseApproved(uint256 indexed licenseId, address indexed licensee, address indexed licensor);
```

#### 2. Payment Events
```solidity
event RoyaltyPaid(uint256 indexed licenseId, address indexed payer, uint256 reportingPeriod);
event ConfidentialBidSubmitted(uint256 indexed patentId, address indexed bidder);
```

#### 3. Gateway Callback Events
```solidity
event DecryptionRequested(uint256 indexed requestId, address indexed requester, uint256 timestamp);
event DecryptionCompleted(uint256 indexed requestId, bool success);
event DecryptionFailed(uint256 indexed requestId, string reason);
event DecryptionTimedOut(uint256 indexed requestId, address indexed user);
```

#### 4. Refund Events
```solidity
event RefundProcessed(address indexed user, uint256 amount, string reason);
event RefundAvailable(address indexed user, uint256 amount);
```

## Storage Optimization

### Struct Packing

```solidity
struct PatentInfo {
    address patentOwner;           // 20 bytes
    uint256 registrationTime;      // 32 bytes
    uint256 expirationTime;        // 32 bytes
    euint64 encryptedRoyaltyRate;  // Handle
    euint64 encryptedMinLicenseFee;// Handle
    euint32 encryptedExclusivity;  // Handle
    PatentStatus status;           // 1 byte
    bool isConfidential;           // 1 byte
    uint8 territoryCode;           // 1 byte
    string patentHash;             // Dynamic
}
```

### Mapping Strategy

```solidity
// Core data
mapping(uint256 => PatentInfo) public patents;
mapping(uint256 => LicenseAgreement) public licenses;

// Indexing for efficient queries
mapping(address => uint256[]) public userPatents;
mapping(address => uint256[]) public userLicenses;
mapping(uint256 => uint256[]) public patentLicenses;

// Gateway callback tracking
mapping(uint256 => DecryptionRequest) public decryptionRequests;
mapping(uint256 => uint256) public requestIdToLicenseId;
mapping(uint256 => uint256) public requestIdToPatentId;

// Refund management
mapping(address => uint256) public pendingRefunds;
```

## Testing Strategy

### Unit Tests

1. **Patent Management**
   - Registration validation
   - Status transitions
   - Permission checks

2. **License Operations**
   - Request creation
   - Approval process
   - Status management

3. **Bidding System**
   - Bid submission
   - Winner determination
   - Refund processing

4. **Callback Handling**
   - Signature verification
   - State transitions
   - Error handling

5. **Timeout Protection**
   - Timeout detection
   - Refund triggers
   - Edge cases

### Integration Tests

1. **End-to-End Flows**
   - Complete bidding cycle
   - Royalty payment and verification
   - Multi-license scenarios

2. **Gateway Interaction**
   - Callback simulation
   - Timeout scenarios
   - Failure recovery

### Security Tests

1. **Attack Vectors**
   - Reentrancy attempts
   - Overflow attacks
   - Access control bypass

2. **Edge Cases**
   - Zero values
   - Maximum values
   - Invalid states

## Deployment Architecture

### Network Configuration

```javascript
// Sepolia Testnet
{
  chainId: 11155111,
  fhevmAddress: "...",
  gatewayAddress: "...",
  rpcUrl: "https://sepolia...."
}
```

### Contract Deployment Steps

1. **Compile Contracts**
```bash
npx hardhat compile
```

2. **Deploy to Sepolia**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. **Verify on Etherscan**
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

4. **Initialize Configuration**
```javascript
// Set initial parameters
await contract.initialize();
```

## Monitoring and Maintenance

### Event Monitoring

Monitor critical events for:
- Stuck decryption requests
- Failed callbacks
- Unusual refund patterns
- High gas usage

### Health Checks

1. **Gateway Connectivity**
   - Check callback response times
   - Monitor timeout rates

2. **Contract State**
   - Pending decryption requests
   - Refund balances
   - Active licenses

3. **User Experience**
   - Average transaction times
   - Success rates
   - Gas costs

## Future Enhancements

### Planned Features

1. **Batch Operations**
   - Multi-patent registration
   - Bulk license approvals
   - Batch royalty payments

2. **Advanced Auctions**
   - Multi-round bidding
   - Reserve prices
   - Dutch auctions

3. **Automated Renewals**
   - License auto-renewal
   - Automated royalty calculations
   - Scheduled payments

4. **Cross-Chain Support**
   - Bridge to L2 solutions
   - Multi-chain licensing
   - Cross-chain royalties

### Research Areas

1. **Enhanced Privacy**
   - Zero-knowledge proofs
   - Anonymous bidding
   - Private royalty formulas

2. **Scalability**
   - Layer 2 integration
   - State channels
   - Rollup solutions

3. **Interoperability**
   - Patent NFTs
   - DeFi integrations
   - DAO governance

## Glossary

- **FHE**: Fully Homomorphic Encryption - enables computation on encrypted data
- **Gateway**: Zama's decryption service for FHE operations
- **HCU**: Homomorphic Compute Unit - gas equivalent for FHE operations
- **Callback Pattern**: Async execution pattern for FHE decryption
- **euint**: Encrypted unsigned integer types (euint8, euint32, euint64)
- **Timeout Protection**: Mechanism to prevent permanent fund locks
- **Refund Mechanism**: System to return funds on failures

## References

- [Zama FHE Documentation](https://docs.zama.ai/)
- [fhEVM Specification](https://docs.zama.ai/fhevm)
- [Gateway Callback Pattern](https://docs.zama.ai/fhevm/guides/callback)
- [Hardhat Development](https://hardhat.org/docs)
- [Solidity Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
