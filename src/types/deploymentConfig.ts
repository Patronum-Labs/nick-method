/**
 * Configuration object for generating a raw deployment transaction.
 * @property {number} value - The amount of native token in wei to send with the transaction.
 * @property {number} gasLimit - The gas limit for the transaction.
 * @property {number} gasPrice - The gas price for the transaction in wei.
 * @property {string} bytecode - The bytecode of the contract to be deployed.
 * @property {string} [r] - Optional r value for the transaction signature.
 * If provided, it allows generation of different contract and deployer addresses.
 * Must be a valid ECDSA signature r value (non-zero and less than the curve order).
 */
export interface DeploymentConfig {
    value: number;
    gasLimit: number;
    gasPrice: number;
    bytecode: string;
    r?: string;
}

/**
 * Result object returned after generating a raw deployment transaction.
 * @property {string} rawTx - The raw transaction data as a hexadecimal string.
 * @property {string} deployerAddress - The address of the account deploying the contract.
 * @property {string} contractAddress - The address where the contract will be deployed.
 * @property {number} UpfrontCost - The upfront cost of the transaction in wei.
 * @property {string} r - The r value of the transaction signature.
 * @property {string} s - The s value of the transaction signature.
 * @property {string} v - The v value of the transaction signature.
 */
export interface DeploymentResult {
    rawTx: string;
    deployerAddress: string;
    contractAddress: string;
    upfrontCost: number;
    r: string;
    s: string;
    v: string;
}
