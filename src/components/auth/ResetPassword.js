import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FieldBlock from '../elements/FieldBlock';
import { jsonPost } from '../../helpers/Ajax';
import toast from 'react-hot-toast';
import Logo from '../../assets/fiaxit-light-logo.png';

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (!token) {
            toast.error('Invalid reset session. Please start over.');
            return;
        }

        setLoading(true);
        try {
            const res = await jsonPost('auth/reset-password', {
                resetToken: token,
                newPassword: password,
                confirmPassword: confirmPassword
            });
            if (res.success) {
                toast.success('Password reset successfully! You can now log in.');
                navigate('/auth/login');
            } else {
                toast.error(res.errors.message || 'Failed to reset password');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
                <div className="card shadow-lg border-0 p-5 text-center" style={{ maxWidth: '400px' }}>
                    <div className="text-danger mb-3">
                        <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>error</span>
                    </div>
                    <h4>Invalid Request</h4>
                    <p className="text-muted">This password reset link is invalid or has expired.</p>
                    <button className="btn btn-primary mt-3" onClick={() => navigate('/auth/forgot-password')}>
                        Start Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
                <div className="card shadow-lg border-0 p-4 main-card-container" style={{ maxWidth: '400px', width: '100%' }}>

                    {/* top bar */}
                    <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}></div>

                    <div className="text-center mt-2">
                        <img className="img-fluid mb-4" src={Logo} alt="Fiaxit" style={{ height: "40px" }} />
                        <h3 className="fw-700 mb-2" style={{ letterSpacing: '-1px' }}>Create strong password</h3>
                        <p className="text-muted small">Your new password must be different from previous used passwords.</p>
                    </div>

                    {/* Illustration */}
                    <div className="d-flex justify-content-center my-4">
                        <div className="bg-light rounded-circle p-4 d-flex align-items-center justify-content-center shadow-inner" style={{ width: '180px', height: '180px' }}>
                            <img
                                src="https://blush.design/api/download?shareUri=Y2G3QlYlLJxlPVBB&c=Hair_0%7Ec38741_Skin_0%7Ec26e5e&w=800&h=800&fm=png"
                                alt="Verification Illustration"
                                className="img-fluid"
                                style={{ width: "140px", height: "auto" }}
                            />
                        </div>
                    </div>

                    <div className="px-2 mt-4">
                        <div className="mb-3">
                            <FieldBlock
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                label="New Password"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="mb-4">
                            <FieldBlock
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                label="Confirm New Password"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            className="btn btn-primary w-100 py-3 mb-4 shadow"
                            onClick={handleReset}
                            disabled={loading}
                            style={{ borderRadius: '12px', fontSize: '1rem' }}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : null}
                            Reset Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
