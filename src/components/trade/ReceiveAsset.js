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
        <div>
            <div className="bg-light rounded-5 rounded-top-0 mb-4">
                {/* top bar */}
                <div className="mb-3 mx-auto" style={{ width: "50%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "2px" }}></div>

                <div className="d-flex justify-content-between align-items-center mb-2 p-3">
                    <button className="btn btn-sm" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">keyboard_backspace</span>
                    </button>
                    <h6 className="mb-0">Receive {displayName}</h6>
                    <div style={{ width: 36 }} />
                </div>
            </div>
            <div className="p-4">
                <div className="text-center mb-4">
                    <div style={{ width: 56, height: 56, margin: '0 auto', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                        {asset.logo ? (
                            <img
                                src={asset.logo}
                                alt={asset.wallet_symbol || displayName}
                                style={{ width: 48, height: 48, objectFit: 'contain' }}
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="fw-bold">{(asset.wallet_symbol || displayName || '').charAt(0)}</div>
                        )}
                    </div>

                    <div className="mt-3">
                        <div className="text-muted small">Your {displayName} address</div>
                        <div className="fw-semibold fs-5">{displayAddress}</div>
                    </div>
                </div>

                <div className="d-flex justify-content-center mb-4">
                    <div className="bg-white p-3 rounded" style={{ width: 260, height: 260 }}>
                        {displayAddress ? (
                            <QRCodeSVG value={displayAddress} size={220} />
                        ) : (
                            <div className="text-center text-muted small" style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                No address
                            </div>
                        )}
                    </div>
                </div>

                <div className="d-flex gap-3 justify-content-center mb-3">
                    <Button onClick={handleCopy} className="btn-light flex-grow-1 me-3">
                        <span className="material-symbols-outlined me-2">content_copy</span>
                        Copy
                    </Button>

                    <Button onClick={shareAddress} className="btn-dark flex-grow-1">
                        <span className="material-symbols-outlined me-2">share</span>
                        Share
                    </Button>
                </div>

                <p className="text-muted small text-center mt-4">
                    Send only {displayName} to this address. Incorrect transfers may result in loss of funds.
                </p>
            </div>
        </div>
    )
}

export default ReceiveAsset;