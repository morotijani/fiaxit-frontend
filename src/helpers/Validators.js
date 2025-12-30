/**
 * Wallet Address Validators
 */

export const validateWalletAddress = (address, coinSymbol) => {
    if (!address) return { isValid: false, message: "Address is required" };

    const symbol = coinSymbol?.toUpperCase();

    switch (symbol) {
        case 'BTC':
            // Simple BTC regex: Mainnet (1, 3, bc1)
            const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,65})$/;
            if (!btcRegex.test(address)) {
                return { isValid: false, message: "Invalid Bitcoin address format" };
            }
            break;

        case 'ETH':
            // ETH regex: 0x followed by 40 hex chars
            const ethRegex = /^0x[a-fA-F0-9]{40}$/;
            if (!ethRegex.test(address)) {
                return { isValid: false, message: "Invalid Ethereum address format (must start with 0x)" };
            }
            break;

        case 'USDT':
            // USDT can be ERC20 (0x...) or TRC20 (T...)
            const usdtRegex = /^(0x[a-fA-F0-9]{40}|T[1-9A-HJ-NP-Za-km-z]{33})$/;
            if (!usdtRegex.test(address)) {
                return { isValid: false, message: "Invalid USDT address format (supports ERC20 or TRC20)" };
            }
            break;

        default:
            // For unknown coins, we just check if it's not empty (already done)
            if (address.length < 10) {
                return { isValid: false, message: "Address seems too short" };
            }
    }

    return { isValid: true, message: "" };
};
