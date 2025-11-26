import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { WalletContext } from '../../contexts/WalletContext'
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
    const [walletStore, walletDispatch] = useContext(WalletContext);
    const rates = walletStore.rates || {}; // get current rates from store
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
                const address = w.wallet_address ?? '';
                const cacheKey = `wallet_info_${w.wallet_id}`;

                // try cached data first
                const cached = getCachedData(cacheKey);
                if (cached && mounted) {
                    setAssets([{ ...w, rawInfo: cached }]);
                    setLoadingWallet(false);
                    // continue to refresh in background (non-blocking)
                    (async () => {
                        try {
                            const resp = await jsonGet(`wallets/${symbol}/${address}/info`);
                            if (resp && resp.success && resp.data) {
                                console.log('response wallet details next cache', resp)
                                // fiat and fiat formatted normalization
                                resp.data.balance = resp.data.balance || {};

                                if (symbol === 'eth' && resp.data.balance.ether != null) {
                                    resp.data.balance.total = Number(resp.data.balance.ether) || 0;
                                } 
                                
                                // else if (symbol === 'btc' && resp.data.balance != null && typeof resp.data.balance === 'number') {
                                //     resp.data.balance.total = Number(resp.data.balance.total) || 0;
                                // }

                                if (resp.data.balance.total != null) {
                                    let rateEntry = rates[symbol.toUpperCase()];
                                    const rateUsd = (rateEntry && typeof rateEntry === 'object' && typeof rateEntry.usd === 'number')
                                    ? rateEntry.usd
                                    : (typeof rateEntry === 'number' ? rateEntry : 0);
                                    resp.data.balance.fiat = resp.data.balance.total * rateUsd;

                                    resp.data.balance.fiatFormatted = `$${(Number(resp.data.balance.fiat) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                }

                                setCachedData(cacheKey, resp.data, DEFAULT_CACHE_TTL_MIN);
                                if (mounted) setAssets([{ ...w, rawInfo: resp.data }]);
                            }
                        } catch (err) {
                            // ignore background refresh errors
                            console.warn('Background wallet info refresh failed', err);
                        }
                    })();
                    return; // early return: UI served from cache
                }

                // no cache: fetch and process
                try {
                    const infoResp = await jsonGet(`wallets/${symbol}/${address}/info`);
                    if (!infoResp || !infoResp.success) {
                        throw new Error(infoResp?.message || 'info endpoint failed');
                    }
                    const infoData = infoResp.data || {};

                    // normalize balance fields safely
                    if (!infoData.balance) infoData.balance = {};

                    // handle common coins robustly (guard objects)
                    if (symbol === 'eth') {
                        let balance = 0;
                        if (infoData.balance && infoData.balance.ether != null) {
                            balance = Number(infoData.balance.ether) || 0;
                        } else if (infoData.balance && infoData.balance.total != null) {
                            balance = Number(infoData.balance.total) || 0;
                        }
                        infoData.balance.total = balance;

                        let rateEntry = rates['ETH'];
                        const rateUsd = (rateEntry && typeof rateEntry === 'object' && typeof rateEntry.usd === 'number')
                        ? rateEntry.usd
                        : (typeof rateEntry === 'number' ? rateEntry : 0);
                        infoData.balance.fiat = balance * rateUsd;

                        infoData.balance.fiatFormatted = `$${(Number(infoData.balance.fiat) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        infoData.txCount = infoData.transactionCount || (Array.isArray(infoData.transactions) ? infoData.transactions.length : infoData.txCount || 0);
                        infoData.totalSent = infoData.totalSentEth ?? infoData.totalSent ?? 0;
                        infoData.totalReceived = infoData.totalReceivedEth ?? infoData.totalReceived ?? 0;
                    } else if (symbol === 'btc') {
                        let balance = 0;
                        if (infoData.balance && infoData.balance.total != null) {
                            balance = Number(infoData.balance.total) || 0;
                        } else if (infoData.balance != null && typeof infoData.balance === 'number') {
                            balance = Number(infoData.balance) || 0;
                        }
                        infoData.balance.total = balance;

                        let rateEntry = rates['BTC'];
                        const rateUsd = (rateEntry && typeof rateEntry === 'object' && typeof rateEntry.usd === 'number')
                        ? rateEntry.usd
                        : (typeof rateEntry === 'number' ? rateEntry : 0);
                        infoData.balance.fiat = balance * rateUsd;


                        infoData.balance.fiatFormatted = `$${(Number(infoData.balance.fiat) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        infoData.txCount = infoData.txCount || (Array.isArray(infoData.transactions) ? infoData.transactions.length : 0);
                    } else {
                        // generic: try to pull first numeric balance field
                        const b = infoData.balance ?? infoData;
                        const potential = Number(b?.total ?? b?.amount ?? b?.balance ?? 0) || 0;
                        infoData.balance = infoData.balance || {};
                        infoData.balance.total = potential;

                        let rateEntry = rates['ETH'];
                        const rateUsd = (rateEntry && typeof rateEntry === 'object' && typeof rateEntry.usd === 'number')
                        ? rateEntry.usd
                        : (typeof rateEntry === 'number' ? rateEntry : 0);
                        infoData.balance.fiat = potential * rateUsd;

                        infoData.balance.fiatFormatted = `$${(Number(infoData.balance.fiat) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        infoData.txCount = infoData.txCount || (Array.isArray(infoData.transactions) ? infoData.transactions.length : 0);
                    }

                    // store cache
                    setCachedData(cacheKey, infoData, DEFAULT_CACHE_TTL_MIN);

                    if (mounted) {
                        setAssets([{ ...w, rawInfo: infoData }]);
                        setLoadingWallet(false);
                    }
                } catch (err) {
                    // network or API error: try to use cached fallback (if any) else show error
                    console.error('Error fetching wallet info:', err);
                    if (cached && mounted) {
                        setAssets([{ ...w, rawInfo: cached }]);
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
                                            style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6", cursor: 'pointer' }}
                                            onClick={() => navigate(`/trade/receive/${t.wallet_id}`)}
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