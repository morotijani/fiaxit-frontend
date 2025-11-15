import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Chart from "react-apexcharts";
import { jsonGet } from '../../helpers/Ajax'
import toast from 'react-hot-toast';
import TimeRangeSelector from "../TimeRangeSelector";
import Skeleton from "../Skeleton";

function CryptoDetails() {
    const navigate = useNavigate();
    let { id, symbol } = useParams()
    symbol = 'bitcoin';
    symbol = String(symbol.toLowerCase());
    const [coin, setCoin] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [range, setRange] = useState("1m"); // default 1MONTH
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);

    // Fetch coin details
    useEffect(() => {
        let mounted = true;
        try {
            const url = `convert/coin/${id}`;
            jsonGet(url).then((coinData) => {
                if (coinData.success) {
                    if (mounted) {
                        setCoin(coinData.data);
                        setLoading(false);
                    }
                } else {
                    toast.error('Crypto not found !', {duration: 6000});
                    navigate('/');
                    setLoading(false);
                }
            });
        } catch (err) {
            console.error('fetchCoin error', err);
        }

        return () => {
            mounted = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Fetch chart data based on time range
    useEffect(() => {
        let mounted = true;
        try {
            symbol = coin ? coin.slug : 'bitcoin';
            const chaturl = `convert/chart/coin/${range}/${symbol}`;
            jsonGet(chaturl).then((chartData) => {
                if (chartData.success) {
                    if (mounted) {
                        setChartData(chartData.data);
                        setChartLoading(false);
                    }
                }
            });
        } catch (err) {
            console.error('fetchChartData error', err);
        }

        return () => {
            mounted = false;
        }
    }, [symbol, range]);

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
                                    <h2 className="price">${coin.quote.USD.price.toLocaleString()}</h2>

                                    <p
                                        className="percent-change"
                                        style={{
                                        color: coin.quote.USD.percent_change_24h > 0 ? "#4caf50" : "#ff5252",
                                        }}
                                    >
                                        {coin.quote.USD.percent_change_24h > 0 ? "▲" : "▼"}
                                        {coin.quote.USD.percent_change_24h.toFixed(2)}%
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
                                    theme: { mode: "dark" },
                                }}
                            />
                        )}
                        
                        <div className="p-4">
                            {/* stats */}
                            {loading ? (
                                <div className="stats-container">
                                    <Skeleton height={60} radius={12} />
                                    <Skeleton height={60} radius={12} />
                                </div>
                            ) : (
                                <div className="card border-0 bg-warning bg-opacity-10 mb-3">
                                    <div className="card-body">
                                        <div className="text-primary fs-xl fw-bold mb-3">Stats</div>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <span className="stats-label mb-5">Market Cap</span>
                                                <p className="font-monospace fw-bold fs-sm">
                                                    ${coin.quote.USD.market_cap.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="col-sm-6">
                                                <span className="stats-label mb-5">Volume (24h)</span>
                                                <p className="font-monospace fw-bold fs-sm">
                                                    ${coin.quote.USD.volume_24h.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* About */}
                            {loading ? (
                                <>
                                    <Skeleton height={25} width="40%" />
                                    <Skeleton height={15} />
                                    <Skeleton height={15} />
                                    <Skeleton height={15} />
                                </>
                            ) : (
                                <>
                                    <div className="">
                                        <h4 className="fs-5">About {coin.name}</h4>
                                        <p className="fs-sm">{coin.slug} is a cryptocurrency listed on CoinMarketCap...</p>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                )
            }
        </div>
    )
}

export default CryptoDetails;