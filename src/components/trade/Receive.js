import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext } from '../../contexts/WalletContext'
import { jsonGet } from '../../helpers/Ajax'
import Button from '../elements/Button'
import { shortenAddress, useCopyToClipboard } from '../../helpers/StringHelpers'
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


function Receive() {
    const navigate = useNavigate();
    const [isCopied, copyToClipboard] = useCopyToClipboard();
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
                            wallet_id
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


    const handleCopy = (address) => {
        if (!address) return;
        copyToClipboard(address);
        toast.success('Address copied', { duration: 2000 });
    };

    return (
        <div className="animate-fade-in">
            {/* Top Handle for App-like feel */}
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            {/* Header / Top Bar */}
            <div className="p-3 border-0 border-bottom d-flex align-items-center justify-content-between sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Receive Crypto</h6>
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate("/transactions")}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>history</span>
                </button>
            </div>

            <div className="p-4">
                {/* Statistics Header */}
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-2 shadow-sm" style={{ width: '64px', height: '64px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>download</span>
                    </div>
                    <h5 className="fw-bold mb-1">Select Asset</h5>
                    <div className="badge rounded-pill bg-light text-dark shadow-sm border px-3 py-2">
                        {walletStore?.total ?? 0} Active Wallets
                    </div>
                    <p className="text-muted small mt-2">Choose an asset to view its deposit address</p>
                </div>

                {/* Assets List */}
                <div className="list-group rounded-4 border shadow-sm overflow-hidden mb-5 bg-white">
                    {loadingAssets ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-muted small mt-2">Fetching your wallets...</div>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="p-5 text-center bg-light">
                            <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>account_balance_wallet</span>
                            <p className="text-muted mt-2">No active wallets found</p>
                            <button className="btn btn-primary btn-sm mt-2 rounded-pill px-4" onClick={() => navigate('/wallets')}>Manage Wallets</button>
                        </div>
                    ) : (
                        assets.map((asset) => {
                            const outerKey = asset.wallet_id || asset.id || `${asset.symbol}_${asset.address}`;
                            return (
                                <div
                                    key={outerKey}
                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 border-0 border-bottom"
                                    onClick={() => navigate(`/trade/receive/${asset.wallet_id ?? asset.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded-circle bg-light d-flex justify-content-center align-items-center me-3 shadow-sm"
                                            style={{ width: "48px", height: "48px", border: "1px solid var(--border)" }}
                                        >
                                            {asset.logo ? (
                                                <img
                                                    src={asset.logo}
                                                    alt={asset.symbol || asset.name}
                                                    style={{ width: 32, height: 32, objectFit: 'contain' }}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentNode.textContent = asset.symbol?.charAt(0) || '•';
                                                    }}
                                                />
                                            ) : (
                                                <div className="fw-bold text-primary">{asset.symbol?.charAt(0) ?? '•'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="fw-bold">{asset.name}</div>
                                            <div className="text-muted small d-flex align-items-center">
                                                <span className="badge bg-light text-dark me-2">{asset.symbol}</span>
                                                {shortenAddress(asset.address || '')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex align-items-center gap-2">
                                        <button
                                            className="btn btn-light rounded-circle p-2 shadow-sm border-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopy(asset.address);
                                            }}
                                            title="Copy address"
                                        >
                                            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>content_copy</span>
                                        </button>
                                        <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>chevron_right</span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

export default Receive;