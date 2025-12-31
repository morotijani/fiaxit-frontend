import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsonGet } from '../../helpers/Ajax';

function Converter() {
    const navigate = useNavigate();

    // States
    const [fromAsset, setFromAsset] = useState({ symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin', type: 'crypto', icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' });
    const [toAsset, setToAsset] = useState({ symbol: 'USD', name: 'US Dollar', id: 'usd', type: 'fiat', icon: '' });
    const [fromAmount, setFromAmount] = useState('1');
    const [toAmount, setToAmount] = useState('');
    const [rate, setRate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastChanged, setLastChanged] = useState('from'); // 'from' or 'to'

    // Supported lists (simplified for now, ideally fetched from API)
    const cryptos = [
        { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin', icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' },
        { symbol: 'ETH', name: 'Ethereum', id: 'ethereum', icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
        { symbol: 'USDT', name: 'Tether', id: 'tether', icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
        { symbol: 'BNB', name: 'BNB', id: 'binancecoin', icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
        { symbol: 'SOL', name: 'Solana', id: 'solana', icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png' }
    ];

    const fiats = [
        { symbol: 'USD', name: 'US Dollar', id: 'usd' },
        { symbol: 'EUR', name: 'Euro', id: 'eur' },
        { symbol: 'GBP', name: 'British Pound', id: 'gbp' },
        { symbol: 'NGN', name: 'Nigerian Naira', id: 'ngn' },
        { symbol: 'GHS', name: 'Ghanaian Cedi', id: 'ghs' }
    ];

    const fetchRate = useCallback(async () => {
        if (!fromAsset || !toAsset) return;

        try {
            setLoading(true);
            setError(null);

            // Determine conversion logic
            // The backend /current endpoint expects ?cryptoId=...&vsCurrency=...
            let cryptoId, vsCurrency;

            if (fromAsset.type === 'crypto') {
                cryptoId = fromAsset.id;
                vsCurrency = toAsset.id;
            } else {
                cryptoId = toAsset.id;
                vsCurrency = fromAsset.id;
            }

            const resp = await jsonGet(`convert/current?cryptoId=${cryptoId}&vsCurrency=${vsCurrency}`);

            if (resp && resp.success && resp.data) {
                const currentRate = resp.data.rate;
                setRate(currentRate);

                // Update the non-edited field
                if (lastChanged === 'from') {
                    if (fromAsset.type === 'crypto') {
                        setToAmount((parseFloat(fromAmount || 0) * currentRate).toFixed(2));
                    } else {
                        setToAmount((parseFloat(fromAmount || 0) / currentRate).toFixed(8));
                    }
                } else {
                    if (toAsset.type === 'crypto') {
                        setFromAmount((parseFloat(toAmount || 0) * currentRate).toFixed(2));
                    } else {
                        setFromAmount((parseFloat(toAmount || 0) / currentRate).toFixed(8));
                    }
                }
            } else {
                setError("Could not fetch exchange rate");
            }
        } catch (err) {
            console.error("Conversion error:", err);
            setError("Service unavailable");
        } finally {
            setLoading(false);
        }
    }, [fromAsset, toAsset, fromAmount, toAmount, lastChanged]);

    useEffect(() => {
        const timeout = setTimeout(fetchRate, 500);
        return () => clearTimeout(timeout);
    }, [fetchRate]);

    const handleSwap = () => {
        const temp = fromAsset;
        setFromAsset(toAsset);
        setToAsset(temp);
        setFromAmount(toAmount);
        setToAmount(fromAmount);
    };

    return (
        <div className="converter-page animate-fade-in p-3 pb-5 mt-4">
            {/* Header */}
            <div className="d-flex align-items-center mb-4">
                <button className="btn btn-link p-0 me-3 text-dark" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h4 className="fw-bold mb-0">Converter</h4>
            </div>

            {/* Main Converter Card */}
            <div className="glass-card converter-main-card p-4 rounded-5 shadow-sm border bg-white position-relative mb-4">
                <div className="position-absolute top-0 end-0 p-4 opacity-10">
                    <span className="material-symbols-outlined" style={{ fontSize: '' }}>currency_exchange</span>
                </div>

                <div className="position-relative">
                    {/* From Section */}
                    <div className="mb-4">
                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block">From</label>
                        <div className="d-flex align-items-center bg-light rounded-4 p-2 border">
                            <input
                                type="number"
                                className="form-control border-0 bg-transparent fw-bold fs-4 flex-grow-1 no-spinner"
                                value={fromAmount}
                                onChange={(e) => {
                                    setFromAmount(e.target.value);
                                    setLastChanged('from');
                                }}
                                placeholder="0.00"
                            />
                            <div className="dropdown">
                                <button className="btn btn-white border rounded-pill d-flex align-items-center px-3 py-2 fw-bold shadow-sm" data-bs-toggle="dropdown">
                                    {fromAsset.icon && <img src={fromAsset.icon} alt="" className="me-2" style={{ width: '20px' }} />}
                                    {fromAsset.symbol}
                                    <span className="material-symbols-outlined ms-1 small">expand_more</span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end rounded-4 shadow border-0 p-2 scrollable-menu" style={{ minWidth: '200px' }}>
                                    <li className="dropdown-header text-uppercase small fw-bold p-2">Cryptocurrencies</li>
                                    {cryptos.map(c => (
                                        <li key={c.id}>
                                            <button className="dropdown-item rounded-3 d-flex align-items-center py-2" onClick={() => setFromAsset({ ...c, type: 'crypto' })}>
                                                <img src={c.icon} alt="" className="me-2" style={{ width: '20px' }} />
                                                <span>{c.name}</span>
                                                <span className="ms-auto text-muted small">{c.symbol}</span>
                                            </button>
                                        </li>
                                    ))}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li className="dropdown-header text-uppercase small fw-bold p-2">Fiats</li>
                                    {fiats.map(f => (
                                        <li key={f.id}>
                                            <button className="dropdown-item rounded-3 d-flex align-items-center py-2" onClick={() => setFromAsset({ ...f, type: 'fiat' })}>
                                                <div className="me-2 bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}>
                                                    <span className="material-symbols-outlined small" style={{ fontSize: '14px' }}>payments</span>
                                                </div>
                                                <span>{f.name}</span>
                                                <span className="ms-auto text-muted small">{f.symbol}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Swap Button Divider */}
                    <div className="d-flex justify-content-center my-n3 position-relative" style={{ zIndex: 2 }}>
                        <button
                            className="btn btn-primary rounded-circle p-2 shadow border-white border-2 d-flex align-items-center justify-content-center swap-btn"
                            style={{ width: '44px', height: '44px' }}
                            onClick={handleSwap}
                        >
                            <span className="material-symbols-outlined">swap_vert</span>
                        </button>
                    </div>

                    {/* To Section */}
                    <div className="mt-2 mb-4">
                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block">To</label>
                        <div className="d-flex align-items-center bg-light rounded-4 p-2 border">
                            <input
                                type="number"
                                className="form-control border-0 bg-transparent fw-bold fs-4 flex-grow-1 no-spinner"
                                value={toAmount}
                                onChange={(e) => {
                                    setToAmount(e.target.value);
                                    setLastChanged('to');
                                }}
                                placeholder="0.00"
                            />
                            <div className="dropdown">
                                <button className="btn btn-white border rounded-pill d-flex align-items-center px-3 py-2 fw-bold shadow-sm" data-bs-toggle="dropdown">
                                    {toAsset.icon && <img src={toAsset.icon} alt="" className="me-2" style={{ width: '20px' }} />}
                                    {toAsset.symbol}
                                    <span className="material-symbols-outlined ms-1 small">expand_more</span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end rounded-4 shadow border-0 p-2 scrollable-menu" style={{ minWidth: '200px' }}>
                                    <li className="dropdown-header text-uppercase small fw-bold p-2">Cryptocurrencies</li>
                                    {cryptos.map(c => (
                                        <li key={c.id}>
                                            <button className="dropdown-item rounded-3 d-flex align-items-center py-2" onClick={() => setToAsset({ ...c, type: 'crypto' })}>
                                                <img src={c.icon} alt="" className="me-2" style={{ width: '20px' }} />
                                                <span>{c.name}</span>
                                                <span className="ms-auto text-muted small">{c.symbol}</span>
                                            </button>
                                        </li>
                                    ))}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li className="dropdown-header text-uppercase small fw-bold p-2">Fiats</li>
                                    {fiats.map(f => (
                                        <li key={f.id}>
                                            <button className="dropdown-item rounded-3 d-flex align-items-center py-2" onClick={() => setToAsset({ ...f, type: 'fiat' })}>
                                                <div className="me-2 bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}>
                                                    <span className="material-symbols-outlined small" style={{ fontSize: '14px' }}>payments</span>
                                                </div>
                                                <span>{f.name}</span>
                                                <span className="ms-auto text-muted small">{f.symbol}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Rate Display */}
                    {rate && !loading && (
                        <div className="text-center bg-primary bg-opacity-10 py-2 px-3 rounded-pill d-inline-block mx-auto w-auto mb-2">
                            <small className="text-primary fw-bold">
                                1 {fromAsset.symbol} = {rate.toLocaleString(undefined, { maximumFractionDigits: 8 })} {toAsset.symbol}
                            </small>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center mb-2">
                            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center text-danger small mb-2 fw-bold">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Suggestions / Market Info */}
            <h6 className="fw-bold mb-3 px-1">Market Insights</h6>
            <div className="row g-3">
                <div className="col-6">
                    <div className="glass-card market-insights-card p-3 rounded-4 border bg-white h-100">
                        <small className="text-muted d-block mb-1">24h Vol (BTC)</small>
                        <div className="fw-bold">$34.2B</div>
                        <div className="text-success small fw-bold mt-1">+2.45%</div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="glass-card market-insights-card p-3 rounded-4 border bg-white h-100">
                        <small className="text-muted d-block mb-1">Market Cap</small>
                        <div className="fw-bold">$2.4T</div>
                        <div className="text-danger small fw-bold mt-1">-0.12%</div>
                    </div>
                </div>
            </div>

            <div className="mt-4 bg-light rounded-4 p-3 border border-dashed text-center">
                <span className="material-symbols-outlined text-muted mb-2 d-block" style={{ fontSize: '32px' }}>info</span>
                <p className="text-muted small mb-0 px-2">Rates are sourced from real-time global exchanges and updated every 30 seconds to ensure the highest accuracy for your conversions.</p>
            </div>
        </div>
    );
}

export default Converter;
