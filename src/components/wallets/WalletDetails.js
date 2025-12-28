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
        <div className="animate-fade-in pb-5">
            {/* Header & Balance Card */}
            <div className="bg-white rounded-5 rounded-top-0 mb-4 shadow-sm border-bottom pb-4">
                {/* Top bar handle */}
                <div className="mb-2 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

                {/* Header Navigation */}
                <div className="d-flex justify-content-between align-items-center px-3 py-2">
                    <button
                        className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                        onClick={() => navigate(-1)}
                        style={{ width: '40px', height: '40px' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                    </button>
                    <h6 className="mb-0 fw-bold">{assets[0]?.rawInfo?.wallet_name || assets[0]?.wallet_id || 'Wallet Details'}</h6>
                    <button
                        className="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
                        onClick={() => navigate('/deposit')}
                        style={{ fontSize: '0.8rem' }}
                    >
                        Deposit
                    </button>
                </div>

                {loadingWallet ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" />
                        <div className="text-muted small mt-2">Syncing wallet data...</div>
                    </div>
                ) : (
                    assets.map((t) => (
                        <div key={t.wallet_id}>
                            {/* Address Badge */}
                            <div className="text-center mt-3">
                                <span
                                    className={`badge bg-${isCopied ? 'success' : 'light'} bg-opacity-75 text-dark rounded-pill px-3 py-2 fw-semibold fs-7 border shadow-inner`}
                                    onClick={handleCopy}
                                    style={{ cursor: 'pointer', letterSpacing: '0.5px' }}
                                >
                                    <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '14px' }}>content_copy</span>
                                    {shortenAddress(t.wallet_address)}
                                </span>
                            </div>

                            {/* Balance Display */}
                            <div className="text-center my-4">
                                <small className="text-muted text-uppercase fw-bold" style={{ letterSpacing: '1.5px', fontSize: '0.7rem' }}>Total Balance</small>
                                <div className="balance-amount my-1 text-primary">
                                    {safeFiat(t)}
                                </div>
                                <div className="d-inline-flex align-items-center px-3 py-1 bg-light rounded-pill border">
                                    <span className="fw-bold text-dark">{safeTotalBalance(t)} {t.wallet_symbol}</span>
                                </div>
                            </div>

                            {/* Stats Strip */}
                            <div className="px-4 mb-4">
                                <div className="row g-2">
                                    <div className="col-6">
                                        <div className="bg-light rounded-4 p-3 text-center border shadow-inner">
                                            <div className="text-muted small mb-1">Sent</div>
                                            <div className="fw-bold text-danger">{t.rawInfo?.totalSent ?? 0} {t.wallet_symbol}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-light rounded-4 p-3 text-center border shadow-inner">
                                            <div className="text-muted small mb-1">Received</div>
                                            <div className="fw-bold text-success">{t.rawInfo?.totalReceived ?? 0} {t.wallet_symbol}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex justify-content-around px-2">
                                {[
                                    { icon: 'send', label: 'Send', route: `/trade/send/${t.wallet_id}`, color: '#0052ff' },
                                    { icon: 'download', label: 'Request', route: `/trade/receive/${t.wallet_id}`, color: '#098551' },
                                    { icon: 'swap_horiz', label: 'Swap', route: `/trade/swap/${t.wallet_id}`, color: '#0052ff' },
                                    { icon: 'more_vert', label: 'More', route: '#!', color: '#5b616e' }
                                ].map((act, i) => (
                                    <div key={i} className="text-center" style={{ cursor: 'pointer' }} onClick={() => act.route !== '#!' && navigate(act.route)}>
                                        <div
                                            className="rounded-circle d-flex justify-content-center align-items-center shadow-sm mx-auto mb-2 bg-white crypto-card"
                                            style={{ width: "52px", height: "52px", border: '1px solid #f1f5f9' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ color: act.color, fontSize: '24px' }}>{act.icon}</span>
                                        </div>
                                        <small className="fw-bold text-muted small">{act.label}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Transactions Section */}
            <div className="px-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Transaction History</h6>
                    {!loadingWallet && assets[0]?.rawInfo && (
                        <span className="badge rounded-pill bg-light text-dark border fw-bold">
                            {assets[0].rawInfo.txCount ?? (Array.isArray(assets[0].rawInfo.transactions) ? assets[0].rawInfo.transactions.length : 0)}
                        </span>
                    )}
                </div>

                <div className="bg-white rounded-5 p-2 shadow-sm border overflow-hidden">
                    {loadingWallet ? (
                        <div className="text-center py-5">
                            <div className="spinner-border spinner-border-sm text-secondary mb-2" role="status" />
                            <div className="text-muted small">Loading history...</div>
                        </div>
                    ) : (
                        assets.map((t) => {
                            const txs = Array.isArray(t.rawInfo?.transactions) ? t.rawInfo.transactions : [];
                            if (!txs.length) {
                                return (
                                    <div key="no-tx" className="text-center py-5">
                                        <div className="text-muted small">No transactions found for this wallet.</div>
                                    </div>
                                );
                            }

                            return txs.map((tx, index) => {
                                const rawAmount = tx?.amount ?? tx?.value ?? tx?.total ?? 0;
                                const amountNum = Number(rawAmount) || 0;

                                // Improved isSent detection: check type first, then from-address, then fallback to numeric sign
                                const isSent = tx.type === 'sent' ||
                                    (tx.from && String(tx.from).toLowerCase() === String(t.wallet_address).toLowerCase()) ||
                                    amountNum < 0;

                                let toAddress = '';
                                if (Array.isArray(tx?.outputs) && tx.outputs.length > 0) {
                                    toAddress = Array.isArray(tx.outputs[0].addresses) ? tx.outputs[0].addresses[0] : tx.outputs[0].addresses;
                                } else if (Array.isArray(tx?.inputs) && tx.inputs.length > 0) {
                                    toAddress = Array.isArray(tx.inputs[0].addresses) ? tx.inputs[0].addresses[0] : tx.inputs[0].addresses;
                                } else {
                                    toAddress = tx?.to ?? tx?.to_address ?? '';
                                }

                                const time = tx?.timestamp ?? tx?.time ?? tx?.received_at ?? tx?.date ?? null;
                                const displayTime = time ? timeAgo(time) : 'Unknown time';
                                const statusIsConfirmed = Boolean(tx?.status || (tx?.confirmations && Number(tx.confirmations) > 0));

                                return (
                                    <div key={index} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 border-0 rounded-4 crypto-card mb-1">
                                        <div className="d-flex align-items-center">
                                            <div
                                                className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${isSent ? "bg-danger-subtle" : "bg-success-subtle"}`}
                                                style={{ width: 44, height: 44, border: '1px solid rgba(0,0,0,0.05)' }}
                                            >
                                                <span className={`material-symbols-outlined ${isSent ? "text-danger" : "text-success"}`} style={{ fontSize: '20px' }}>
                                                    {isSent ? "vertical_align_top" : "vertical_align_bottom"}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{shortenAddress(String(toAddress || ''))}</div>
                                                <div className="text-muted small d-flex align-items-center">
                                                    {displayTime}
                                                    <span className="mx-1">•</span>
                                                    <span className={statusIsConfirmed ? "text-success fw-semibold" : "text-warning fw-semibold"}>
                                                        {statusIsConfirmed ? "Confirmed" : "Pending"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className={`fw-bold ${isSent ? "text-dark" : "text-success"}`} style={{ fontSize: '0.95rem' }}>
                                                {isSent ? '-' : '+'}{Math.abs(amountNum)} {t.wallet_symbol}
                                            </div>
                                            <div className="text-muted small">
                                                {statusIsConfirmed && <span className="material-symbols-outlined align-middle" style={{ fontSize: '14px' }}>verified</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default WalletDetails;