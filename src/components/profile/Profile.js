import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import { Switch } from 'antd'
import ThemeToggle from '../ThemeToggle';

import { jsonPost } from '../../helpers/Ajax'
import toast from 'react-hot-toast'

function Profile() {
    const navigate = useNavigate();
    const [biometric, setBiometric] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [authStore, authDispatch] = useContext(AuthContext);
    const fullName = authStore.user ? authStore.user.user_fname + ' ' + (authStore.user.user_mname ? authStore.user.user_mname + ' ' : '') + authStore.user.user_lname : 'Stranger';

    const settingsLink = () => {
        navigate('/settings');
    }

    const changePasswordLink = () => {
        navigate('/change-password');
    }

    const changePinLink = () => {
        navigate('/change-pin');
    }

    const handleImageUploadInvalid = (e) => {
        toast.error('Please select a valid image file');
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('profile_image', file);

        setUploading(true);
        try {
            const result = await jsonPost('user/profile-image', data);

            if (result.success) {
                toast.success('Profile picture updated!');
                // Update local user state
                authDispatch({
                    type: 'updateUser',
                    payload: { ...authStore.user, user_image: result.data.user.user_image }
                });
            } else {
                toast.error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Profile image upload error:', error);
            toast.error('An error occurred during upload');
        } finally {
            setUploading(false);
        }
    };

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
                <div className="text-center mb-4 position-relative">
                    <div
                        className="avatar-container mx-auto mb-2 position-relative"
                        style={{ width: '100px', height: '100px' }}
                        onClick={() => document.getElementById('profileUpload').click()}
                    >
                        {authStore.user?.user_image ? (
                            <img
                                src={`${authStore.user.user_image}?t=${new Date().getTime()}`}
                                alt="Profile"
                                className="rounded-circle shadow-lg object-fit-cover w-100 h-100 border border-3 border-primary"
                            />
                        ) : (
                            <div className="avatar-placeholder w-100 h-100 bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-lg" style={{ fontSize: '32px' }}>
                                {authStore.user?.user_fname?.charAt(0)}{authStore.user?.user_lname?.charAt(0)}
                            </div>
                        )}
                        <div className="position-absolute bottom-0 end-0 bg-white rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>photo_camera</span>
                        </div>
                        {uploading && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center">
                                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        id="profileUpload"
                        className="d-none"
                        accept="image/*"
                        onChange={handleImageUpload}
                        onInvalid={handleImageUploadInvalid}
                    />
                    <h5 className="fw-bold mb-1">{fullName}</h5>
                    <div className="d-flex align-items-center justify-content-center">
                        <small className="text-muted">{authStore.user?.user_email}</small>
                        {authStore.user?.kyc_status === 'verified' && (
                            <span className="material-symbols-outlined text-success ms-1" style={{ fontSize: '16px' }}>verified</span>
                        )}
                    </div>
                </div>

                {/* KYC Status Banner */}
                <div className={`p-3 rounded-4 mb-4 border d-flex align-items-center justify-content-between ${authStore.user?.kyc_status === 'verified' ? 'bg-success-subtle border-success-subtle' :
                    authStore.user?.kyc_status === 'pending' ? 'bg-info-subtle border-info-subtle' :
                        'bg-warning-subtle border-warning-subtle'
                    }`}>
                    <div className="d-flex align-items-center">
                        <span className="material-symbols-outlined me-3">
                            {authStore.user?.kyc_status === 'verified' ? 'verified_user' :
                                authStore.user?.kyc_status === 'pending' ? 'hourglass_empty' : 'warning'}
                        </span>
                        <div>
                            <p className="m-0 fw-bold small">KYC Verification</p>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {authStore.user?.kyc_status === 'verified' ? 'Your account is fully verified.' :
                                    authStore.user?.kyc_status === 'pending' ? 'Review in progress...' :
                                        'Verify to increase transaction limits.'}
                            </small>
                        </div>
                    </div>
                    {authStore.user?.kyc_status !== 'verified' && authStore.user?.kyc_status !== 'pending' && (
                        <button
                            className="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => navigate('/kyc-submit')}
                        >
                            Verify Now
                        </button>
                    )}
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
                        <span className="text-secondary fw-semibold">KYC Status</span>
                        <span className={`badge rounded-pill ${authStore.user?.kyc_status === 'verified' ? 'bg-success-subtle text-success' :
                            authStore.user?.kyc_status === 'pending' ? 'bg-info-subtle text-info' :
                                'bg-warning-subtle text-warning'}`}>
                            {authStore.user?.kyc_status?.toUpperCase() || 'UNVERIFIED'}
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
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom" onClick={changePinLink} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center">
                            <span className="material-symbols-outlined me-3 text-primary">lock_reset</span>
                            <span className="fw-semibold">Change PIN</span>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom" onClick={() => navigate('/two-factor')} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center">
                            <span className="material-symbols-outlined me-3 text-primary">security</span>
                            <span className="fw-semibold">Two-Factor Authentication</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <span className={`badge rounded-pill me-2 ${authStore.user?.user_2fa_enabled ? 'bg-success' : 'bg-light text-muted'}`}>
                                {authStore.user?.user_2fa_enabled ? 'On' : 'Off'}
                            </span>
                            <span className="material-symbols-outlined text-muted">chevron_right</span>
                        </div>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom" onClick={() => navigate('/whitelisting')} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center">
                            <span className="material-symbols-outlined me-3 text-primary">verified_user</span>
                            <span className="fw-semibold">Address Whitelisting</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <span className={`badge rounded-pill me-2 ${authStore.user?.user_whitelisting_enabled ? 'bg-success' : 'bg-light text-muted'}`}>
                                {authStore.user?.user_whitelisting_enabled ? 'On' : 'Off'}
                            </span>
                            <span className="material-symbols-outlined text-muted">chevron_right</span>
                        </div>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom" onClick={() => navigate('/sessions')} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center">
                            <span className="material-symbols-outlined me-3 text-primary">devices</span>
                            <span className="fw-semibold">Active Sessions</span>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 border-bottom" onClick={() => navigate('/anti-phishing')} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center">
                            <span className="material-symbols-outlined me-3 text-primary">marking</span>
                            <span className="fw-semibold">Anti-Phishing Code</span>
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