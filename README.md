# Confidential Patent License Platform

A decentralized patent licensing platform built with Fully Homomorphic Encryption (FHE) using Zama's fhEVM on Ethereum Sepolia. This platform enables confidential patent registration, licensing agreements, royalty payments, and encrypted bidding processes.


**Watch the Demo**: [View demonstration demo.mp4]

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

### Blockchain & Smart Contracts
- **Smart Contracts**: Solidity ^0.8.24
- **Development Framework**: Hardhat
- **Network**: Ethereum Sepolia Testnet
- **Testing**: Hardhat with Chai assertions
- **Verification**: Etherscan

### FHE (Fully Homomorphic Encryption)
- **FHE Library**: Zama fhEVM (@fhevm/solidity)
- **SDK**: @fhevm/sdk (custom implementation)
- **Encryption Types**: euint8, euint16, euint32, euint64, euint128, ebool, eaddress

### Frontend Technologies
- **Vanilla JavaScript**: Pure HTML/CSS/JS with ethers.js
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **UI Framework**: Custom component-based architecture
- **Wallet Integration**: MetaMask via ethers.js v6.9.0

### Development Tools
- **Package Manager**: npm
- **Local Server**: http-server
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git

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
├── contracts/                           # Smart Contracts
│   └── ConfidentialPatentLicense.sol    # Main FHE-enabled contract
├── scripts/                             # Deployment & Automation
│   ├── deploy.js                        # Deployment script
│   ├── verify.js                        # Contract verification script
│   ├── interact.js                      # Interaction utilities
│   └── simulate.js                      # Full workflow simulation
├── test/                                # Test Suite
│   └── ConfidentialPatentLicense.test.js # Comprehensive tests
├── index.html                           # Frontend Application
│   ├── Wallet Integration               # MetaMask connection
│   ├── Patent Registration UI           # Register patents with FHE
│   ├── License Management               # Request & approve licenses
│   ├── Bidding Interface                # Confidential auction system
│   ├── Royalty Dashboard                # Payment tracking
│   └── Real-time Statistics             # Live contract metrics
├── hardhat.config.js                    # Hardhat configuration
├── package.json                         # Project dependencies
├── .env.example                         # Environment template
├── README.md                            # This file
├── vercel.json                          # Vercel deployment config
└── ConfidentialPatentLicense.mp4        # Demo video
```

## Usage

### Development Workflow

#### 1. Compile Smart Contracts

```bash
npm run compile
```

#### 2. Run Test Suite

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run test:coverage
```

#### 3. Deploy to Network

```bash
# Deploy to Sepolia Testnet
npm run deploy

# Deploy to local Hardhat network
npm run deploy:local
```

#### 4. Verify Contract on Etherscan

After deployment, verify the contract:

```bash
npm run verify
```

#### 5. Start Frontend Application

```bash
# Start local development server
npm start
# or
npm run dev
```

The application will open at `http://localhost:3001`

### Contract Interaction

#### Via Script (CLI)

Use the interactive script to perform actions:

```bash
npm run interact
```

Available CLI interactions:
- Register patents with encrypted terms
- Request licenses with confidential proposals
- Approve license requests
- Submit sealed bids for exclusive licenses
- Pay royalties with encrypted revenue
- Query contract state and statistics

#### Via Web Interface

1. **Connect Wallet**: Click "Connect Wallet" to connect MetaMask
2. **Register Patent**: Fill in patent details with encrypted terms
3. **Request License**: Select a patent and submit license request
4. **Confidential Bidding**: Participate in sealed-bid auctions
5. **Pay Royalties**: Submit encrypted revenue and royalty payments
6. **View Dashboard**: Monitor your patents and licenses in real-time

### Run Full Simulation

Execute a complete workflow simulation:

```bash
npm run simulate
```

