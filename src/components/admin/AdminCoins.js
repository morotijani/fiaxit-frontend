import React, { useState, useEffect } from 'react';
import { jsonGet, jsonPost, jsonPatch } from '../../helpers/Ajax';

function AdminCoins() {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        type: 'crypto',
        contract_address: '',
        network: 'mainnet',
        icon: ''
    });

    const fetchCoins = async () => {
        try {
            setLoading(true);
            const resp = await jsonGet('coins');
            if (resp && resp.success) {
                setCoins(resp.data);
            }
        } catch (err) {
            console.error("Fetch coins error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoins();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resp = await jsonPost('coins', formData);
            if (resp && resp.success) {
                setShowAdd(false);
                setFormData({ name: '', symbol: '', type: 'crypto', contract_address: '', network: 'mainnet', icon: '' });
                fetchCoins();
            } else {
                alert(resp?.message || "Failed to add coin");
            }
        } catch (err) {
            alert("Error adding coin");
        }
    };

    const toggleCoinStatus = async (coinId, currentStatus) => {
        try {
            const resp = await jsonPatch(`coins/${coinId}`, { status: !currentStatus });
            if (resp && resp.success) {
                fetchCoins();
            }
        } catch (err) {
            console.error("Toggle status error:", err);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-4 d-flex align-items-center justify-content-between">
                <div>
                    <h2 className="fw-normal" style={{ color: '#202124' }}>Assets & configuration</h2>
                    <p className="text-muted small">Manage the cryptocurrencies, tokens, and networks supported by the Fiaxit ecosystem.</p>
                </div>
                <button
                    className="admin-btn-primary d-flex align-items-center"
                    onClick={() => setShowAdd(!showAdd)}
                >
                    <span className="material-symbols-outlined me-2" style={{ fontSize: '20px' }}>{showAdd ? 'close' : 'add'}</span>
                    {showAdd ? 'Discard' : 'New asset'}
                </button>
            </div>

            {showAdd && (
                <div className="admin-card mb-5 animate-slide-up bg-light bg-opacity-10 border-primary border-opacity-25">
                    <div className="d-flex align-items-center mb-4 text-primary">
                        <span className="material-symbols-outlined me-2">toll</span>
                        <h3 className="admin-card-title mb-0">Add new crypto asset</h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-medium" style={{ fontSize: '10px' }}>ASSET NAME</label>
                                <input
                                    type="text"
                                    className="form-control border shadow-none p-3"
                                    placeholder="e.g. Ethereum"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small text-muted text-uppercase fw-medium" style={{ fontSize: '10px' }}>SYMBOL</label>
                                <input
                                    type="text"
                                    className="form-control border shadow-none p-3"
                                    placeholder="ETH"
                                    required
                                    value={formData.symbol}
                                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small text-muted text-uppercase fw-medium" style={{ fontSize: '10px' }}>PROTOCOL</label>
                                <select
                                    className="form-select border shadow-none p-3"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="crypto">Native</option>
                                    <option value="ERC20">ERC20</option>
                                    <option value="BEP20">BEP20</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small text-muted text-uppercase fw-medium" style={{ fontSize: '10px' }}>NETWORK</label>
                                <input
                                    type="text"
                                    className="form-control border shadow-none p-3"
                                    placeholder="mainnet"
                                    value={formData.network}
                                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                                />
                            </div>
                            <div className="col-12 text-end mt-4">
                                <button type="submit" className="admin-btn-primary px-5">Publish asset</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-4">
                {coins.map(coin => (
                    <div className="col-md-6 col-xl-4" key={coin.coin_id}>
                        <div className="admin-card h-100 d-flex flex-column">
                            <div className="d-flex align-items-start mb-4">
                                <div className="bg-light rounded-2 border d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '28px' }}>toll</span>
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <h4 className="admin-card-title mb-0 text-truncate">{coin.coin_name}</h4>
                                    <div className="text-muted small fw-medium mt-1">
                                        <span className="badge bg-light text-dark border fw-normal me-2">{coin.coin_symbol}</span>
                                        {coin.coin_type.toUpperCase()}
                                    </div>
                                </div>
                                <div className="form-check form-switch p-0 ms-2">
                                    <input
                                        className="form-check-input ms-0"
                                        type="checkbox"
                                        style={{ cursor: 'pointer', scale: '1.2' }}
                                        checked={coin.coin_status}
                                        onChange={() => toggleCoinStatus(coin.coin_id, coin.coin_status)}
                                    />
                                </div>
                            </div>

                            <div className="mt-auto pt-3 border-top bg-light bg-opacity-10 p-3 m-n3 mt-3 rounded-bottom">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small text-muted">Network:</span>
                                    <span className="small fw-medium text-dark">{coin.coin_network}</span>
                                </div>
                                {coin.coin_contract_address ? (
                                    <div className="overflow-hidden">
                                        <span className="small text-muted d-block mb-1">Contract:</span>
                                        <code className="d-block text-truncate p-2 bg-white border rounded small" style={{ fontSize: '10px' }}>{coin.coin_contract_address}</code>
                                    </div>
                                ) : (
                                    <div className="small text-muted font-italic">Native network asset</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {coins.length === 0 && !loading && (
                    <div className="col-12 text-center py-5 border rounded-2 bg-light bg-opacity-10">
                        <span className="material-symbols-outlined text-muted opacity-25" style={{ fontSize: '64px' }}>account_balance</span>
                        <p className="text-muted mt-3">No assets configured yet. Click "New asset" to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminCoins;
