import { describe, expect, it } from 'vitest';
import { genRawDeployment } from '../../src/genRawDeployment/genRawDeployment';

describe('genRawDeployment', () => {
    const validConfig = {
        gasLimit: 100000,
        gasPrice: 1000000000,
        bytecode: '0x1234',
        value: 0,
    };

    it('should return a valid DeploymentResult with correct structure', () => {
        const result = genRawDeployment(validConfig);
        expect(result).toHaveProperty('rawTx');
        expect(result).toHaveProperty('deployerAddress');
        expect(result).toHaveProperty('contractAddress');
        expect(result).toHaveProperty('r');
        expect(result).toHaveProperty('s');
        expect(result).toHaveProperty('v');
        expect(result).toHaveProperty('upfrontCost');
    });

    it('should calculate upfrontCost correctly', () => {
        const config = {
            gasLimit: 100000,
            gasPrice: 1000000000, // 1 Gwei
            bytecode: '0x1234',
            value: 1000000000000000, // 0.001 ETH
        };
        const result = genRawDeployment(config);

        // Manual calculation: value + (gasLimit * gasPrice)
        const expectedUpfrontCost = config.value + config.gasLimit * config.gasPrice;

        expect(result.upfrontCost).toBe(expectedUpfrontCost);
    });

    it('should calculate different UpfrontCost for different inputs', () => {
        const result1 = genRawDeployment(validConfig);
        const result2 = genRawDeployment({
            ...validConfig,
            gasPrice: validConfig.gasPrice * 2,
        });
        expect(result1.upfrontCost).toBeLessThan(result2.upfrontCost);
    });

    it('should calculate UpfrontCost correctly with hex string inputs', () => {
        const hexConfig = {
            gasLimit: '0x186a0', // 100000
            gasPrice: '0x3b9aca00', // 1000000000 (1 Gwei)
            bytecode: '0x1234',
            value: '0xde0b6b3a7640000', // 1000000000000000000 (1 ETH)
        };
        const result = genRawDeployment(hexConfig);

        // Manual calculation: value + (gasLimit * gasPrice)
        const expectedUpfrontCost = 1000000000000000000 + 100000 * 1000000000;

        expect(result.upfrontCost).toBe(expectedUpfrontCost);
    });

    it('should use hardcoded values for r, s, and v', () => {
        const result = genRawDeployment(validConfig);
        expect(result.r).toBe('0x1212121212121212121212121212121212121212121212121212121212121212');
        expect(result.s).toBe('0x1212121212121212121212121212121212121212121212121212121212121212');
        expect(result.v).toBe('0x1b');
    });

    it('should throw an error when gasLimit is missing', () => {
        const invalidConfig = { ...validConfig, gasLimit: undefined };
        expect(() => genRawDeployment(invalidConfig)).toThrow(
            'All parameters (gasLimit, gasPrice, bytecode, value) are required',
        );
    });

    it('should throw an error when gasPrice is missing', () => {
        const invalidConfig = { ...validConfig, gasPrice: undefined };
        expect(() => genRawDeployment(invalidConfig)).toThrow(
            'All parameters (gasLimit, gasPrice, bytecode, value) are required',
        );
    });

    it('should throw an error when bytecode is missing', () => {
        const invalidConfig = { ...validConfig, bytecode: undefined };
        expect(() => genRawDeployment(invalidConfig)).toThrow(
            'All parameters (gasLimit, gasPrice, bytecode, value) are required',
        );
    });

    it('should throw an error when value is missing', () => {
        const invalidConfig = { ...validConfig, value: undefined };
        expect(() => genRawDeployment(invalidConfig)).toThrow(
            'All parameters (gasLimit, gasPrice, bytecode, value) are required',
        );
    });

    it('should accept numeric values for gasLimit, gasPrice, and value', () => {
        const numericConfig = {
            gasLimit: 100000,
            gasPrice: 1000000000,
            bytecode: '0x1234',
            value: 0,
        };
        expect(() => genRawDeployment(numericConfig)).not.toThrow();
    });

    it('should accept hex string values for gasLimit, gasPrice, and value', () => {
        const hexConfig = {
            gasLimit: '0x186a0',
            gasPrice: '0x3b9aca00',
            bytecode: '0x1234',
            value: '0x0',
        };
        expect(() => genRawDeployment(hexConfig)).not.toThrow();
    });

    it('should throw an error for invalid hex values', () => {
        const invalidHexConfig = {
            ...validConfig,
            gasLimit: '0xZZZ',
        };
        expect(() => genRawDeployment(invalidHexConfig)).toThrow('Invalid hex values in config');
    });

    it('should generate a valid rawTx', () => {
        const result = genRawDeployment(validConfig);
        expect(result.rawTx).toMatch(/^0x[0-9a-fA-F]+$/);
    });

    it('should generate a valid deployerAddress', () => {
        const result = genRawDeployment(validConfig);
        expect(result.deployerAddress).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });

    it('should generate a valid contractAddress', () => {
        const result = genRawDeployment(validConfig);
        expect(result.contractAddress).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });

    it('should generate different contract addresses for different bytecodes', () => {
        const result1 = genRawDeployment(validConfig);
        const result2 = genRawDeployment({ ...validConfig, bytecode: '0x5678' });
        expect(result1.contractAddress).not.toBe(result2.contractAddress);
    });

    it('should generate the same result for the same input', () => {
        const result1 = genRawDeployment(validConfig);
        const result2 = genRawDeployment(validConfig);
        expect(result1).toEqual(result2);
    });

    it('should throw an error for non-hex bytecode', () => {
        const invalidBytecodeConfig = { ...validConfig, bytecode: 'not-a-hex-string' };
        expect(() => genRawDeployment(invalidBytecodeConfig)).toThrow();
    });

    it('should handle zero value', () => {
        const zeroValueConfig = { ...validConfig, value: 0 };
        expect(() => genRawDeployment(zeroValueConfig)).not.toThrow();
    });

    it('should generate different deployerAddresses for different inputs', () => {
        const result1 = genRawDeployment(validConfig);
        const result2 = genRawDeployment({
            ...validConfig,
            gasPrice: validConfig.gasPrice + 1,
        });
        expect(result1.deployerAddress).not.toBe(result2.deployerAddress);
    });

    it('should handle very long bytecode', () => {
        const longBytecodeConfig = { ...validConfig, bytecode: '0x' + '1234'.repeat(10000) };
        expect(() => genRawDeployment(longBytecodeConfig)).not.toThrow();
    });

    it('should throw an error for non-string bytecode', () => {
        const invalidBytecodeConfig = { ...validConfig, bytecode: 12345 };
        expect(() => genRawDeployment(invalidBytecodeConfig)).toThrow();
    });

    it('should throw an error for fractional gasLimit', () => {
        const fractionalGasLimitConfig = { ...validConfig, gasLimit: 100000.5 };
        expect(() => genRawDeployment(fractionalGasLimitConfig)).toThrow();
    });

    it('should throw an error for fractional gasPrice', () => {
        const fractionalGasPriceConfig = { ...validConfig, gasPrice: 1000000000.5 };
        expect(() => genRawDeployment(fractionalGasPriceConfig)).toThrow();
    });

    it('should throw an error for fractional value', () => {
        const fractionalValueConfig = { ...validConfig, value: 0.5 };
        expect(() => genRawDeployment(fractionalValueConfig)).toThrow();
    });

    it('should use custom r value when provided', () => {
        const customR = '0x2222222222222222222222222222222222222222222222222222222222222222';
        const result = genRawDeployment({ ...validConfig, r: customR });
        expect(result.r).toBe(customR);
    });

    it('should generate different deployer addresses for different r values', () => {
        const result1 = genRawDeployment(validConfig);
        const result2 = genRawDeployment({
            ...validConfig,
            r: '0x2222222222222222222222222222222222222222222222222222222222222222',
        });
        expect(result1.deployerAddress).not.toBe(result2.deployerAddress);
    });

    it('should generate different contract addresses for different r values', () => {
        const result1 = genRawDeployment(validConfig);
        const result2 = genRawDeployment({
            ...validConfig,
            r: '0x3333333333333333333333333333333333333333333333333333333333333333',
        });
        expect(result1.contractAddress).not.toBe(result2.contractAddress);
    });

    it('should throw an error for invalid custom r value', () => {
        const invalidConfig = { ...validConfig, r: 'not-a-hex-string' };
        expect(() => genRawDeployment(invalidConfig)).toThrow('Invalid hex value for customR');
    });

    it('should use hardcoded R when custom r is not provided', () => {
        const result = genRawDeployment(validConfig);
        expect(result.r).toBe('0x1212121212121212121212121212121212121212121212121212121212121212');
    });

    it('should generate consistent results for the same custom r value', () => {
        const customConfig = {
            ...validConfig,
            r: '0x4444444444444444444444444444444444444444444444444444444444444444',
        };
        const result1 = genRawDeployment(customConfig);
        const result2 = genRawDeployment(customConfig);
        expect(result1).toEqual(result2);
    });

    it('should generate different results for different custom r values', () => {
        const result1 = genRawDeployment({
            ...validConfig,
            r: '0x1212121212121212121212121212121212121212121212121212121212121212',
        });
        const result2 = genRawDeployment({
            ...validConfig,
            r: '0x4444444444444444444444444444444444444444444444444444444444444444',
        });
        expect(result1).not.toEqual(result2);
    });

    it('should accept only 0x-prefixed custom r values', () => {
        const customR = '0x7777777777777777777777777777777777777777777777777777777777777777';
        const result1 = genRawDeployment({
            ...validConfig,
            r: customR,
        });
        expect(result1.r).toBe(customR);

        // This should throw an error
        expect(() =>
            genRawDeployment({
                ...validConfig,
                r: '7777777777777777777777777777777777777777777777777777777777777777',
            }),
        ).toThrow('Invalid hex value for customR');
    });
});