This automated simulation will:
1. Register multiple patents with various encrypted terms
2. Request licenses from different accounts
3. Approve and reject license agreements
4. Simulate confidential bidding periods
5. Process royalty payments with encrypted revenue
6. Generate a comprehensive report with statistics

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

## Frontend Architecture

### UI/UX Design

The application features a modern, privacy-focused interface:

- **Ocean Gradient Theme**: Calming cyan-to-purple gradient background
- **Animated Particles**: Dynamic floating particle effects for visual appeal
- **Glassmorphism**: Modern frosted-glass effect on cards and panels
- **Responsive Layout**: Fully responsive design for all screen sizes
- **Real-time Updates**: Live contract state monitoring and statistics

### Key UI Components

#### 1. Wallet Connection
- One-click MetaMask integration
- Account display with address shortening
- Network status indicator
- Connection state management

#### 2. Patent Registration Form
- Patent details input (name, description)
- Encrypted terms configuration:
  - Royalty rate (encrypted)
  - Minimum license fee (encrypted)
  - Exclusivity period
  - Auto-renewal settings
- Territory selection dropdown
- Form validation and error handling

#### 3. License Management Interface
- Patent listing with search/filter
- License request form with confidential proposals
- Approval/rejection workflow
- License status tracking (Pending/Active/Expired)

#### 4. Confidential Bidding System
- Sealed-bid auction interface
- Encrypted bid submission
- Countdown timer for bidding period
- Winner announcement after finalization

#### 5. Royalty Dashboard
- Revenue reporting with encryption
- Royalty payment processing
- Payment history tracking
- Verification status monitoring

#### 6. Statistics Panel
- Total patents registered
- Active licenses count
- Personal patent portfolio
- Your license agreements
- Real-time blockchain data

### State Management

The application uses vanilla JavaScript with a custom state management pattern:

```javascript
// Global state object
const AppState = {
  wallet: null,
  contract: null,
  userPatents: [],
  userLicenses: [],
  loading: false,
  error: null
};

// State update functions
function updateState(newState) {
  Object.assign(AppState, newState);
  renderUI();
}
```

### Event Handling

Contract events are monitored in real-time:

- `PatentRegistered` - Update patent list
- `LicenseRequested` - Notify patent owner
- `LicenseApproved` - Update license status
- `RoyaltyPaid` - Update payment history
- `ConfidentialBidSubmitted` - Update bid count
- `ExclusiveLicenseAwarded` - Display winner

## Development Workflow

### 1. Local Development
```bash
npx hardhat node          # Start local Hardhat node
npm run deploy:local      # Deploy contracts locally
npm test                  # Run comprehensive test suite
npm start                 # Start frontend server
```

### 2. Testnet Deployment
```bash
npm run deploy            # Deploy to Sepolia
npm run verify            # Verify on Etherscan
npm start                 # Start frontend with testnet
```

