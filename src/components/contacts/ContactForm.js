import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form } from '../../helpers/Form'
import Button from '../elements/Button'
import FieldBlock from '../elements/FieldBlock'
import toast from 'react-hot-toast';
import { jsonGet } from '../../helpers/Ajax'
import { ContactContext } from '../../contexts/ContactContext'

function ContactForm() {
    
    const [, contactDispatch] = useContext(ContactContext)
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

    async function fetchContacts() {
        const resp = await jsonGet('contacts')
        if (resp.success) {
            contactDispatch({type: 'setContacts', payload: {contacts: resp.data, total: resp.total}})
        } else {

        }
    }

    const success = (resp) => {
        fetchContacts();
        navigate('/contacts');
        toast.success('Contact saved', {duration: 6000})
    }

    const form = new Form(formUrl, fields, setFields, success, formMethod);

    return (
        <div>
            <h1>Create contact</h1>
            <div className="d-flex flex-gap-18">
                <FieldBlock id="fname" label="First name" isInvalid={fields.fname.isInvalid} value={fields.fname.value} onChange={form.handleInputChanges} feedback={fields.fname.msg} />
                <FieldBlock id="lname" label="Last name" isInvalid={fields.lname.isInvalid} value={fields.lname.value} onChange={form.handleInputChanges} feedback={fields.lname.msg} />
                <FieldBlock id="email" label="Email" isInvalid={fields.email.isInvalid} type="email" value={fields.email.value} onChange={form.handleInputChanges} feedback={fields.email.msg} />
                <FieldBlock id="phone" type="phone" label="Phone number" isInvalid={fields.phone.isInvalid} value={fields.phone.value} onChange={form.handleInputChanges} feedback={fields.phone.msg} />
                <FieldBlock id="message" label="Message" isInvalid={fields.message.isInvalid} value={fields.message.value} onChange={form.handleInputChanges} feedback={fields.message.msg} />
            </div>
            <div className="l_footer_buttons">
                <Button variant="secondary" onClick={() => navigate('/contacts')}>Cancel</Button>
                <Button variant="primary" onClick={form.submitForm}>Save</Button>
            </div>
        </div>
    )
}

export default ContactForm