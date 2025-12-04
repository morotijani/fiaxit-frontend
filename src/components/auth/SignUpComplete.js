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
                            <h4 className="fw-bold">Account Registered</h4>
                            <p className="text-muted mb-4">We sent a verification link to your email.</p>
                        </div>
                    </div>

                    {/* Main Content Section */}
                    <div>
                        {/* Illustration */}
                        <div className="d-flex justify-content-center mt-3 mb-4">
                            <img
                                src="https://blush.design/api/download?shareUri=vZjFcf89A4Xcg4_f&c=Hair_0%7E7590ff_Skin_0%7Ea97979&w=800&h=800&fm=png"
                                alt="Verification Illustration"
                                className="img-fluid"
                                style={{ width: "300px", height: "auto" }}
                            />
                        </div>

                        {loadingUser ? (
                            <div className="text-center my-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <small className="text-muted mt-2 d-block">Loading your account information...</small>
                            </div>
                        ) : user ? (
                            <div className="text-center mt-4">
                                <h5 className="fw-semibold">Hello, {user.user_fname.toUpperCase() ?? 'User'} {user.user_lname.toUpperCase() ?? ''}!</h5>
                                <p className="text-muted small mt-3">
                                    You have successfully registered your account with Fiaxit. A verification link has been sent to:
                                </p>
                                <div className="alert alert-info small mt-2" role="alert">
                                    <strong>{user.user_email ?? 'your email'}</strong>
                                </div>
                                <p className="text-muted small">
                                    Click the link to verify your account. The link expires in <strong>15 minutes</strong>. 
                                    If you don't see the email, please check your spam/junk folder.
                                </p>
                                <div className="mt-4">
                                    <p className="text-muted small mb-0">Didn't receive the email?</p>
                                    <button className="btn btn-link btn-sm text-primary">Resend verification link</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center my-4">
                                <p className="text-danger small">Unable to load account details.</p>
                                <Link to="/auth/signup" className="btn btn-primary btn-sm">Go back to Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-muted small mt-4 px-3 pb-2 text-center">
                        We care about your data. By signing up, we promise your data is saved with us alone. See our{" "}
                        <Link to="/terms" className="text-decoration-none fw-semibold">Terms</Link>{" "} and{" "}<Link to="/privacy-policy" className="text-decoration-none fw-semibold"> Privacy Policy</Link>.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUpComplete;