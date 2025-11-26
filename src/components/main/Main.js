import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import { WalletContext } from '../../contexts/WalletContext'
import Avatar from '../../assets/avatar.jpeg'
import { jsonGet } from '../../helpers/Ajax'

function Main() {
    const [authStore, authDispatch] = useContext(AuthContext);
    const [walletStore, walletDispatch] = useContext(WalletContext);
    const navigate = useNavigate();

    
    // create greeting function based on time of day
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning!";
        if (hour < 18) return "Good afternoon!";
        return "Good evening!";
    }

    const [userBalance, setUserBalance] = useState(0);
    const [loadingBalance, setLoadingBalance] = useState(false);
    useEffect(() => {
        let mounted = true;
        async function loadBalance() {
            try {
                setLoadingBalance(true);
                const storeWallets = Array.isArray(walletStore?.wallets) ? walletStore.wallets : [];
                if (!storeWallets.length) {
                    if (mounted) setUserBalance(0);
                    return;
                }

                // compute per-wallet fiat equivalents and sum
                const jobs = storeWallets.map(async (w) => {
                    const walletSymbol = (w.wallet_symbol || '').toUpperCase();
                    const walletBalance = Number(w.wallet_balance) || 0;

                    // try both upper and lower keyed rates (tolerant lookup)
                    const rates = walletStore.rates || {};
                    let rateEntry = rates[walletSymbol];
                    if (rateEntry == null) rateEntry = rates[walletSymbol.toLowerCase()];

                    // rateEntry might be { usd: number } or a number
                    const rateUsd = (rateEntry && typeof rateEntry === 'object' && typeof rateEntry.usd === 'number')
                        ? rateEntry.usd
                        : (typeof rateEntry === 'number' ? rateEntry : 0);

                    return walletBalance * rateUsd;
                });

                const results = await Promise.all(jobs);
                const total = results.reduce((acc, v) => acc + (Number(v) || 0), 0);

                if (mounted) setUserBalance(total);
            } catch (err) {
                console.warn('Failed to load user balance', err);
                if (mounted) setUserBalance(0);
            } finally {
                if (mounted) setLoadingBalance(false);
            }
        }
        loadBalance();
        return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletStore?.wallets?.length, JSON.stringify(walletStore?.rates)]);

    function formatFiat(p) {
        if (!Number.isFinite(p)) return '-';
        return `$${p.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    }

    // live assets state (from CoinMarketCap Pro)
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchAssets() {
            try {
                setLoadingAssets(true);
                
                const url = 'convert/coinmarketcap/listings/latest?start=1&limit=20&convert=USD';
                const res = await jsonGet(url);
                if (res.success) {
                    const mapped = (res.data || []).map(a => {
                        const price = Number(a.price || 0);
                        const change = Number(a.change || 0);
                        // coin icon from CoinMarketCap static CDN by id
                        const icon = `https://s2.coinmarketcap.com/static/img/coins/64x64/${a.id}.png`;
                        return {
                            id: a.id,
                            name: a.name,
                            symbol: a.symbol,
                            price,
                            change,
                            icon
                        }
                    });

                    if (mounted) setAssets(mapped);
                }
            } catch (err) {
                console.error('Failed to load assets from CoinMarketCap', err);
            } finally {
                if (mounted) setLoadingAssets(false);
            }
        }

        fetchAssets();
        // const interval = setInterval(fetchAssets, 30000); // refresh every 30 seconds
        const interval = setInterval(fetchAssets, 86400000); // refresh every 24 hours
        return () => { mounted = false; clearInterval(interval); }
    }, []);

    function formatPrice(p) {
        if (!Number.isFinite(p)) return '-';
        if (p >= 1) return `$${p.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        return `$${p.toPrecision(6)}`;
    }

    return (
        <div>
            <div className="bg-light rounded-5 rounded-top-0 mb-4">
                {/* top bar */}
                <div className="mb-3 mx-auto" style={{ width: "50%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "2px" }}></div>

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex align-items-center">
                        <Link to="/profile" className="d-flex align-items-center">
                            <img src={Avatar} className='img-fluid rounded-pill shadow-sm' alt="ETH" style={{ width: "30px", height: "30px" }} />
                        </Link>
                        <div className="ps-2 lh-sm">
                            <Link to="/profile" className="d-flex align-items-center text-decoration-none">
                                <div className="text-muted mb-0">Hi, {(authStore.user?.user_fname || 'Stranger').toUpperCase()} 🙋‍♂️</div>
                            </Link>
                            <div className='fw-bold mb-0'>{getGreeting()}</div>
                        </div>
                    </div>
                    <button className="btn btn-sm" onClick={() => navigate('/notifications')}>
                        <span className="material-symbols-outlined">siren</span>
                    </button>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2 p-3">
                    <h6 className="mb-0">Account 1 ⌄</h6>
                    <button className="btn btn-light btn-sm shadow-sm" onClick={() => navigate('/wallets')}>
                        Assets
                    </button>
                </div>

                {/* Balance */}
                <div className="text-center my-3">
                    <h3 className="fw-bold">
                        {loadingBalance ? (
                            <span className="spinner-border spinner-border-sm text-secondary" role="status" />
                        ) : (
                            formatFiat(userBalance)
                        )}
                    </h3>
                    <div className="text-success small fw-semibold">+ $56.17 (+0.67%)</div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-around my-3 pb-3">
                    <div className="text-center">
                        <div
                            className="rounded-circle d-flex justify-content-center align-items-center mb-1"
                            style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6", cursor: 'pointer' }} 
                            onClick={() => navigate("/trade/send")}
                        >
                            <i className="bi bi-arrow-up-left"></i>
                        </div>
                        <small>Send</small>
                    </div>
                    <div className="text-center">
                        <div
                            className="rounded-circle d-flex justify-content-center align-items-center mb-1"
                            style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6", cursor: 'pointer' }}
                            onClick={() => navigate("/trade/receive")}
                        >
                            <i className="bi bi-arrow-down-left"></i>
                        </div>
                        <small>Request</small>
                    </div>
                    <div className="text-center">
                        <div
                            className="rounded-circle d-flex justify-content-center align-items-center mb-1"
                            style={{ width: "45px", height: "45px", backgroundColor: "#E6F9E6", cursor: 'pointer' }}
                            onClick={() => navigate("/trade/swap")}
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
            <div className="p-4">
                {/* Tokens Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Tokens</h6>
                    <div>
                        <span className="badge bg-light text-dark me-2">Market</span>
                        <button className="btn btn-light btn-sm">⋯</button>
                    </div>
                </div>


                {/* Token List */}
                <div className="list-group border-0">
                    {loadingAssets ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                            <small className="text-muted ms-2">Loading tokens...</small>
                        </div>
                    ) : (
                        (assets.length ? assets : []).map((t) => {
                            const changeClass = (t.change >= 0) ? 'text-success' : 'text-danger';
                            return (
                                <div key={t.id} className="d-flex justify-content-between align-items-center py-2 border-bottom" onClick={() => navigate(`/crypto/${t.id}`)} style={{ cursor: 'pointer' }}>
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded-circle bg-light d-flex justify-content-center align-items-center me-2"
                                            style={{ width: "35px", height: "35px", overflow: 'hidden' }}
                                        >
                                            <img
                                                src={t.icon}
                                                alt={t.symbol}
                                                style={{ width: 28, height: 28, objectFit: 'contain' }}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.style.display = 'none';
                                                    const parent = e.currentTarget.parentNode;
                                                    if (parent) parent.textContent = t.symbol?.charAt(0) || '•';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div className="fw-semibold">{t.name}</div>
                                            <div className={`small ${changeClass}`}>{t.change?.toFixed(2)}%</div>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-semibold">{formatPrice(t.price)}</div>
                                        <div className="small text-muted">{t.symbol}</div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
            
    );
}

export default Main;