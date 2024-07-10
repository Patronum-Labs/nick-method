import { describe, expect, it } from 'vitest';
import { genRawTransaction } from '../../src/genRawTransaction/genRawTransaction';

describe('genRawTransaction', () => {
    const validConfig = {
        gasLimit: 100000,
        gasPrice: 1000000000,
        to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        data: '0x1234',
        value: 0,
    };

    it('should return a valid TransactionResult with correct structure', () => {
        const result = genRawTransaction(validConfig);
        expect(result).toHaveProperty('rawTx');
        expect(result).toHaveProperty('senderAddress');
        expect(result).toHaveProperty('upfrontCost');
        expect(result).toHaveProperty('r');
        expect(result).toHaveProperty('s');
        expect(result).toHaveProperty('v');
    });

    it('should calculate upfrontCost correctly', () => {
        const config = {
            ...validConfig,
            gasLimit: 100000,
            gasPrice: 1000000000, // 1 Gwei
            value: 1000000000000000, // 0.001 ETH
        };
        const result = genRawTransaction(config);

        // Manual calculation: value + (gasLimit * gasPrice)
        const expectedUpfrontCost = config.value + config.gasLimit * config.gasPrice;

        expect(result.upfrontCost).toBe(expectedUpfrontCost);
    });

    it('should calculate different upfrontCost for different inputs', () => {
        const result1 = genRawTransaction(validConfig);
        const result2 = genRawTransaction({
            ...validConfig,
            gasPrice: validConfig.gasPrice * 2,
        });
        expect(result1.upfrontCost).toBeLessThan(result2.upfrontCost);
    });

    it('should calculate upfrontCost correctly with hex string inputs', () => {
        const hexConfig = {
            gasLimit: '0x186a0', // 100000
            gasPrice: '0x3b9aca00', // 1000000000 (1 Gwei)
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            data: '0x1234',
            value: '0xde0b6b3a7640000', // 1000000000000000000 (1 ETH)
        };
        const result = genRawTransaction(hexConfig);

        // Manual calculation: value + (gasLimit * gasPrice)
        const expectedUpfrontCost = 1000000000000000000 + 100000 * 1000000000;

        expect(result.upfrontCost).toBe(expectedUpfrontCost);
    });

    it('should use hardcoded values for r, s, and v when custom r is not provided', () => {
        const result = genRawTransaction(validConfig);
        expect(result.r).toBe('0x1212121212121212121212121212121212121212121212121212121212121212');
        expect(result.s).toBe('0x1212121212121212121212121212121212121212121212121212121212121212');
        expect(result.v).toBe('0x1b');
    });

    it('should throw an error when gasLimit is missing', () => {
        const invalidConfig = { ...validConfig, gasLimit: undefined };
        expect(() => genRawTransaction(invalidConfig)).toThrow(
            'All parameters (gasLimit, gasPrice, to, data, value) are required',
        );
    });

    it('should throw an error when gasPrice is missing', () => {
        const invalidConfig = { ...validConfig, gasPrice: undefined };
        expect(() => genRawTransaction(invalidConfig)).toThrow(
            'All parameters (gasLimit, gasPrice, to, data, value) are required',
        );
    });

    it('should throw an error when to is missing', () => {
        const invalidConfig = { ...validConfig, to: undefined };
        expect(() => genRawTransaction(invalidConfig)).toThrow(
            'All parameters (gasLimit, gasPrice, to, data, value) are required',
        );
    });

    it('should throw an error when data is missing', () => {
        const invalidConfig = { ...validConfig, data: undefined };
        expect(() => genRawTransaction(invalidConfig)).toThrow(
            'All parameters (gasLimit, gasPrice, to, data, value) are required',
        );
    });

    it('should throw an error when value is missing', () => {
        const invalidConfig = { ...validConfig, value: undefined };
        expect(() => genRawTransaction(invalidConfig)).toThrow(
            'All parameters (gasLimit, gasPrice, to, data, value) are required',
        );
    });

    it('should accept numeric values for gasLimit, gasPrice, and value', () => {
        const numericConfig = {
            gasLimit: 100000,
            gasPrice: 1000000000,
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            data: '0x1234',
            value: 0,
        };
        expect(() => genRawTransaction(numericConfig)).not.toThrow();
    });

    it('should accept hex string values for gasLimit, gasPrice, and value', () => {
        const hexConfig = {
            gasLimit: '0x186a0',
            gasPrice: '0x3b9aca00',
            to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            data: '0x1234',
            value: '0x0',
        };
        expect(() => genRawTransaction(hexConfig)).not.toThrow();
    });

    it('should throw an error for invalid hex values', () => {
        const invalidHexConfig = {
            ...validConfig,
            gasLimit: '0xZZZ',
        };
        expect(() => genRawTransaction(invalidHexConfig)).toThrow('Invalid hex values in config');
    });

    it('should generate a valid rawTx', () => {
        const result = genRawTransaction(validConfig);
        expect(result.rawTx).toMatch(/^0x[0-9a-fA-F]+$/);
    });

    it('should generate a valid senderAddress', () => {
        const result = genRawTransaction(validConfig);
        expect(result.senderAddress).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });

    it('should generate the same result for the same input', () => {
        const result1 = genRawTransaction(validConfig);
        const result2 = genRawTransaction(validConfig);
        expect(result1).toEqual(result2);
    });

    it('should throw an error for non-hex data', () => {
        const invalidDataConfig = { ...validConfig, data: 'not-a-hex-string' };
        expect(() => genRawTransaction(invalidDataConfig)).toThrow();
    });

    it('should handle zero value', () => {
        const zeroValueConfig = { ...validConfig, value: 0 };
        expect(() => genRawTransaction(zeroValueConfig)).not.toThrow();
    });

    it('should generate different senderAddresses for different inputs', () => {
        const result1 = genRawTransaction(validConfig);
        const result2 = genRawTransaction({
            ...validConfig,
            gasPrice: validConfig.gasPrice + 1,
        });
        expect(result1.senderAddress).not.toBe(result2.senderAddress);
    });

    it('should handle very long data', () => {
        const longDataConfig = { ...validConfig, data: '0x' + '1234'.repeat(10000) };
        expect(() => genRawTransaction(longDataConfig)).not.toThrow();
    });

    it('should throw an error for non-string data', () => {
        const invalidDataConfig = { ...validConfig, data: 12345 };
        expect(() => genRawTransaction(invalidDataConfig)).toThrow();
    });

    it('should throw an error for fractional gasLimit', () => {
        const fractionalGasLimitConfig = { ...validConfig, gasLimit: 100000.5 };
        expect(() => genRawTransaction(fractionalGasLimitConfig)).toThrow();
    });

    it('should throw an error for fractional gasPrice', () => {
        const fractionalGasPriceConfig = { ...validConfig, gasPrice: 1000000000.5 };
        expect(() => genRawTransaction(fractionalGasPriceConfig)).toThrow();
    });

    it('should throw an error for fractional value', () => {
        const fractionalValueConfig = { ...validConfig, value: 0.5 };
        expect(() => genRawTransaction(fractionalValueConfig)).toThrow();
    });

    it('should use custom r value when provided', () => {
        const customR = '0x2222222222222222222222222222222222222222222222222222222222222222';
        const result = genRawTransaction({ ...validConfig, r: customR });
        expect(result.r).toBe(customR);
    });

    it('should generate different sender addresses for different r values', () => {
        const result1 = genRawTransaction(validConfig);
        const result2 = genRawTransaction({
            ...validConfig,
            r: '0x2222222222222222222222222222222222222222222222222222222222222222',
        });
        expect(result1.senderAddress).not.toBe(result2.senderAddress);
    });

    it('should throw an error for invalid custom r value', () => {
        const invalidConfig = { ...validConfig, r: 'not-a-hex-string' };
        expect(() => genRawTransaction(invalidConfig)).toThrow('Invalid hex value for customR');
    });

    it('should use hardcoded R when custom r is not provided', () => {
        const result = genRawTransaction(validConfig);
        expect(result.r).toBe('0x1212121212121212121212121212121212121212121212121212121212121212');
    });

    it('should generate consistent results for the same custom r value', () => {
        const customConfig = {
            ...validConfig,
            r: '0x4444444444444444444444444444444444444444444444444444444444444444',
        };
        const result1 = genRawTransaction(customConfig);
        const result2 = genRawTransaction(customConfig);
        expect(result1).toEqual(result2);
    });

    it('should generate different results for different custom r values', () => {
        const result1 = genRawTransaction({
            ...validConfig,
            r: '0x1212121212121212121212121212121212121212121212121212121212121212',
        });
        const result2 = genRawTransaction({
            ...validConfig,
            r: '0x4444444444444444444444444444444444444444444444444444444444444444',
        });
        expect(result1).not.toEqual(result2);
    });

    it('should accept only 0x-prefixed custom r values', () => {
        const customR = '0x7777777777777777777777777777777777777777777777777777777777777777';
        const result1 = genRawTransaction({
            ...validConfig,
            r: customR,
        });
        expect(result1.r).toBe(customR);

        // This should throw an error
        expect(() =>
            genRawTransaction({
                ...validConfig,
                r: '7777777777777777777777777777777777777777777777777777777777777777',
            }),
        ).toThrow('Invalid hex value for customR');
    });

    it('should throw an error for invalid to address', () => {
        const invalidToConfig = { ...validConfig, to: '0xinvalidaddress' };
        expect(() => genRawTransaction(invalidToConfig)).toThrow(
            'Invalid or non-checksummed address provided for "to"',
        );
    });

    it('should accept a valid checksummed to address', () => {
        const validToConfig = { ...validConfig, to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' };
        expect(() => genRawTransaction(validToConfig)).not.toThrow();
    });

    it('should throw an error for non-checksummed to address', () => {
        const nonChecksummedToConfig = {
            ...validConfig,
            to: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
        };
        expect(() => genRawTransaction(nonChecksummedToConfig)).toThrow(
            'Invalid or non-checksummed address provided for "to"',
        );
    });
});
