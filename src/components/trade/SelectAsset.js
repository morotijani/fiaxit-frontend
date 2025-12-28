import React, { useState, useEffect, useContext, useMemo } from 'react'
import { WalletContext } from '../../contexts/WalletContext'
import { jsonGet } from '../../helpers/Ajax'
import './SelectAsset.css';
import toast from 'react-hot-toast';

const CACHE_PREFIX = 'select_asset_cache_v1_';
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

/**
    * SelectAsset Modal Component
    * @param {object} props
    * @param {boolean} props.isOpen - Whether the modal is open
    * @param {function} props.onClose - Function to close the modal
    * @param {function} props.onSelectAsset - Function to handle asset selection
*/
const SelectAsset = ({ isOpen, onClose, onSelectAsset }) => {
    const [walletStore] = useContext(WalletContext);

    // state for enriched wallets (info + balance)
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!isOpen) return; // only fetch when modal open (safe because hooks already ran)

        let mounted = true;
        async function fetchWallets() {
            try {
                if (mounted) setLoadingAssets(true);

                const storeWallets = Array.isArray(walletStore?.wallets) ? walletStore.wallets : [];
                if (!storeWallets.length) {
                    if (mounted) {
                        setAssets([]);
                        setLoadingAssets(false);
                    }
                    return;
                }

                const jobs = storeWallets.map(async (w) => {
                    const symbolRaw = (w.wallet_symbol || '');
                    const symbol = symbolRaw.toUpperCase();
                    const symLower = symbolRaw.toLowerCase();
                    const address = w.wallet_address || '';
                    const wallet_id = w.wallet_id ?? w.id ?? '';

                    let infoData = null;
                    try {
                        const cacheKey = `receive_coin_info_${symLower}`;
                        infoData = getCachedData(cacheKey);

                        if (!infoData) {
                            const infoResp = await jsonGet(`convert/coinmarketcap/latest/${symLower}`);
                            if (infoResp && infoResp.success && infoResp.data) {
                                const d = infoResp.data;
                                if (Array.isArray(d)) infoData = d[0];
                                else if (d && typeof d === 'object') {
                                    const keys = Object.keys(d);
                                    infoData = (keys.length === 1 && d[keys[0]]) ? d[keys[0]] : d;
                                } else infoData = d;
                                if (infoData) setCachedData(cacheKey, infoData);
                            }
                        }
                    } catch (err) {
                        console.warn(`coin info fetch failed for ${symbol}`, err);
                        infoData = infoData || {};
                    }

                    // price/extras with safe defaults
                    const name = infoData?.name || symbol;
                    const logo = infoData?.logo || infoData?.logo_url || infoData?.icon ||
                        (infoData?.id ? `https://s2.coinmarketcap.com/static/img/coins/64x64/${infoData.id}.png` : null);
                    const price = Number(infoData?.price ?? infoData?.quote?.USD?.price ?? 0) || 0;
                    const priceFormatted = `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                    // fetch balance safely and normalize
                    let balance = 0;
                    let balanceFiatFormatted = '$0.00';
                    try {
                        const balanceResp = await jsonGet(`wallets/${symLower}/${address}/balance`);
                        if (balanceResp && balanceResp.success) {
                            const balanceData = balanceResp.data ?? {};

                            // support multiple shapes in a unified way (similar to backend)
                            const payload = balanceData;

                            const candidates = [
                                payload?.balance?.total,
                                payload?.balance?.btc,
                                payload?.balanceEth,
                                payload?.usdt?.balance,
                                payload?.balance?.eth,
                                payload?.balance,
                                payload?.amount,
                                payload?.value
                            ];

                            let found = false;
                            for (const c of candidates) {
                                if (c !== undefined && c !== null) {
                                    const n = Number(c);
                                    if (!isNaN(n) && typeof c !== 'object') {
                                        balance = n;
                                        found = true;
                                        break;
                                    }
                                    if (typeof c === 'object' && c !== null) {
                                        const nt = Number(c.total ?? c.btc ?? c.balance ?? 0);
                                        if (!isNaN(nt)) {
                                            balance = nt;
                                            found = true;
                                            break;
                                        }
                                    }
                                }
                            }

                            // convert balance to fiat
                            const fiatValue = parseFloat(balance) * price;
                            balanceFiatFormatted = `$${fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }
                    } catch (err) {
                        console.warn(`Error fetching balance for ${symbol}`, err);
                    }

                    return {
                        auto_id: w.id,
                        id: `${symbol}_${address}`,
                        wallet_id,
                        symbol,
                        name,
                        logo,
                        price,
                        priceFormatted,
                        rawInfo: infoData || {},
                        address,
                        balance: balance,
                        balanceFiatFormatted,
                        wallet_privatekey: w.wallet_privatekey || null,
                    };
                });

                const results = await Promise.all(jobs);
                if (mounted) setAssets(results.filter(Boolean));
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

        // close on Escape key
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', onKey);

        return () => {
            window.removeEventListener('keydown', onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, walletStore?.wallets?.length]);

    // filtered list (memoized)
    const filtered = useMemo(() => {
        const q = (search || '').trim().toLowerCase();
        if (!q) return assets;
        return assets.filter(a =>
            (a.symbol || '').toLowerCase().includes(q) ||
            (a.name || '').toLowerCase().includes(q) ||
            (a.address || '').toLowerCase().includes(q)
        );
    }, [assets, search]);

    // Close if modal not open
    if (!isOpen) return null;

    const handleSelect = (asset) => {
        try {
            onSelectAsset?.(asset);
        } catch (e) {
            console.warn('onSelectAsset handler threw', e);
        } finally {
            onClose?.();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container" onMouseDown={(e) => e.stopPropagation()}>

                {/* Header Section */}
                <div className="modal-header-section">
                    <h2 className="modal-title">Select asset</h2>
                    <button onClick={() => onClose?.()} className="close-button" aria-label="Close">×</button>
                </div>

                {/* Search Bar Section */}
                <div className="search-bar-container">
                    <input
                        type="text"
                        placeholder="Search assets"
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search assets"
                    />
                </div>

                {/* Assets List */}
                <div className="assets-list" role="list">
                    {loadingAssets ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                            <small className="text-muted ms-2">Loading assets...</small>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-3">
                            <small className="text-muted">No assets found</small>
                        </div>
                    ) : (
                        filtered.map((asset) => {
                            const outerKey = asset.wallet_id || asset.id || `${asset.symbol}_${asset.address}`;
                            return (
                                <div
                                    key={outerKey}
                                    className="asset-item d-flex align-items-center justify-content-between px-1"
                                    onClick={() => handleSelect(asset)}
                                    role="listitem"
                                >
                                    <div className="asset-icon">
                                        {asset.logo ? (
                                            <img
                                                src={asset.logo}
                                                alt={asset.symbol || asset.name}
                                                style={{ width: 36, height: 36, objectFit: 'contain' }}
                                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="fw-bold">{(asset.symbol || '•').charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className="asset-details">
                                        <div className="asset-symbol">{asset.name} . {asset.symbol} ({asset.auto_id})</div>
                                        <div className="asset-balance">{typeof asset.balance === 'number' ? asset.balance : (asset.balance ?? 0)} available</div>
                                    </div>
                                    <div className="asset-price">{asset.balanceFiatFormatted || '$0.00'}</div>
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