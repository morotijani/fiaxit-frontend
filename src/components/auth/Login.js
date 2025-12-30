import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FieldBlock from '../elements/FieldBlock'
import { Form } from '../../helpers/Form'
import Button from '../elements/Button'
import { AuthContext } from "../../contexts/AuthContext"
import toast from 'react-hot-toast';
import Logo from '../../assets/fiaxit-light-logo.png';

function Login() {
    const navigate = useNavigate();
    const [fields, setFields] = useState({
        email: { value: "", isInvalid: false, msg: "" },
        password: { value: "", isInvalid: false, msg: "" }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [requires2fa, setRequires2fa] = useState(false);
    const [tempUserId, setTempUserId] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState('');

    const [, authDispatch, getUser] = useContext(AuthContext)

    async function success(resp) {
        if (resp.requires_2fa) {
            setIsLoading(false);
            setRequires2fa(true);
            setTempUserId(resp.temp_user_id);
            toast("Two-factor authentication required", { icon: '🔐' });
            return;
        }
        setIsLoading(false);
        authDispatch({ type: 'login', payload: resp.token });
        await getUser()
        navigate('/'); // redirect to main page or root directory after loggedin
        toast.success("You have been logged in successfully", { duration: 6000 });
    }

    function error(resp) {
        setIsLoading(false);
    }

    const form = new Form('auth/login', fields, setFields, success, error);

    const handleLogin = async (e) => {
        setIsLoading(true);
        await form.submitForm(e);
    };

    const handle2faLogin = async () => {
        if (twoFactorToken.length !== 6) {
            toast.error("Please enter a 6-digit code");
            return;
        }
        setIsLoading(true);
        try {
            const resp = await (new Form()).jsonPost('auth/login/2fa', { user_id: tempUserId, token: twoFactorToken });
            if (resp.success) {
                authDispatch({ type: 'login', payload: resp.token });
                await getUser();
                navigate('/');
                toast.success("Logged in successfully");
            } else {
                toast.error(resp.message || "Invalid 2FA code");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
                <div className="card shadow-lg border-0 p-4 main-card-container">

                    {/* top bar */}
                    <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}></div>

                    {/* Logo & Header */}
                    <div className="text-center mt-2">
                        <img className="img-fluid mb-4" src={Logo} alt="Fiaxit" style={{ height: "40px" }} />
                        <h3 className="fw-700 mb-2" style={{ letterSpacing: '-1px' }}>
                            {requires2fa ? 'Verify Identity' : 'Welcome back'}
                        </h3>
                        <p className="text-muted">
                            {requires2fa ? 'Enter the security code from your app' : 'Enter your email and password to log in'}
                        </p>
                    </div>

                    {/* Illustration */}
                    {/* <div className="d-flex justify-content-center my-4 py-2">
                        <div className="bg-light rounded-circle p-4 d-flex align-items-center justify-content-center shadow-inner" style={{ width: '180px', height: '180px' }}>
                            <img
                                src="https://blush.design/api/download?shareUri=gToALQCf3sSkwAY2&c=Hair_0%7E8b542f_Skin_0%7E4b3425&w=800&h=800&fm=png"
                                alt="Login Illustration"
                                className="img-fluid"
                                style={{ width: "140px", height: "auto" }}
                            />
                        </div>
                    </div> */}

                    {/* Form Section */}
                    {!requires2fa ? (
                        <div className="px-2">
                            <div className="mb-3">
                                <FieldBlock
                                    id="email"
                                    value={fields.email.value}
                                    onChange={form.handleInputChanges}
                                    label="Email address"
                                    isInvalid={fields.email.isInvalid}
                                    feedback={fields.email.msg}
                                    placeholder="name@email.com"
                                />
                            </div>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <label className="form-label mb-0">Password</label>
                                    <Link to="/auth/forgot-password" style={{ fontSize: '0.8rem', color: '#1a73e8', textDecoration: 'none', fontWeight: '500' }}>Forgot password?</Link>
                                </div>
                                <FieldBlock
                                    id="password"
                                    value={fields.password.value}
                                    onChange={form.handleInputChanges}
                                    hideLabel={true}
                                    type="password"
                                    feedback={fields.password.msg}
                                    isInvalid={fields.password.isInvalid}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="px-2 mb-4 text-center">
                            <input
                                type="text"
                                className="form-control form-control-lg text-center fw-bold rounded-4 shadow-sm mb-2 border-2 border-primary-subtle"
                                placeholder="000000"
                                maxLength="6"
                                value={twoFactorToken}
                                onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ''))}
                                style={{ letterSpacing: '8px', fontSize: '24px', height: '64px' }}
                                autoFocus
                            />
                            <button className="btn btn-link text-decoration-none small" onClick={() => setRequires2fa(false)}>
                                Back to login
                            </button>
                        </div>
                    )}

                    <div className='text-center'>
                        <button
                            className={`btn btn-primary w-100 py-3 mb-4 shadow d-flex align-items-center justify-content-center ${isLoading ? 'disabled' : ''}`}
                            onClick={requires2fa ? handle2faLogin : handleLogin}
                            disabled={isLoading}
                            style={{ borderRadius: '12px', fontSize: '1rem', minHeight: '58px' }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {requires2fa ? 'Verifying...' : 'Signing in...'}
                                </>
                            ) : (
                                requires2fa ? 'Verify Code' : 'Sign In'
                            )}
                        </button>

                        <div className="d-flex align-items-center my-4 opacity-50">
                            <hr className="flex-grow-1" />
                            <span className="mx-3 small fw-bold">OR</span>
                            <hr className="flex-grow-1" />
                        </div>

                        <p className="mb-0">
                            Don't have an account? <Link to="/auth/signup" className="text-primary fw-bold text-decoration-none">Sign up</Link>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="text-muted text-center small mt-4 px-3 pb-2 opacity-75">
                        By logging in, you agree to our{" "}
                        <Link to="#" className="text-decoration-none fw-semibold">Terms</Link>{" "} &{" "}<Link to="#" className="text-decoration-none fw-semibold"> Privacy</Link>.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
