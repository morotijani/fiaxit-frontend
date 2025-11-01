import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function stringToBoolean(val) {
    if (val === true || val === 'true' || val === 1 || val === '1') return true;
    return false;
}

/**
* Shortens a wallet address by placing an ellipsis in the middle.
* @param {string} address The full wallet address.
* @param {number} startChars The number of characters to show at the beginning.
* @param {number} endChars The number of characters to show at the end.
* @returns {string} The shortened wallet address.
*/
export const shortenAddress = (address, startChars = 6, endChars = 6) => {
    if (!address || address.length < startChars + endChars) {
        return address;
    }
    
    return `${address.substring(0, startChars)}...${address.substring(
        address.length - endChars,
    )}`;
};

/**
* Custom hook for copying text to the clipboard.
* @returns {[boolean, (text: string) => Promise<void>]} A tuple with the copy status and the copy function.
*/
export const useCopyToClipboard = () => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = async (text) => {
        if ('clipboard' in navigator) {
            try {
                await navigator.clipboard.writeText(text);
                setIsCopied(true);
                toast.success('Copied to clipboard!');
                // Reset the "copied" status after a short delay
                setTimeout(() => setIsCopied(false), 2000); 
            } catch (err) {
                console.error('Failed to copy text: ', err);
                setIsCopied(false);
                toast.error('Failed to copy to clipboard.');
            }
        } else {
            console.warn('Clipboard API not supported.');
            setIsCopied(false);
            toast.error('Clipboard API not supported.');
        }
    };
    return [isCopied, copyToClipboard];
};
