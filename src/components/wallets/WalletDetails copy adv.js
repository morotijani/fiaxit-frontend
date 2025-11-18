// ...existing code...
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jsonGet } from '../../helpers/Ajax'
import { shortenAddress, useCopyToClipboard } from '../../helpers/StringHelpers'
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

/*
  Changes:
  - Added module-level inflight request deduplication (INFLIGHT map)
  - Tuned TTLs: INFO_TTL_MIN = 10, TX_TTL_MIN = 5
  - fetchWithCache utility returns cached/stale data on 429/network errors
  - Uses fetchWithCache for wallet info refreshes to avoid duplicated calls during navigation/page refresh
*/

const INFO_TTL_MIN = 10; // minutes for wallet info
const TX_TTL_MIN = 5;    // minutes for transactions/quick data
const CACHE_PREFIX = 'wallet_info_cache_v2_';

const INFLIGHT = new Map(); // key -> Promise

function makeKey(key) {
    return `${CACHE_PREFIX}${key}`;
}

function setLocalCache(key, data, ttlInMinutes = INFO_TTL_MIN) {
    try {
        const expiresAt = Date.now() + ttlInMinutes * 60 * 1000;
        localStorage.setItem(makeKey(key), JSON.stringify({ data, expiresAt }));
    } catch (err) {
        console.error('setLocalCache error', err);
    }
}

function getLocalCache(key) {
    try {
        const raw = localStorage.getItem(makeKey(key));
        if (!raw) return null;
        const { data, expiresAt } = JSON.parse(raw);
        if (!expiresAt || Date.now() > expiresAt) {
            localStorage.removeItem(makeKey(key));
            return null;
        }
        return data;
    } catch (err) {
        console.error('getLocalCache error', err);
        return null;
    }
}

/**
 * fetchWithCache(key, ttlMinutes, fetcher)
 * - returns cached data if fresh
 * - deduplicates inflight requests per key
 * - on error (429/network) returns stale cache if available
 */
