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
        fname: { value: '', isInvalid: false, msg: '' },
        mname: { value: '', isInvalid: false, msg: '' },
        lname: { value: '', isInvalid: false, msg: '' },
        email: { value: '', isInvalid: false, msg: '' },
        phone: { value: '', isInvalid: false, msg: '' },
        dob: { value: '', isInvalid: false, msg: '' },
        gender: { value: '', isInvalid: false, msg: '' },
    });
    const [authStore, userDispatch] = useContext(AuthContext);

    const success = (resp) => {
        if (resp.success) {
            userDispatch({ type: 'updateUser', payload: resp.data.user });
            navigate('/profile');
            toast.success('Profile deatils updated !', { duration: 6000 })
        } else {
            toast.error('Error updating profile details.', { duration: 6000 })
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
            dob: res.user_dob || '',
            gender: res.user_gender || '',
        });
        setFormMethod('PATCH');
        setFormUrl(`user/update/${authStore.user.user_id}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const form = new Form(formUrl, fields, setFields, success, null, formMethod);

    return (
        <div className="animate-fade-in">

            {/* Top Handle for App-like feel */}
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            {/* Header / Top Bar */}
            <div className="d-flex border-0 justify-content-between align-items-center px-3 py-2 border-bottom sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Profile Settings</h6>
                <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" onClick={() => navigate("/notifications")}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>notifications</span>
                </button>
            </div>

            <div className="p-4">
                <div className="mb-4">
                    <h5 className="fw-bold mb-1">Personal Information</h5>
                    <p className="text-muted small">Update your profile details and contact information.</p>
                </div>

                <div className="bg-white rounded-4 border shadow-sm p-4 mb-4">
                    <div className="mb-3">
                        <FieldBlock id="fname" label="First Name" isInvalid={fields.fname.isInvalid} value={fields.fname.value} onChange={form.handleInputChanges} feedback={fields.fname.msg} placeholder="Enter your first name" />
                    </div>
                    <div className="mb-3">
                        <FieldBlock id="mname" label="Middle Name" isInvalid={fields.mname.isInvalid} value={fields.mname.value} onChange={form.handleInputChanges} feedback={fields.mname.msg} placeholder="Enter your middle name" />
                    </div>
                    <div className="mb-3">
                        <FieldBlock id="lname" label="Last Name" isInvalid={fields.lname.isInvalid} value={fields.lname.value} onChange={form.handleInputChanges} feedback={fields.lname.msg} placeholder="Enter your last name" />
                    </div>
                    <div className="mb-3">
                        <FieldBlock id="email" label="Email Address" type="email" isInvalid={fields.email.isInvalid} value={fields.email.value} onChange={form.handleInputChanges} feedback={fields.email.msg} placeholder="your@email.com" />
                    </div>
                    <div className="mb-3">
                        <FieldBlock id="phone" type="tel" label="Phone Number" isInvalid={fields.phone.isInvalid} value={fields.phone.value} onChange={form.handleInputChanges} feedback={fields.phone.msg} placeholder="+233 (000) 000-0000" />
                    </div>
                    <div className="mb-3">
                        <FieldBlock id="dob" type="date" label="Date of Birth" isInvalid={fields.dob.isInvalid} value={fields.dob.value} onChange={form.handleInputChanges} feedback={fields.dob.msg} />
                    </div>
                    <div className="mb-0">
                        <label className="form-label small text-muted">Gender</label>
                        <select
                            id="gender"
                            name="gender"
                            className="form-select border-0 bg-light p-3"
                            style={{ borderRadius: '12px' }}
                            value={fields.gender.value}
                            onChange={form.handleInputChanges}
                        >
                            <option value="">Prefer not to say</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="d-grid gap-3">
                    <button
                        className="btn btn-primary rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                        onClick={form.submitForm}
                    >
                        <span className="material-symbols-outlined me-2">save</span>
                        Save Changes
                    </button>
                    <button
                        className="btn btn-light rounded-pill py-3 fw-bold border mb-5"
                        onClick={() => navigate('/profile')}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SettingsForm