export function stringToBoolean(val) {
    if (val === true || val === 'true' || val === 1 || val === '1') return true;
    return false;
}