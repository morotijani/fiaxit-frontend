import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'
import { jsonGet } from '../../helpers/Ajax'
import { toast } from 'react-hot-toast';
import Logo from '../../assets/fiaxit-light-logo.png';

function VerifyEmail() {
    const navigate = useNavigate();
    const { id, code } = useParams();
    const [loadingUser, setLoadingUser] = useState(true);
    const [user, setUser] = useState(null);
    const [verifyError, setVerifyError] = useState(null);

    async function verifyUser(userId, verifyCode) {
        if (!userId || !verifyCode) {
            throw new Error('User ID and verification code are required');
        }

        try {
            const resp = await jsonGet(`auth/verify/${userId}/${verifyCode}`);

            // Success response (2xx)
            if (resp && resp.success) {
                return {
                    success: true,
                    data: resp.data || resp,
                    message: resp.message || 'Email verified successfully!'
                };
            }

            // Error response (400, 401, 422 handled by Ajax.js)
            if (resp && resp.success === false) {
                // Ajax returns { status, success, errors: { ...api_response... } }
                const apiResponse = resp.errors || resp;
                return {
                    success: false,
                    status: apiResponse.status || resp.status || 'verification_failed',
                    message: apiResponse.message || resp.message || 'Verification failed',
                    details: apiResponse
                };
            }

            return { success: false, status: 'unknown', message: 'Unexpected response' };
        } catch (err) {
            return {
                success: false,
                status: 'network_error',
                message: err.message || 'Network error occurred'
            };
        }
    }

    useEffect(() => {
        let mounted = true;

        (async function startup() {
            try {
                if (!id || !code) {
                    toast.error('Invalid verification link.', { duration: 6000 });
                    navigate('/auth/signup');
                    return;
                }

                if (mounted) setLoadingUser(true);
                const result = await verifyUser(id, code);

                if (!mounted) return;

                if (result.success) {
                    setUser(result.data);
                    setVerifyError(null);
                    toast.success(result.message || 'Email verified successfully!', { duration: 4000 });
                } else {
                    const { status, message } = result;
                    setVerifyError({ status, message });
                    setUser(null);

                    if (status === 'is_verified') {
                        toast.success('Your email is already verified. Please log in.');
                    } else if (status === 'invalid_user') {
                        toast.error('User not found. Please sign up again.');
                    } else if (status === 'expired' || status === 'invalid_code') {
                        // Keep on-screen message
                    } else {
                        toast.error(message || 'Verification failed.');
                    }
                }
            } catch (err) {
                console.error('VerifyEmail startup error:', err);
                if (mounted) {
                    toast.error('An unexpected error occurred.');
                    setVerifyError({ status: 'unexpected_error', message: err.message });
                }
            } finally {
                if (mounted) setLoadingUser(false);
            }
        })();

        return () => { mounted = false; };
    }, [id, code, navigate]);

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
                <div className="card shadow-lg border-0 p-4 main-card-container">

                    {/* Top Handle */}
                    <div className="mb-4 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}></div>

                    {/* Logo & Header */}
                    <div className="text-center">
                        <img className="img-fluid mb-4" src={Logo} alt="Fiaxit" style={{ height: "40px" }} />
                        <h3 className="fw-700 mb-2" style={{ letterSpacing: '-1px' }}>Account Verification</h3>
                        <p className="text-muted">Finalizing your account setup</p>
                    </div>

                    <div className="flex-grow-1 d-flex flex-column justify-content-center">
                        {loadingUser ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Verifying...</span>
                                </div>
                                <p className="text-muted fw-500">Verifying your email coordinates...</p>
                            </div>
                        ) : user || (verifyError && verifyError.status === 'is_verified') ? (
                            <>
                                {/* Success Illustration */}
                                <div className="d-flex justify-content-center my-4">
                                    <div className="bg-success-subtle rounded-circle p-4 d-flex align-items-center justify-content-center shadow-inner" style={{ width: '160px', height: '160px' }}>
                                        <span className="material-symbols-outlined text-success" style={{ fontSize: '80px' }}>verified_user</span>
                                    </div>
                                </div>

                                <div className="text-center px-2">
                                    <h4 className="fw-700 mb-2">
                                        {verifyError?.status === 'is_verified' ? "Already Verified!" : "Success!"}
                                    </h4>
                                    <p className="text-muted small mb-4">
                                        {verifyError?.status === 'is_verified'
                                            ? (verifyError.message || "Your account is already verified. You can proceed to login safely.")
                                            : (user?.message || "Your email has been verified. You're now ready to access the full power of Fiaxit.")
                                        }
                                    </p>
                                    <Link to="/auth/login" className="btn btn-primary w-100 py-3 rounded-4 shadow-sm mb-3">
                                        Back to Login
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Error Illustration */}
                                <div className="d-flex justify-content-center my-4">
                                    <div className="bg-danger-subtle rounded-circle p-4 d-flex align-items-center justify-content-center shadow-inner" style={{ width: '160px', height: '160px' }}>
                                        <span className="material-symbols-outlined text-danger" style={{ fontSize: '80px' }}>gpp_bad</span>
                                    </div>
                                </div>

                                <div className="text-center px-2">
                                    <h4 className="fw-700 mb-2 text-danger">
                                        {verifyError?.status === 'expired' ? "Link Expired" :
                                            verifyError?.status === 'invalid_code' ? "Invalid Link" :
                                                verifyError?.status === 'invalid_user' ? "User Not Found" :
                                                    "Verification Failed"}
                                    </h4>
                                    <p className="text-muted small mb-4">
                                        {verifyError?.message || "There was a problem verifying your account."}
                                    </p>

                                    <div className="d-grid gap-2">
                                        {(verifyError?.status === 'expired' || verifyError?.status === 'invalid_code') ? (
                                            <Link to="/auth/signup" className="btn btn-primary w-100 py-3 rounded-4 shadow-sm">
                                                Request New Link
                                            </Link>
                                        ) : (
                                            <Link to="/auth/signup" className="btn btn-primary w-100 py-3 rounded-4 shadow-sm">
                                                Go to Sign Up
                                            </Link>
                                        )}
                                        <button onClick={() => window.location.reload()} className="btn btn-light w-100 py-3 rounded-4">
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-muted text-center small mt-5 px-3 pb-2 opacity-75">
                        We care about your data. We promise your data is saved with us alone. See our{" "}
                        <Link to="/terms" className="text-decoration-none fw-semibold">Terms</Link>{" "} &{" "}
                        <Link to="/privacy-policy" className="text-decoration-none fw-semibold">Privacy</Link>.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
