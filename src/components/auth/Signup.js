import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FieldBlock from '../elements/FieldBlock';
import { Form } from '../../helpers/Form';
import Button from '../elements/Button';

function Signup() {
    const navigate = useNavigate();
    const [fields, setFields] = useState({
        fname: {value: "", isInvalid: false, msg: ""}, 
        mname: {value: "", isInvalid: false, msg: ""}, 
        lname: {value: "", isInvalid: false, msg: ""}, 
        email: {value: "", isInvalid: false, msg: ""}, 
        phone: {value: "", isInvalid: false, msg: ""}, 
        password: {value: "", isInvalid: false, msg: ""}, 
        confrim_password: {value: "", isInvalid: false, msg: ""},  
        pin: {value: "", isInvalid: false, msg: ""},  
        invitationcode: {value: "", isInvalid: false, msg: ""},  
    })

    //
    async function success(resp) {
        navigate('/auth/login');
    }

    // setup form
    const form = new Form('auth/signup', fields, setFields, success);

    return (
        <div>
            <h2>Create An Account To Get Started</h2>
            <FieldBlock
                id="fname" lable="First name" isInvalid={fields.fname.isInvalid} value={fields.fname.value} onChange={form.handleInputChanges} feedback={fields.fname.msg} 
            />
            <FieldBlock
                id="mname" lable="Middle name" isInvalid={fields.mname.isInvalid} value={fields.mname.value} onChange={form.handleInputChanges} feedback={fields.mname.msg} 
            />
            <FieldBlock
                id="lname" lable="Last name" isInvalid={fields.lname.isInvalid} value={fields.lname.value} onChange={form.handleInputChanges} feedback={fields.lname.msg} 
            />
            <FieldBlock
                id="email" lable="Email" type="email" isInvalid={fields.email.isInvalid} value={fields.email.value} onChange={form.handleInputChanges} feedback={fields.email.msg} 
            />
            <FieldBlock
                id="password" lable="Password" type="password" isInvalid={fields.password.isInvalid} value={fields.password.value} onChange={form.handleInputChanges} feedback={fields.password.msg} 
            />
            <FieldBlock
                id="confirm" lable="Confirm password" type="confirm" isInvalid={fields.confirm.isInvalid} value={fields.confirm.value} onChange={form.handleInputChanges} feedback={fields.confirm.msg} 
            />
        </div>
    );
}