import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form } from '../../helpers/Form'
import FieldBlock from '../elements/FieldBlock'
import toast from 'react-hot-toast';
import { AuthContext } from '../../contexts/AuthContext'

function ChangePassword() {
    const navigate = useNavigate();
    const [authStore] = useContext(AuthContext);

    const [fields, setFields] = useState({
        current_password: { value: '', isInvalid: false, msg: '' },
        new_password: { value: '', isInvalid: false, msg: '' },
        confirm_password: { value: '', isInvalid: false, msg: '' },
    });

    const success = (resp) => {
        if (resp.success) {
            toast.success('Password changed successfully!', { duration: 4000 });
            navigate('/profile');
        }
    }

    const form = new Form('user/change-password', fields, setFields, success, null, 'PATCH');

    const handleSubmit = (e) => {
        if (fields.new_password.value !== fields.confirm_password.value) {
            setFields(prev => ({
                ...prev,
                confirm_password: { ...prev.confirm_password, isInvalid: true, msg: 'Passwords do not match' }
            }));
            return;
        }
        form.submitForm(e);
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            <div className="p-3 border-0 border-bottom d-flex align-items-center sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm me-3" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">Change Password</h6>
            </div>

            <div className="p-4">
                <div className="mb-4">
                    <h5 className="fw-bold mb-1">Update Security</h5>
                    <p className="text-muted small">Enter your current password and a new one to update your security.</p>
                </div>

                <div className="bg-white rounded-4 border shadow-sm p-4 mb-4">
                    <div className="mb-3">
                        <FieldBlock
                            id="current_password"
                            name="current_password"
                            label="Current Password"
                            type="password"
                            isInvalid={fields.current_password.isInvalid}
                            value={fields.current_password.value}
                            onChange={form.handleInputChanges}
                            feedback={fields.current_password.msg}
                            placeholder="Enter current password"
                        />
                    </div>
                    <div className="mb-3">
                        <FieldBlock
                            id="new_password"
                            name="new_password"
                            label="New Password"
                            type="password"
                            isInvalid={fields.new_password.isInvalid}
                            value={fields.new_password.value}
                            onChange={form.handleInputChanges}
                            feedback={fields.new_password.msg}
                            placeholder="Min 6 chars, uppercase, number, special"
                        />
                    </div>
                    <div className="mb-0">
                        <FieldBlock
                            id="confirm_password"
                            name="confirm_password"
                            label="Confirm New Password"
                            type="password"
                            isInvalid={fields.confirm_password.isInvalid}
                            value={fields.confirm_password.value}
                            onChange={form.handleInputChanges}
                            feedback={fields.confirm_password.msg}
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>

                <div className="d-grid gap-3">
                    <button
                        className="btn btn-primary rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                        onClick={handleSubmit}
                    >
                        <span className="material-symbols-outlined me-2">lock_reset</span>
                        Update Password
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

export default ChangePassword;
