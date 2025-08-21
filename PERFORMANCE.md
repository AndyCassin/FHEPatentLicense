# Performance Optimization Guide

Comprehensive guide for gas optimization and performance tuning.

## Table of Contents

1. [Gas Optimization Overview](#gas-optimization-overview)
2. [Measurement & Monitoring](#measurement--monitoring)
3. [Optimization Techniques](#optimization-techniques)
4. [Compiler Optimizations](#compiler-optimizations)
5. [Performance Testing](#performance-testing)
6. [Best Practices](#best-practices)

---

## Gas Optimization Overview

### Why Gas Optimization Matters

**User Benefits**:
- Lower transaction costs
- Faster execution
- Better user experience

**Platform Benefits**:
- Higher scalability
- More efficient resource usage
- Competitive advantage

**Security Benefits**:
- DoS attack prevention
- Predictable costs
- Reduced attack surface

### Gas Cost Hierarchy

```
Most Expensive (avoid):
├── SSTORE (20,000 gas) - Write to storage
├── CREATE (32,000 gas) - Deploy contract
└── CALL (2,600+ gas) - External call

Medium Cost (optimize):
├── SLOAD (2,100 gas) - Read from storage
├── LOG (375+ gas) - Event emission
└── KECCAK256 (30+ gas) - Hashing

Least Expensive (prefer):
├── Memory operations (3 gas)
├── Stack operations (3 gas)
└── Arithmetic (3-5 gas)
```

---

## Measurement & Monitoring

### 1. Gas Reporter Configuration

**File**: `hardhat.config.js`

```javascript
gasReporter: {
  enabled: process.env.REPORT_GAS === "true",
  currency: "USD",
  outputFile: "gas-report.txt",
  coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  showTimeSpent: true,
  showMethodSig: true,
}
```

**Usage**:
```bash
# Run tests with gas reporting
npm run test:gas

# Output: gas-report.txt
·----------------------------------------|---------------------------|
|  Contract              ·  Method       ·  Gas                      |
·----------------------------------------|---------------------------|
|  PatentLicense         ·  register     ·  510,234                  |
|  PatentLicense         ·  request      ·  425,123                  |
·----------------------------------------|---------------------------|
```

### 2. Contract Size Monitoring

**Configuration**:
```javascript
contractSizer: {
  alphaSort: true,
  runOnCompile: process.env.CONTRACT_SIZER === "true",
  strict: true,
}
```

**Usage**:
```bash
# Check contract sizes
CONTRACT_SIZER=true npm run compile

# Output:
# ConfidentialPatentLicense: 23.5 KB (< 24 KB limit ✓)
```

### 3. Profiling Tools

```bash
# Hardhat gas profiling
npx hardhat test --trace

# Detailed gas breakdown
REPORT_GAS=true npm test > gas-profile.txt
```

---

## Optimization Techniques

### 1. Storage Optimization

#### Use Proper Data Types

```solidity
// ✅ Good: Packed struct (1 slot)
struct Optimized {
    uint128 value1;  // 16 bytes
    uint64 value2;   // 8 bytes
    uint32 value3;   // 4 bytes
    uint32 value4;   // 4 bytes
}  // Total: 32 bytes = 1 slot

// ❌ Bad: Unpacked struct (4 slots)
struct Unoptimized {
    uint256 value1;  // 32 bytes = 1 slot
    uint256 value2;  // 32 bytes = 1 slot
    uint256 value3;  // 32 bytes = 1 slot
    uint256 value4;  // 32 bytes = 1 slot
}  // Total: 128 bytes = 4 slots
```

**Gas Savings**: ~60,000 gas per struct write

#### Use Mappings Over Arrays

```solidity
// ✅ Good: O(1) lookup
mapping(uint256 => Patent) public patents;

// ❌ Bad: O(n) lookup
Patent[] public patents;

function findPatent(uint256 id) external view returns (Patent memory) {
    for (uint256 i = 0; i < patents.length; i++) {
        if (patents[i].id == id) return patents[i];
    }
}
```

**Gas Savings**: Variable, huge for large datasets

#### Cache Storage Variables

```solidity
// ✅ Good: Cache in memory
function processPatent(uint256 patentId) external {
    Patent memory patent = patents[patentId];  // 1 SLOAD
    // Use patent.* multiple times
    require(patent.owner == msg.sender);
    require(patent.status == Status.Active);
}

// ❌ Bad: Multiple SLOAD
function processPatentBad(uint256 patentId) external {
    require(patents[patentId].owner == msg.sender);  // SLOAD
    require(patents[patentId].status == Status.Active);  // SLOAD
}
```

**Gas Savings**: ~2,000 gas per avoided SLOAD

### 2. Function Optimization

#### Use External Instead of Public

```solidity
// ✅ Good: External (calldata)
function registerPatent(uint64 rate) external returns (uint256) {
    // Function logic
}

// ❌ Bad: Public (extra copying)
function registerPatent(uint64 rate) public returns (uint256) {
    // Function logic
}
```

**Gas Savings**: ~200-500 gas

#### Short-circuit Conditionals

```solidity
// ✅ Good: Most likely condition first
if (msg.sender == owner || authorized[msg.sender]) {
    // Execute
}

// ❌ Bad: Expensive check first
if (checkComplexCondition() || msg.sender == owner) {
    // Execute
}
```

#### Use Custom Errors

```solidity
// ✅ Good: Custom errors (4 bytes)
error Unauthorized();
error InsufficientBalance(uint256 required, uint256 available);

if (msg.sender != owner) revert Unauthorized();

// ❌ Bad: String errors (~50 bytes)
require(msg.sender == owner, "Not authorized");
```

**Gas Savings**: ~200-400 gas per revert

### 3. Loop Optimization

#### Avoid Unbounded Loops

```solidity
// ✅ Good: Bounded iteration
function processPatents(uint256 start, uint256 count) external {
    uint256 end = start + count;
    require(end <= totalPatents, "Out of bounds");

    for (uint256 i = start; i < end; i++) {
        process(patents[i]);
    }
}

// ❌ Bad: Unbounded loop
function processAllPatents() external {
    for (uint256 i = 0; i < patents.length; i++) {
        process(patents[i]);
    }
}
```

#### Optimize Loop Variables

```solidity
// ✅ Good: Cache length, use unchecked
function optimizedLoop(uint256[] calldata data) external {
    uint256 length = data.length;
    for (uint256 i = 0; i < length;) {
        // Process data[i]
        unchecked { ++i; }
    }
}

// ❌ Bad: Access length each iteration
function slowLoop(uint256[] calldata data) external {
    for (uint256 i = 0; i < data.length; i++) {
        // Process data[i]
    }
}
```

**Gas Savings**: ~20-50 gas per iteration

### 4. Event Optimization

#### Index Important Fields

```solidity
// ✅ Good: Indexed for filtering
event PatentRegistered(
    uint256 indexed patentId,
    address indexed owner,
    string patentHash
);

// ❌ Bad: No indexing
event PatentRegistered(
    uint256 patentId,
    address owner,
    string patentHash
);
```

#### Minimize Event Data

```solidity
// ✅ Good: Only essential data
event LicenseApproved(
    uint256 indexed licenseId,
    uint256 indexed patentId
);

// ❌ Bad: Redundant data
event LicenseApproved(
    uint256 indexed licenseId,
    uint256 indexed patentId,
    address licensee,        // Can be queried
    address licensor,        // Can be queried
    uint256 timestamp        // Available in block
);
```

### 5. Memory vs Storage

```solidity
// ✅ Good: Use memory for temporary data
function calculateTotal(uint256[] memory values) external pure returns (uint256 total) {
    for (uint256 i = 0; i < values.length; i++) {
        total += values[i];
    }
}

// ❌ Bad: Unnecessary storage
uint256[] public tempValues;  // Costs 20,000 gas per write!
```

---

## Compiler Optimizations

### 1. Optimizer Configuration

**File**: `hardhat.config.js`

```javascript
solidity: {
  version: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,  // Default
      // runs: 1,      // Optimize for deployment
      // runs: 1000,   // Optimize for runtime
      // runs: 10000,  // Maximum runtime optimization
    },
    viaIR: false,  // Experimental optimization
  },
}
```

### Optimizer Runs Trade-off

| Runs | Deployment Gas | Runtime Gas | Use Case |
|------|----------------|-------------|----------|
| 1 | Lowest | Highest | Single-use contracts |
| 200 | Balanced | Balanced | General purpose (default) |
| 1000 | Higher | Lower | Frequently called functions |
| 10000 | Highest | Lowest | Production contracts |

**Configuration via Environment**:
```bash
# Optimize for deployment
OPTIMIZER_RUNS=1 npm run compile

# Optimize for runtime
OPTIMIZER_RUNS=10000 npm run compile
```

### 2. viaIR Optimization

**Benefits**:
- Better optimization across functions
- Improved inlining
- Advanced stack management

**Trade-offs**:
- Slower compilation
- Experimental feature
- May have edge cases

**Usage**:
```javascript
viaIR: true,  // Enable in hardhat.config.js
```

---

## Performance Testing

### 1. Gas Benchmarking

```javascript
describe("Gas Benchmarks", function () {
  it("should measure patent registration gas", async function () {
    const tx = await contract.registerPatent(...args);
    const receipt = await tx.wait();

    console.log("Gas used:", receipt.gasUsed.toString());
    expect(receipt.gasUsed).to.be.lt(550000);  // Under 550k
  });

  it("should measure batch operations", async function () {
    // Batch operation testing
  });
});
```

### 2. Stress Testing

```javascript
describe("Stress Tests", function () {
  it("should handle 100 licenses efficiently", async function () {
    for (let i = 0; i < 100; i++) {
      await contract.requestLicense(...args);
    }
    // Measure total gas
  });
});
```

### 3. Comparative Analysis

```bash
# Before optimization
npm run test:gas > gas-before.txt

# After optimization
npm run test:gas > gas-after.txt

# Compare
diff gas-before.txt gas-after.txt
```

---

## Best Practices

### 1. Development Phase

#### Gas-Aware Coding

```solidity
// Priority order:
// 1. Correctness (security first!)
// 2. Clarity (maintainability)
// 3. Efficiency (gas optimization)

// Balance all three:
/// @notice Efficient and secure transfer
function safeTransfer(address to, uint256 amount) external {
    // 1. Security: Check balance
    if (balances[msg.sender] < amount) revert InsufficientBalance();

    // 2. Efficiency: Cache storage variable
    uint256 senderBalance = balances[msg.sender];

    // 3. Security: Check-effects-interactions
    balances[msg.sender] = senderBalance - amount;
    balances[to] += amount;

    emit Transfer(msg.sender, to, amount);
}
```

#### Progressive Optimization

```
Step 1: Write correct, clear code
Step 2: Add comprehensive tests
Step 3: Measure gas usage
Step 4: Identify bottlenecks
Step 5: Optimize hot paths
Step 6: Verify correctness maintained
Step 7: Measure improvements
```

### 2. Testing Phase

```bash
# Standard test
npm test

# With gas reporting
npm run test:gas

# Generate gas report
REPORT_GAS=true npm test > gas-report.txt

# Analyze report
grep -A 5 "expensive" gas-report.txt
```

### 3. Deployment Phase

```bash
# 1. Optimize for production
OPTIMIZER_RUNS=1000 npm run compile

# 2. Run gas benchmarks
npm run test:gas

# 3. Verify contract size
CONTRACT_SIZER=true npm run compile

# 4. Deploy with optimized bytecode
npm run deploy
```

---

## Gas Optimization Checklist

### Contract Design
- [ ] Minimize storage variables
- [ ] Pack structs efficiently
- [ ] Use mappings over arrays
- [ ] Limit array sizes
- [ ] Use events instead of storage logs

### Function Design
- [ ] Use `external` for external functions
- [ ] Use `calldata` for arrays
- [ ] Cache storage variables
- [ ] Use custom errors
- [ ] Avoid unnecessary modifiers

### Loop Optimization
- [ ] Avoid unbounded loops
- [ ] Cache array length
- [ ] Use `unchecked` for counters
- [ ] Minimize storage operations in loops

### Compiler Settings
- [ ] Enable optimizer
- [ ] Set appropriate runs
- [ ] Consider viaIR for production
- [ ] Pin Solidity version

### Testing
- [ ] Measure gas usage
- [ ] Set gas limits
- [ ] Benchmark critical functions
- [ ] Compare before/after optimization

---

## Monitoring in Production

### Key Metrics

```javascript
// Track:
- Average gas per transaction
- Peak gas usage
- Failed transactions (out of gas)
- Gas price trends
- User behavior patterns
```

### Alerts

```javascript
// Alert if:
- Gas usage exceeds threshold
- Multiple out-of-gas failures
- Unusual transaction patterns
- Contract approaching size limit
```

---

## Resources

### Tools
- [Hardhat Gas Reporter](https://github.com/cgewecke/hardhat-gas-reporter)
- [eth-gas-reporter](https://github.com/cgewecke/eth-gas-reporter)
- [Tenderly](https://tenderly.co/)
- [BlockNative Gas Platform](https://www.blocknative.com/)

### Learning
- [Solidity Gas Optimization Tips](https://mudit.blog/solidity-gas-optimization-tips/)
- [OpenZeppelin Gas Optimization](https://blog.openzeppelin.com/gas-optimization-in-solidity/)
- [Ethereum Gas Tracker](https://etherscan.io/gastracker)

---

**Gas Optimization Summary**

| Technique | Gas Savings | Difficulty | Priority |
|-----------|-------------|------------|----------|
| Custom Errors | 200-400 | Easy | High |
| Storage Packing | 20,000+ | Medium | High |
| Cache Storage | 2,000+ | Easy | High |
| External Functions | 200-500 | Easy | Medium |
| Unchecked Loops | 20-50 | Easy | Medium |
| Mapping vs Array | Variable | Medium | High |

**Remember**: Security > Clarity > Efficiency

---

**Last Updated**: 2025-10-30
**Performance Version**: 1.0
