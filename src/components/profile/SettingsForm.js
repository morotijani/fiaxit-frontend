import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form } from '../../helpers/Form'
import Button from '../elements/Button'
import FieldBlock from '../elements/FieldBlock'
import toast from 'react-hot-toast';
import { AuthContext } from '../../contexts/AuthContext'

function SettingsForm() {
    const navigate = useNavigate();
    const [formUrl, setFormUrl] = useState('users');
    const [formMethod, setFormMethod] = useState('POST');
    const [fields, setFields] = useState({
        fname: {value: '', isInvalid: false, msg: ''}, 
        mname: {value: '', isInvalid: false, msg: ''}, 
        lname: {value: '', isInvalid: false, msg: ''}, 
        email: {value: '', isInvalid: false, msg: ''}, 
        phone: {value: '', isInvalid: false, msg: ''}, 
    });
    const [authStore, userDispatch] = useContext(AuthContext);
    
    const success = (resp) => {
        if (resp.success) {
            userDispatch({type: 'updateUser', payload: resp.data.user});
            navigate('/profile');
            toast.success('Profile deatils updated !', {duration: 6000})
        } else {
            toast.error('Error updating profile details.', {duration: 6000})
        }
    }
    
    useEffect(() => {
        const res = authStore.user
        form.populateFormValues({
            fname: res.user_fname || '',
            mname: res.user_mname || '',
            lname: res.user_lname || '',
            email: res.user_email || '',
            phone: res.user_phone || '',
        });
        setFormMethod('PATCH');
        setFormUrl(`user/update/${authStore.user.user_id}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const form = new Form(formUrl, fields, setFields, success, formMethod);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#eaeae6"}}>
                {/* back button */}
                <button className="btn btn-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">keyboard_backspace</span>
                </button>
                <h5 className="m-0">Profile Settings</h5>
                <button className="btn btn-sm" onClick={() => navigate("/notifications")}>
                    <span class="material-symbols-outlined">siren</span>
                </button>
            </div>
            <div className="p-4">
                <h6 className="text-muted mb-2">Settings</h6>
                <FieldBlock id="fname" label="First name: " isInvalid={fields.fname.isInvalid} value={fields.fname.value} onChange={form.handleInputChanges} feedback={fields.fname.msg} />
                <FieldBlock id="mname" label="Middle name: " isInvalid={fields.mname.isInvalid} value={fields.mname.value} onChange={form.handleInputChanges} feedback={fields.mname.msg} />
                <FieldBlock id="lname" label="Last name: " isInvalid={fields.lname.isInvalid} value={fields.lname.value} onChange={form.handleInputChanges} feedback={fields.lname.msg} />
                <FieldBlock id="email" label="Email: " type="email" isInvalid={fields.email.isInvalid} value={fields.email.value} onChange={form.handleInputChanges} feedback={fields.email.msg} />
                <FieldBlock id="phone" type="tel" label="Phone: " isInvalid={fields.phone.isInvalid} value={fields.phone.value} onChange={form.handleInputChanges} feedback={fields.phone.msg} />
                <div className="d-flex justify-content-end mt-4">
                    <Button variant="" onClick={() => navigate('/profile')}>Cancel</Button>&nbsp;&nbsp;
                    <Button variant="primary" onClick={form.submitForm}>Save Changes</Button>
                </div>
            </div>
        </div>
    )
}

export default SettingsForm