import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import Avatar from '../../assets/avatar.jpeg'
import {jsonGet} from '../../helpers/Ajax'

function Main() {
    const [authStore, authDispatch] = useContext(AuthContext);
    const navigate = useNavigate();
    // get user account balance
    // getBalance();
    // async function getBalance() {
    //     const url = "wallets/BTC/mhxwNC4yW82KdcwsAPi81d8dcMSvmWoTSc/balance";
    //     const resp = await jsonGet(url);
    //     if (resp.success) {
    //         console.log(resp);
    //     }
    // }

    // live assets state (from CoinMarketCap Pro)
    const [assets, setAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchAssets() {
            try {
                setLoadingAssets(true);
                const url = 'convert/coinmarketcap/listings/latest?start=1&limit=10&convert=USD';

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
        const interval = setInterval(fetchAssets, 30000);
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
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center p-3">
                    <div class="d-flex align-items-center">
                        <Link to="/profile" className="d-flex align-items-center">
                            <img src={Avatar} className='img-fluid rounded-pill shadow-sm' alt="ETH" style={{ width: "30px", height: "30px" }} />
                        </Link>
                        <div className="ps-2">
                            <Link to="/profile" className="d-flex align-items-center text-decoration-none">
                                <div className="text-muted mb-0">Hi, {authStore.user?.user_fname.toUpperCase() || 'Stranger'} 🙋‍♂️</div>
                            </Link>
                            <div className='fw-bold mb-0'>Good morning!</div>
                        </div>
                    </div>
                    <button className="btn btn-light btn-sm rounded-circle shadow-sm">
                        <i className="bi bi-bell"></i>
                    </button>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2 p-3">
                    <h6 className="mb-0">Account 1 ⌄</h6>
                    <button className="btn btn-light btn-sm shadow-sm">
                        Deposit
                    </button>
                </div>
                <div className="text-center text-muted small mt-2">
                    <span className="badge bg-dark bg-opacity-10 text-dark rounded-pill px-3 py-2">
                        0x9e59...34c7 <i className="bi bi-back"></i>
                    </span>
                </div>

                {/* Balance */}
                <div className="text-center my-3">
                    <h3 className="fw-bold">$76,297.32</h3>
                    <div className="text-success small fw-semibold">+ $56.17 (+0.67%)</div>
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
                                <div key={t.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
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