/**
 * Result object returned after recovering a raw transaction.
 * @property {number} nonce - The nonce of the transaction.
 * @property {number} gasPrice - The gas price for the transaction in wei.
 * @property {number} gasLimit - The maximum amount of gas the transaction is allowed to use.
 * @property {string | undefined} to - The recipient address of the transaction.
 *                                     Undefined for contract creation transactions.
 * @property {number} value - The amount of Ether being transferred in wei.
 * @property {string} data - The data payload of the transaction as a hexadecimal string.
 * @property {string | undefined} v - The v value of the transaction signature.
 * @property {string | undefined} r - The r value of the transaction signature.
 * @property {string | undefined} s - The s value of the transaction signature.
 */
export interface RecoveredTransactionResult {
    nonce: number;
    gasPrice: number;
    gasLimit: number;
    to: string | undefined;
    value: number;
    data: string;
    v: string | undefined;
    r: string | undefined;
    s: string | undefined;
}
