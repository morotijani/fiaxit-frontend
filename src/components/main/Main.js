import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import { WalletContext } from '../../contexts/WalletContext'
import Avatar from '../../assets/avatar.jpeg'
import { jsonGet } from '../../helpers/Ajax'

import CreateWalletModal from '../wallets/CreateWalletModal'
import PortfolioChart from './PortfolioChart'

function Main() {
    const [authStore, authDispatch] = useContext(AuthContext);
    const [walletStore, walletDispatch] = useContext(WalletContext);
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


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
        return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        if (p >= 1) return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return `$${p.toPrecision(6)}`;
    }

    return (
        <div className="animate-fade-in">
            <div className="bg-white rounded-5 rounded-top-0 mb-4 shadow-sm border-bottom">
                {/* top bar */}
                <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex align-items-center">
                        <Link to="/profile" className="d-flex align-items-center text-decoration-none">
                            <div className="position-relative">
                                {authStore.user?.user_image ? (
                                    <img src={authStore.user?.user_image} className='img-fluid rounded-circle shadow-sm' alt="User" style={{ width: "40px", height: "40px", border: "2px solid #fff" }} />
                                ) : (
                                    <img src={Avatar} className='img-fluid rounded-circle shadow-sm' alt="User" style={{ width: "40px", height: "40px", border: "2px solid #fff" }} />
                                )}
                                <div className="position-absolute bottom-0 end-0 bg-success rounded-circle" style={{ width: "10px", height: "10px", border: "2px solid #fff" }}></div>
                            </div>
                            <div className="ps-2">
                                <div className="text-muted small mb-0">Hi, {(authStore.user?.user_fname || 'User')} 👋</div>
                                <div className='fw-bold text-dark' style={{ fontSize: '0.9rem' }}>{getGreeting()}</div>
                            </div>
                        </Link>
                    </div>
                    <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate('/notifications')}>
                        <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>notifications</span>
                    </button>
                </div>

                {/* Balance Section */}
                <div className="text-center py-4">
                    <small className="text-muted text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>Total Balance</small>
                    <div className="balance-amount my-1">
                        {loadingBalance ? (
                            <div className="spinner-border spinner-border-sm text-primary" role="status" />
                        ) : (
                            formatFiat(userBalance)
                        )}
                    </div>
                    <div className="d-inline-flex align-items-center px-2 py-1 bg-success-subtle rounded-pill">
                        <span className="material-symbols-outlined text-success me-1" style={{ fontSize: '14px' }}>trending_up</span>
                        <small className="text-success fw-bold">+$56.17 (0.67%)</small>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-around my-4 px-3 pb-3">
                    {[
                        { icon: 'arrow_upward', label: 'Send', route: '/trade/send', color: '#0052ff' },
                        { icon: 'arrow_downward', label: 'Receive', route: '/trade/receive', color: '#0052ff' },
                        { icon: 'swap_horiz', label: 'Swap', route: '/trade/swap', color: '#0052ff' },
                        { icon: 'more_horiz', label: 'More', route: '/more', color: '#5b616e' }
                    ].map((act, i) => (
                        <div key={i} className="text-center" style={{ cursor: 'pointer' }} onClick={() => navigate(act.route)}>
                            <div
                                className="rounded-circle d-flex justify-content-center align-items-center shadow-sm mx-auto mb-2"
                                style={{ width: "52px", height: "52px", backgroundColor: "#fff", transition: 'all 0.2s' }}
                            >
                                <span className="material-symbols-outlined" style={{ color: act.color, fontSize: '24px' }}>{act.icon}</span>
                            </div>
                            <small className="fw-semibold text-secondary">{act.label}</small>
                        </div>
                    ))}
                </div>

                {/* Empty State CTA */}
                {(!walletStore?.wallets || walletStore.wallets.length === 0) && (
                    <div className="px-3 pb-4">
                        <div className="bg-primary bg-opacity-10 rounded-4 p-3 border border-primary border-opacity-25 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="fw-bold text-primary small">No wallet yet?</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Create one to start trading</div>
                            </div>
                            <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold" onClick={() => setIsCreateModalOpen(true)}>
                                Create Wallet
                            </button>
                        </div>
                    </div>
                )}
                {/* Portfolio Chart Section */}
                <div className="px-3 pb-4">
                    <div className="bg-white rounded-4 border shadow-sm p-4">
                        <PortfolioChart />
                    </div>
                </div>
            </div>

            <div className="px-3 pb-5">
                {/* Tokens Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Assets</h6>
                    <button className="btn btn-link btn-sm text-decoration-none fw-bold" onClick={() => navigate('/wallets')}>Manage</button>
                </div>

                {/* Token List */}
                <div className="list-group list-group-flush rounded-4 overflow-hidden border shadow-sm bg-white">
                    {loadingAssets ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-muted small mt-2">Updating market prices...</div>
                        </div>
                    ) : (
                        (assets.length ? assets : []).map((t) => {
                            const changeClass = (t.change >= 0) ? 'text-success' : 'text-danger';
                            return (
                                <div key={t.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 border-0 crypto-card" onClick={() => navigate(`/crypto/${t.id}`)} style={{ cursor: 'pointer' }}>
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded-circle bg-light d-flex justify-content-center align-items-center me-3 shadow-sm"
                                            style={{ width: "40px", height: "40px", border: "1px solid #f1f5f9" }}
                                        >
                                            <img
                                                src={t.icon}
                                                alt={t.symbol}
                                                style={{ width: 28, height: 28 }}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentNode.textContent = t.symbol?.charAt(0) || '•';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div className="fw-bold">{t.name}</div>
                                            <div className="text-muted small">{t.symbol}</div>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold">{formatPrice(t.price)}</div>
                                        <div className={`small fw-semibold ${changeClass}`}>
                                            {t.change > 0 ? '+' : ''}{t.change?.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
            <CreateWalletModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>

    );
}

export default Main;