import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FieldBlock from '../elements/FieldBlock';
import { Form } from '../../helpers/Form';
import Button from '../elements/Button';
import toast from 'react-hot-toast';

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
        toast.success("Account created successfully! Please log in.");
    }

    // setup form
    const form = new Form('auth/signup', fields, setFields, success);

    return (
        <div>
            <h2>Create An Account To Get Started</h2>
            <FieldBlock
                id="fname" label="First name" isInvalid={fields.fname.isInvalid} value={fields.fname.value} onChange={form.handleInputChanges} feedback={fields.fname.msg} 
            />
            <FieldBlock
                id="mname" label="Middle name" isInvalid={fields.mname.isInvalid} value={fields.mname.value} onChange={form.handleInputChanges} feedback={fields.mname.msg} 
            />
            <FieldBlock
                id="lname" label="Last name" isInvalid={fields.lname.isInvalid} value={fields.lname.value} onChange={form.handleInputChanges} feedback={fields.lname.msg} 
            />
            <FieldBlock
                id="email" label="Email" type="email" isInvalid={fields.email.isInvalid} value={fields.email.value} onChange={form.handleInputChanges} feedback={fields.email.msg} 
            />
            <FieldBlock
                id="password" label="Password" type="password" isInvalid={fields.password.isInvalid} value={fields.password.value} onChange={form.handleInputChanges} feedback={fields.password.msg} 
            />
            <FieldBlock 
                id="confirm_password" label="Confirm Password" type="password" isInvalid={fields.confirm_password.isInvalid}
                value={fields.confirm_password.value} onChange={form.handleInputChanges} feedback={fields.confirm_password.msg}
           />
            <FieldBlock
                id="pin" label="PIN" type="password" isInvalid={fields.pin.isInvalid} value={fields.pin.value} onChange={form.handleInputChanges} feedback={fields.pin.msg} 
            />
            <FieldBlock
                id="invitationcode" label="Invitation code" isInvalid={fields.invitationcode.isInvalid} value={fields.invitationcode.value} onChange={form.handleInputChanges} feedback={fields.invitationcode.msg} 
            />

            <div className="l_footer_button d-flex justify-content-between align-items-center">
                <Link to="/auth/login">Already have an account? Log In</Link>
                <Button variant="primary" onClick={form.submitForm}>Sign Up</Button>
            </div>
        </div>
    );
}

export default SignUp;