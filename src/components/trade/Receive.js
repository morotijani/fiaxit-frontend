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
        <div>
            <div className="bg-light rounded-5 rounded-top-0 mb-4">
                {/* top bar */}
                <div className="mb-3 mx-auto" style={{ width: "50%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "2px" }}></div>

                <div className="d-flex justify-content-between align-items-center mb-2 p-3">
                    <button className="btn btn-sm" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">keyboard_backspace</span>
                    </button>
                    <h6 className="mb-0">Receive crypto</h6>
                    <button className="btn btn-light btn-sm" onClick={() => navigate('/transactions')}>
                        Activity
                    </button>
                </div>
            </div>

            <div className="p-4">
                {/* Header */}
                <div className="text-center mb-2">
                    <h6 className="">
                        My asstes &nbsp;
                        <span className="badge rounded-pill bg-dark">{walletStore?.total ?? 0}</span>
                    </h6>
                    <p className="text-muted small mb-0">View and receive funds on your wallets</p>
                </div>

                {/* Assets List */}
                <div className="flex-grow-1 overflow-auto">
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
                                    className="bg-[#16181D] rounded-xl border border-[#26282D] p-4 cursor-pointer hover:bg-[#1C1E24] mb-3 rounded-3"
                                    onClick={() => navigate(`/trade/receive/${asset.wallet_id ?? asset.id}`)}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="text-gray-300 text-sm fw-bold mb-1">Your {asset.name} address</p>
                                            <p className="text-lg mb-2">{shortenAddress(asset.address || '')}</p>

                                            <div className="d-flex align-items-center gap-2 mt-2">
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
                                        </div>

                                        {/* Buttons */}
                                        <div className="d-flex align-items-center gap-3">
                                            <Button variant=""
                                                className="btn-light rounded-circle"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/trade/receive/${asset.wallet_id ?? asset.id}`);
                                                }}
                                                title="Show QR"
                                            >
                                                <span className="material-symbols-outlined fs-3 fw-normal">qr_code_2</span>
                                            </Button>

                                            <Button variant=""
                                                className="btn-light rounded-circle"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopy(asset.address);
                                                }}
                                                title="Copy address"
                                            >
                                                <span className="material-symbols-outlined fs-3 fw-normal">content_copy</span>
                                            </Button>
                                        </div>
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