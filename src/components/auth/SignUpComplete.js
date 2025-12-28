import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { jsonGet } from '../../helpers/Ajax'
import toast from 'react-hot-toast';
import Logo from '../../assets/fiaxit-light-logo.png';

function SignUpComplete() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loadingUser, setLoadingUser] = useState(true);
    const [user, setUser] = useState(null); // null by default, not array

    async function fetchUserById(userId) {

        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            // try common endpoint patterns; adjust based on your backend
            let resp = null;
            try {
                resp = await jsonGet(`auth/user/${userId}`);
            } catch (err1) {
                // fallback endpoint
                resp = await jsonGet(`users/${userId}`);
            }
            console.log(resp)
            if (resp && resp.success) {
                return resp.data || null;
            }
            return null;
        } catch (err) {
            console.error('fetchUserById error', err);
            throw err;
        }
    }

    useEffect(() => {
        let mounted = true;

        (async function startup() {
            try {
                // check id early, before any async work
                if (!id) {
                    toast.error('Invalid signup link. Please sign up again.', { duration: 6000 });
                    navigate('/auth/signup');
                    return;
                }

                if (mounted) setLoadingUser(true);

                const u = await fetchUserById(id);
                if (!u) {
                    if (mounted) {
                        toast.error('User not found. Please sign up again.', { duration: 5000 });
                        navigate('/auth/signup');
                        setLoadingUser(false);
                    }
                    return;
                }

                if (mounted) {
                    setUser(u);
                    setLoadingUser(false);
                }
            } catch (err) {
                console.error('SignUpComplete startup error:', err);
                if (mounted) {
                    toast.error('An error occurred. Please sign up again.', { duration: 5000 });
                    navigate('/auth/signup');
                    setLoadingUser(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
                <div className="card shadow-lg border-0 p-4 main-card-container">

                    {/* Top Handle for App-like feel */}
                    <div className="mb-4 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}></div>

                    {/* Logo & Header */}
                    <div className="text-center">
                        <img className="img-fluid mb-4" src={Logo} alt="Fiaxit" style={{ height: "40px" }} />
                        <h3 className="fw-700 mb-2" style={{ letterSpacing: '-1px' }}>Account Registered</h3>
                        <p className="text-muted">We've sent a verification link to your email.</p>
                    </div>

                    {/* Main Content Section */}
                    <div className="flex-grow-1 d-flex flex-column justify-content-center">
                        {loadingUser ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted fw-500">Preparing your account...</p>
                            </div>
                        ) : user ? (
                            <>
                                {/* Illustration */}
                                <div className="d-flex justify-content-center my-4">
                                    <div className="bg-light rounded-circle p-4 d-flex align-items-center justify-content-center shadow-inner" style={{ width: '180px', height: '180px' }}>
                                        <img
                                            src="https://blush.design/api/download?shareUri=8PM0lK-V7hK0Fdjx&c=Hair_0%7Ef5bbee_Skin_0%7E715b4c&w=800&h=800&fm=png"
                                            alt="Verification Illustration"
                                            className="img-fluid"
                                            style={{ width: "140px", height: "auto" }}
                                        />
                                    </div>
                                </div>

                                <div className="text-center px-2">
                                    <h5 className="fw-700 mb-3">Welcome, {user.user_fname}!</h5>
                                    <div className="bg-success-subtle p-3 rounded-4 border border-success-subtle mb-4">
                                        <p className="text-success-emphasis small mb-1 fw-bold">Verification Email Sent To:</p>
                                        <div className="fw-bold text-success-emphasis">{user.user_email}</div>
                                    </div>

                                    <p className="text-muted small mb-4">
                                        Please click the link in the email to verify your account. The link expires in <strong className="text-main">15 minutes</strong>.
                                    </p>

                                    <div className="pt-3 border-top">
                                        <p className="text-muted small mb-0">
                                            Didn't receive the email?
                                            <button className="btn btn-link btn-sm text-primary fw-bold text-decoration-none">Resend link</button>
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-5">
                                <span className="material-symbols-outlined text-danger mb-3" style={{ fontSize: '48px' }}>error</span>
                                <p className="text-danger fw-bold">Unable to load account details.</p>
                                <button onClick={() => navigate('/auth/signup')} className="btn btn-primary rounded-pill px-4 mt-2">
                                    Back to Sign Up
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-muted text-center small mt-5 px-3 pb-2 opacity-75">
                        We value your privacy. Your data is encrypted and saved securely. See our{" "}
                        <Link to="/terms" className="text-decoration-none fw-semibold">Terms</Link>{" "} &{" "}
                        <Link to="/privacy-policy" className="text-decoration-none fw-semibold">Privacy</Link>.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUpComplete;