import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FieldBlock from '../elements/FieldBlock';
import { Form } from '../../helpers/Form';
import Button from '../elements/Button';
import toast from 'react-hot-toast';
import Logo from '../../assets/fiaxit-light-logo.png';

function SignUp() {

    const navigate = useNavigate();
    const [fields, setFields] = useState({
        fname: {value:"", isInvalid: false, msg:""}, 
        mname: {value:"", isInvalid: false, msg:""}, 
        lname: {value:"", isInvalid: false, msg:""}, 
        email: {value:"", isInvalid: false, msg:""}, 
        password: {value:"", isInvalid: false, msg:""},
        confirm_password: {value:"", isInvalid: false, msg:""}, 
        pin: {value: "", isInvalid: false, msg: ""}, 
        invitationcode: {value: "", isInvalid: false, msg: ""} 
    })

    //
    function success(resp) {
        navigate('/auth/login');
        // send toast of signup
        toast.success("Account created successfully! Please may now log in !");
    }

    // setup form
    const form = new Form('auth/signup', fields, setFields, success);

    return (
        <div>
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
                <div
                    className="card shadow-sm border-0 p-4"
                    style={{
                        width: "360px",
                        borderRadius: "25px",
                        minHeight: "90vh",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    {/* Heading */}
                    <img class="img-fluid" src={Logo} alt="" width="72" height="35"></img>
                    <div className="mt-4">
                        <h4 className="fw-bold">Your borderless account awaits</h4>
                        <p className="text-muted mb-4">Create An Account To Get Started</p>
                    </div>
                    <FieldBlock
                        id="fname" label="First name" isInvalid={fields.fname.isInvalid} value={fields.fname.value} onChange={form.handleInputChanges} feedback={fields.fname.msg} 
                    />
                    <FieldBlock
                        id="mname" label="Middle name" isInvalid={fields.mname.isInvalid} value={fields.mname.value} onChange={form.handleInputChanges} feedback={fields.mname.msg} 
                    />
                    <FieldBlock
                        id="lname" label="Last name" isInvalid={fields.lname.isInvalid} value={fields.lname.value} onChange={form.handleInputChanges} feedback={fields.lname.msg} 
                    />
                    <FieldBlock id="email" label="Email" type="email" isInvalid={fields.email.isInvalid} value={fields.email.value} onChange={form.handleInputChanges} feedback={fields.email.msg} 
                    />
                    <FieldBlock id="password" label="Password" type="password" isInvalid={fields.password.isInvalid} value={fields.password.value} onChange={form.handleInputChanges} feedback={fields.password.msg} 
                    />
                    <FieldBlock id="confirm_password" label="Confirm Password" type="password" isInvalid={fields.confirm_password.isInvalid}
                        value={fields.confirm_password.value} onChange={form.handleInputChanges} feedback={fields.confirm_password.msg}
                />
                    <FieldBlock id="pin" label="PIN" type="password" isInvalid={fields.pin.isInvalid} value={fields.pin.value} onChange={form.handleInputChanges} feedback={fields.pin.msg} 
                    />
                    <FieldBlock id="invitationcode" label="Invitation code" isInvalid={fields.invitationcode.isInvalid} value={fields.invitationcode.value} onChange={form.handleInputChanges} feedback={fields.invitationcode.msg} 
                    />

                    <div className='text-center'>
                        <div className="mb-2 mt-4">
                            <Button variant="primary" onClick={form.submitForm}>Sign Up</Button>
                        </div>
                        <div>
                            <Link to="/auth/login">Already have an account? Log In</Link>
                        </div>
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

export default SignUp;