# Testing Guide

Comprehensive testing documentation for the Confidential Patent License Platform.

## Table of Contents

1. [Test Infrastructure](#test-infrastructure)
2. [Running Tests](#running-tests)
3. [Test Coverage](#test-coverage)
4. [Test Suites](#test-suites)
5. [Testing Patterns](#testing-patterns)
6. [Best Practices](#best-practices)

## Test Infrastructure

### Technology Stack

- **Test Framework**: Hardhat with Mocha
- **Assertion Library**: Chai with custom matchers
- **Coverage Tool**: Solidity Coverage
- **Gas Reporter**: Hardhat Gas Reporter
- **Network Helpers**: @nomicfoundation/hardhat-network-helpers

### Project Structure

```
test/
└── ConfidentialPatentLicense.test.js    # Main test suite (45+ test cases)
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with gas reporting
REPORT_GAS=true npm test

# Run coverage analysis
npm run test:coverage

# Run tests on Sepolia testnet
npm run test:sepolia

# Clean and recompile before testing
npm run clean && npm run compile && npm test
```

### Test Output

Expected output:
```
  ConfidentialPatentLicense
    Deployment
      ✓ Should set the correct owner
      ✓ Should initialize patent and license IDs to 1
    Patent Registration
      ✓ Should register a new patent successfully
      ✓ Should reject royalty rate over 100%
      ...

  45 passing (2s)
```

## Test Coverage

### Coverage Metrics

Target coverage levels:
- **Statements**: > 95%
- **Branches**: > 90%
- **Functions**: > 95%
- **Lines**: > 95%

### Generate Coverage Report

```bash
npm run test:coverage
```

This generates:
- `coverage/` directory with HTML reports
- `coverage.json` with detailed metrics
- Console summary

### View Coverage Report

```bash
# Open in browser (Windows)
start coverage/index.html

# Or manually navigate to
# coverage/index.html
```

## Test Suites

### 1. Deployment Tests (2 tests)

**Purpose**: Verify contract initialization

Tests:
- [x] Contract owner is set correctly
- [x] Initial state variables are initialized

```javascript
describe("Deployment", function () {
  it("Should set the correct owner", async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Should initialize patent and license IDs to 1", async function () {
    expect(await contract.nextPatentId()).to.equal(1);
    expect(await contract.nextLicenseId()).to.equal(1);
  });
});
```

### 2. Patent Registration Tests (4 tests)

**Purpose**: Test patent creation and validation

Tests:
- [x] Successful patent registration
- [x] Rejection of invalid royalty rates
- [x] Rejection of invalid validity periods
- [x] User patent tracking

```javascript
describe("Patent Registration", function () {
  it("Should register a new patent successfully");
  it("Should reject royalty rate over 100%");
  it("Should reject invalid validity period");
  it("Should track user patents correctly");
});
```

### 3. Patent Information Tests (2 tests)

**Purpose**: Query patent data correctly

Tests:
- [x] Retrieve patent information
- [x] Revert on invalid patent ID

### 4. License Request Tests (4 tests)

**Purpose**: Test license workflow

Tests:
- [x] Successful license request
- [x] Rejection for inactive patents
- [x] Rejection of invalid duration
- [x] License tracking per user

### 5. License Approval Tests (3 tests)

**Purpose**: Verify approval process

Tests:
- [x] Successful approval by licensor
- [x] Rejection of unauthorized approval
- [x] Rejection of non-pending license approval

### 6. Confidential Bidding Tests (6 tests)

**Purpose**: Test sealed-bid auction mechanism

Tests:
- [x] Start bidding successfully
- [x] Only patent owner can start bidding
- [x] Reject invalid bidding duration
- [x] Submit confidential bid
- [x] Reject bid when bidding not open
- [x] Reject bid after deadline

### 7. Royalty Payment Tests (4 tests)

**Purpose**: Verify royalty processing

Tests:
- [x] Pay royalties successfully
- [x] Only licensee can pay
- [x] Reject payment for inactive license
- [x] Transfer payment to licensor

### 8. Status Management Tests (4 tests)

**Purpose**: Test state transitions

Tests:
- [x] Update patent status
- [x] Only owner can update patent status
- [x] Update license status
- [x] Only licensor can update license status

### 9. Emergency Functions Tests (3 tests)

**Purpose**: Verify admin controls

Tests:
- [x] Emergency pause by owner
- [x] Emergency resume by owner
- [x] Reject unauthorized emergency calls

### 10. Access Control Tests (Throughout)

**Purpose**: Verify permissions

Pattern used across all test suites:
```javascript
await expect(
  contract.connect(unauthorizedUser).restrictedFunction()
).to.be.revertedWith("Not authorized");
```

### 11. Edge Cases Tests (Throughout)

**Purpose**: Test boundary conditions

Tests include:
- Zero values
- Maximum values
- Empty strings
- Invalid states
- Race conditions

## Testing Patterns

### Pattern 1: Deployment Fixture

Every test uses isolated deployment:

```javascript
async function deployFixture() {
  const factory = await ethers.getContractFactory("ConfidentialPatentLicense");
  const contract = await factory.deploy();
  const contractAddress = await contract.getAddress();
  return { contract, contractAddress };
}

beforeEach(async function () {
  ({ contract, contractAddress } = await deployFixture());
});
```

**Benefits**:
- Isolated test environment
- No state pollution
- Consistent starting point

### Pattern 2: Multi-Signer Setup

Role-based testing with multiple accounts:

```javascript
let owner, patentOwner, licensee, bidder1, bidder2;

beforeEach(async function () {
  [owner, patentOwner, licensee, bidder1, bidder2] = await ethers.getSigners();
});

// Test with different roles
await contract.connect(patentOwner).registerPatent(...);
await contract.connect(licensee).requestLicense(...);
```

### Pattern 3: Event Verification

Verify events are emitted correctly:

```javascript
await expect(
  contract.registerPatent(...)
).to.emit(contract, "PatentRegistered")
  .withArgs(1, patentOwner.address, patentHash);
```

### Pattern 4: Revert Testing

Test error conditions:

```javascript
// Test specific error message
await expect(
  contract.invalidOperation()
).to.be.revertedWith("Specific error message");

// Test that transaction reverts
await expect(
  contract.unauthorizedCall()
).to.be.reverted;
```

### Pattern 5: State Verification

Verify state changes:

```javascript
// Before
const beforeState = await contract.getState();

// Action
await contract.changeState();

// After
const afterState = await contract.getState();
expect(afterState).to.not.equal(beforeState);
```

### Pattern 6: Gas Tracking

Monitor gas usage:

```javascript
const tx = await contract.expensiveOperation();
const receipt = await tx.wait();

console.log("Gas used:", receipt.gasUsed.toString());
expect(receipt.gasUsed).to.be.lt(500000); // Under 500k gas
```

### Pattern 7: Time Manipulation

Test time-dependent features:

```javascript
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// Fast forward time
await time.increase(3600); // 1 hour

// Check time-based condition
const isActive = await contract.isBiddingActive(patentId);
expect(isActive).to.equal(false);
```

## Best Practices

### 1. Test Naming

✅ **Good**: Descriptive and specific
```javascript
it("should reject license request for suspended patent", async function () {});
it("should allow owner to emergency pause patent", async function () {});
```

❌ **Bad**: Vague or generic
```javascript
it("test1", async function () {});
it("should work", async function () {});
```

### 2. Test Organization

Organize tests by functionality:

```javascript
describe("ContractName", function () {
  describe("Deployment", function () {
    // Initialization tests
  });

  describe("Core Functionality", function () {
    // Main feature tests
  });

  describe("Access Control", function () {
    // Permission tests
  });

  describe("Edge Cases", function () {
    // Boundary tests
  });
});
```

### 3. Clear Assertions

Use specific expectations:

✅ **Good**:
```javascript
expect(value).to.equal(100);
expect(address).to.equal(owner.address);
expect(status).to.equal(PatentStatus.Active);
```

❌ **Bad**:
```javascript
expect(value).to.be.ok;
expect(result).to.exist;
```

### 4. Test Independence

Each test should be independent:

✅ **Good**:
```javascript
beforeEach(async function () {
  ({ contract } = await deployFixture());
});

it("test 1", async function () {
  // Independent test
});

it("test 2", async function () {
  // Independent test
});
```

❌ **Bad**:
```javascript
it("test 1", async function () {
  await contract.setup();
});

it("test 2", async function () {
  // Depends on test 1 running first
  await contract.use();
});
```

### 5. Comprehensive Coverage

Test all code paths:

- ✓ Success cases
- ✓ Failure cases
- ✓ Edge cases
- ✓ Access control
- ✓ State transitions
- ✓ Events
- ✓ Return values

### 6. Error Messages

Test specific error conditions:

```javascript
await expect(
  contract.invalidInput(0)
).to.be.revertedWith("Invalid input value");
```

### 7. Setup and Teardown

Use hooks appropriately:

```javascript
before(async function () {
  // One-time setup (e.g., get signers)
});

beforeEach(async function () {
  // Per-test setup (e.g., deploy contract)
});

after(async function () {
  // One-time cleanup
});

afterEach(async function () {
  // Per-test cleanup
});
```

## Gas Optimization Testing

### Enable Gas Reporter

```bash
REPORT_GAS=true npm test
```

### Gas Report Output

```
·----------------------------------------|---------------------------|-------------|-----------------------------·
|  Solc version: 0.8.24                 ·  Optimizer enabled: true  ·  Runs: 200  ·  Block limit: 30000000 gas  │
·········································|···························|·············|······························
|  Methods                                                                                                        │
··························|··············|·············|·············|·············|···············|··············
|  Contract               ·  Method      ·  Min        ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
··························|··············|·············|·············|·············|···············|··············
|  ConfidentialPatent...  ·  register... ·     500000  ·     520000  ·     510000  ·           15  ·          -  │
··························|··············|·············|·············|·············|···············|··············
```

### Gas Optimization Goals

Target gas usage:
- Patent registration: < 550,000 gas
- License request: < 450,000 gas
- Royalty payment: < 350,000 gas

## Continuous Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Test Data

### Sample Test Data

```javascript
const testData = {
  patent: {
    royaltyRate: 1000, // 10%
    minLicenseFee: ethers.parseEther("1.0"),
    exclusivityPeriod: 180,
    validityYears: 10,
    patentHash: "QmTestHash123",
    territoryCode: 255,
    isConfidential: true
  },
  license: {
    proposedFee: ethers.parseEther("1.5"),
    proposedRoyaltyRate: 1000,
    revenueCap: ethers.parseEther("100"),
    durationDays: 365
  }
};
```

## Troubleshooting

### Common Issues

**Tests timing out**
```javascript
// Increase timeout
this.timeout(10000); // 10 seconds
```

**Nonce errors**
```bash
# Reset local network
npx hardhat clean
npx hardhat node
```

**Gas estimation failures**
```javascript
// Manually set gas limit
await contract.function({ gasLimit: 500000 });
```

## Test Metrics

### Current Test Statistics

- **Total Test Suites**: 1
- **Total Tests**: 45+
- **Test Categories**: 9
- **Coverage**: Target > 90%
- **Average Test Time**: < 3 seconds

### Test Distribution

| Category | Tests | Percentage |
|----------|-------|------------|
| Deployment | 2 | 4.4% |
| Patent Registration | 4 | 8.9% |
| Patent Information | 2 | 4.4% |
| License Requests | 4 | 8.9% |
| License Approval | 3 | 6.7% |
| Bidding | 6 | 13.3% |
| Royalty Payments | 4 | 8.9% |
| Status Management | 4 | 8.9% |
| Emergency Functions | 3 | 6.7% |
| Access Control | Throughout | - |
| Edge Cases | Throughout | - |

## Resources

- [Hardhat Testing Documentation](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Coverage](https://github.com/sc-forks/solidity-coverage)

## Summary

This test suite provides:

✅ **Comprehensive Coverage** - 45+ test cases covering all functionality
✅ **Multiple Test Categories** - Deployment, functionality, access control, edge cases
✅ **Best Practices** - Following industry-standard testing patterns
✅ **Clear Documentation** - Detailed explanations and examples
✅ **Gas Tracking** - Monitor and optimize gas usage
✅ **CI/CD Ready** - Easy integration with automation pipelines

Run `npm test` to verify all tests pass!
