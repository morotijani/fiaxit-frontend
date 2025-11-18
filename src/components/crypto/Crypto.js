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
    }, [coin, range]); // depend on coin object, not coin.slug string

    if (loading) {
        return (
            <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                <small className="text-muted ms-2">Loading crypto details</small>
            </div>
        );
    }

    if (!coin) {
        return (
            <div className="text-center py-3">
                <small className="text-muted">No crypto details found</small>
            </div>
        );
    }

    const price = Number(coin.quote?.USD?.price || 0);
    const percentChange = Number(coin.quote?.USD?.percent_change_24h || 0);
    const marketCap = Number(coin.quote?.USD?.market_cap || 0);
    const volume24h = Number(coin.quote?.USD?.volume_24h || 0);

    return (
        <div>
            {loading  ? (
                <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                    <small className="text-muted ms-2">Loading crypto details</small>
                </div>
                // <>
                // <Skeleton height={40} width="60%" />
                // <Skeleton height={30} width="30%" />
                // </>
            ) : (
                    <div>
                        {!coin ? (
                            <div className="text-center py-3">
                                <small className="text-muted">No crypto details found</small>
                            </div>
                        ) : (
                            <div className="bg-light rounded-5 rounded-top-0 mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2 p-3">
                                    <button className="btn btn-sm" onClick={() => navigate(-1)}>
                                        <span className="material-symbols-outlined">keyboard_backspace</span>
                                    </button>
                                    <h6 className="mb-0">Coin Details</h6>
                                    <button className="btn btn-light btn-sm" onClick={() => navigate('/deposit')}>
                                        <span className="material-symbols-outlined">share</span>
                                    </button>
                                </div>
                                <div className="p-3" style={{ overflowY: "auto", flexGrow: 1 }}>
                                    <div className="coin-header">
                                        <img
                                            src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                                            className="coin-icon"
                                            alt=""
                                        />
                                        <h1>{coin.name} ({coin.symbol})</h1>
                                    </div>

                                    {/* Price */}
                                    <h2 className="price">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>

                                    <p
                                        className="percent-change"
                                        style={{
                                            color: percentChange > 0 ? "#4caf50" : "#ff5252",
                                        }}
                                    >
                                        {percentChange > 0 ? "▲" : "▼"}
                                        {Math.abs(percentChange).toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Time Range Selector */}
                        <TimeRangeSelector active={range} onChange={setRange} />

                        {/* Chart */}
                        {chartLoading ? (
                            // <Skeleton height={300} radius={12} />
                            <div className="text-center py-3">
                                <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                                <small className="text-muted ms-2">Loading crypto graph data</small>
                            </div>
                        ) : chartData.length === 0 ? (
                                <div className="text-center py-3">
                                    <small className="text-muted">No chart data found</small>
                                </div>
                            ) : (
                                <Chart
                                    type="area"
                                    height={320}
                                    series={[
                                        {
                                            name: "Price",
                                            data: chartData.map((c) => c[1]),
                                        },
                                    ]}
                                    options={{
                                        chart: { toolbar: { show: false } },
                                        stroke: { curve: "smooth" },
                                        fill: { opacity: 0.2 },
                                        xaxis: { labels: { show: false } },
                                        yaxis: { labels: { show: false } },
                                        // theme: { mode: "dark" },
                                    }}
                                />
                            )
                        }
                        
                        <div className="p-4">

                            {/* stats */}
                            <div className="card border-0 bg-warning bg-opacity-10 mb-3">
                                <div className="card-body">
                                    <div className="text-secondary fs-xl fw-bold mb-3">Stats</div>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <span className="stats-label mb-5">Market Cap</span>
                                            <p className="font-monospace fw-bold fs-sm">
                                                ${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                        <div className="col-sm-6">
                                            <span className="stats-label mb-5">Volume (24h)</span>
                                            <p className="font-monospace fw-bold fs-sm">
                                                ${volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* About */}
                            <div className="">
                                <h4 className="fs-5">About {coin.name}</h4>
                                <p className="fs-sm">{coin.slug} is a digital asset tracked by CoinMarketCap. It supports decentralized transactions and smart contract execution.</p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default CryptoDetails;