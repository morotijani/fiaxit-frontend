import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { WalletContext } from '../../contexts/WalletContext';
import { jsonPost, jsonGet } from '../../helpers/Ajax';
import toast from 'react-hot-toast';

function Withdraw() {
    const navigate = useNavigate();
    const [authStore] = useContext(AuthContext);
    const [walletStore] = useContext(WalletContext);

    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [selectedCoin, setSelectedCoin] = useState('USDT');
    const [submitting, setSubmitting] = useState(false);

    const fetchBalances = async () => {
        setLoading(true);
        try {
            const resp = await jsonGet('wallets/internal-balances');
            if (resp && resp.success) {
                setBalances(resp.data);
            }
        } catch (err) {
            toast.error("Failed to fetch internal balances");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, []);

    const handleWithdraw = async () => {
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (!address) {
            toast.error("Please enter a recipient address");
            return;
        }

        setSubmitting(true);
        try {
            // This would be the logic to move funds from custodial internal balance to external address
            const resp = await jsonPost('transactions/create', {
                crypto_symbol: selectedCoin,
                amount: amount,
                receiver_address: address,
                type: 'withdraw',
                is_internal: false
            });

            if (resp && resp.success) {
                toast.success("Withdrawal request submitted successfully");
                setAmount('');
                setAddress('');
                fetchBalances();
            } else {
                toast.error(resp.message || "Withdrawal failed");
            }
        } catch (err) {
            toast.error("An error occurred during withdrawal");
        } finally {
            setSubmitting(false);
        }
    };

    const currentBalance = balances.find(b => b.coin_symbol === selectedCoin)?.balance || 0;

    return (
        <div className="animate-fade-in p-4">
            <div className="d-flex align-items-center mb-4">
                <button className="btn btn-light rounded-circle p-2 me-3 shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary">arrow_back</span>
                </button>
                <h4 className="m-0 fw-bold">Withdraw Funds</h4>
            </div>

            <div className="card border-0 shadow-lg rounded-4 glass p-4 mb-4">
                <div className="mb-4">
                    <label className="form-label small text-muted">Select Asset</label>
                    <select
                        className="form-select bg-light border-0 rounded-3 py-3 fw-bold"
                        value={selectedCoin}
                        onChange={(e) => setSelectedCoin(e.target.value)}
                    >
                        <option value="USDT">USDT (Tether)</option>
                        <option value="BTC">BTC (Bitcoin)</option>
                        <option value="ETH">ETH (Ethereum)</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="form-label small text-muted">Amount to Withdraw</label>
                    <div className="input-group">
                        <input
                            type="number"
                            className="form-control bg-light border-0 rounded-start-3 py-3 fw-bold"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <button className="btn btn-light border-0 px-3 fw-bold text-primary" onClick={() => setAmount(currentBalance)}>MAX</button>
                    </div>
                    <div className="mt-2 small text-muted d-flex justify-content-between">
                        <span>Available Internal Balance:</span>
                        <span className="fw-bold text-dark">{currentBalance} {selectedCoin}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label small text-muted">Recipient Address</label>
                    <input
                        type="text"
                        className="form-control bg-light border-0 rounded-3 py-3"
                        placeholder="Paste destination wallet address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>

                <div className="alert bg-primary bg-opacity-10 border-0 rounded-4 p-3 mb-4">
                    <div className="d-flex">
                        <span className="material-symbols-outlined text-primary me-2">info</span>
                        <div className="small">
                            <div className="fw-bold text-primary">Network Fees Apply</div>
                            <div className="text-muted">Withdrawals to external wallets are processed on-chain and incur standard network fees.</div>
                        </div>
                    </div>
                </div>

                <button
                    className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm"
                    onClick={handleWithdraw}
                    disabled={submitting || !amount || !address}
                >
                    {submitting ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
            </div>
        </div>
    );
}

export default Withdraw;
