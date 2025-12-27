import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Chart from "react-apexcharts";
import { jsonGet } from '../../helpers/Ajax'
import toast from 'react-hot-toast';
import TimeRangeSelector from "../TimeRangeSelector";
import Skeleton from "../Skeleton";

/* Module-level cache for coin details and chart data */
const LS_PREFIX = 'crypto_cache_v1_'
const COIN_TTL_MS = 10 * 60 * 1000  // 10 minutes
const CHART_TTL_MS = 5 * 60 * 1000  // 5 minutes

function getLsKey(type, key) {
    return `${LS_PREFIX}${type}_${key}`;
}

// fetch cache data
function getCachedData(type, key) {
    try {
        const raw = localStorage.getItem(getLsKey(type, key));
        if (!raw) return null;
        const { ts, data } = JSON.parse(raw);
        const ttl = type === 'coin' ? COIN_TTL_MS : CHART_TTL_MS;
        if (Date.now() - ts > ttl) {
            localStorage.removeItem(getLsKey(type, key));
            return null;
        }
        return data;
    } catch (e) {
        return null;
    }
}

// set cache data
function setCachedData(type, key, data) {
    try {
        localStorage.setItem(getLsKey(type, key), JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {
        // ignore
    }
}

function CryptoDetails() {
    const navigate = useNavigate();
    let { id } = useParams()
    const [coin, setCoin] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [range, setRange] = useState("1m"); // default 1MONTH
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);

    // Fetch coin details
    useEffect(() => {
        let mounted = true;

        async function fetchCoin() {
            try {
                setLoading(true);

                // check cache first
                const cached = getCachedData('coin', id);
                if (cached) {
                    if (mounted) {
                        setCoin(cached);
                        setLoading(false);
                    }
                    return;
                }

                const url = `convert/coin/${id}`;
                const coinData = await jsonGet(url);

                if (coinData && coinData.success && coinData.data) {
                    if (mounted) {
                        setCoin(coinData.data);
                        setCachedData('coin', id, coinData.data);
                        setLoading(false);
                    }
                } else {
                    if (mounted) {
                        toast.error('Crypto not found!', { duration: 6000 });
                        navigate('/');
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error('fetchCoin error', err);
                if (mounted) {
                    toast.error('Failed to load crypto details', { duration: 6000 });
                    setLoading(false);
                }
            }
        }

        fetchCoin();

        return () => {
            mounted = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Fetch chart data based on time range
    useEffect(() => {
        let mounted = true;

        async function fetchChart() {
            try {
                // only fetch if coin is loaded and has slug
                if (!coin || !coin.slug) return;

                setChartLoading(true);
                const chartKey = `${coin.slug}_${range}`;

                // check cache first
                const cached = getCachedData('chart', chartKey);
                if (cached) {
                    if (mounted) {
                        setChartData(cached);
                        setChartLoading(false);
                    }
                    return;
                }

                const chartUrl = `convert/chart/coin/${range}/${coin.slug}`;
                const chartResp = await jsonGet(chartUrl);

                if (chartResp && chartResp.success && chartResp.data) {
                    if (mounted) {
                        setChartData(chartResp.data);
                        setCachedData('chart', chartKey, chartResp.data);
                        setChartLoading(false);
                    }
                } else {
                    if (mounted) {
                        toast.error('Failed to load chart data', { duration: 6000 });
                        setChartData([]);
                        setChartLoading(false);
                    }
                }
            } catch (err) {
                console.error('fetchChart error', err);
                if (mounted) {
                    toast.error('Chart data unavailable', { duration: 6000 });
                    setChartData([]);
                    setChartLoading(false);
                }
            }
        }

        fetchChart();

        return () => {
            mounted = false;
        }
    }, [coin, range]);

    if (loading) {
        return (
            <div className="animate-fade-in d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary mb-3" role="status" />
                <span className="text-muted small fw-bold text-uppercase tracking-wider">Loading Assets...</span>
            </div>
        );
    }

    if (!coin) {
        return (
            <div className="animate-fade-in d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '48px' }}>error</span>
                <span className="text-muted">Crypto details not found</span>
                <button className="btn btn-primary mt-3 rounded-pill px-4" onClick={() => navigate('/')}>Go Back</button>
            </div>
        );
    }

    const price = Number(coin.quote?.USD?.price || 0);
    const percentChange = Number(coin.quote?.USD?.percent_change_24h || 0);
    const marketCap = Number(coin.quote?.USD?.market_cap || 0);
    const volume24h = Number(coin.quote?.USD?.volume_24h || 0);

    return (
        <div className="animate-fade-in">
            {/* Top Bar / Header */}
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <div className="text-center">
                    <h6 className="m-0 fw-bold">{coin.name}</h6>
                    <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>{coin.symbol} • Live</small>
                </div>
                <button className="btn btn-light rounded-circle p-2 shadow-sm">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>star</span>
                </button>
            </div>

            <div className="flex-grow-1">
                {/* Summary Section */}
                <div className="p-4 text-center">
                    <div className="mb-2">
                        <img
                            src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                            className="rounded-circle shadow-sm"
                            alt=""
                            style={{ width: '48px', height: '48px' }}
                        />
                    </div>
                    <h2 className="fw-bold mb-1">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                    <div className={`d-inline-flex align-items-center px-2 py-1 rounded-pill ${percentChange >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        <span className="material-symbols-outlined me-1" style={{ fontSize: '14px' }}>
                            {percentChange >= 0 ? 'trending_up' : 'trending_down'}
                        </span>
                        <small className="fw-bold">{Math.abs(percentChange).toFixed(2)}% (24h)</small>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="p-2">
                    <TimeRangeSelector active={range} onChange={setRange} />
                    <div className="mt-3" style={{ minHeight: '260px' }}>
                        {chartLoading ? (
                            <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '260px' }}>
                                <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                                <small className="text-muted fs-xs fw-bold text-uppercase">Mapping Market Data...</small>
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className="d-flex align-items-center justify-content-center" style={{ height: '260px' }}>
                                <small className="text-muted">Chart data currently unavailable</small>
                            </div>
                        ) : (
                            <Chart
                                type="area"
                                height={260}
                                series={[{ name: "Price", data: chartData.map((c) => c[1]) }]}
                                options={{
                                    chart: { toolbar: { show: false }, sparks: { enabled: true } },
                                    stroke: { curve: "smooth", width: 3, colors: [percentChange >= 0 ? '#10b981' : '#ef4444'] },
                                    fill: {
                                        type: 'gradient',
                                        gradient: {
                                            shadeIntensity: 1,
                                            opacityFrom: 0.45,
                                            opacityTo: 0.05,
                                            stops: [20, 100],
                                            colorStops: [
                                                { offset: 0, color: percentChange >= 0 ? '#10b981' : '#ef4444', opacity: 0.4 },
                                                { offset: 100, color: percentChange >= 0 ? '#10b981' : '#ef4444', opacity: 0 }
                                            ]
                                        }
                                    },
                                    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
                                    yaxis: { labels: { show: false } },
                                    grid: { show: false },
                                    tooltip: { theme: 'light', x: { show: false } }
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="p-4 pt-0">
                    <h6 className="fw-bold mb-3">Market Stats</h6>
                    <div className="row g-3">
                        <div className="col-6">
                            <div className="bg-white p-3 rounded-4 border shadow-sm h-100">
                                <small className="text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.65rem' }}>Market Cap</small>
                                <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                    ${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="bg-white p-3 rounded-4 border shadow-sm h-100">
                                <small className="text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.65rem' }}>Volume (24h)</small>
                                <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                    ${volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="mt-4 p-3 bg-white rounded-4 border shadow-sm">
                        <h6 className="fw-bold mb-2">About {coin.name}</h6>
                        <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                            {coin.name} is a leading digital asset in the cryptocurrency market. {coin.slug} is currently valued at ${price.toLocaleString()} with a 24-hour trading volume of ${volume24h.toLocaleString()}.
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 mb-2 pb-4">
                        <button className="btn btn-primary w-100 py-3 rounded-4 fw-bold shadow-sm" onClick={() => navigate('/wallets')}>
                            Trade {coin.symbol}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CryptoDetails;