import React, { useState, useEffect, useContext } from 'react'
import { WalletContext } from '../../contexts/WalletContext'
import { jsonGet } from '../../helpers/Ajax'
import './SelectAsset.css';
import toast from 'react-hot-toast';

const CACHE_PREFIX = 'receive_wallet_cache_v1_';
const DEFAULT_CACHE_TTL_MIN = 5; // minutes

function setCachedData(key, data, ttlInMinutes = DEFAULT_CACHE_TTL_MIN) {
    try {
        const expiresAt = Date.now() + ttlInMinutes * 60 * 1000;
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, expiresAt }));
    } catch (err) {
        // ignore localStorage write errors
        console.error('setCachedData error', err);
    }
}

function getCachedData(key) {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        const { data, expiresAt } = JSON.parse(raw);
        if (!expiresAt || Date.now() > expiresAt) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return data;
    } catch (err) {
        console.error('getCachedData error', err);
        return null;
    }
}

// get wallet balance helper


/**
    * SelectAsset Modal Component
    * @param {object} props
    * @param {boolean} props.isOpen - Whether the modal is open
    * @param {function} props.onClose - Function to close the modal
    * @param {function} props.onSelectAsset - Function to handle asset selection
*/
const SelectAsset = ({ isOpen, onClose, onSelectAsset }) => {
    if (!isOpen) return null;

    const [walletStore] = useContext(WalletContext);
  
    // state for enriched wallets (info + balance)
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchWallets() {
            try {
                if (mounted) setLoadingAssets(true);

                const storeWallets = Array.isArray(walletStore?.wallets) ? walletStore.wallets : [];
                if (!storeWallets.length) {
                    if (mounted) {
                        setAssets([]); // no wallets in DB
                        setLoadingAssets(false);
                    }
                    return;
                }
    
                const jobs = storeWallets.map(async (w) => {
                    const symbol = (w.wallet_symbol || '').toUpperCase();
                    const address = w.wallet_address || '';
                    const wallet_id = w.wallet_id ?? '';

                    try {
                        // check cache first
                        const cacheKey = `receive_coin_info_${symbol.toLowerCase()}`;
                        let infoData = getCachedData(cacheKey);

                        if (!infoData) {
                            // fetch if not cached
                            const infoResp = await jsonGet(`convert/coinmarketcap/latest/${symbol.toLowerCase()}`);

                            if (infoResp && infoResp.success && infoResp.data) {
                                const d = infoResp.data;
                                if (Array.isArray(d)) {
                                    infoData = d[0];
                                } else if (d && typeof d === 'object') {
                                    const keys = Object.keys(d);
                                    if (keys.length === 1 && d[keys[0]]) {
                                        infoData = d[keys[0]];
                                    } else {
                                        infoData = d;
                                    }
                                } else {
                                    infoData = d;
                                }

                                if (infoData) setCachedData(cacheKey, infoData);
                            }
                        }
    
                        if (!infoData) {
                            // fallback empty object
                            infoData = {};
                        }

                        // extract fields with fallbacks
                        const name = infoData?.name || symbol;
                        const logo = infoData?.logo || infoData?.logo_url || infoData?.icon ||
                            (infoData?.id ? `https://s2.coinmarketcap.com/static/img/coins/64x64/${infoData.id}.png` : null);
                        const price = Number(
                            infoData?.price ||
                            infoData?.quote?.USD?.price ||
                            infoData?.last_price ||
                            0
                        );
                        const change = Number(
                            infoData?.quote?.USD?.percent_change_24h ||
                            infoData?.percent_change_24h ||
                            infoData?.change_percent_24h ||
                            0
                        );

                        const priceFormatted = `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        
                        // get wallet balance
                        try {
                            const balanceResp = await jsonGet(`wallets/${symbol}/${address}/balance`);
                            if (!balanceResp || !balanceResp.success) {
                                throw new Error(balanceResp?.message || 'info endpoint failed');
                            }
                            const balanceData = balanceResp.data || {};
                            
                            // normalize balance fields safely
                            if (!balanceData.balance) balanceData.balance = {};

                            // handle common coins robustly (guard objects)
                            if (symbol === 'eth') {
                                let balance = 0;
                                if (balanceData.balance && balanceData.balance.ether != null) {
                                    balance = Number(balanceData.balance.ether) || 0;
                                } else if (balanceData.balance && balanceData.balance.total != null) {
                                    balance = Number(balanceData.balance.total) || 0;
                                }
                                balanceData.balance.total = balance;
                            } else if (symbol === 'btc') {
                                let balance = 0;
                                if (balanceData.balance && balanceData.balance.total != null) {
                                    balance = Number(balanceData.balance.total) || 0;
                                } else if (balanceData.balance != null && typeof balanceData.balance === 'number') {
                                    balance = Number(balanceData.balance) || 0;
                                }
                                balanceData.balance.total = balance;
                            } else {
                                // generic: try to pull first numeric balance field
                                const b = balanceData.balance ?? balanceData;
                                const potential = Number(b?.total ?? b?.amount ?? b?.balance ?? 0) || 0;
                                balanceData.balance = balanceData.balance || {};
                                balanceData.balance.total = potential;
                            }
                        } catch (err) {
                            console.error(`Error fetching balance for ${symbol}`, err);
                        }

                        return {
                            id: `${symbol}_${address}`,
                            symbol,
                            name,
                            logo,
                            price,
                            priceFormatted,
                            change,
                            rawInfo: infoData,
                            address,
                            wallet_id, 
                            balance: balanceData.balance.total || 0
                        };
                    } catch (err) {
                        console.error(`Error fetching wallet info for ${symbol}`, err);
                        // return minimal wallet info on error
                        return {
                            id: `${symbol}_${address}`,
                            symbol,
                            name: symbol,
                            logo: null,
                            price: 0,
                            priceFormatted: '$0.00',
                            change: 0,
                            rawInfo: {},
                            address,
                            wallet_id,
                            error: true
                        };
                    }
                });

                const results = await Promise.all(jobs);
                if (mounted) {
                    setAssets(results.filter(r => r != null));
                }
            } catch (err) {
                console.error('Failed to load wallets info', err);
                if (mounted) {
                    toast.error('Failed to load wallets', { duration: 6000 });
                    setAssets([]);
                }
            } finally {
                if (mounted) setLoadingAssets(false);
            }
        }

        fetchWallets();
        return () => { mounted = false; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletStore?.wallets?.length]);

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                
                {/* Header Section */}
                <div className="modal-header-section">
                    <h2 className="modal-title">Select asset</h2>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                {/* Search Bar Section */}
                <div className="search-bar-container">
                    <input 
                        type="text" 
                        placeholder="Search assets" 
                        className="search-input" 
                    />
                </div>

                {/* Assets List */}
                <div className="assets-list">
                    {loadingAssets ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                            <small className="text-muted ms-2">Loading assets...</small>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="text-center py-3">
                            <small className="text-muted">No assets found</small>
                        </div>
                    ) : (
                        assets.map((asset) => {
                            const outerKey = asset.wallet_id || asset.id || `${asset.symbol}_${asset.address}`;
                            return (
                                <div 
                                    key={outerKey} 
                                    className="asset-item" 
                                    onClick={() => onSelectAsset(asset.symbol)}
                                >
                                    <div className="asset-icon">
                                        {asset.logo ? (
                                            <img
                                                src={asset.logo}
                                                alt={asset.symbol || asset.name}
                                                style={{ width: 36, height: 36, objectFit: 'contain' }}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="fw-bold">{asset.symbol?.charAt(0) ?? '•'}</div>
                                        )}
                                    </div>
                                    <div className="asset-details">
                                        <div className="asset-symbol">{asset.symbol}</div>
                                        <div className="asset-balance">{asset.balance ?? 0}</div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectAsset;