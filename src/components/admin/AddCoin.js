import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsonPost } from '../../helpers/Ajax';
import toast from 'react-hot-toast';

function AddCoin() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        type: 'ERC20',
        network: 'mainnet',
        contract_address: '',
        icon: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const resp = await jsonPost('coins', formData);
            if (resp.success) {
                toast.success('Coin added successfully!');
                navigate('/');
            } else {
                toast.error(resp.message || 'Failed to add coin');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex align-items-center p-3 border-bottom sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm me-3" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Add New Coin</h6>
            </div>

            <div className="p-4">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted text-uppercase">Coin Name</label>
                        <input name="name" className="form-control py-3 rounded-4 border-2" placeholder="e.g. Polygon" onChange={handleChange} required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted text-uppercase">Symbol</label>
                        <input name="symbol" className="form-control py-3 rounded-4 border-2" placeholder="e.g. MATIC" onChange={handleChange} required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted text-uppercase">Coin Type</label>
                        <select name="type" className="form-select py-3 rounded-4 border-2" onChange={handleChange}>
                            <option value="ERC20">ERC20 (Ethereum)</option>
                            <option value="TRC20">TRC20 (Tron)</option>
                            <option value="BTC">BTC (Bitcoin Native)</option>
                            <option value="ETH">ETH (Ethereum Native)</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted text-uppercase">Network</label>
                        <select name="network" className="form-select py-3 rounded-4 border-2" onChange={handleChange}>
                            <option value="mainnet">Mainnet</option>
                            <option value="testnet">Testnet</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted text-uppercase">Contract Address (Optional)</label>
                        <input name="contract_address" className="form-control py-3 rounded-4 border-2" placeholder="0x..." onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted text-uppercase">Icon URL (Optional)</label>
                        <input name="icon" className="form-control py-3 rounded-4 border-2" placeholder="https://..." onChange={handleChange} />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-3 rounded-4 fw-bold shadow-sm mb-4" disabled={loading}>
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Adding Coin...</>
                        ) : 'Confirm & Add Coin'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddCoin;
