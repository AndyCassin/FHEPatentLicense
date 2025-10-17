# Confidential Patent License Platform

A decentralized patent licensing platform built with Fully Homomorphic Encryption (FHE) using Zama's fhEVM on Ethereum Sepolia. This platform enables confidential patent registration, licensing agreements, royalty payments, and encrypted bidding processes.


**Watch the Demo**: [View demonstration video demo.mp4]

## 🚀 Live Application

Access the platform at: **[https://fhe-patent-license.vercel.app/](https://fhe-patent-license.vercel.app/)**

## Features

- **Confidential Patent Registration**: Register patents with encrypted royalty rates, minimum fees, and exclusivity periods
- **License Management**: Request, approve, and manage patent licenses with encrypted terms
- **Confidential Bidding**: Submit sealed bids for exclusive patent licenses
- **Royalty Tracking**: Report revenue and pay royalties with privacy-preserving encryption
- **Multi-Territory Support**: Define geographic territories for patent and license coverage
- **Automated Status Management**: Track patent and license lifecycles with automated state transitions

## Technology Stack

- **Smart Contracts**: Solidity ^0.8.24
- **Development Framework**: Hardhat
- **FHE Library**: Zama fhEVM (@fhevm/solidity)
- **Network**: Ethereum Sepolia Testnet
- **Testing**: Hardhat with Chai assertions
- **Verification**: Etherscan

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- MetaMask or similar Web3 wallet
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd confidential-patent-license-platform
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Project Structure

```
confidential-patent-license-platform/
├── contracts/
│   └── ConfidentialPatentLicense.sol    # Main smart contract
├── scripts/
│   ├── deploy.js                        # Deployment script
│   ├── verify.js                        # Contract verification script
│   ├── interact.js                      # Interaction utilities
│   └── simulate.js                      # Full workflow simulation
├── test/
│   └── ConfidentialPatentLicense.test.js # Comprehensive test suite
├── hardhat.config.js                    # Hardhat configuration
├── package.json                         # Project dependencies
├── .env.example                         # Environment template
├── README.md                            # This file
└── DEPLOYMENT.md                        # Deployment guide
```

## Usage

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run test:coverage
```

### Deploy to Network

```bash
# Deploy to Sepolia
npm run deploy

# Deploy to local network
npm run deploy:local
```

### Verify Contract

After deployment, verify the contract on Etherscan:

```bash
npm run verify
```

### Interact with Contract

Use the interactive script to perform actions:

```bash
npm run interact
```

Available interactions:
- Register patents
- Request licenses
- Approve license requests
- Submit confidential bids
- Pay royalties
- Query contract state

### Run Full Simulation

Execute a complete workflow simulation:

```bash
npm run simulate
```

This will:
1. Register multiple patents
2. Request licenses from different accounts
3. Approve license agreements
4. Simulate confidential bidding
5. Process royalty payments
6. Generate a detailed report

## Smart Contract Overview

### Main Functions

#### Patent Management

- `registerPatent()`: Register a new patent with encrypted terms
- `updatePatentStatus()`: Update patent status (Active, Suspended, Expired)
- `getPatentInfo()`: Retrieve public patent information
- `getUserPatents()`: Get all patents owned by an address

#### License Management

- `requestLicense()`: Submit a license request with proposed terms
- `approveLicense()`: Approve a pending license request
- `updateLicenseStatus()`: Update license status
- `getUserLicenses()`: Get all licenses for an address
- `getPatentLicenses()`: Get all licenses for a patent

#### Confidential Bidding

- `startConfidentialBidding()`: Initiate sealed bid auction
- `submitConfidentialBid()`: Submit encrypted bid amount
- `finalizeBidding()`: Close bidding and award exclusive license

#### Royalty Payments

- `payRoyalties()`: Submit royalty payment with encrypted revenue report
- `requestRoyaltyVerification()`: Initiate verification process
- `getRoyaltyPaymentCount()`: Get number of payments for a license

### Events

- `PatentRegistered`: Emitted when a new patent is registered
- `LicenseRequested`: Emitted when a license is requested
- `LicenseApproved`: Emitted when a license is approved
- `RoyaltyPaid`: Emitted when royalties are paid
- `ConfidentialBidSubmitted`: Emitted when a bid is submitted
- `ExclusiveLicenseAwarded`: Emitted when bidding concludes
- `PatentStatusChanged`: Emitted when patent status updates
- `LicenseStatusChanged`: Emitted when license status updates

## Security Features

### Fully Homomorphic Encryption

All sensitive financial terms are encrypted using Zama's FHE:

- Royalty rates
- License fees
- Revenue reports
- Bid amounts
- Revenue caps
- Territory restrictions

### Access Control

- Only patent owners can approve licenses
- Only licensees can pay royalties
- Only contract owner can execute emergency functions
- FHE permissions restrict data visibility

### Validation

- Royalty rates capped at 100%
- Patent validity limited to 20 years
- Bidding duration limited to 1 week
- Territory codes validated

## Gas Optimization

- Struct packing for storage efficiency
- Minimal external calls
- Efficient event emissions
- Optimized compiler settings (200 runs)

## Testing

The test suite covers:

- Contract deployment and initialization
- Patent registration and validation
- License request and approval workflow
- Confidential bidding process
- Royalty payment processing
- Status management
- Emergency functions
- Access control
- Error handling

Run tests with:
```bash
npm test
```

## Deployment Information

After deployment, find details in `deployments/sepolia-deployment.json`:

```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "contractAddress": "0x...",
  "deployer": "0x...",
  "deploymentTime": "2025-01-...",
  "transactionHash": "0x...",
  "verified": true
}
```

## Etherscan Links

After deployment and verification, view your contract on Sepolia Etherscan:

- Contract: `https://sepolia.etherscan.io/address/CONTRACT_ADDRESS`
- Transactions: View all contract interactions
- Code: Verified source code and ABI
- Events: Real-time event monitoring

## Development Workflow

1. **Local Development**
   ```bash
   npx hardhat node          # Start local node
   npm run deploy:local      # Deploy locally
   npm test                  # Run tests
   ```

2. **Testnet Deployment**
   ```bash
   npm run deploy            # Deploy to Sepolia
   npm run verify            # Verify on Etherscan
   npm run interact          # Interact with contract
   ```

3. **Simulation**
   ```bash
   npm run simulate          # Run full workflow
   ```

## Troubleshooting

### Common Issues

**"Insufficient funds"**
- Ensure your wallet has Sepolia ETH
- Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

**"Invalid API key"**
- Verify your `.env` file has correct API keys
- Check Alchemy/Infura and Etherscan keys

**"Contract verification failed"**
- Ensure contract is deployed first
- Wait a few seconds after deployment
- Check Etherscan API key is valid

**"FHE library errors"**
- Ensure @fhevm/solidity is properly installed
- Check compiler version matches (0.8.24)

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Resources

- [Zama Documentation](https://docs.zama.ai/)
- [fhEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum Sepolia](https://sepolia.dev/)
- [Etherscan API](https://docs.etherscan.io/)

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review test scripts for examples

## Roadmap

- Multi-signature approval for high-value licenses
- Dispute resolution mechanism
- Automated royalty calculation
- License transfer functionality
- Patent portfolio management
- Advanced analytics dashboard
- Cross-chain deployment

---

Built with Zama FHE and Hardhat
