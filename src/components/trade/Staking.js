import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { WalletContext } from '../../contexts/WalletContext';
import Button from '../elements/Button';
import { jsonPost, jsonGet } from '../../helpers/Ajax';
import toast from 'react-hot-toast';

function Staking() {
    const navigate = useNavigate();
    const [authStore] = useContext(AuthContext);
    const [walletStore] = useContext(WalletContext);

    const [activeStakes, setActiveStakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stakingAmount, setStakingAmount] = useState('');
    const [duration, setDuration] = useState(30);
    const [submitting, setSubmitting] = useState(false);

    const rates = {
        30: 2.5,
        90: 5.0,
        180: 8.0,
        365: 12.0
    };

    const fetchStakes = async () => {
        setLoading(true);
        try {
            const resp = await jsonGet('staking/my-stakes');
            if (resp && resp.success) {
                setActiveStakes(resp.data);
            }
        } catch (err) {
            toast.error("Failed to fetch staking data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStakes();
    }, []);

    const handleStake = async () => {
        if (!stakingAmount || stakingAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setSubmitting(true);
        try {
            const resp = await jsonPost('staking/stake', {
                amount: stakingAmount,
                duration_days: duration
            });

            if (resp && resp.success) {
                toast.success(resp.message);
                setStakingAmount('');
                fetchStakes();
            } else {
                toast.error(resp.message || "Staking failed");
            }
        } catch (err) {
            toast.error("An error occurred during staking");
        } finally {
            setSubmitting(false);
        }
    };

    const projectedInterest = (parseFloat(stakingAmount || 0) * (rates[duration] / 100) * (duration / 365)).toFixed(2);

    return (
        <div className="animate-fade-in p-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                    <button className="btn btn-light rounded-circle p-2 me-3 shadow-sm" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined text-secondary">arrow_back</span>
                    </button>
                    <h4 className="m-0 fw-bold">USDT Staking</h4>
                </div>
                <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                    <span className="small fw-bold">Up to 12% APY</span>
                </div>
            </div>

            {/* Staking Card */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 glass">
                <div className="card-body p-4">
                    <div className="row">
                        <div className="col-md-7">
                            <h6 className="text-muted small fw-bold text-uppercase mb-3">Create New Stake</h6>
                            <div className="mb-4">
                                <label className="form-label small text-muted">Amount to Lock (USDT)</label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text bg-light border-end-0 rounded-start-4">
                                        <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" width="24" alt="USDT" />
                                    </span>
                                    <input
                                        type="number"
                                        className="form-control bg-light border-start-0 rounded-end-4 fw-bold"
                                        placeholder="0.00"
                                        value={stakingAmount}
                                        onChange={(e) => setStakingAmount(e.target.value)}
                                    />
                                </div>
                                <div className="mt-2 d-flex justify-content-between p-2 bg-light rounded-3">
                                    <span className="small text-muted fw-medium">Internal Balance: <span className="text-dark fw-bold">$0.00</span></span>
                                    <button className="btn btn-link p-0 small text-decoration-none fw-bold" onClick={() => navigate('/wallets')}>Deposit USDT</button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small text-muted">Select Duration</label>
                                <div className="d-flex gap-2">
                                    {[30, 90, 180, 365].map(d => (
                                        <button
                                            key={d}
                                            className={`btn flex-fill rounded-3 py-2 fw-bold ${duration === d ? 'btn-primary shadow-sm' : 'btn-light border text-muted'}`}
                                            onClick={() => setDuration(d)}
                                        >
                                            {d} Days
                                            <div className="small opacity-75" style={{ fontSize: '10px' }}>{rates[d]}% APY</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-5">
                            <div className="rounded-4 p-4 h-100 border border-primary border-opacity-10 shadow-inner" style={{ background: 'rgba(0, 82, 255, 0.03)' }}>
                                <h6 className="text-primary small fw-bold text-uppercase mb-3 d-flex align-items-center">
                                    <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>analytics</span>
                                    Projection
                                </h6>
                                <div className="mb-3">
                                    <div className="text-muted small">Projected Interest</div>
                                    <div className="h3 fw-bold mb-0 text-primary">${projectedInterest}</div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-muted small">Total Return</div>
                                    <div className="h5 fw-bold mb-0 text-dark">
                                        ${(parseFloat(stakingAmount || 0) + parseFloat(projectedInterest)).toFixed(2)}
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm"
                                    onClick={handleStake}
                                    disabled={submitting || !stakingAmount}
                                >
                                    {submitting ? 'Processing...' : 'Lock Funds Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Stakes List */}
            <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="m-0 fw-bold">Active Savings</h5>
                    <button className="btn btn-sm btn-light border rounded-pill px-3" onClick={fetchStakes}>
                        <span className="material-symbols-outlined align-middle small me-1">refresh</span>
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : activeStakes.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-4 border border-dashed">
                        <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '48px' }}>savings</span>
                        <div className="text-muted">No active savings yet. Start staking to earn interest!</div>
                    </div>
                ) : (
                    <div className="vstack gap-3">
                        {activeStakes.map(stake => (
                            <div key={stake.staking_id} className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden hover-fade">
                                <div className="card-body p-3 d-flex align-items-center">
                                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3 text-success">
                                        <span className="material-symbols-outlined">trending_up</span>
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="fw-bold">{stake.amount} USDT</div>
                                                <div className="text-muted small">{stake.interest_rate}% APY • {stake.duration_days} Days</div>
                                            </div>
                                            <div className="text-end">
                                                <div className="text-success fw-bold">+${parseFloat(stake.interest_earned || 0).toFixed(4)}</div>
                                                <div className="badge bg-light text-dark small">Earned</div>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="d-flex justify-content-between small text-muted mb-1">
                                                <span>Ends: {new Date(stake.end_date).toLocaleDateString()}</span>
                                                <span>{Math.max(0, Math.ceil((new Date(stake.end_date) - new Date()) / (1000 * 3600 * 24)))} days left</span>
                                            </div>
                                            <div className="progress rounded-pill bg-light" style={{ height: '4px' }}>
                                                <div
                                                    className="progress-bar bg-success"
                                                    style={{ width: `${Math.min(100, (1 - (new Date(stake.end_date) - new Date()) / (stake.duration_days * 24 * 3600 * 1000)) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Staking;
