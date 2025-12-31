import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext } from '../../contexts/WalletContext'
import { jsonGet } from '../../helpers/Ajax'
import { shortenAddress } from '../../helpers/StringHelpers'
import toast from 'react-hot-toast';

/* Module-level cache */
const LS_PREFIX = 'wallets_cache_v1_'
const TTL_MS = 5 * 60 * 1000 // 5 minutes

function getCachedData(key) {
    try {
        const raw = localStorage.getItem(LS_PREFIX + key);
        if (!raw) return null;
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts > TTL_MS) {
            localStorage.removeItem(LS_PREFIX + key);
            return null;
        }
        return data;
    } catch (e) {
        return null;
    }
}

function setCachedData(key, data) {
    try {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {
        // ignore
    }
}

import CreateWalletModal from './CreateWalletModal';

function Wallets() {
    const navigate = useNavigate();
    const [walletStore, walletDispatch] = useContext(WalletContext);

    // state for enriched wallets (info + balance)
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function fetchWallets() {
            try {
                setLoadingAssets(true);

                const storeWallets = (walletStore && walletStore.wallets) ? walletStore.wallets : [];
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
                    const wallet_id = w.wallet_id || '';

                    try {
                        // check cache first
                        const cacheKey = `coin_info_${symbol.toLowerCase()}`;
                        let infoData = getCachedData(cacheKey);

                        if (!infoData) {
                            // fetch if not cached
                            const infoResp = await jsonGet(`convert/coinmarketcap/latest/${symbol.toLowerCase()}`);

                            if (infoResp && infoResp.success && infoResp.data) {
                                const d = infoResp.data;
                                if (Array.isArray(d)) {
                                    infoData = d[0];
                                } else if (typeof d === 'object') {
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
                            console.warn(`No info data for symbol ${symbol}`);
                            infoData = {};
                        }
                        console.log('Wallet info data for', symbol, address, infoData);

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

                        // format price as currency
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
                // if (mounted) setAssets(results);
                if (mounted) {
                    // filter out nulls and set
                    setAssets(results.filter(r => r != null));
                }
            } catch (err) {
                console.error('Failed to load wallets info', err);
                // if (mounted) setAssets([]);
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
    }, [walletStore?.wallets?.length]); // depend on length, not object reference

    return (
        <div className="animate-fade-in bg-white" style={{ minHeight: '100vh' }}>

            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            <div className="d-flex border-0 justify-content-between align-items-center px-3 py-2 border-bottom sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">My Assets</h6>
                <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" onClick={() => navigate("/notifications")}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>notifications</span>
                </button>
            </div>

            <div className="p-4">
                {/* Summary Card */}
                <div className="bg-primary rounded-4 p-4 text-white mb-4 shadow-lg position-relative overflow-hidden">
                    <div className="position-absolute end-0 top-0 opacity-25" style={{ fontSize: '100px', transform: 'translate(20%, -20%)' }}>
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                    <small className="opacity-75 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Total Assets</small>
                    <h2 className="fw-bold mb-0 mt-1">{walletStore.total}</h2>
                    <p className="small mb-0 opacity-75">Unique wallet addresses linked</p>
                </div>

                {/* Wallet List */}
                <div className="mb-5">
                    {loadingAssets ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-muted small mt-2">Fetching wallet details...</div>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                            <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>account_balance_wallet</span>
                            <p className="text-muted mt-2">No active wallets found</p>
                            <button className="btn btn-primary btn-sm mt-2 rounded-pill px-4" onClick={() => setIsCreateModalOpen(true)}>Create First Wallet</button>
                        </div>
                    ) : (
                        assets.map((w) => {
                            const changeClass = (Number(w.change) >= 0) ? 'text-success' : 'text-danger';
                            return (
                                <div key={w.id} className="d-flex justify-content-between align-items-center py-3 crypto-card border-bottom" style={{ cursor: "pointer" }} onClick={() => navigate('/wallet/' + w.wallet_id)}>
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 shadow-sm"
                                            style={{ width: 48, height: 48, border: '1px solid #f1f5f9' }}
                                        >
                                            {w.logo ? (
                                                <img
                                                    src={w.logo}
                                                    alt={w.symbol}
                                                    style={{ width: 32, height: 32 }}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentNode.textContent = w.symbol?.charAt(0) || '•';
                                                    }}
                                                />
                                            ) : (
                                                <div className="fw-bold text-primary">{w.symbol?.charAt(0)}</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark">{w.name}</div>
                                            <div className="text-muted small d-flex align-items-center">
                                                <span className="badge bg-light text-dark me-2">{w.symbol}</span>
                                                {shortenAddress(w.address)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <div className="fw-bold text-dark">{w.priceFormatted}</div>
                                        <div className={`small fw-semibold ${changeClass}`}>
                                            {w.change >= 0 ? '+' : ''}{(w.change || 0).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}

                    {/* Add New Wallet Button */}
                    <div className="mt-4">
                        <button
                            className="btn btn-light d-flex align-items-center justify-content-center w-100 py-3 border rounded-4 shadow-sm"
                            style={{ transition: 'all 0.2s', fontWeight: '600' }}
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <span className="material-symbols-outlined me-2 text-primary">add_circle</span>
                            Add New Wallet
                        </button>
                    </div>
                </div>
            </div>

            <CreateWalletModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    )
}

export default Wallets;