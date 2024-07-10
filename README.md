![Nick MethodSmaller](https://github.com/Patronum-Labs/nick-method/assets/86341666/8b392eea-74aa-4c73-95fe-fb355bc04d57)

# @patronumlabs/nick-method

This package provides utilities for generating transactions according to the Nick Method, supporting both normal execution transactions and deployment transactions.

## Rationale

The Nick Method allows for creating contracts on different chains at the same address without centralized control of a private key, and minimizes trust in execution. These transactions are useful for:

-   Deploying contracts to the same address across multiple chains
-   Executing transactions without direct control of private keys
-   Minimizing trust requirements in transaction execution

For a full explanation, please refer to the article: [Nick Method - Ethereum Keyless execution](https://yamenmerhi.medium.com/nicks-method-ethereum-keyless-execution-168a6659479c)

## Installation

```bash
npm install @patronumlabs/nick-method
```

## Usage

Here's an example of how to use the package to generate and broadcast transactions:

```javascript
import { ethers } from 'ethers'; // ethers@v6
import { genRawDeployment, genRawTransaction } from '@patronumlabs/nick-method';

// Example provider
const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID');

// Step 1: Generate a raw deployment transaction

// Generate a raw deployment transaction
const deploymentConfig = {
  gasLimit: 1000000,
  gasPrice: 100000000000,
  bytecode: '0x60806040',
  value: 0
};

const deploymentResult = genRawDeployment(deploymentConfig);
console.log('Deployment Result:', deploymentResult);

// Step 2: Fund the deployment transaction

// // ------------------------------------------------------------
// // Funding should be sent to deploymentResult.deployerAddress
// // The funds to be sent equal to deploymentResult.upfrontCost
// // The contract will be created at deploymentResult.contractAddress
// // ------------------------------------------------------------

// Step 3: Broadcast the deployment transaction

// Broadcast the deployment transaction
provider.broadcastTransaction(deploymentResult.rawTx).then(tx => {
  console.log('Deployment Transaction Hash:', tx.hash);
});


/* ----------------------------------------------------------------- */
/* ----------------------------------------------------------------- */
/* ----------------------------------------------------------------- */


// Step 1: Generate a raw execution transaction

// Generate a raw execution transaction
const transactionConfig = {
  gasLimit: 21000,
  gasPrice: 20000000000,
  to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  data: '0x',
  value: ethers.parseEther('0.1')
};

const transactionResult = genRawTransaction(transactionConfig);
console.log('Transaction Result:', transactionResult);


// Step 2: Fund the execution transaction

// ------------------------------------------------------------
// Funding should be sent to transactionResult.senderAddress
// The funds to be sent equal to transactionResult.upfrontCost
// ------------------------------------------------------------

// Step 3: Broadcast the execution transaction

// Broadcast the execution transaction
provider.broadcastTransaction(transactionResult.rawTx).then(tx => {
  console.log('Execution Transaction Hash:', tx.hash);
});
```

This example demonstrates how to generate both deployment and execution transactions using the Nick Method, and how to broadcast them to the network using ethers.js.

## API Reference

### genRawDeployment(config: DeploymentConfig): DeploymentResult

Generates a raw deployment transaction.

### genRawTransaction(config: TransactionConfig): TransactionResult

Generates a raw execution transaction.

For detailed type definitions of `DeploymentConfig`, `DeploymentResult`, `TransactionConfig`, and `TransactionResult`, please refer to the source code or TypeScript definitions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
