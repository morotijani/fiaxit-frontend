import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../profile/ChangePassword';
import ChangePIN from '../profile/ChangePIN';

function AdminSecurity() {
    const navigate = useNavigate();
    const [view, setView] = useState('overview'); // overview, password, pin

    const renderOverview = () => (
        <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto' }}>
            <div className="text-center mb-5">
                <h2 className="fw-normal mt-4" style={{ color: '#202124' }}>Security</h2>
                <p className="text-muted">Settings and recommendations to help you keep your account secure</p>
            </div>

            <div className="admin-card mb-4 border-success-subtle bg-success bg-opacity-10 shadow-none">
                <div className="d-flex align-items-center">
                    <div className="bg-success rounded-circle p-2 me-3 d-flex align-items-center justify-content-center">
                        <span className="material-symbols-outlined text-white">verified_user</span>
                    </div>
                    <div>
                        <h6 className="mb-0 fw-medium text-success">Your account is protected</h6>
                        <p className="mb-0 small text-muted">The Security Checkup scanned your account and found no recommended actions.</p>
                    </div>
                </div>
            </div>

            <div className="admin-card p-0 overflow-hidden mb-4">
                <div className="p-4 border-bottom">
                    <h5 className="admin-card-title mb-0">Signing in to Fiaxit</h5>
                    <p className="admin-card-text">Manage your password and other security credentials.</p>
                </div>

                <div className="list-group list-group-flush">
                    {/* PASSWORD */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between" style={{ cursor: 'pointer' }} onClick={() => setView('password')}>
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                                <span className="material-symbols-outlined me-3 text-muted">lock</span>
                                <span className="fw-medium text-dark">Password</span>
                            </div>
                            <div className="text-muted small ps-5">Last changed 3 months ago</div>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>

                    {/* PIN */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between" style={{ cursor: 'pointer' }} onClick={() => setView('pin')}>
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                                <span className="material-symbols-outlined me-3 text-muted">pin</span>
                                <span className="fw-medium text-dark">Transaction PIN</span>
                            </div>
                            <div className="text-muted small ps-5">Used for crypto withdrawals and high-value transfers</div>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>
                </div>
            </div>

            <div className="admin-card p-0 overflow-hidden mb-4 opacity-50">
                <div className="p-4 border-bottom">
                    <h5 className="admin-card-title mb-0">2-Step Verification</h5>
                    <p className="admin-card-text">Add an extra layer of security to your account (Coming Soon).</p>
                </div>
                <div className="p-4 bg-light">
                    <span className="badge bg-secondary px-3 py-2">Disabled</span>
                </div>
            </div>
        </div>
    );

    const renderPassword = () => (
        <div className="animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="mb-4">
                <button className="btn btn-link text-decoration-none p-0 d-flex align-items-center text-primary fw-medium" onClick={() => setView('overview')}>
                    <span className="material-symbols-outlined me-2">arrow_back</span>
                    Back to Security
                </button>
            </div>
            <div className="admin-card">
                <div className="mb-4">
                    <h5 className="fw-normal mb-1">Change password</h5>
                    <p className="text-muted small">Enter your current password to set a new one.</p>
                </div>
                {/* Reusing existing ChangePassword but we might need to style it or wrap it */}
                <ChangePassword variant="admin" onSuccess={() => setView('overview')} />
            </div>
        </div>
    );

    const renderPIN = () => (
        <div className="animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="mb-4">
                <button className="btn btn-link text-decoration-none p-0 d-flex align-items-center text-primary fw-medium" onClick={() => setView('overview')}>
                    <span className="material-symbols-outlined me-2">arrow_back</span>
                    Back to Security
                </button>
            </div>
            <div className="admin-card">
                <div className="mb-4">
                    <h5 className="fw-normal mb-1">Set Transaction PIN</h5>
                    <p className="text-muted small">Update your 6-digit PIN used for sensitive operations.</p>
                </div>
                <ChangePIN variant="admin" onSuccess={() => setView('overview')} />
            </div>
        </div>
    );

    switch (view) {
        case 'password': return renderPassword();
        case 'pin': return renderPIN();
        default: return renderOverview();
    }
}

export default AdminSecurity;
