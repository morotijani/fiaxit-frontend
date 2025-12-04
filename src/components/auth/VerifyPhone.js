import {useState, useContext, useRef} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import FieldBlock from '../elements/FieldBlock'
import { Form } from '../../helpers/Form'
import Button from '../elements/Button'
import {AuthContext} from "../../contexts/AuthContext"
import toast from 'react-hot-toast';
import Logo from '../../assets/fiaxit-light-logo.png';

function Verify() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);

    const handleChange = (value, index) => {
        if (/^\d$/.test(value) || value === "") {
            const updatedOtp = [...otp];
            updatedOtp[index] = value;
            setOtp(updatedOtp);

            // Move to next input
            if (value !== "" && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        // Backspace → move back
        if (e.key === "Backspace" && index > 0 && otp[index] === "") {
            inputRefs.current[index - 1].focus();
        }
    };

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
                    {/* top bar */}
                    <div className="mb-3 mx-auto" style={{ width: "50%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "2px" }}></div>

                    {/* Heading */}
                    <img className="img-fluid" src={Logo} alt="" width="72" height="35"></img>
                    <div className="mt-4">
                        <h4 className="fw-bold">Verification Code</h4>
                        <p className="text-muted mb-4">We sent a 6-digit code to your email.</p>
                    </div>
                    {/* Top Section */}
                    <div>
                        {/* Illustration */}
                        <div className="d-flex justify-content-center mt-3">
                            <img
                            src="https://blush.design/api/download?shareUri=gToALQCf3sSkwAY2&c=Hair_0%7E8b542f_Skin_0%7E4b3425&w=800&h=800&fm=png"
                            alt="Meditation Illustration" className="img-fluid"
                            style={{ width: "300px", height: "auto" }}
                            />
                        </div>

                        {/* OTP Inputs */}
                        <div className="flex gap-3 mb-10">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-12 h-14 rounded-xl bg-[#1A1C20] text-center text-xl font-semibold outline-none border border-[#2A2C31]"
                                />
                            ))}
                        </div>

                        {/* <FieldBlock id="password" value={fields.password.value} onChange={form.handleInputChanges} label="Password:" type="password" feedback={fields.password.msg} isInvalid={fields.password.isInvalid} /> */}

                        <div className='text-center'>
                            <div className="mb-2 mt-4">
                                <Button className="btn-warning" onClick={form.submitForm}>
                                    Verify
                                </Button>
                            </div>
                            <div>
                                {/* Resend */}
                                <p className="text-gray-400 text-sm mt-6">
                                    Didn’t receive the code?{" "}
                                    <span className="text-blue-500 cursor-pointer">Resend</span>
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="text-muted small mt-4 px-3 pb-2">We care about your data. By logging in, you agree to our{" "}
                        <Link to="#" className="text-decoration-none fw-semibold">Terms</Link>{" "} and{" "}<Link to="#" className="text-decoration-none fw-semibold"> Privacy Policy</Link>.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Verify;