import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { jsonGet, jsonPost } from '../../helpers/Ajax';
import toast from 'react-hot-toast';

function TwoFactorSettings() {
    const navigate = useNavigate();
    const [authStore, authDispatch] = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [setupData, setSetupData] = useState(null);
    const [token, setToken] = useState('');
    const [step, setStep] = useState('overview'); // 'overview', 'setup', 'verify'

    const isEnabled = authStore.user?.user_2fa_enabled;

    const fetchSetupData = async () => {
        setLoading(true);
        try {
            const res = await jsonGet('user/2fa/setup');
            if (res.success) {
                setSetupData(res.data);
                setStep('setup');
            } else {
                toast.error(res.message || 'Failed to fetch setup data');
            }
        } catch (err) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleEnable = async () => {
        if (!token || token.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }
        setLoading(true);
        try {
            const res = await jsonPost('user/2fa/enable', {
                secret: setupData.secret,
                token: token
            });
            if (res.success) {
                toast.success('2FA enabled successfully!');
                authDispatch({
                    type: 'updateUser',
                    payload: { ...authStore.user, user_2fa_enabled: true }
                });
                navigate('/profile');
            } else {
                toast.error(res.message || 'Verification failed');
            }
        } catch (err) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!token || token.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }
        setLoading(true);
        try {
            const res = await jsonPost('user/2fa/disable', { token });
            if (res.success) {
                toast.success('2FA disabled successfully');
                authDispatch({
                    type: 'updateUser',
                    payload: { ...authStore.user, user_2fa_enabled: false }
                });
                navigate('/profile');
            } else {
                toast.error(res.message || 'Verification failed');
            }
        } catch (err) {
            toast.error('An error occurred');
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
                <h6 className="m-0 fw-bold">Two-Factor Authentication</h6>
                <div style={{ width: '40px' }}></div>
            </div>

            <div className="p-4">
                {step === 'overview' && (
                    <div className="text-center">
                        <div className={`d-inline-flex align-items-center justify-content-center rounded-circle mb-4 shadow-sm ${isEnabled ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`} style={{ width: '80px', height: '80px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                                {isEnabled ? 'shield_check' : 'shield_person'}
                            </span>
                        </div>
                        <h5 className="fw-bold mb-2">{isEnabled ? '2FA is Enabled' : 'Secure Your Account'}</h5>
                        <p className="text-muted small mb-4">
                            Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to log in.
                        </p>

                        <div className="bg-white rounded-4 border p-4 mb-4 text-start shadow-sm">
                            <div className="d-flex align-items-start mb-3">
                                <span className="material-symbols-outlined text-primary me-3">app_shortcut</span>
                                <div>
                                    <div className="fw-bold small">Authenticator App</div>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>Use apps like Google Authenticator or Authy to generate secure codes.</div>
                                </div>
                            </div>
                        </div>

                        {isEnabled ? (
                            <button className="btn btn-outline-danger w-100 rounded-pill py-3 fw-bold" onClick={() => setStep('verify')}>
                                Disable 2FA
                            </button>
                        ) : (
                            <button className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm" onClick={fetchSetupData} disabled={loading}>
                                {loading ? 'Loading...' : 'Enable 2FA'}
                            </button>
                        )}
                    </div>
                )}

                {step === 'setup' && (
                    <div className="animate-slide-up">
                        <div className="text-center mb-4">
                            <h6 className="fw-bold">Step 1: Scan QR Code</h6>
                            <p className="text-muted small">Scan this code with your authenticator app.</p>

                            <div className="bg-white p-3 d-inline-block rounded-4 border shadow-sm mb-3">
                                {setupData?.qrCode ? (
                                    <img src={setupData.qrCode} alt="2FA QR Code" style={{ width: '200px', height: '200px' }} />
                                ) : (
                                    <div className="spinner-border text-primary" role="status"></div>
                                )}
                            </div>

                            <div className="mt-2 text-start bg-light p-3 rounded-4 border">
                                <div className="small fw-bold text-muted mb-1 text-uppercase">Unable to scan?</div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <code className="text-primary fw-bold" style={{ fontSize: '1rem' }}>{setupData?.secret}</code>
                                    <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => {
                                        navigator.clipboard.writeText(setupData?.secret);
                                        toast.success('Secret copied');
                                    }}>Copy</button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h6 className="fw-bold text-center">Step 2: Enter 6-digit Code</h6>
                            <input
                                type="text"
                                className="form-control form-control-lg text-center fw-bold rounded-4 shadow-sm mb-4 border-2 border-primary-subtle"
                                placeholder="000000"
                                maxLength="6"
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                style={{ letterSpacing: '8px', fontSize: '24px' }}
                            />
                            <button className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm" onClick={handleEnable} disabled={loading || token.length !== 6}>
                                {loading ? 'Enabling...' : 'Verify and Enable'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="animate-slide-up">
                        <div className="text-center mb-4">
                            <h5 className="fw-bold">Disable 2FA</h5>
                            <p className="text-muted small">Enter the 6-digit code from your authenticator app to disable 2FA.</p>
                        </div>

                        <input
                            type="text"
                            className="form-control form-control-lg text-center fw-bold rounded-4 shadow-sm mb-4 border-2 border-danger-subtle"
                            placeholder="000000"
                            maxLength="6"
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                            style={{ letterSpacing: '8px', fontSize: '24px' }}
                        />

                        <div className="d-grid gap-3">
                            <button className="btn btn-danger w-100 rounded-pill py-3 fw-bold shadow-sm" onClick={handleDisable} disabled={loading || token.length !== 6}>
                                {loading ? 'Disabling...' : 'Confirm Disable'}
                            </button>
                            <button className="btn btn-light w-100 rounded-pill py-3 fw-bold border" onClick={() => setStep('overview')}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TwoFactorSettings;
