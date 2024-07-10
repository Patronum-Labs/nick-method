import { TransactionConfig, TransactionResult } from '../types/transactionConfig';
import { Transaction } from '@ethereumjs/tx';
import { isValidChecksumAddress, toChecksumAddress } from '@ethereumjs/util';

import { isValidHex } from '../utils/utils';

/**
 * @dev Hardcoded `v` value for the transaction signature.
 * This is equivalent to 27, which is the `v` value not containing the chainId.
 * Using this value enables non-protected transactions according to EIP-155.
 */
const HARDCODED_V = '0x1b';

/**
 * @dev Hardcoded `r` value for the transaction signature.
 * This is a dummy value designed to produce a signature that is
 * extremely unlikely to be relevant for a controlled address.
 */
const HARDCODED_R = '0x1212121212121212121212121212121212121212121212121212121212121212';

/**
 * @dev Hardcoded `s` value for the transaction signature.
 * This is a dummy value designed to produce a signature that is
 * extremely unlikely to be relevant for a controlled address.
 */
const HARDCODED_S = '0x1212121212121212121212121212121212121212121212121212121212121212';

/**
 * Generates a signed raw transaction ready to be broadcasted to the network.
 *
 * The raw transaction follows Nick's method, meaning the transaction is not protected from cross-chain replay attacks,
 * which means that the transaction can be replicated on several EVM-based chains.
 *
 * The address of the sender needs to be funded with enough value to cover the gas cost of the transaction with the value
 * being sent.
 *
 * The optional r value needs to be a valid r value. If provided, it allows generation of different sender addresses,
 * which is helpful to choose a vanity address for the sender.
 *
 * Valid 'r' values must be non-zero and less than the curve order (secp256k1 in Ethereum's case).
 *
 * @param {TransactionConfig} config - The transaction configuration object.
 * @param {number|string} config.gasLimit - The gas limit for the transaction either as number or hex.
 * @param {number|string} config.gasPrice - The gas price for the transaction either as number or hex.
 * @param {string} config.to - The recipient address of the transaction (must be a valid checksummed address).
 * @param {string} config.data - The data payload of the transaction.
 * @param {number|string} config.value - The amount of native token in wei to send with the transaction
 * either as number or hex.
 * @param {string} [config.r] - Optional r value for the transaction signature.
 * If provided, it allows generation of different sender addresses.
 *
 * @returns {TransactionResult} An object containing the signed raw transaction and other transaction details.
 * @property {string} rawTx - The raw transaction data as a hexadecimal string.
 * @property {string} senderAddress - The address of the account sending the transaction.
 * @property {number} upfrontCost - The upfront cost of the transaction in wei.
 * @property {string} r - The r value of the transaction signature.
 * @property {string} s - The s value of the transaction signature.
 * @property {string} v - The v value of the transaction signature.
 *
 * @throws {Error} If any required parameter is missing, if hex values are invalid, or if the 'to' address is not a valid checksummed address.
 */
export function genRawTransaction(config: TransactionConfig): TransactionResult {
    // Validate parameters
    if (
        !config.gasLimit ||
        !config.gasPrice ||
        !config.to ||
        !config.data ||
        config.value === undefined
    ) {
        throw new Error('All parameters (gasLimit, gasPrice, to, data, value) are required');
    }

    if (!isValidChecksumAddress(config.to)) {
        throw new Error('Invalid or non-checksummed address provided for "to"');
    }

    if (config.r && !isValidHex(config.r)) {
        throw new Error('Invalid hex value for customR');
    }

    const r = config.r || HARDCODED_R;

    // Convert and validate hex values
    const gasPrice =
        typeof config.gasPrice === 'number' ? `0x${config.gasPrice.toString(16)}` : config.gasPrice;
    const gasLimit =
        typeof config.gasLimit === 'number' ? `0x${config.gasLimit.toString(16)}` : config.gasLimit;
    const value =
        typeof config.value === 'number' ? `0x${config.value.toString(16)}` : config.value;

    if (
        !isValidHex(gasPrice) ||
        !isValidHex(gasLimit) ||
        !isValidHex(value) ||
        !isValidHex(config.data)
    ) {
        throw new Error('Invalid hex values in config');
    }

    // Construct txParams with hardcoded values for r, s, and v
    const txParams = {
        nonce: '0x00', // Assuming nonce is always 0 for this transaction
        gasPrice,
        gasLimit,
        to: config.to,
        value,
        data: config.data,
        v: HARDCODED_V,
        r,
        s: HARDCODED_S,
    };

    // Create transaction
    const tx = Transaction.fromTxData(txParams);

    // Serialize the transaction
    const serializedTx = tx.serialize().toString('hex');

    // Get sender address
    let senderAddress = tx.getSenderAddress().toString();

    if (!isValidChecksumAddress(senderAddress)) {
        senderAddress = toChecksumAddress(senderAddress);
    }

    // Calculate upfrontCost
    const upfrontCost = Number(tx.getUpfrontCost().toString());

    // Construct and return result
    return {
        rawTx: `0x${serializedTx}`,
        senderAddress,
        upfrontCost,
        r: txParams.r,
        s: txParams.s,
        v: txParams.v,
    };
}
