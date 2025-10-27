import {useState, useContext} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import FieldBlock from '../elements/FieldBlock'
import {Form} from '../../helpers/Form'
import Button from '../elements/Button'
import {AuthContext} from "../../contexts/AuthContext"
import toast from 'react-hot-toast';
import Logo from '../../assets/fiaxit-light-logo.png';

function Login() {
    const navigate = useNavigate();
    const [fields, setFields] = useState({
        email: {value: "", isInvalid:false, msg: ""},
        password: {value: "", isInvalid:false, msg: ""}
    });

    const [, authDispatch, getUser] = useContext(AuthContext)

    async function success(resp) {
        authDispatch({type: 'login', payload: resp.token});
        await getUser()
        navigate('/'); // redirect to main page or root directory after loggedin
        toast.success("You have been logged in successfully", {duration: 6000});
    }

    const form = new Form('auth/login', fields, setFields, success);

    return(
        <div>
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
                <div
                    className="card shadow-sm border-0 p-4"
                    style={{
                        width: "460px",
                        borderRadius: "25px",
                        minHeight: "90vh",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    {/* Heading */}
                    <img class="img-fluid" src={Logo} alt="" width="72" height="35"></img>
                    <div className="mt-4">
                        <h4 className="fw-bold">Your borderless account awaits, finally in sync.</h4>
                        <p className="text-muted mb-4">Login in to your account</p>
                    </div>
                    {/* Top Section */}
                    <div>
                        {/* Illustration */}
                        <div className="d-flex justify-content-center mt-3">
                            <img
                            src="https://blush.design/api/download?shareUri=6vo50rA9MKAQYjhg&c=Hair_0%7E8b542f_Skin_0%7E4b3425&w=800&h=800&fm=png"
                            alt="Meditation Illustration" className="img-fluid"
                            style={{ width: "250px", height: "250px" }}
                            />
                        </div>

                        <FieldBlock id="email" value={fields.email.value} onChange={form.handleInputChanges} label="Username:" isInvalid={fields.email.isInvalid} feedback={fields.email.msg} />
                        <FieldBlock id="password" value={fields.password.value} onChange={form.handleInputChanges} label="Password:" type="password" feedback={fields.password.msg} isInvalid={fields.password.isInvalid} />

                        <div className='text-center'>
                            <div className="mb-2 mt-4">
                                <Button className="btn-warning border fw-semibold px-4" onClick={form.submitForm}>Log In</Button>
                            </div>
                            <div>
                                <Link to="/auth/signup">Register</Link>
                            </div>
                        </div>

                        {/* Buttons */}
                        {/* <div className="d-flex flex-column gap-3 px-3">
                            <button className="btn btn-light border d-flex align-items-center justify-content-center gap-2 py-2">
                            <img
                                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                                alt="Google"
                                style={{ width: "20px", height: "20px" }}
                            />
                            Continue with Google
                            </button>

                            <button className="btn btn-light border d-flex align-items-center justify-content-center gap-2 py-2">
                            <i className="bi bi-apple fs-5"></i>
                            Continue with Apple
                            </button>
                        </div> */}
                    </div>

                    {/* Footer */}
                    <div className="text-muted small mt-4 px-3 pb-2">We care about your data. By logging in, you agree to our{" "}
                        <a href="#" className="text-decoration-none fw-semibold">Terms</a>{" "} and{" "}<a href="#" className="text-decoration-none fw-semibold"> Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;