async function fetchWithCache(key, ttlMinutes, fetcher) {
    const cacheKey = makeKey(key);
    // if cached and fresh, return
    const cached = getLocalCache(key);
    if (cached) return cached;

    // return inflight promise if exists
    const inflight = INFLIGHT.get(key);
    if (inflight) return inflight;

    const p = (async () => {
        try {
            const respData = await fetcher();
            if (respData != null) {
                setLocalCache(key, respData, ttlMinutes);
                return respData;
            }
            // if fetcher returned null, try returning stale cache (rare here)
            const stale = localStorage.getItem(cacheKey);
            if (stale) {
                try {
                    return JSON.parse(stale).data;
                } catch (e) {
                    return null;
                }
            }
            return null;
        } catch (err) {
            // if rate limited or network error, return stale if present
            const msg = String(err?.message || '').toLowerCase();
            if (msg.includes('429') || msg.includes('rate') || msg.includes('network') || msg.includes('failed to fetch')) {
                const staleRaw = localStorage.getItem(cacheKey);
                if (staleRaw) {
                    try {
                        return JSON.parse(staleRaw).data;
                    } catch (e) {
                        // fallthrough
                    }
                }
            }
            throw err;
        } finally {
            // cleanup inflight
            INFLIGHT.delete(key);
        }
    })();

    INFLIGHT.set(key, p);
    return p;
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
    const [isCopied, copyToClipboard] = useCopyToClipboard();
    let { id } = useParams();

    const [assets, setAssets] = useState([]);
    const [loadingWallet, setLoadingWallet] = useState(true);

    async function fetchWalletById(id) {
        try {
            const resp = await jsonGet(`wallets/${id}`);
            if (resp && resp.success) return resp.wallet || null;
        } catch (err) {
            console.error('fetchWalletById error', err);
        }
        return null;
    }

    async function convertCryptoToFiat(amount, fromCurrency, toCurrency) {
        try {
            const resp = await jsonGet(`convert/${fromCurrency}/${toCurrency}/${amount}/crypto-to-fiat`);
            return resp?.data?.to?.amount || 0;
        } catch (err) {
            console.warn('convertCryptoToFiat failed', err);
            return 0;
        }
    }

    useEffect(() => {
        let mounted = true;

        (async function startup() {
            setLoadingWallet(true);
            try {
                const w = await fetchWalletById(id);
                if (!w) {
                    toast.error('Wallet not found!', { duration: 5000 });
                    navigate('/wallets');
                    if (mounted) setLoadingWallet(false);
                    return;
                }

                const symbol = (w.wallet_symbol || '').toLowerCase();
                const address = w.wallet_address || '';
                const cacheKey = `wallet_${w.wallet_id}_info`;

                // try cached data first (fast)
                const cached = getLocalCache(cacheKey);
                if (cached && mounted) {
                    setAssets([{ ...w, rawInfo: cached }]);
                    setLoadingWallet(false);

                    // schedule background refresh using fetchWithCache to dedupe if multiple tabs/navigations occur
                    fetchWithCache(cacheKey, INFO_TTL_MIN, async () => {
                        const resp = await jsonGet(`wallets/${symbol}/${address}/info`);
                        if (resp && resp.success) return resp.data;
                        throw new Error(resp?.message || 'info fetch failed');
                    }).then((fresh) => {
                        if (mounted && fresh) {
                            setAssets([{ ...w, rawInfo: fresh }]);
                        }
                    }).catch((err) => {
                        // don't surface background errors
                        console.warn('background wallet refresh failed', err?.message ?? err);
                    });

                    return; // UI served from cache while background refresh runs
                }

                // no fresh cache: fetch with dedupe
                try {
                    const infoData = await fetchWithCache(cacheKey, INFO_TTL_MIN, async () => {
                        const resp = await jsonGet(`wallets/${symbol}/${address}/info`);
                        if (resp && resp.success) return resp.data;
                        throw new Error(resp?.message || 'info endpoint failed');
                    });

                    // infoData might be stale-from-cache or fresh; normalize
                    const info = infoData || {};
                    if (!info.balance) info.balance = {};

                    if (symbol === 'eth') {
                        let balance = 0;
                        if (info.balance && info.balance.ether != null) {
                            balance = Number(info.balance.ether) || 0;
                        } else if (info.balance && info.balance.total != null) {
                            balance = Number(info.balance.total) || 0;
                        }
                        info.balance.total = balance;
                        info.balance.fiat = await convertCryptoToFiat(balance, w.wallet_crypto_name || 'ethereum', 'usd');
                        info.balance.fiatFormatted = `$${(Number(info.balance.fiat) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        info.txCount = info.transactionCount || (Array.isArray(info.transactions) ? info.transactions.length : info.txCount || 0);
                        info.totalSent = info.totalSentEth ?? info.totalSent ?? 0;
                        info.totalReceived = info.totalReceivedEth ?? info.totalReceived ?? 0;
                    } else if (symbol === 'btc') {
                        let balance = 0;
                        if (info.balance && info.balance.total != null) {
                            balance = Number(info.balance.total) || 0;
                        } else if (info.balance != null && typeof info.balance === 'number') {
                            balance = Number(info.balance) || 0;
                        }
                        info.balance.total = balance;
                        info.balance.fiat = await convertCryptoToFiat(balance, w.wallet_crypto_name || 'bitcoin', 'usd');
                        info.balance.fiatFormatted = `$${(Number(info.balance.fiat) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        info.txCount = info.txCount || (Array.isArray(info.transactions) ? info.transactions.length : 0);
                    } else {
                        const b = info.balance ?? info;
                        const potential = Number(b?.total ?? b?.amount ?? b?.balance ?? 0) || 0;
                        info.balance = info.balance || {};
                        info.balance.total = potential;
                        info.balance.fiat = await convertCryptoToFiat(potential, w.wallet_crypto_name || symbol, 'usd');
                        info.balance.fiatFormatted = `$${(Number(info.balance.fiat) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        info.txCount = info.txCount || (Array.isArray(info.transactions) ? info.transactions.length : 0);
                    }

                    if (mounted) {
                        setAssets([{ ...w, rawInfo: info }]);
                        setLoadingWallet(false);
                    }
                } catch (err) {
                    console.error('Error fetching wallet info:', err);
                    // attempt to recover from any stale local cache
                    const stale = getLocalCache(cacheKey);
                    if (stale && mounted) {
                        setAssets([{ ...w, rawInfo: stale }]);
                        toast('Using cached wallet data due to API error', { icon: '⚠️' });
                    } else {
                        toast.error('Failed to load wallet info', { duration: 6000 });
                    }
                    if (mounted) setLoadingWallet(false);
                }
            } catch (err) {
                console.error('WalletDetails startup error', err);
                if (mounted) {
                    toast.error('Unexpected error', { duration: 6000 });
                    setLoadingWallet(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleCopy = () => {
        const addr = assets[0]?.wallet_address || '';
        copyToClipboard(addr);
        toast.success('Address copied', { duration: 2000 });
    };

    // small helper to render safe fields
    const safeFiat = (t) => t?.rawInfo?.balance?.fiatFormatted ?? '$0.00';
    const safeTotalBalance = (t) => Number(t?.rawInfo?.balance?.total ?? 0);

    return (
        <div>
            <div className="bg-light rounded-5 rounded-top-0 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2 p-3">
                    <button className="btn btn-sm" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">keyboard_backspace</span>
                    </button>
                    <h6 className="mb-0">{assets[0]?.rawInfo?.wallet_name || assets[0]?.wallet_id || 'Wallet'}</h6>
                    <button className="btn btn-light btn-sm" onClick={() => navigate('/deposit')}>
                        Deposit
                    </button>
                </div>

                {loadingWallet ? (
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                        <small className="text-muted ms-2">Loading wallet info...</small>
                    </div>
                ) : (
                    (assets.length ? assets : []).map((t) => {
                        return (
                            <div key={t.wallet_id}>
                                <div className="text-center text-muted small mt-2">
                                    <span
                                        className={`badge bg-${isCopied ? 'info' : 'dark'} bg-opacity-10 text-dark rounded-pill px-3 py-2 fw-normal fs-6`}
                                        onClick={handleCopy}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {shortenAddress(t.wallet_address)}&nbsp;&nbsp;<i className="bi bi-back"></i>
                                    </span>
                                </div>

                                {/* Balance */}
                                <div className="text-center my-3">
                                    <h3 className="fw-bold fs-2">{safeFiat(t)}</h3>
                                    <div className="small text-muted d-flex justify-content-between fw-semibold p-3">
                                        <div className="p-1">Total Sent: <span className="text-warning">{t.rawInfo?.totalSent ?? 0} {t.wallet_symbol}</span></div>
                                        <div className="p-1">Total Received: <span className="text-success">{t.rawInfo?.totalReceived ?? 0} {t.wallet_symbol}</span></div>
                                    </div>
                                    <div className="small text-muted">Bal: {safeTotalBalance(t)} {t.wallet_symbol}</div>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex justify-content-around my-3 pb-3">
                                    <div className="text-center">
                                        <div
                                            className="rounded-circle d-flex justify-content-center align-items-center mb-1"
                                            style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6" }}
                                        >
                                            <i className="bi bi-arrow-up-left"></i>
                                        </div>
                                        <small>Send</small>
                                    </div>
                                    <div className="text-center">
                                        <div
                                            className="rounded-circle d-flex justify-content-center align-items-center mb-1"
                                            style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6" }}
                                        >
                                            <i className="bi bi-arrow-down-left"></i>
                                        </div>
                                        <small>Request</small>
                                    </div>
                                    <div className="text-center">
                                        <div
                                            className="rounded-circle d-flex justify-content-center align-items-center mb-1"
                                            style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6" }}
                                        >
                                            <i className="bi bi-arrow-left-right"></i>
                                        </div>
                                        <small>Swap</small>
                                    </div>
                                    <div className="text-center">
                                        <div
                                            className="rounded-circle d-flex justify-content-center align-items-center mb-1"
                                            style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6" }}
                                        >
                                            <i className="bi bi-three-dots-vertical"></i>
                                        </div>
                                        <small>More</small>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <div className="p-4">
                {loadingWallet ? (
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                        <small className="text-muted ms-2">Loading wallet transactions...</small>
                    </div>
                ) : (
                    (assets.length ? assets : []).map((t) => {
                        const txs = Array.isArray(t.rawInfo?.transactions) ? t.rawInfo.transactions : [];
                        return (
                            <div key={t.wallet_id}>
                                {/* Header */}
                                <div className="text-center mb-2">
                                    <h6 className="">Wallet transactions &nbsp;
                                        <span className="badge rounded-pill bg-dark">{t.rawInfo?.txCount ?? txs.length ?? 0}</span>
                                    </h6>
                                    <p className="text-muted small mb-0">View and manage your wallets</p>
                                </div>

                                {txs.length ? (
                                    txs.map((tx, index) => {
                                        // amount detection
                                        const rawAmount = tx?.amount ?? tx?.value ?? tx?.total ?? 0;
                                        const amountNum = Number(rawAmount) || 0;
                                        const isSent = amountNum < 0;

                                        // addresses - guard arrays
                                        let toAddress = '';
                                        if (Array.isArray(tx?.outputs) && tx.outputs.length > 0) {
                                            toAddress = Array.isArray(tx.outputs[0].addresses) ? tx.outputs[0].addresses[0] : tx.outputs[0].addresses;
                                        } else if (Array.isArray(tx?.inputs) && tx.inputs.length > 0) {
                                            toAddress = Array.isArray(tx.inputs[0].addresses) ? tx.inputs[0].addresses[0] : tx.inputs[0].addresses;
                                        } else {
                                            toAddress = tx?.to ?? tx?.to_address ?? '';
                                        }

                                        const time = tx?.timestamp ?? tx?.time ?? tx?.received_at ?? tx?.date ?? null;
                                        const displayTime = time ? timeAgo(time) : '';

                                        // status
                                        const statusIsConfirmed = Boolean(tx?.status || (tx?.confirmations && Number(tx.confirmations) > 0));
                                        const statusText = statusIsConfirmed ? 'Confirmed' : 'Pending';

                                        const displayAmount = (Math.abs(amountNum) || rawAmount) ;

                                        return (
                                            <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-3">
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${isSent ? "bg-danger-subtle" : "bg-success-subtle"}`}
                                                        style={{ width: 40, height: 40 }}
                                                    >
                                                        {isSent ? (
                                                            <span className="material-symbols-outlined text-danger">arrow_upward</span>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-success">arrow_downward</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{shortenAddress(String(toAddress || ''))}</div>
                                                        <div className="text-muted small">{displayTime}</div>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className={`fw-semibold ${isSent ? "text-danger" : "text-success"}`}>
                                                        {displayAmount}
                                                    </div>
                                                    <div className="small">
                                                        {statusText}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center text-muted py-3">
                                        No transactions found.
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default WalletDetails;