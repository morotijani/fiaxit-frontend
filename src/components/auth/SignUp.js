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
        fname: { value: "", isInvalid: false, msg: "" },
        mname: { value: "", isInvalid: false, msg: "" },
        lname: { value: "", isInvalid: false, msg: "" },
        email: { value: "", isInvalid: false, msg: "" },
        password: { value: "", isInvalid: false, msg: "" },
        confirm_password: { value: "", isInvalid: false, msg: "" },
        pin: { value: "", isInvalid: false, msg: "" },
        invitationcode: { value: "", isInvalid: false, msg: "" }
    })

    //
    function success(resp) {
        // navigate('/auth/login');
        navigate(`/auth/registered/${resp.data.user_id}`);
        // send toast of signup
        toast.success("Account created successfully! Please verify your email before logging in.");
    }

    // setup form
    const form = new Form('auth/signup', fields, setFields, success);

    // Stepper state: define groups of field ids for each step
    const stepGroups = [
        ['fname', 'mname', 'lname'],               // step 0 - names
        ['email', 'password', 'confirm_password'], // step 1 - credentials
        ['pin', 'invitationcode']                 // step 2 - extra
    ];
    const [step, setStep] = useState(0);

    // simple per-step validation: require non-empty values (you can expand rules)
    function validateStep(currStep) {
        const ids = stepGroups[currStep];
        let ok = true;
        const nextFields = { ...fields };
        ids.forEach(id => {
            const val = (fields[id] && fields[id].value) ? String(fields[id].value).trim() : '';
            // exlude field with id mname from required validation
            if (id === 'mname') return;

            if (!val) {
                ok = false;
                nextFields[id] = { ...nextFields[id], isInvalid: true, msg: 'This field is required' };
            } else {
                nextFields[id] = { ...nextFields[id], isInvalid: false, msg: '' };
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

                    {/* Heading */}
                    <div className="text-center mt-2">
                        <img className="img-fluid mb-3" src={Logo} alt="Fiaxit" style={{ height: "35px" }} />
                        <h4 className="fw-700 mb-1" style={{ letterSpacing: '-0.5px' }}>Create account</h4>
                        <p className="text-muted small">Join our borderless crypto community</p>
                    </div>

                    {/* Step indicator */}
                    <div className="px-2 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-primary-subtle text-primary rounded-pill px-3">Step {step + 1} of {stepGroups.length}</span>
                            <small className="text-muted fw-bold">{Math.round(((step + 1) / stepGroups.length) * 100)}% Complete</small>
                        </div>
                        <div className="progress" style={{ height: "6px", backgroundColor: "#f1f5f9", borderRadius: "10px" }}>
                            <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{
                                    width: `${((step + 1) / stepGroups.length) * 100}%`,
                                    borderRadius: "10px",
                                    transition: "width 0.4s ease"
                                }}
                            ></div>
                        </div>
                    </div>


                    {/* Form Fields */}
                    <div className="px-2 overflow-auto" style={{ maxHeight: '45vh' }}>
                        {visibleFields.includes('fname') && (
                            <div className="mb-3">
                                <FieldBlock id="fname" label="First Name" isInvalid={fields.fname.isInvalid} value={fields.fname.value} onChange={form.handleInputChanges} feedback={fields.fname.msg} placeholder="John" />
                            </div>
                        )}
                        {visibleFields.includes('mname') && (
                            <div className="mb-3">
                                <FieldBlock id="mname" label="Middle Name (Optional)" isInvalid={fields.mname.isInvalid} value={fields.mname.value} onChange={form.handleInputChanges} feedback={fields.mname.msg} placeholder="Quincy" />
                            </div>
                        )}
                        {visibleFields.includes('lname') && (
                            <div className="mb-3">
                                <FieldBlock id="lname" label="Last Name" isInvalid={fields.lname.isInvalid} value={fields.lname.value} onChange={form.handleInputChanges} feedback={fields.lname.msg} placeholder="Doe" />
                            </div>
                        )}

                        {visibleFields.includes('email') && (
                            <div className="mb-3">
                                <FieldBlock id="email" label="Email address" type="email" isInvalid={fields.email.isInvalid} value={fields.email.value} onChange={form.handleInputChanges} feedback={fields.email.msg} placeholder="john@example.com" />
                            </div>
                        )}
                        {visibleFields.includes('password') && (
                            <div className="mb-3">
                                <FieldBlock id="password" label="Create Password" type="password" isInvalid={fields.password.isInvalid} value={fields.password.value} onChange={form.handleInputChanges} feedback={fields.password.msg} placeholder="••••••••" />
                            </div>
                        )}
                        {visibleFields.includes('confirm_password') && (
                            <div className="mb-3">
                                <FieldBlock id="confirm_password" label="Confirm Password" type="password" isInvalid={fields.confirm_password.isInvalid} value={fields.confirm_password.value} onChange={form.handleInputChanges} feedback={fields.confirm_password.msg} placeholder="••••••••" />
                            </div>
                        )}

                        {visibleFields.includes('pin') && (
                            <div className="mb-3">
                                <FieldBlock id="pin" label="Security PIN (4-6 digits)" type="password" isInvalid={fields.pin.isInvalid} value={fields.pin.value} onChange={form.handleInputChanges} feedback={fields.pin.msg} placeholder="••••" />
                            </div>
                        )}
                        {visibleFields.includes('invitationcode') && (
                            <div className="mb-3">
                                <FieldBlock id="invitationcode" label="Referral Code (Optional)" isInvalid={fields.invitationcode.isInvalid} value={fields.invitationcode.value} onChange={form.handleInputChanges} feedback={fields.invitationcode.msg} placeholder="REF123" />
                            </div>
                        )}
                    </div>

                    <div className="px-2 mt-4">
                        <div className='d-flex gap-2 mb-4'>
                            {step > 0 && (
                                <button className="btn btn-light py-3 flex-grow-1 fw-bold" onClick={handlePrev} style={{ borderRadius: '12px' }}>
                                    Back
                                </button>
                            )}
                            <button
                                className="btn btn-primary py-3 flex-grow-1 fw-bold shadow-sm"
                                onClick={step < stepGroups.length - 1 ? handleNext : form.submitForm}
                                style={{ borderRadius: '12px' }}
                            >
                                {step < stepGroups.length - 1 ? 'Continue' : 'Create Account'}
                            </button>
                        </div>

                        <div className='text-center mb-3'>
                            <p className="text-muted small">
                                Already have an account? <Link to="/auth/login" className="text-primary fw-bold text-decoration-none">Log In</Link>
                            </p>
                        </div>

                        <div className="text-muted text-center small opacity-75">
                            By signing up, you agree to our{" "}
                            <Link to="#" className="text-decoration-none fw-semibold">Terms</Link>{" "} &{" "}<Link to="#" className="text-decoration-none fw-semibold"> Privacy</Link>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;