### 3. Full Testing Workflow
```bash
npm run compile           # Compile contracts
npm test                  # Run all tests
npm run simulate          # Run full workflow simulation
npm start                 # Launch frontend
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

### Phase 1 (Current) ✅
- ✅ Core patent registration with FHE
- ✅ License request and approval workflow
- ✅ Confidential bidding system
- ✅ Royalty payment processing
- ✅ Frontend web application
- ✅ Sepolia testnet deployment

### Phase 2 (In Progress)
- 🔄 Multi-signature approval for high-value licenses
- 🔄 Dispute resolution mechanism
- 🔄 Automated royalty calculation and verification
- 🔄 Advanced analytics dashboard

### Phase 3 (Planned)
- 📋 License transfer functionality
- 📋 Patent portfolio management tools
- 📋 Mobile-responsive PWA version
- 📋 Integration with external IP databases

### Phase 4 (Future)
- 🚀 Cross-chain deployment (Polygon, Arbitrum)
- 🚀 DAO governance for platform decisions
- 🚀 NFT-based patent certificates
- 🚀 AI-powered patent matching

## Performance Metrics

### Smart Contract Efficiency
- **Gas Optimization**: ~200 runs optimizer setting
- **Storage Efficiency**: Packed structs for minimal storage
- **Event Emissions**: Indexed parameters for efficient querying
- **Batch Operations**: Support for multiple actions in single transaction

### Frontend Performance
- **Load Time**: < 2 seconds on standard connection
- **Bundle Size**: Minimal dependencies (ethers.js only)
- **Rendering**: Vanilla JS for optimal performance
- **Caching**: Browser storage for improved UX

### Security Metrics
- **FHE Encryption**: All sensitive data encrypted on-chain
- **Access Control**: Role-based permissions enforced
- **Audit Status**: Community reviewed (formal audit pending)
- **Test Coverage**: >90% code coverage

## Deployment Information

### Live Application
- **URL**: https://fhe-patent-license.vercel.app/
- **Network**: Sepolia Testnet
- **Contract**: 0x6Cabd68b533F593D268344cB1281E50699001E0E
- **Status**: Active and operational

### Deployment Configuration
```json
{
  "platform": "Vercel",
  "framework": "Static",
  "buildCommand": "echo 'No build required'",
  "outputDirectory": ".",
  "installCommand": "npm install"
}
```

## API Reference

### Smart Contract Functions

#### Patent Management
```solidity
function registerPatent(
    string memory patentName,
    string memory patentDescription,
    bytes memory encryptedRoyaltyRate,
    bytes memory encryptedMinimumFee,
    uint256 exclusivityPeriod,
    uint8 territory,
    bool autoRenewal
) external returns (uint256 patentId)
```

#### License Operations
```solidity
function requestLicense(
    uint256 patentId,
    bytes memory encryptedProposedFee,
    uint256 duration,
    uint8 territory
) external returns (uint256 licenseId)

function approveLicense(uint256 licenseId) external
```

#### Bidding System
```solidity
function startConfidentialBidding(
    uint256 patentId,
    uint256 biddingDuration
) external

function submitConfidentialBid(
    uint256 patentId,
    bytes memory encryptedBidAmount
) external

function finalizeBidding(uint256 patentId) external
```

#### Royalty Payments
```solidity
function payRoyalties(
    uint256 licenseId,
    bytes memory encryptedRevenue
) external payable

function requestRoyaltyVerification(
    uint256 licenseId,
    uint256 paymentIndex
) external
```

### Frontend API

The application exposes a JavaScript API for integration:

```javascript
// Initialize application
await initializeApp();

// Connect wallet
const account = await connectWallet();

// Register patent
const patentId = await registerPatent({
    name: "My Patent",
    description: "Patent description",
    royaltyRate: 5, // Will be encrypted
    minimumFee: 1000, // Will be encrypted
    exclusivityPeriod: 365,
    territory: 1,
    autoRenewal: true
});

// Request license
const licenseId = await requestLicense(patentId, {
    proposedFee: 1500,
    duration: 180,
    territory: 1
});
```

## Community & Support

### Get Help
- 📖 Documentation: Read the full README and inline comments
- 💬 GitHub Issues: Report bugs or request features
- 🎥 Demo Video: Watch the walkthrough video
- 🔗 Live Demo: Try the application on Sepolia

### Contributing
We welcome contributions! Please see our contributing guidelines:
1. Fork the repository
2. Create a feature branch
3. Write comprehensive tests
4. Submit a pull request with detailed description

### Social Links
- GitHub: [Repository](https://github.com/AndyCassin/ConfidentialPatentLicense)
- Demo: [Live Application](https://fhe-patent-license.vercel.app/)
- Zama: [FHE Documentation](https://docs.zama.ai/)

---

**Built with Zama FHE Technology | Deployed on Ethereum Sepolia | Powered by Hardhat**

*Confidential Patent License Platform - Revolutionizing IP Licensing with Privacy-Preserving Blockchain Technology*
