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

    // Stepper state: define groups of field ids for each step
    const stepGroups = [
        ['fname','mname','lname'],               // step 0 - names
        ['email','password','confirm_password'], // step 1 - credentials
        ['pin','invitationcode']                 // step 2 - extra
    ];
    const [step, setStep] = useState(0);

    // simple per-step validation: require non-empty values (you can expand rules)
    function validateStep(currStep) {
        const ids = stepGroups[currStep];
        let ok = true;
        const nextFields = {...fields};
        ids.forEach(id => {
            const val = (fields[id] && fields[id].value) ? String(fields[id].value).trim() : '';
            // exlude field with id mname from required validation
            if (id === 'mname') return;

            if (!val) {
                ok = false;
                nextFields[id] = {...nextFields[id], isInvalid: true, msg: 'This field is required'};
            } else {
                nextFields[id] = {...nextFields[id], isInvalid: false, msg: ''};
            }
        });
        setFields(nextFields);
        return ok;
    }

    function handleNext() {
        if (!validateStep(step)) return;
        if (step < stepGroups.length - 1) {
            setStep(s => s + 1);
        } else {
            // last step -> submit
            form.submitForm();
        }
    }

    function handlePrev() {
        if (step > 0) setStep(s => s - 1);
    }

    // render only fields for current step
    const visibleFields = stepGroups[step];

    return (
        <div>
            <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f7f9fc, #eef1f5)",}}>
                <div
                    className="card shadow-sm border-0 p-4"
                    style={{
                        width: "360px",
                        borderRadius: "25px",
                        minHeight: "90vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        backgroundColor: "white",
                    }}
                >
                    {/* Heading */}
                    <img class="img-fluid" src={Logo} alt="" width="72" height="35"></img>
                    <div className="mt-4">
                        <h4 className="fw-bold">Your borderless account awaits</h4>
                        <p className="text-muted mb-4">Create An Account To Get Started</p>
                    </div>

                    {/* Step indicator */}
                    <div className="mb-3">
                        <small className="text-muted">Step {step + 1} of {stepGroups.length}</small>
                        <div className="progress mt-2" style={{height: 6}}>
                            <div className="progress-bar" role="progressbar" style={{width: `${((step+1)/stepGroups.length)*100}%`}} aria-valuenow={(step+1)} aria-valuemin="0" aria-valuemax={stepGroups.length}></div>
                        </div>
                    </div>


                    {/* STEP ONE */}
                    {/* Render fields for current step */}
                    <div>
                        {visibleFields.includes('fname') && (
                            <FieldBlock id="fname" label="First name" isInvalid={fields.fname.isInvalid} value={fields.fname.value} onChange={form.handleInputChanges} feedback={fields.fname.msg} />
                        )}
                        {visibleFields.includes('mname') && (
                            <FieldBlock id="mname" label="Middle name" isInvalid={fields.mname.isInvalid} value={fields.mname.value} onChange={form.handleInputChanges} feedback={fields.mname.msg} />
                        )}
                        {visibleFields.includes('lname') && (
                            <FieldBlock id="lname" label="Last name" isInvalid={fields.lname.isInvalid} value={fields.lname.value} onChange={form.handleInputChanges} feedback={fields.lname.msg} />
                        )}

                        {/* STEP TWO */}
                        {visibleFields.includes('email') && (
                            <FieldBlock id="email" label="Email" type="email" isInvalid={fields.email.isInvalid} value={fields.email.value} onChange={form.handleInputChanges} feedback={fields.email.msg} />
                        )}
                        {visibleFields.includes('password') && (
                            <FieldBlock id="password" label="Password" type="password" isInvalid={fields.password.isInvalid} value={fields.password.value} onChange={form.handleInputChanges} feedback={fields.password.msg} />
                        )}
                        {visibleFields.includes('confirm_password') && (
                            <FieldBlock id="confirm_password" label="Confirm Password" type="password" isInvalid={fields.confirm_password.isInvalid} value={fields.confirm_password.value} onChange={form.handleInputChanges} feedback={fields.confirm_password.msg} />
                        )}

                        {/* STEP THREE */}
                        {visibleFields.includes('pin') && (
                            <FieldBlock id="pin" label="PIN" type="password" isInvalid={fields.pin.isInvalid} value={fields.pin.value} onChange={form.handleInputChanges} feedback={fields.pin.msg} />
                        )}
                        {visibleFields.includes('invitationcode') && (
                            <FieldBlock id="invitationcode" label="Invitation code" isInvalid={fields.invitationcode.isInvalid} value={fields.invitationcode.value} onChange={form.handleInputChanges} feedback={fields.invitationcode.msg} />
                        )}
                    </div>
                    <div className='d-flex justify-content-between align-items-center mt-3'>
                        <div>
                            {step > 0 && <Button variant="secondary" onClick={handlePrev}>Previous</Button>}
                        </div>
                        <div>
                            <Button variant="primary" onClick={step < stepGroups.length - 1 ? handleNext : form.submitForm}>
                                {step < stepGroups.length - 1 ? 'Next' : 'Submit'}
                            </Button>
                        </div>
                    </div>

                    <div className='text-center mt-3'>
                        <div>
                            <Link to="/auth/login">Already have an account? Log In</Link>
                        </div>
                    </div>

                    {/* <div className='text-center'>
                        <div className="mb-2 mt-4">
                            <Button variant="primary" onClick={form.submitForm}>Sign Up</Button>
                        </div>
                        <div>
                            <Link to="/auth/login">Already have an account? Log In</Link>
                        </div>
                    </div> */}
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