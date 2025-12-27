import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jsonGet } from '../../helpers/Ajax'
import Button from '../elements/Button'
import { useCopyToClipboard } from '../../helpers/StringHelpers'
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const CACHE_PREFIX = 'receive_asset_cache_v1_';
const DEFAULT_CACHE_TTL_MIN = 5; // minutes

function setCachedData(key, data, ttlInMinutes = DEFAULT_CACHE_TTL_MIN) {
    try {
        const expiresAt = Date.now() + ttlInMinutes * 60 * 1000;
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, expiresAt }));
    } catch (err) {
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

async function fetchAssetById(id) {
    try {
        const resp = await jsonGet(`wallets/${id}`);
        if (resp && resp.success) return resp.wallet || null;
    } catch (err) {
        console.error('fetchAssetById error', err);
    }
    return null;
}

async function fetchCoinInfo(symbol) {
    if (!symbol) return null;
    const cacheKey = `coin_${symbol.toLowerCase()}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    try {
        const infoResp = await jsonGet(`convert/coinmarketcap/latest/${symbol.toLowerCase()}`);
        if (infoResp && infoResp.success && infoResp.data) {
            const d = infoResp.data;
            let infoData = null;
            if (Array.isArray(d)) infoData = d[0];
            else if (d && typeof d === 'object') {
                const keys = Object.keys(d);
                if (keys.length === 1 && d[keys[0]]) infoData = d[keys[0]];
                else infoData = d;
            } else infoData = d;
            if (infoData) setCachedData(cacheKey, infoData, DEFAULT_CACHE_TTL_MIN);
            return infoData;
        }
    } catch (err) {
        console.error('fetchCoinInfo error', err);
    }
    return null;
}


function ReceiveAsset() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCopied, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);
            try {
                if (!id) {
                    toast.error('Invalid asset id');
                    navigate('/wallets');
                    return;
                }

                const w = await fetchAssetById(id);
                if (!w) {
                    toast.error('Wallet not found!', { duration: 4000 });
                    navigate('/wallets');
                    return;
                }

                const symbol = (w.wallet_symbol || '').toLowerCase();
                const coinInfo = await fetchCoinInfo(symbol);

                const logo = coinInfo?.logo || coinInfo?.logo_url || coinInfo?.icon ||
                    (coinInfo?.id ? `https://s2.coinmarketcap.com/static/img/coins/64x64/${coinInfo.id}.png` : null);

                const normalized = {
                    wallet_id: w.wallet_id ?? w.id ?? id,
                    wallet_address: w.wallet_address ?? w.address ?? '',
                    wallet_symbol: w.wallet_symbol ?? w.symbol ?? symbol,
                    wallet_name: w.wallet_name ?? w.name ?? (coinInfo?.name || symbol?.toUpperCase()),
                    rawInfo: coinInfo || {},
                    logo
                };

                if (mounted) setAsset(normalized);
            } catch (err) {
                console.error('ReceiveAsset startup error', err);
                toast.error('Failed to load asset', { duration: 4000 });
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);


    const handleCopy = () => {
        const addr = asset?.wallet_address || '';
        if (!addr) {
            toast.error('No address to copy');
            return;
        }
        copyToClipboard(addr);
        toast.success('Address copied', { duration: 2000 });
    };

    const shareAddress = async () => {
        if (!asset) return;
        const text = `${asset.wallet_name || asset.wallet_symbol} Address:\n${asset.wallet_address}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: `${asset.wallet_name || 'Address'}`, text });
            } else {
                // fallback: copy to clipboard and inform user
                copyToClipboard(text);
                toast.success('Address copied to clipboard (share unavailable)', { duration: 3000 });
            }
        } catch (err) {
            console.error('shareAddress error', err);
            toast.error('Share failed');
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="spinner-border text-secondary" role="status" />
                <div className="mt-2 text-muted small">Loading asset...</div>
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="p-4 text-center">
                <div className="text-muted">Asset not available</div>
            </div>
        );
    }

    const displayAddress = asset.wallet_address || '';
    const displayName = asset.wallet_name || asset.wallet_symbol?.toUpperCase() || 'Asset';

    return (
        <div className="animate-fade-in">
            {/* Top Handle for App-like feel */}
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            {/* Header / Top Bar */}
            <div className="p-3 border-0 border-bottom d-flex align-items-center justify-content-between sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Receive {asset.wallet_symbol}</h6>
                <div style={{ width: 40 }} /> {/* Spacer to center the title */}
            </div>

            <div className="p-4">
                {/* Asset Identity */}
                <div className="text-center mb-4">
                    <div
                        className="d-inline-flex align-items-center justify-content-center bg-white shadow-sm mb-3"
                        style={{ width: '72px', height: '72px', borderRadius: '18px', border: '1px solid var(--border)', overflow: 'hidden' }}
                    >
                        {asset.logo ? (
                            <img
                                src={asset.logo}
                                alt={displayName}
                                style={{ width: 48, height: 48, objectFit: 'contain' }}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentNode.textContent = asset.wallet_symbol?.charAt(0) || '•';
                                }}
                            />
                        ) : (
                            <div className="fw-bold text-primary fs-3">{(asset.wallet_symbol || '').charAt(0)}</div>
                        )}
                    </div>
                    <h5 className="fw-bold mb-1">{displayName}</h5>
                    <div className="badge rounded-pill bg-light text-muted border px-3 py-1 fw-normal">
                        Mainnet Network
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="d-flex justify-content-center mb-4">
                    <div className="bg-white p-4 rounded-4 shadow-sm border" style={{ width: '260px', height: '260px' }}>
                        {displayAddress ? (
                            <div className="d-flex align-items-center justify-content-center w-100 h-100">
                                <QRCodeSVG
                                    value={displayAddress}
                                    size={210}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="var(--text-main, #000)"
                                    bgColor="transparent"
                                />
                            </div>
                        ) : (
                            <div className="text-center text-muted small h-100 d-flex align-items-center justify-content-center">
                                Address not available
                            </div>
                        )}
                    </div>
                </div>

                {/* Address Display */}
                <div className="bg-light rounded-4 p-3 mb-4 border border-dashed">
                    <div className="text-muted small text-center mb-2 fw-semibold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                        Your Deposit Address
                    </div>
                    <div
                        className="text-center fw-bold text-break px-2"
                        style={{ fontSize: '0.95rem', color: 'var(--text-main)', cursor: 'pointer' }}
                        onClick={handleCopy}
                    >
                        {displayAddress}
                    </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-3 mb-4">
                    <button
                        onClick={handleCopy}
                        className="btn btn-primary flex-grow-1 rounded-pill py-3 d-flex align-items-center justify-content-center shadow-sm"
                        style={{ fontWeight: '600' }}
                    >
                        <span className="material-symbols-outlined me-2">content_copy</span>
                        Copy
                    </button>
                    <button
                        onClick={shareAddress}
                        className="btn btn-light flex-grow-1 rounded-pill py-3 d-flex align-items-center justify-content-center shadow-sm border"
                        style={{ fontWeight: '600' }}
                    >
                        <span className="material-symbols-outlined me-2">share</span>
                        Share
                    </button>
                </div>

                {/* Warning Card */}
                <div className="alert alert-warning border-0 rounded-4 p-3 d-flex align-items-start mb-5" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                    <span className="material-symbols-outlined text-warning me-2" style={{ fontSize: '20px' }}>warning</span>
                    <div className="small text-dark-emphasis">
                        <strong>Important:</strong> Send only <strong>{displayName} ({asset.wallet_symbol})</strong> to this address. Sending any other asset may result in permanent loss of funds.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReceiveAsset;