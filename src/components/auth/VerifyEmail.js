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
    const [verifyError, setVerifyError] = useState(null); // { status, message, details }

        /**
     * verifyUser: call API to verify email with user id and code
     * on error (4xx/5xx), parse response to extract status/message for conditional UI
     */
    async function verifyUser(userId, verifyCode) {
        if (!userId || !verifyCode) {
            throw new Error('User ID and verification code are required');
        }

        try {
            // call verify endpoint
            const resp = await jsonGet(`auth/verify/${userId}/${verifyCode}`);
            
            // if we get here, request succeeded (2xx)
            if (resp && resp.success) {
                return { success: true, data: resp.data || resp };
            } else {
                // 2xx but success: false (backend validation failed)
                return {
                    success: false,
                    status: resp?.status || 'unknown_error',
                    message: resp?.message || 'Verification failed',
                    details: resp
                };
            }
        } catch (err) {
            // error thrown by jsonGet (non-2xx status or network error)
            // jsonGet throws: "HTTP 400: {...json...}"
            // extract JSON from error message
            let errorData = null;

            try {
                const errMsg = err.message || '';
                // parse "HTTP 400: {...}" format
                const jsonMatch = errMsg.match(/:\s*({.*})$/);
                if (jsonMatch && jsonMatch[1]) {
                    try {
                        errorData = JSON.parse(jsonMatch[1]);
                    } catch (parseErr) {
                        console.warn('Failed to parse JSON from error message:', parseErr);
                    }
                }
            } catch (extractErr) {
                console.warn('Failed to extract error data:', extractErr);
            }

            // if parsing failed, try to extract from err.response if available
            if (!errorData && err.response) {
                try {
                    errorData = await err.response.json().catch(() => null);
                } catch (parseErr) {
                    console.warn('Failed to parse response body:', parseErr);
                }
            }

            // if still no data, create default error structure
            if (!errorData) {
                errorData = {
                    success: false,
                    status: 'network_error',
                    message: err.message || 'Network error occurred'
                };
            }

            return {
                success: false,
                status: errorData.status || 'verification_failed',
                message: errorData.message || 'Verification failed',
                details: errorData
            };
        }
    }

    useEffect(() => {
        let mounted = true;

        (async function startup() {
            try {
                // validate params early
                if (!id || !code) {
                    const msg = !id ? 'Missing user ID' : 'Missing verification code';
                    toast.error(`Invalid verification link: ${msg}`, { duration: 6000 });
                    navigate('/auth/signup');
                    return;
                }

                if (mounted) setLoadingUser(true);

                // call verify endpoint
                const result = await verifyUser(id, code);

                if (!mounted) return;

                if (result.success) {
                    // success: user verified
                    setUser(result.data);
                    setVerifyError(null);
                    toast.success('Email verified successfully!', { duration: 4000 });
                    // optionally auto-redirect to login after a delay
                    // setTimeout(() => navigate('/auth/login'), 3000);
                } else {
                    // error: show conditional message based on status
                    const { status, message } = result;
                    setVerifyError({ status, message });
                    setUser(null);

                    // conditional error messages
                    switch (status) {
                        case 'invalid_user':
                            toast.error('User not found. Please sign up again.', { duration: 6000 });
                            break;
                        case 'invalid_code':
                            toast.error('Invalid verification code. Please request a new one.', { duration: 6000 });
                            break;
                        case 'expired':
                            toast.error('Verification code has expired. Please request a new one.', { duration: 6000 });
                            break;
                        case 'is_verified': 
                            toast.success('Your email is already verified. Please log in.', { duration: 6000 });
                            break;
                        case 'network_error':
                            toast.error('Network error. Please check your connection and try again.', { duration: 6000 });
                            break;
                        default:
                            toast.error(message || 'Verification failed. Please try again.', { duration: 6000 });
                    }
                }
            } catch (err) {
                console.error('VerifyEmail startup error:', err);
                if (mounted) {
                    toast.error('An unexpected error occurred. Please try again.', { duration: 5000 });
                    setVerifyError({ status: 'unexpected_error', message: err.message });
                }
            } finally {
                if (mounted) setLoadingUser(false);
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, code]);

    return (
        <div>
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f7f9fc, #eef1f5)" }}>
                <div
                    className="card shadow-sm border-0 p-4"
                    style={{
                        width: "460px",
                        borderRadius: "25px",
                        minHeight: "90vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        backgroundColor: "white",
                    }}
                >
                    {/* Top bar */}
                    <div className="mb-3 mx-auto" style={{ width: "50%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "2px" }} />

                    {/* Header Section */}
                    <div>
                        <img className="img-fluid" src={Logo} alt="Fiaxit Logo" width="72" height="35" />
                        <div className="mt-4">
                            <h4 className="fw-bold">Account Verification</h4>
                            <p className="text-muted mb-4">Your email verification status.</p>
                        </div>
                    </div>

                    {/* Main Content Section */}
                    <div>
                        {/* Illustration */}
                        <div className="d-flex justify-content-center mt-3 mb-4">
                            <img
                                src="https://blush.design/api/download?shareUri=fzIOhjyIryimFdlW&c=Bottom_0%7E393f82_Hair_0%7Eb58143_Skin_0%7E57331f_Top_0%7Ef2f2f2&w=800&h=800&fm=png"
                                alt="Verification Illustration"
                                className="img-fluid"
                                style={{ width: "auto", height: "400px" }}
                            />
                        </div>

                        {loadingUser ? (
                            <div className="text-center my-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Verifying...</span>
                                </div>
                                <small className="text-muted mt-2 d-block">Verifying your email...</small>
                            </div>
                        ) : user ? (
                            // Success state
                            <div className="text-center mt-4">
                                <div className="mb-3">
                                    <span className="badge bg-success fs-5">✓ Verified</span>
                                </div>
                                <h5 className="fw-semibold">
                                    Hi, {(user.user_fname ?? 'User').toUpperCase()} {(user.user_lname ?? '').toUpperCase()}!
                                </h5>
                                <p className="text-muted small mt-3">
                                    Congratulations! Your account has been successfully verified. You can now log in and start using Fiaxit.
                                </p>
                                <Link to="/auth/login" className="btn btn-primary mt-4">
                                    Go to Login
                                </Link>
                            </div>
                        ) : verifyError ? (
                            // Error state: show conditional message based on status
                            <div className="text-center my-4">
                                <div className="mb-3">
                                    <span className="badge bg-danger-subtle text-danger-emphasis">✗ Verification Failed</span>
                                </div>
                                <p className="text-danger small fw-semibold">{verifyError.status}</p>
                                <p className="text-muted small mt-2">{verifyError.message}</p>

                                {/* Conditional action buttons based on error status */}
                                <div className="mt-4 d-flex flex-column gap-2">
                                    {verifyError.status === 'expired' || verifyError.status === 'invalid_code' ? (
                                        <>
                                            <Link to="/auth/resend-verification-code" className="btn btn-warning btn-sm">
                                                Request new verification code
                                            </Link>
                                            <Link to="/auth/signup" className="btn btn-light btn-sm">
                                                Sign up again
                                            </Link>
                                        </>
                                    ) : verifyError.status === 'invalid_user' || verifyError.status === 'network_error' ? (
                                        <>
                                            <Link to="/auth/signup" className="btn btn-warning btn-sm">
                                                Sign Up
                                            </Link>
                                        </>
                                    ) : verifyError.status === 'is_verified' ? (
                                        <>
                                            <Link to="/auth/login" className="btn btn-warning btn-sm">
                                                Go to Login
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => window.location.reload()} className="btn btn-warning btn-sm">
                                                Try again
                                            </button>
                                            <Link to="/auth/signup" className="btn btn-light btn-sm">
                                                Sign up
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Fallback (should not reach here)
                            <div className="text-center my-4">
                                <p className="text-warning small">Unable to determine verification status.</p>
                                <Link to="/auth/signup" className="btn btn-primary btn-sm">Go to Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-muted small mt-4 px-3 pb-2 text-center">
                        We care about your data. We promise your data is saved with us alone. See our{" "}
                        <Link to="/terms" className="text-decoration-none fw-semibold">Terms</Link>{" "} and{" "}
                        <Link to="/privacy-policy" className="text-decoration-none fw-semibold">Privacy Policy</Link>.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;