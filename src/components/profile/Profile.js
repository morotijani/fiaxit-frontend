import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import { Switch } from 'antd'
import ThemeToggle from '../ThemeToggle';

function Profile() {
    const navigate = useNavigate();
    const [biometric, setBiometric] = useState(false);
    const [authStore, authDispatch] = useContext(AuthContext);
    const fullName = authStore.user ? authStore.user.user_fname + ' ' + authStore.user.user_mname + ' ' + authStore.user.user_lname : 'Stranger';

    const settingsLink = () => {
        navigate('/settings');
    }

    const changePasswordLink = () => {
        navigate('/change-password');
    }

    const changePinLink = () => {
        navigate('/change-pin');
    }

    return (
        <div className="animate-fade-in">
            {/* top bar */}
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            {/* Header / Top Bar */}
            <div className="p-3 border-0 border-bottom d-flex align-items-center justify-content-between sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Profile & Settings</h6>
                <button className="btn btn-light rounded-circle p-2 shadow-sm" onClick={() => navigate("/notifications")}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>notifications</span>
                </button>
            </div>

            <div className="p-4">
                {/* User Info Header */}
                <div className="text-center mb-4">
                    <div className="avatar-placeholder mx-auto mb-2 bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-lg" style={{ width: '80px', height: '80px', fontSize: '24px' }}>
                        {authStore.user?.user_fname?.charAt(0)}{authStore.user?.user_lname?.charAt(0)}
                    </div>
                    <h5 className="fw-bold mb-1">{fullName}</h5>
                    <small className="text-muted">{authStore.user?.user_email}</small>
                </div>

                {/* Profile Section */}
                <h6 className="small fw-bold text-muted text-uppercase mb-3" style={{ letterSpacing: '1px' }}>Account Information</h6>
                <div className="list-group rounded-4 border shadow-sm mb-4">
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom">
                        <span className="text-secondary fw-semibold">Email</span>
                        <span className="fw-bold">{authStore.user?.user_email}</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom">
                        <span className="text-secondary fw-semibold">Phone</span>
                        <span className="fw-bold">{authStore.user?.user_phone || 'Not set'}</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom">
                        <span className="text-secondary fw-semibold">Joined</span>
                        <span className="fw-bold">{authStore.user?.createdAt ? new Date(authStore.user.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0">
                        <span className="text-secondary fw-semibold">Verification</span>
                        <span className={`badge rounded-pill ${authStore.user?.user_verified ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                            {authStore.user?.user_verified ? 'Verified' : 'Pending'}
                        </span>
                    </div>
                </div>

                {/* App Settings */}
                <h6 className="small fw-bold text-muted text-uppercase mb-3" style={{ letterSpacing: '1px' }}>Preferences</h6>
                <div className="list-group rounded-4 border shadow-sm mb-4">
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom" onClick={() => navigate('/transactions')} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center">
                            <span className="material-symbols-outlined me-3 text-primary">history</span>
                            <span className="fw-semibold">Transaction History</span>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom">
                        <div className="d-flex align-items-center">
                            <span className="material-symbols-outlined me-3 text-primary">dark_mode</span>
                            <span className="fw-semibold">Dark Mode</span>
                        </div>
                        <ThemeToggle />
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0">
                        <div className="d-flex align-items-center">
                            <span className="material-symbols-outlined me-3 text-primary">language</span>
                            <span className="fw-semibold">Language</span>
                        </div>
                        <span className="text-muted fw-bold">English</span>
                    </div>
                </div>

                {/* Security */}
                <h6 className="small fw-bold text-muted text-uppercase mb-3" style={{ letterSpacing: '1px' }}>Security & Auth</h6>
                <div className="list-group rounded-4 border shadow-sm mb-4">
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom">
                        <div className="d-flex align-items-center">
                            <span className="material-symbols-outlined me-3 text-primary">fingerprint</span>
                            <span className="fw-semibold">Biometric Authentication</span>
                        </div>
                        <Switch checked={biometric} onChange={setBiometric} size="small" />
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom" onClick={changePasswordLink} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center">
                            <span className="material-symbols-outlined me-3 text-primary">lock_reset</span>
                            <span className="fw-semibold">Change Password</span>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 text-danger" onClick={() => navigate('/auth/logout')} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center">
                            <span className="material-symbols-outlined me-3">logout</span>
                            <span className="fw-semibold">Sign Out</span>
                        </div>
                        <span className="material-symbols-outlined">exit_to_app</span>
                    </div>
                </div>

                <div className="text-center pb-5">
                    <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '2px' }}>Fiaxit Version 2.0.4</small>
                </div>
            </div>
        </div>
    )
}

export default Profile;