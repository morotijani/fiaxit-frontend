import React, { useState, useEffect } from 'react';
import { jsonGet, jsonPost, jsonDelete } from '../../helpers/Ajax';
import Button from '../elements/Button';
import toast from 'react-hot-toast';

function PriceAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        coin_symbol: 'BTC',
        target_price: '',
        direction: 'above'
    });

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        const resp = await jsonGet('price-alerts');
        if (resp && resp.success) {
            setAlerts(resp.data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const resp = await jsonPost('price-alerts', formData);
        if (resp && resp.success) {
            toast.success("Alert created!");
            setShowForm(false);
            setFormData({ coin_symbol: 'BTC', target_price: '', direction: 'above' });
            fetchAlerts();
        } else {
            toast.error(resp.message || "Failed to create alert");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this alert?")) return;
        const resp = await jsonDelete(`price-alerts/${id}`);
        if (resp && resp.success) {
            toast.success("Alert deleted");
            fetchAlerts();
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Top Handle */}
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            {/* Header */}
            <div className="p-3 border-0 border-bottom d-flex align-items-center justify-content-between sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => window.history.back()}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Price Alerts</h6>
                <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold" onClick={() => setShowForm(true)}>
                    Add
                </button>
            </div>

            <div className="p-4">
                <div className="bg-white rounded-4 border shadow-sm p-3 mb-4 d-flex align-items-center justify-content-between">
                    <div>
                        <div className="fw-bold">Real-time Monitoring</div>
                        <small className="text-muted">Get notified when prices reach your targets.</small>
                    </div>
                </div>

                <h6 className="small fw-bold text-muted text-uppercase mb-3" style={{ letterSpacing: '1px' }}>Active Alerts</h6>

                {loading && alerts.length === 0 ? (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="text-center p-5 bg-light rounded-4 border border-dashed">
                        <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>notifications_off</span>
                        <p className="text-muted mt-2">No price alerts set yet.</p>
                    </div>
                ) : (
                    <div className="list-group rounded-4 border shadow-sm overflow-hidden">
                        {alerts.map(alert => (
                            <div key={alert.id} className="list-group-item p-3 border-0 border-bottom d-flex align-items-center justify-content-between hvr-light">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary-subtle text-primary rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                        <span className="fw-bold small">{alert.coin_symbol}</span>
                                    </div>
                                    <div>
                                        <div className="fw-bold small">
                                            {alert.direction === 'above' ? 'Goes Above' : 'Goes Below'} ${parseFloat(alert.target_price).toLocaleString()}
                                        </div>
                                        <div className="d-flex align-items-center">
                                            {alert.is_active ? (
                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 rounded-pill small" style={{ fontSize: '0.65rem' }}>Active</span>
                                            ) : (
                                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 rounded-pill small" style={{ fontSize: '0.65rem' }}>Triggered</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-link text-danger p-0" onClick={() => handleDelete(alert.id)}>
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Alert Modal-like Backdrop */}
            {showForm && (
                <div className="position-fixed start-0 w-100 h-100 bg-black bg-opacity-50 d-flex align-items-end z-1050 animate-fade-in" style={{ zIndex: 1060, top: '95px' }} onClick={() => setShowForm(false)}>
                    <div className="bg-white w-100 rounded-top-5 p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}></div>
                        <h5 className="fw-bold mb-4">Set Price Alert</h5>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Select Asset</label>
                            <select
                                className="form-select p-3 rounded-4 border-0 bg-light"
                                value={formData.coin_symbol}
                                onChange={e => setFormData({ ...formData, coin_symbol: e.target.value })}
                            >
                                <option value="BTC">Bitcoin (BTC)</option>
                                <option value="ETH">Ethereum (ETH)</option>
                                <option value="USDT">Tether (USDT)</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Direction</label>
                            <select
                                className="form-select p-3 rounded-4 border-0 bg-light"
                                value={formData.direction}
                                onChange={e => setFormData({ ...formData, direction: e.target.value })}
                            >
                                <option value="above">Goes Above</option>
                                <option value="below">Goes Below</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">Target Price (USD)</label>
                            <input
                                type="number"
                                step="0.00000001"
                                className="form-control p-3 rounded-4 border-0 bg-light"
                                placeholder="e.g. 50000"
                                value={formData.target_price}
                                onChange={e => setFormData({ ...formData, target_price: e.target.value })}
                                required
                            />
                        </div>

                        <div className="d-grid gap-2">
                            <button className="btn btn-primary py-3 rounded-pill fw-bold shadow-sm" onClick={handleSubmit}>
                                Create Alert
                            </button>
                            <button className="btn btn-link text-muted text-decoration-none" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PriceAlerts;
