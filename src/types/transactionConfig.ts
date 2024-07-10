/**
 * Configuration object for generating a raw transaction.
 * @property {number} value - The amount of native token in wei to send with the transaction.
 * @property {string} to - The recipient address of the transaction (must be a valid checksummed address).
 * @property {number} gasLimit - The gas limit for the transaction.
 * @property {number} gasPrice - The gas price for the transaction in wei.
 * @property {string} data - The data payload of the transaction.
 * @property {string} [r] - Optional r value for the transaction signature.
 * If provided, it allows generation of different sender addresses.
 * Must be a valid ECDSA signature r value (non-zero and less than the curve order).
 */
export interface TransactionConfig {
    value: number;
    to: string;
    gasLimit: number;
    gasPrice: number;
    data: string;
    r?: string;
}

/**
 * Result object returned after generating a raw transaction.
 * @property {string} rawTx - The raw transaction data as a hexadecimal string.
 * @property {string} senderAddress - The address of the account sending the transaction.
 * @property {number} upfrontCost - The upfront cost of the transaction in wei.
 * @property {string} r - The r value of the transaction signature.
 * @property {string} s - The s value of the transaction signature.
 * @property {string} v - The v value of the transaction signature.
 */
export interface TransactionResult {
    rawTx: string;
    senderAddress: string;
    upfrontCost: number;
    r: string;
    s: string;
    v: string;
}
