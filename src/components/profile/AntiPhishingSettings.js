import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { jsonPatch } from '../../helpers/Ajax';
import toast from 'react-hot-toast';

function AntiPhishingSettings() {
    const navigate = useNavigate();
    const [authStore, authDispatch] = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState(authStore.user?.user_anti_phishing_code || '');

    const handleUpdate = async () => {
        if (code.length < 4 && code.length > 0) {
            toast.error('Code must be at least 4 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await jsonPatch('user/anti-phishing', { code });
            if (res.success) {
                toast.success('Anti-phishing code updated');
                authDispatch({
                    type: 'updateUser',
                    payload: { ...authStore.user, user_anti_phishing_code: code }
                });
                navigate('/profile');
            }
        } catch (err) {
            toast.error('Failed to update code');
        } finally {
            setLoading(false);
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
                <h6 className="m-0 fw-bold">Anti-Phishing Code</h6>
                <div style={{ width: '40px' }}></div>
            </div>

            <div className="p-4 text-center">
                <div className="bg-primary-subtle text-primary rounded-circle p-4 mx-auto mb-4 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '80px', height: '80px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>lock_person</span>
                </div>

                <h5 className="fw-bold mb-2">Protect Your Identity</h5>
                <p className="text-muted small mb-4">
                    Setting an anti-phishing code helps you distinguish between legitimate Fiaxit emails and phishing attempts.
                </p>

                <div className="bg-white rounded-4 border p-4 mb-4 text-start shadow-sm">
                    <p className="small text-muted mb-3">
                        Once set, this code will be included in the header of every official email we send to you.
                    </p>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Your Custom Code</label>
                        <input
                            type="text"
                            className="form-control form-control-lg p-3 rounded-4 border-2 border-primary-subtle fw-bold"
                            placeholder="e.g. FIAXIT-SECURE-2024"
                            maxLength="20"
                            value={code}
                            onChange={e => setCode(e.target.value.toUpperCase())}
                        />
                    </div>
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                        * Maximum 20 characters, uppercase only recommended.
                    </small>
                </div>

                <div className="d-grid gap-3">
                    <button className="btn btn-primary rounded-pill py-3 fw-bold shadow-sm" onClick={handleUpdate} disabled={loading}>
                        {loading ? 'Updating...' : 'Save Anti-Phishing Code'}
                    </button>
                    <button className="btn btn-light rounded-pill py-3 fw-bold border" onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AntiPhishingSettings;
