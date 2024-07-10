/**
 * Checks if a given string is a valid hexadecimal value.
 *
 * @param {string} value - The string to be checked.
 * @returns {boolean} True if the string is a valid hexadecimal value (starts with '0x' followed by hexadecimal digits), false otherwise.
 */
export function isValidHex(value: string): boolean {
    return /^0x[0-9A-Fa-f]*$/.test(value);
}
