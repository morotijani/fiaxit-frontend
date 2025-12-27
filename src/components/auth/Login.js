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

    const [, authDispatch, getUser] = useContext(AuthContext)

    async function success(resp) {
        authDispatch({ type: 'login', payload: resp.token });
        await getUser()
        navigate('/'); // redirect to main page or root directory after loggedin
        toast.success("You have been logged in successfully", { duration: 6000 });
    }

    const form = new Form('auth/login', fields, setFields, success);

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
                <div
                    className="card shadow-lg border-0 p-4 main-card-container"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    {/* top bar */}
                    <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}></div>

                    {/* Logo & Header */}
                    <div className="text-center mt-2">
                        <img className="img-fluid mb-4" src={Logo} alt="Fiaxit" style={{ height: "40px" }} />
                        <h3 className="fw-700 mb-2" style={{ letterSpacing: '-1px' }}>Welcome back</h3>
                        <p className="text-muted">Enter your email and password to log in</p>
                    </div>

                    {/* Form Section */}
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
                            <FieldBlock
                                id="password"
                                value={fields.password.value}
                                onChange={form.handleInputChanges}
                                label="Password"
                                type="password"
                                feedback={fields.password.msg}
                                isInvalid={fields.password.isInvalid}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className='text-center'>
                            <button
                                className="btn btn-primary w-100 py-3 mb-4 shadow"
                                onClick={form.submitForm}
                                style={{ borderRadius: '12px', fontSize: '1rem' }}
                            >
                                Sign In
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
