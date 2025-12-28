import React, { useState, useEffect, useContext } from 'react';
import { jsonGet, jsonPost } from '../../helpers/Ajax';
import { WalletContext } from '../../contexts/WalletContext';
import toast from 'react-hot-toast';
import '../trade/SelectAsset.css'; // Reusing styles for consistency

const CreateWalletModal = ({ isOpen, onClose }) => {
    const [walletStore, walletDispatch] = useContext(WalletContext);
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState('');
    const [walletName, setWalletName] = useState('');
    const [selectedCoin, setSelectedCoin] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedCoin(null);
            setWalletName('');
            return;
        };

        const fetchCoins = async () => {
            setLoading(true);
            try {
                const resp = await jsonGet('coins');
                if (resp && resp.success) {
                    // Filter out coins that already have wallets
                    const existingSymbols = (walletStore.wallets || []).map(w => w.wallet_symbol.toUpperCase());
                    const availableCoins = resp.data.filter(c => !existingSymbols.includes(c.coin_symbol.toUpperCase()));
                    setCoins(availableCoins);
                } else {
                    toast.error(resp?.message || 'Failed to fetch supported coins');
                }
            } catch (err) {
                console.error('Error fetching coins:', err);
                toast.error('Network error while fetching coins');
            } finally {
                setLoading(false);
            }
        };

        fetchCoins();
    }, [isOpen, walletStore.wallets]);

    const handleCreateWallet = async () => {
        if (!selectedCoin) return;
        setCreating(true);
        const toastId = toast.loading(`Generating ${selectedCoin.coin_symbol} wallet...`);
        try {
            const resp = await jsonPost(`wallets/${selectedCoin.coin_symbol.toLowerCase()}/generate`, {
                wallet_name: walletName
            });
            if (resp && resp.success) {
                toast.success(`${selectedCoin.coin_symbol} wallet created successfully!`, { id: toastId });

                // Refresh global wallet list
                const refreshResp = await jsonGet('wallets');
                if (refreshResp && refreshResp.success) {
                    walletDispatch({
                        type: 'setWallets',
                        payload: {
                            wallets: refreshResp.data,
                            total: refreshResp.total,
                            rates: refreshResp.rates
                        }
                    });
                }
                onClose();
            } else {
                toast.error(resp?.message || 'Failed to create wallet', { id: toastId });
            }
        } catch (err) {
            console.error('Error creating wallet:', err);
            toast.error('Network error during wallet generation', { id: toastId });
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    const filteredCoins = coins.filter(c =>
        c.coin_name.toLowerCase().includes(search.toLowerCase()) ||
        c.coin_symbol.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header-section">
                    <h2 className="modal-title">Select Coin</h2>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                <div className="search-bar-container">
                    {!selectedCoin ? (
                        <input
                            type="text"
                            placeholder="Search coins"
                            className="search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    ) : (
                        <div className="d-flex align-items-center bg-light rounded-pill px-3 py-2">
                            <button
                                onClick={() => setSelectedCoin(null)}
                                className="border-0 bg-transparent p-0 me-2"
                                title="Back to selection"
                            >
                                <span className="material-symbols-outlined align-middle" style={{ fontSize: '20px' }}>arrow_back</span>
                            </button>
                            <span className="small fw-semibold">{selectedCoin.coin_name} Wallet Name</span>
                        </div>
                    )}
                </div>

                <div className="assets-list">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                            <div className="text-muted small mt-2">Fetching available coins...</div>
                        </div>
                    ) : !selectedCoin ? (
                        filteredCoins.length === 0 ? (
                            <div className="text-center py-5">
                                <p className="text-muted small">No new coins available for registration.</p>
                            </div>
                        ) : (
                            filteredCoins.map(coin => (
                                <div
                                    key={coin.coin_id}
                                    className="asset-item d-flex align-items-center p-3 border-bottom"
                                    onClick={() => {
                                        setSelectedCoin(coin);
                                        setWalletName(`Main ${coin.coin_symbol} Wallet`);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="asset-icon me-3">
                                        <img
                                            src={coin.coin_icon}
                                            alt={coin.coin_symbol}
                                            style={{ width: '32px', height: '32px' }}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=' + coin.coin_symbol[0] }}
                                        />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="fw-bold">{coin.coin_name}</div>
                                        <div className="text-muted small">{coin.coin_symbol} • {coin.coin_type}</div>
                                    </div>
                                    <span className="material-symbols-outlined text-muted">chevron_right</span>
                                </div>
                            ))
                        )
                    ) : (
                        <div className="p-4">
                            <div className="mb-4">
                                <label className="form-label small text-muted fw-bold">WALLET NAME (OPTIONAL)</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg rounded-3 border-0 bg-light shadow-none"
                                    placeholder={`e.g. ${selectedCoin.coin_symbol} Savings`}
                                    value={walletName}
                                    onChange={(e) => setWalletName(e.target.value)}
                                    autoFocus
                                />
                                <div className="form-text small text-muted mt-2">
                                    Give your wallet a name to help you identify it later.
                                </div>
                            </div>

                            <button
                                className="btn btn-primary w-100 py-3 rounded-3 shadow-sm fw-bold mb-2"
                                onClick={handleCreateWallet}
                                disabled={creating}
                            >
                                {creating ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</>
                                ) : (
                                    `Create ${selectedCoin.coin_symbol} Wallet`
                                )}
                            </button>

                            <button
                                className="btn btn-link w-100 text-decoration-none text-muted small"
                                onClick={() => setSelectedCoin(null)}
                                disabled={creating}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateWalletModal;
