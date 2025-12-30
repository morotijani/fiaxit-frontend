import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { jsonGet } from '../../helpers/Ajax';

function PortfolioChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(7); // default 7 days

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true);
            try {
                const resp = await jsonGet(`portfolio/history?days=${timeRange}`);
                if (resp && resp.success) {
                    const mappedData = resp.data.map(item => ({
                        name: new Date(item.snapshot_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                        balance: parseFloat(item.total_balance_usd)
                    }));
                    setData(mappedData);
                }
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, [timeRange]);

    if (loading && data.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-5 bg-light rounded-4">
                <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '48px' }}>monitoring</span>
                <p className="text-muted">No historical data available yet.<br /><small>Check back after your first automated snapshot.</small></p>
            </div>
        );
    }

    return (
        <div className="chart-container animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Portfolio Performance</h6>
                <div className="btn-group btn-group-sm rounded-pill overflow-hidden border shadow-sm">
                    {[
                        { label: '24h', val: 1 },
                        { label: '7d', val: 7 },
                        { label: '30d', val: 30 }
                    ].map(btn => (
                        <button
                            key={btn.val}
                            className={`btn ${timeRange === btn.val ? 'btn-primary' : 'btn-light border-0'}`}
                            onClick={() => setTimeRange(btn.val)}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            dy={10}
                        />
                        <YAxis
                            hide={true}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']}
                        />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="#0d6efd"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorBal)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default PortfolioChart;
