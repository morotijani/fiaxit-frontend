import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CoinContext } from '../../contexts/CoinContext';
import { jsonGet, jsonPost, jsonDelete, jsonPatch } from '../../helpers/Ajax';
import toast from 'react-hot-toast';
import { Switch } from 'antd';
import { validateWalletAddress } from '../../helpers/Validators';

function WhitelistingSettings() {
    const navigate = useNavigate();
    const [authStore, authDispatch] = useContext(AuthContext);
    const [coinStore] = useContext(CoinContext);
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newAddr, setNewAddr] = useState({ address: '', coin_symbol: '', label: '' });

    const isEnabled = authStore.user?.user_whitelisting_enabled;

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await jsonGet('user/whitelisting');
            if (res.success) {
                setAddresses(res.data);
            }
        } catch (err) {
            toast.error('Failed to load whitelisted addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (checked) => {
        try {
            const res = await jsonPatch('user/whitelisting/toggle', { enabled: checked });
            if (res.success) {
                authDispatch({
                    type: 'updateUser',
                    payload: { ...authStore.user, user_whitelisting_enabled: checked }
                });
                toast.success(res.message);
            }
        } catch (err) {
            toast.error('Failed to update whitelisting status');
        }
    };

    const handleAddAddress = async () => {
        if (!newAddr.address || !newAddr.coin_symbol) {
            toast.error('Address and Coin are required');
            return;
        }

        const validation = validateWalletAddress(newAddr.address, newAddr.coin_symbol);
        if (!validation.isValid) {
            toast.error(validation.message);
            return;
        }

        setLoading(true);
        try {
            const res = await jsonPost('user/whitelisting', newAddr);
            if (res.success) {
                toast.success('Address added to whitelist');
                setAddresses([...addresses, res.data]);
                setShowAdd(false);
                setNewAddr({ address: '', coin_symbol: '', label: '' });
            }
        } catch (err) {
            toast.error('Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this address?')) return;
        try {
            const res = await jsonDelete(`user/whitelisting/${id}`);
            if (res.success) {
                toast.success('Address removed');
                setAddresses(addresses.filter(a => a.address_id !== id));
            }
        } catch (err) {
            toast.error('Failed to remove address');
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Top Handle */}
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            {/* Header */}
            <div className="p-3 border-0 border-bottom d-flex align-items-center justify-content-between sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Address Whitelisting</h6>
                <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold" onClick={() => setShowAdd(true)}>
                    Add
                </button>
            </div>

            <div className="p-4">
                <div className="bg-white rounded-4 border shadow-sm p-3 mb-4 d-flex align-items-center justify-content-between">
                    <div>
                        <div className="fw-bold">Whitelist Protection</div>
                        <small className="text-muted">Only allow withdrawals to whitelisted addresses.</small>
                    </div>
                    <Switch checked={isEnabled} onChange={handleToggle} />
                </div>

                <h6 className="small fw-bold text-muted text-uppercase mb-3" style={{ letterSpacing: '1px' }}>Whitelisted Addresses</h6>

                {loading && addresses.length === 0 ? (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="text-center p-5 bg-light rounded-4 border border-dashed">
                        <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>list_alt</span>
                        <p className="text-muted mt-2">No addresses whitelisted yet.</p>
                    </div>
                ) : (
                    <div className="list-group rounded-4 border shadow-sm">
                        {addresses.map(addr => (
                            <div key={addr.address_id} className="list-group-item p-3 border-0 border-bottom d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary-subtle text-primary rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                        <span className="fw-bold small">{addr.coin_symbol}</span>
                                    </div>
                                    <div>
                                        <div className="fw-bold small">{addr.label || 'Unnamed Address'}</div>
                                        <div className="text-muted text-truncate" style={{ fontSize: '0.75rem', maxWidth: '180px' }}>{addr.address}</div>
                                    </div>
                                </div>
                                <button className="btn btn-link text-danger p-0" onClick={() => handleDelete(addr.address_id)}>
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Address Modal-like Backdrop */}
            {showAdd && (
                <div className="position-fixed start-0 w-100 h-100 bg-black bg-opacity-50 d-flex align-items-end z-1050 animate-fade-in" style={{ zIndex: 1060, top: '95px' }} onClick={() => setShowAdd(false)}>
                    <div className="bg-white w-100 rounded-top-5 p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}></div>
                        <h5 className="fw-bold mb-4">Add Whitelisted Address</h5>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Label (Optional)</label>
                            <input type="text" className="form-control p-3 rounded-4 border-0 bg-light" placeholder="e.g. My Ledger Wallet" value={newAddr.label} onChange={e => setNewAddr({ ...newAddr, label: e.target.value })} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Select Asset</label>
                            <select className="form-select p-3 rounded-4 border-0 bg-light" value={newAddr.coin_symbol} onChange={e => setNewAddr({ ...newAddr, coin_symbol: e.target.value })}>
                                <option value="">Select Coin</option>
                                {coinStore.coins.map(c => (
                                    <option key={c.coin_symbol} value={c.coin_symbol}>{c.coin_name} ({c.coin_symbol})</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">Wallet Address</label>
                            <textarea className="form-control p-3 rounded-4 border-0 bg-light" rows="2" placeholder="Paste address here" value={newAddr.address} onChange={e => setNewAddr({ ...newAddr, address: e.target.value })}></textarea>
                        </div>

                        <div className="d-grid gap-2">
                            <button className="btn btn-primary py-3 rounded-pill fw-bold shadow-sm" onClick={handleAddAddress} disabled={loading}>
                                {loading ? 'Adding...' : 'Add to Whitelist'}
                            </button>
                            <button className="btn btn-link text-muted text-decoration-none" onClick={() => setShowAdd(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WhitelistingSettings;
