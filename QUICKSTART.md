# Quick Start Guide

Get started with the Confidential Patent License Platform in 5 minutes.

## Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

## Essential Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npm run deploy

# Verify contract
npm run verify

# Interact with contract
npm run interact

# Run simulation
npm run simulate
```

## Environment Setup

Edit `.env` file:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Deployment Flow

1. **Test Locally**
   ```bash
   npm test
   ```

2. **Deploy to Sepolia**
   ```bash
   npm run deploy
   ```

3. **Verify on Etherscan**
   ```bash
   npm run verify
   ```

4. **Test Interaction**
   ```bash
   npm run interact
   ```

## Next Steps

- Read [README.md](./README.md) for full documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide
- Check [test/](./test/) for usage examples

## Support

- Review documentation files
- Check example scripts in `scripts/`
- Run simulation for complete workflow demo

---

Happy building with FHE!
