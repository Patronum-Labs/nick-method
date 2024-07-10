import { Transaction } from '@ethereumjs/tx';
import { isValidHex } from '../utils/utils';
import { RecoveredTransactionResult } from '../types/rawTransactionConfig';

/**
 * Recovers transaction details from a raw transaction string.
 *
 * This function takes a raw transaction in hexadecimal format and decodes it to extract
 * the individual transaction parameters. It supports both legacy and EIP-155 transactions.
 *
 * @param {string} rawTransaction - The raw transaction data as a hexadecimal string.
 *
 * @returns {RecoveredTransactionResult} An object containing the recovered transaction details.
 * @property {number} nonce - The nonce of the transaction.
 * @property {number} gasPrice - The gas price in wei.
 * @property {number} gasLimit - The gas limit for the transaction.
 * @property {string|undefined} to - The recipient address of the transaction, or undefined for contract creation.
 * @property {number} value - The amount of Ether being transferred in wei.
 * @property {string} data - The data payload of the transaction as a hexadecimal string.
 * @property {string|undefined} v - The v value of the transaction signature.
 * @property {string|undefined} r - The r value of the transaction signature.
 * @property {string|undefined} s - The s value of the transaction signature.
 *
 * @throws {Error} If the input is not a valid hexadecimal string.
 */
export function recoverRawTransaction(rawTransaction: string): RecoveredTransactionResult {
    // Validate that the input is a valid hex string
    if (!isValidHex(rawTransaction)) {
        throw new Error('Invalid hex value for rawTransaction');
    }

    // Remove '0x' prefix if present
    const cleanedRawTx = rawTransaction.startsWith('0x') ? rawTransaction.slice(2) : rawTransaction;

    // Convert hex string to Uint8Array
    const serialized = Buffer.from(cleanedRawTx, 'hex');

    // Recover the transaction
    const tx = Transaction.fromSerializedTx(serialized);

    // Return the recovered transaction data
    return {
        nonce: Number(tx.nonce),
        gasPrice: Number(tx.gasPrice),
        gasLimit: Number(tx.gasLimit),
        to: tx.to?.toString(),
        value: Number(tx.value),
        data: '0x' + tx.data.toString('hex'),
        v: tx.v !== undefined ? '0x' + tx.v.toString(16) : undefined,
        r: tx.r !== undefined ? '0x' + tx.r.toString(16) : undefined,
        s: tx.s !== undefined ? '0x' + tx.s.toString(16) : undefined,
    };
}
