# Deployment Guide

Complete guide for deploying the Confidential Patent License Platform to Ethereum Sepolia testnet.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Configuration](#configuration)
4. [Local Testing](#local-testing)
5. [Sepolia Deployment](#sepolia-deployment)
6. [Contract Verification](#contract-verification)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version

Verify installations:
```bash
node --version
npm --version
git --version
```

### Required Accounts

1. **Ethereum Wallet**
   - MetaMask or similar Web3 wallet
   - Sepolia testnet ETH (minimum 0.1 ETH recommended)

2. **Alchemy Account** (or Infura)
   - Sign up at [https://www.alchemy.com/](https://www.alchemy.com/)
   - Create a new app on Sepolia network
   - Copy the API key

3. **Etherscan Account**
   - Register at [https://etherscan.io/](https://etherscan.io/)
   - Generate API key from account settings

### Get Sepolia Testnet ETH

Visit these faucets to get free Sepolia ETH:

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd confidential-patent-license-platform

# Install dependencies
npm install
```

### 2. Verify Installation

```bash
# Check Hardhat installation
npx hardhat --version

# List available Hardhat tasks
npx hardhat
```

## Configuration

### 1. Environment Variables

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix

# Etherscan API Key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Gas Reporter
REPORT_GAS=false
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

**Important Security Notes:**
- Never commit `.env` file to version control
- Keep your private key secure
- Use a dedicated wallet for testnet deployments
- Export private key from MetaMask: Settings → Security & Privacy → Show Private Key

### 2. Verify Configuration

Test your configuration:

```bash
# Test network connection
npx hardhat run scripts/deploy.js --network localhost
```

## Local Testing

### 1. Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiling 1 file with 0.8.24
Compilation finished successfully
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run test:coverage
```

Expected test results:
- All tests should pass
- Coverage should be >90%

### 3. Local Network Deployment

Terminal 1 - Start local node:
```bash
npx hardhat node
```

Terminal 2 - Deploy to local network:
```bash
npm run deploy:local
```

Expected output:
```
=== Confidential Patent License Platform Deployment ===

Deploying contracts with account: 0x...
Account balance: 10000.0 ETH

--- Deployment Configuration ---
Network: localhost
Chain ID: 31337

--- Deploying ConfidentialPatentLicense Contract ---
Starting deployment...
✓ Contract deployed successfully!
Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 4. Run Simulation

Test full workflow on local network:

```bash
npm run simulate
```

This will:
1. Register 3 patents
2. Request 2 licenses
3. Approve licenses
4. Simulate bidding
5. Process royalty payments

## Sepolia Deployment

### 1. Pre-Deployment Checklist

- [ ] `.env` file configured with Sepolia RPC URL
- [ ] Private key added to `.env`
- [ ] Wallet has sufficient Sepolia ETH (>0.1 ETH)
- [ ] Etherscan API key configured
- [ ] All tests passing locally

### 2. Deploy to Sepolia

```bash
npm run deploy
```

**Deployment Process:**

1. **Contract Compilation**
   - Hardhat compiles Solidity contracts
   - Generates artifacts and ABI

2. **Transaction Broadcast**
   - Deployment transaction sent to Sepolia
   - Wait for confirmation (15-30 seconds)

3. **Deployment Confirmation**
   - Contract address generated
   - Transaction hash provided
   - Block number recorded

Expected output:
```
=== Confidential Patent License Platform Deployment ===

Deploying contracts with account: 0xYourAddress
Account balance: 0.5 ETH

--- Deployment Configuration ---
Network: sepolia
Chain ID: 11155111

--- Deploying ConfidentialPatentLicense Contract ---
Starting deployment...
✓ Contract deployed successfully!
Contract address: 0x1234567890123456789012345678901234567890
Deployment transaction hash: 0xabcdef...
Block number: 5234567

--- Verifying Initial State ---
Contract owner: 0xYourAddress
Next patent ID: 1
Next license ID: 1

✓ Deployment information saved to: deployments/sepolia-deployment.json

--- Etherscan Links ---
Contract: https://sepolia.etherscan.io/address/0x1234567890123456789012345678901234567890

Run the following command to verify the contract:
npx hardhat verify --network sepolia 0x1234567890123456789012345678901234567890

=== Deployment Complete ===
```

### 3. Save Deployment Information

The deployment script automatically saves information to:
```
deployments/sepolia-deployment.json
```

Example content:
```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "contractName": "ConfidentialPatentLicense",
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "deployer": "0xYourAddress",
  "deploymentTime": "2025-01-30T12:00:00.000Z",
  "transactionHash": "0xabcdef...",
  "blockNumber": 5234567,
  "owner": "0xYourAddress",
  "initialState": {
    "nextPatentId": "1",
    "nextLicenseId": "1"
  }
}
```

## Contract Verification

### 1. Verify on Etherscan

After deployment, verify the contract source code:

```bash
npm run verify
```

**Verification Process:**

1. Reads deployment information
2. Submits source code to Etherscan
3. Waits for verification confirmation

Expected output:
```
=== Contract Verification Script ===

Network: sepolia
Contract address: 0x1234567890123456789012345678901234567890
Contract name: ConfidentialPatentLicense

--- Starting Verification ---
Submitting verification to Etherscan...
✓ Contract verified successfully!

Verification status saved to deployment file.

View verified contract on Etherscan:
https://sepolia.etherscan.io/address/0x1234567890123456789012345678901234567890#code

=== Verification Complete ===
```

### 2. Manual Verification (Alternative)

If automatic verification fails:

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### 3. Verify Success

Visit Etherscan link and confirm:
- ✓ Green checkmark next to contract
- ✓ "Code" tab shows verified source
- ✓ "Read Contract" and "Write Contract" tabs available

## Post-Deployment

### 1. Test Contract Interaction

```bash
npm run interact
```

Uncomment functions in `scripts/interact.js` to test:

```javascript
// Register a test patent
await registerPatent(contract);

// Get patent information
await getPatentInfo(contract, 1);
```

### 2. Run Sepolia Simulation

Test full workflow on Sepolia:

```bash
npm run simulate
```

**Note:** This will consume testnet ETH. Ensure you have sufficient balance.

### 3. Frontend Integration

Update your frontend configuration with:

```javascript
const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";
const NETWORK = "sepolia";
const CHAIN_ID = 11155111;
```

### 4. Monitor Contract

Track your contract activity:

1. **Etherscan**
   - View transactions: `https://sepolia.etherscan.io/address/CONTRACT_ADDRESS`
   - Monitor events
   - Track gas usage

2. **Hardhat Console**
   ```bash
   npx hardhat console --network sepolia
   ```

3. **Event Monitoring**
   - Set up event listeners in your frontend
   - Use The Graph for indexed data (optional)

## Deployment Costs

Estimated gas costs for Sepolia deployment:

| Operation | Estimated Gas | ETH Cost (50 gwei) |
|-----------|---------------|-------------------|
| Contract Deployment | ~4,000,000 | ~0.2 ETH |
| Patent Registration | ~500,000 | ~0.025 ETH |
| License Request | ~400,000 | ~0.02 ETH |
| License Approval | ~200,000 | ~0.01 ETH |
| Royalty Payment | ~300,000 | ~0.015 ETH |

**Note:** Sepolia uses free testnet ETH. Mainnet costs would be significantly higher.

## Troubleshooting

### Common Issues

#### 1. Insufficient Funds

**Error:**
```
Error: insufficient funds for intrinsic transaction cost
```

**Solution:**
- Get more Sepolia ETH from faucets
- Check wallet balance: `npx hardhat run scripts/check-balance.js --network sepolia`

#### 2. Invalid API Key

**Error:**
```
Error: invalid project id
```

**Solution:**
- Verify Alchemy/Infura API key in `.env`
- Check API key has Sepolia network enabled
- Regenerate API key if necessary

#### 3. Nonce Too Low

**Error:**
```
Error: nonce has already been used
```

**Solution:**
- Reset MetaMask account (Settings → Advanced → Reset Account)
- Or wait a few minutes and retry

#### 4. Contract Verification Failed

**Error:**
```
Error: Verification failed
```

**Solution:**
- Wait 30-60 seconds after deployment
- Ensure Etherscan API key is valid
- Try manual verification
- Check compiler version matches (0.8.24)

#### 5. FHE Library Errors

**Error:**
```
Error: Cannot find module '@fhevm/solidity'
```

**Solution:**
```bash
npm install @fhevm/solidity --save
npm run compile
```

#### 6. Network Connection Issues

**Error:**
```
Error: network does not support ENS
```

**Solution:**
- Check `SEPOLIA_RPC_URL` in `.env`
- Try alternative RPC provider
- Verify internet connection

### Debug Mode

Enable verbose logging:

```bash
# Set Hardhat verbose mode
npx hardhat run scripts/deploy.js --network sepolia --verbose

# Enable debug logs
DEBUG=hardhat:* npm run deploy
```

### Getting Help

If issues persist:

1. Check Hardhat documentation: [https://hardhat.org/docs](https://hardhat.org/docs)
2. Review Zama docs: [https://docs.zama.ai/](https://docs.zama.ai/)
3. Open GitHub issue with:
   - Error message
   - Deployment logs
   - Network and Node.js versions

## Mainnet Deployment (Future)

**Warning:** Do not deploy to mainnet without:

- [ ] Complete security audit
- [ ] Thorough testing on testnet
- [ ] Legal review for patent licensing
- [ ] Sufficient ETH for deployment (~2-3 ETH)
- [ ] Insurance/security measures
- [ ] Incident response plan

Mainnet deployment steps would be similar but require:
- Higher gas prices
- More rigorous testing
- Professional audit
- Upgrade mechanisms
- Multisig admin controls

## Deployment Checklist

Use this checklist for each deployment:

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] `.env` configured
- [ ] Sufficient testnet ETH
- [ ] Contract compiled successfully

### Deployment
- [ ] Deploy script executed
- [ ] Contract address saved
- [ ] Transaction confirmed
- [ ] Initial state verified

### Verification
- [ ] Contract verified on Etherscan
- [ ] Source code visible
- [ ] ABI accessible

### Testing
- [ ] Interaction script tested
- [ ] Simulation run successfully
- [ ] All functions working
- [ ] Events emitting correctly

### Documentation
- [ ] Deployment info saved
- [ ] README updated
- [ ] Frontend configuration updated
- [ ] Team notified

## Next Steps

After successful deployment:

1. **Integrate Frontend**
   - Update contract address
   - Test all user flows
   - Deploy frontend to hosting

2. **Setup Monitoring**
   - Configure event listeners
   - Set up alerting
   - Track usage metrics

3. **Documentation**
   - Create user guide
   - Write API documentation
   - Record demo video

4. **Testing**
   - Conduct user acceptance testing
   - Perform security testing
   - Load testing (if needed)

---

**Deployment Support**

For deployment assistance:
- Review logs in `deployments/` directory
- Check Hardhat documentation
- Consult Zama FHE resources

**Remember:** Always test on Sepolia before considering mainnet deployment.
