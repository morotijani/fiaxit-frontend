import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form } from '../../helpers/Form'
import Button from '../elements/Button'
import FieldBlock from '../elements/FieldBlock'
import toast from 'react-hot-toast';
import { jsonGet } from '../../helpers/Ajax'

function ContactForm() {
    
    const navigate = useNavigate();
    const [formUrl, setFormUrl] = useState('contacts');
    const [formMethod, setFormMethod] = useState('POST');
    const [fields, setFields] = useState({
        fname: {value: '', isInvalid: false, msg: ''}, 
        lname: {value: '', isInvalid: false, msg: ''}, 
        email: {value: '', isInvalid: false, msg: ''}, 
        phone: {value: '', isInvalid: false, msg: ''}, 
        message: {value: '', isInvalid: false, msg: ''}, 
    });

    const success = (resp) => {
        console.log(resp);
    }

    const form = new Form(formUrl, fields, setFields, success, formMethod);

    return (
        <div>
            <h1>Create contact</h1>
            <div className="d-flex flex-wrap">
                <FieldBlock id="fname" label="First name" isInvalid={fields.fname.isInvalid} value={fields.fname.value} onChnage={form.handleInputChanges} feedback={fields.fname.msg} />
                <FieldBlock id="lname" label="Last name" isInvalid={fields.lname.isInvalid} value={fields.lname.value} onChnage={form.handleInputChanges} feedback={fields.lname.msg} />
                <FieldBlock id="email" label="Email" isInvalid={fields.email.isInvalid} type="email" value={fields.email.value} onChnage={form.handleInputChanges} feedback={fields.email.msg} />
                <FieldBlock id="phone" type="phone" label="Phone number" isInvalid={fields.phone.isInvalid} value={fields.phone.value} onChnage={form.handleInputChanges} feedback={fields.phone.msg} />
                <FieldBlock id="message" label="Message" isInvalid={fields.message.isInvalid} value={fields.message.value} onChnage={form.handleInputChanges} feedback={fields.message.msg} />
            </div>
            <div className="l_footer_buttons">
                <Button variant="secondary" onClick={() => navigate('/contacts')}>Cancel</Button>
                <Button variant="primary" onClick={form.submitForm}>Save</Button>
            </div>
        </div>
    )
}

export default ContactForm