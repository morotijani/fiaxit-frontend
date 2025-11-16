import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletContext } from '../../contexts/WalletContext'
import { jsonDelete, jsonGet } from '../../helpers/Ajax'
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

function Wallets() {
    const navigate = useNavigate();
    const [walletStore, walletDispatch] = useContext(WalletContext);

   // state for enriched wallets (info + balance)
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(true);

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
                    const wallet_id = w.wallet_id || 111;

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
        <div>
            <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#eaeae6"}}>
                {/* back button */}
                <button className="btn btn-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">keyboard_backspace</span>
                </button>
                <h5 className="m-0">Manage & add wallets</h5>
                <button className="btn btn-sm" onClick={() => navigate("/notifications")}>
                    <span className="material-symbols-outlined">siren</span>
                </button>
            </div>
            <div className="p-4">
                {/* Header */}
                <div className="text-center mb-2">
                    <h6 className="">
                        My asstes &nbsp;
                        <span className="badge rounded-pill bg-dark">{walletStore.total}</span>
                    </h6>
                    <p className="text-muted small mb-0">View and manage your wallets</p>
                </div>

                {/* Wallet List */}
                <div className="flex-grow-1 overflow-auto">
                    {loadingAssets ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                            <small className="text-muted ms-2">Loading wallets...</small>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="text-center py-3">
                            <small className="text-muted">No wallets found</small>
                        </div>
                    ) : (
                        assets.map((w) => {
                            const changeClass = (Number(w.change) >= 0) ? 'text-success' : 'text-danger';
                            return (
                                <div key={w.id} className="d-flex justify-content-between align-items-center border-bottom py-3" style={{ cursor: "pointer" }} onClick={() => navigate('/wallet/' + w.wallet_id)}>
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                                            style={{ width: 45, height: 45, overflow: 'hidden' }}
                                        >
                                            {w.logo ? (
                                                <img
                                                    src={w.logo}
                                                    alt={w.symbol}
                                                    style={{ width: 36, height: 36, objectFit: 'contain' }}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.style.display = 'none';
                                                        const parent = e.currentTarget.parentNode;
                                                        if (parent) parent.textContent = w.symbol?.charAt(0) || '•';
                                                    }}
                                                />
                                            ) : (
                                                <div className="fw-bold">{w.symbol?.charAt(0)}</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="fw-semibold">{w.name}</div>
                                            <div className="text-muted small">
                                                {w.symbol} • {shortenAddress(w.address)}
                                                {w.error && <span className="text-danger ms-2">(error)</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <div className="fw-semibold">{w.priceFormatted}</div>
                                        <div className={`small ${changeClass}`}>{(w.change || 0).toFixed(2)}%</div>
                                        {/* <div className="small text-muted">Bal: {Number(w.balance || 0)}</div> */}
                                    </div>
                                </div>
                            )
                        })
                    )}

                    {/* Add New Wallet Button */}
                    <div className="text-center py-4">
                        <button
                            className="btn btn-outline-secondary d-flex align-items-center justify-content-center w-100"
                            style={{
                                borderRadius: "15px",
                                fontWeight: "500",
                                padding: "10px 0",
                            }}
                        >
                            <span className="material-symbols-outlined me-2">add_circle</span>
                            Add Wallet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Wallets;