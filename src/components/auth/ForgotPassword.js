import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FieldBlock from '../elements/FieldBlock';
import { jsonPost } from '../../helpers/Ajax';
import Button from '../elements/Button';
import toast from 'react-hot-toast';
import Logo from '../../assets/fiaxit-light-logo.png';

function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: Code
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');

    const handleSendCode = async () => {
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }
        setLoading(true);
        try {
            const res = await jsonPost('auth/forgot-password', { email });
            if (res.success) {
                toast.success('Verification code sent to your email');
                setStep(2);
            } else {
                toast.error(res.errors.message || 'Failed to send code');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!code) {
            toast.error('Please enter the 6-digit code');
            return;
        }
        setLoading(true);
        try {
            const res = await jsonPost('auth/verify-reset-code', { email, code });
            // The backend returns { status: false } on success in the current implementation? 
            // Wait, I saw "status: false" in my previous view_file of verifyResetCode success response.
            // Let me fix the backend first to return success: true.
            if (res.success || res.message === 'Code verified successfully') {
                toast.success('Code verified');
                navigate(`/auth/reset-password?token=${res.data.resetToken}`);
            } else {
                toast.error(res.errors.message || 'Invalid or expired code');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
                <div className="card shadow-lg border-0 p-4 main-card-container" style={{ maxWidth: '400px', width: '100%' }}>

                    {/* top bar */}
                    <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}></div>

                    <div className="text-center mt-2">
                        <img className="img-fluid mb-4" src={Logo} alt="Fiaxit" style={{ height: "40px" }} />
                        <h3 className="fw-700 mb-2" style={{ letterSpacing: '-1px' }}>
                            {step === 1 ? 'Find your account' : 'Enter code'}
                        </h3>
                        <p className="text-muted small">
                            {step === 1
                                ? "Enter your email address and we'll send you a code to reset your password."
                                : `We've sent a 6-digit verification code to ${email}`}
                        </p>
                    </div>

                    {/* Illustration */}
                    <div className="d-flex justify-content-center my-4">
                        <div className="bg-light rounded-circle p-4 d-flex align-items-center justify-content-center shadow-inner" style={{ width: '180px', height: '180px' }}>
                            <img
                                src="https://blush.design/api/download?shareUri=2V5KwTPMyeNVs0B0&c=Hair_0%7Effd04f_Skin_0%7Ea97979&w=800&h=800&fm=png"
                                alt="Verification Illustration"
                                className="img-fluid"
                                style={{ width: "140px", height: "auto" }}
                            />
                        </div>
                    </div>

                    <div className="px-2 mt-4">
                        {step === 1 ? (
                            <div className="mb-4">
                                <FieldBlock
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    label="Email address"
                                    placeholder="name@email.com"
                                />
                            </div>
                        ) : (
                            <div className="mb-4 text-center">
                                <input
                                    type="text"
                                    className="form-control form-control-lg text-center fw-bold"
                                    style={{ letterSpacing: '8px', fontSize: '24px' }}
                                    maxLength="6"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                />
                                <button
                                    className="btn btn-link mt-2 text-decoration-none small"
                                    onClick={() => setStep(1)}
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    Wrong email? Change it
                                </button>
                            </div>
                        )}

                        <button
                            className="btn btn-primary w-100 py-3 mb-4 shadow"
                            onClick={step === 1 ? handleSendCode : handleVerifyCode}
                            disabled={loading}
                            style={{ borderRadius: '12px', fontSize: '1rem' }}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : null}
                            {step === 1 ? 'Next' : 'Verify'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/auth/login" className="text-muted text-decoration-none small">
                            Cancel and go back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
