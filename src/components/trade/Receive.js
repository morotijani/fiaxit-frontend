import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jsonGet } from '../../helpers/Ajax'
import { shortenAddress, useCopyToClipboard } from '../../helpers/StringHelpers'
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const DEFAULT_CACHE_TTL_MIN = 5; // minutes

function setCachedData(key, data, ttlInMinutes = DEFAULT_CACHE_TTL_MIN) {
    const ttlInMilliseconds = ttlInMinutes * 60 * 1000;
    const expiresAt = Date.now() + ttlInMilliseconds;
    try {
        localStorage.setItem(key, JSON.stringify({ data, expiresAt }));
    } catch (err) {
        console.error('Error setting cached data:', err);
    }
}
function getCachedData(key) {
    try {
        const cachedItem = localStorage.getItem(key);
        if (!cachedItem) return null;
        const { data, expiresAt } = JSON.parse(cachedItem);
        if (!expiresAt || Date.now() > expiresAt) {
            localStorage.removeItem(key);
            return null;
        }
        return data;
    } catch (err) {
        console.error('Error getting cached data:', err);
        return null;
    }
}

function timeAgo(date) {
    if (!date) return '';
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
        return '';
    }
}

function WalletDetails() {
    const navigate = useNavigate();

    return (
        <div>
            <div className="bg-light rounded-5 rounded-top-0 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2 p-3">
                    <button className="btn btn-sm" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">keyboard_backspace</span>
                    </button>
                    <h6 className="mb-0">Receive crypto</h6>
                    <button className="btn btn-light btn-sm" onClick={() => navigate('/deposit')}>
                        Deposit
                    </button>
                </div>

                         


            </div>
        </div>
    )
}

export default WalletDetails;