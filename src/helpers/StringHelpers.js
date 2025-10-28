export function stringToBoolean(val) {
    if (val === true || val === 'true' || val === 1 || val === '1') return true;
    return false;
}

export const shortenAddress = (address, startChars = 6, endChars = 6) => {
    if (!address || address.length < startChars + endChars) {
        return address;
    }
    
    return `${address.substring(0, startChars)}...${address.substring(
        address.length - endChars,
    )}`;
};