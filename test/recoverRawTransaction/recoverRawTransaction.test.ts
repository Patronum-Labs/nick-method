import { describe, expect, it } from 'vitest';
import { recoverRawTransaction } from '../../src/recoverRawTransaction/recoverRawTransaction';
import { Transaction } from '@ethereumjs/tx';

describe('recoverRawTransaction', () => {
    function createRawTransaction(params: any) {
        const tx = Transaction.fromTxData(params);
        return '0x' + tx.serialize().toString('hex');
    }

    const validRawTx = createRawTransaction({
        nonce: 0,
        gasPrice: 1000000000,
        gasLimit: 100000,
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        value: 1000000000000000,
        data: '0x1234',
    });

    const validContractCreationBytecode =
        '0x608060405234801561001057600080fd5b5060f78061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806360fe47b11460375780636d4ce63c146062575b600080fd5b606060048036036020811015604b57600080fd5b8101908080359060200190929190505050607e565b005b60686088565b6040518082815260200191505060405180910390f35b8060008190555050565b6000805490509056fea2646970667358221220b8679e66a68b72b8cd5db8cc0068c7076ea3826ae3aef1aa844cd36de332108764736f6c63430007060033';

    it('should return a valid RecoveredTransactionResult with correct structure', () => {
        const result = recoverRawTransaction(validRawTx);
        expect(result).toHaveProperty('nonce');
        expect(result).toHaveProperty('gasPrice');
        expect(result).toHaveProperty('gasLimit');
        expect(result).toHaveProperty('to');
        expect(result).toHaveProperty('value');
        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('v');
        expect(result).toHaveProperty('r');
        expect(result).toHaveProperty('s');
    });

    it('should correctly recover transaction details', () => {
        const result = recoverRawTransaction(validRawTx);
        expect(result.nonce).toBe(0);
        expect(result.gasPrice).toBe(1000000000);
        expect(result.gasLimit).toBe(100000);
        expect(result.to).toBe('0x742d35cc6634c0532925a3b844bc454e4438f44e');
        expect(result.value).toBe(1000000000000000);
        expect(result.data).toBe('0x1234');
    });

    it('should handle transactions without a to address (contract creation)', () => {
        const contractCreationTx = createRawTransaction({
            nonce: 0,
            gasPrice: 1000000000,
            gasLimit: 500000,
            value: 0,
            data: validContractCreationBytecode,
        });
        const result = recoverRawTransaction(contractCreationTx);
        expect(result.to).toBeUndefined();
        expect(result.data).toBe(validContractCreationBytecode);
    });

    it('should throw an error for invalid hex input', () => {
        expect(() => recoverRawTransaction('not-a-hex-string')).toThrow(
            'Invalid hex value for rawTransaction',
        );
    });

    it('should return undefinied for v,r,s when the rawTx is not signed', () => {
        const result = recoverRawTransaction(validRawTx);
        expect(result.v).toBeUndefined();
        expect(result.r).toBeUndefined();
        expect(result.s).toBeUndefined();
    });

    it('should handle transactions with different gas prices', () => {
        const highGasPriceTx = createRawTransaction({
            nonce: 0,
            gasPrice: 2000000000,
            gasLimit: 100000,
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            value: 1000000000000000,
            data: '0x1234',
        });
        const result = recoverRawTransaction(highGasPriceTx);
        expect(result.gasPrice).toBe(2000000000);
    });

    it('should handle transactions with different gas limits', () => {
        const highGasLimitTx = createRawTransaction({
            nonce: 0,
            gasPrice: 1000000000,
            gasLimit: 200000,
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            value: 1000000000000000,
            data: '0x1234',
        });
        const result = recoverRawTransaction(highGasLimitTx);
        expect(result.gasLimit).toBe(200000);
    });

    it('should handle transactions with different values', () => {
        const highValueTx = createRawTransaction({
            nonce: 0,
            gasPrice: 1000000000,
            gasLimit: 100000,
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            value: 2000000000000000,
            data: '0x1234',
        });
        const result = recoverRawTransaction(highValueTx);
        expect(result.value).toBe(2000000000000000);
    });

    it('should handle transactions with different data', () => {
        const differentDataTx = createRawTransaction({
            nonce: 0,
            gasPrice: 1000000000,
            gasLimit: 100000,
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            value: 1000000000000000,
            data: '0x0123456789abcdef',
        });
        const result = recoverRawTransaction(differentDataTx);
        expect(result.data).toBe('0x0123456789abcdef');
    });

    it('should handle transactions with different nonces', () => {
        const highNonceTx = createRawTransaction({
            nonce: 10,
            gasPrice: 1000000000,
            gasLimit: 100000,
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            value: 1000000000000000,
            data: '0x1234',
        });
        const result = recoverRawTransaction(highNonceTx);
        expect(result.nonce).toBe(10);
    });

    it('should handle transactions with very long data', () => {
        const longData = '0x' + '1234'.repeat(1000);
        const longDataTx = createRawTransaction({
            nonce: 0,
            gasPrice: 1000000000,
            gasLimit: 100000,
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            value: 1000000000000000,
            data: longData,
        });
        const result = recoverRawTransaction(longDataTx);
        expect(result.data).toBe(longData);
        expect(result.data.length).toBe(4002);
    });

    it('should recover the correct fields of Nick Factory Transaction', () => {
        const rawTx =
            '0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222';
        const result = recoverRawTransaction(rawTx);
        expect(result.nonce).toBe(0);
        expect(result.data).toBe(
            '0x604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3',
        );
        expect(result.gasLimit).toBe(100000);
        expect(result.gasPrice).toBe(100000000000);
        expect(result.value).toBe(0);
        expect(result.v).toBe('0x1b');
        expect(result.r).toBe('0x2222222222222222222222222222222222222222222222222222222222222222');
        expect(result.s).toBe('0x2222222222222222222222222222222222222222222222222222222222222222');
        expect(result.to).toBeUndefined();
    });
});
