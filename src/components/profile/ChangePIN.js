import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form } from '../../helpers/Form'
import FieldBlock from '../elements/FieldBlock'
import toast from 'react-hot-toast';
import { AuthContext } from '../../contexts/AuthContext'

function ChangePIN({ variant = 'default', onSuccess, onCancel }) {
    const navigate = useNavigate();
    const [authStore] = useContext(AuthContext);

    const [fields, setFields] = useState({
        current_pin: { value: '', isInvalid: false, msg: '' },
        new_pin: { value: '', isInvalid: false, msg: '' },
        confirm_pin: { value: '', isInvalid: false, msg: '' },
    });

    const success = (resp) => {
        if (resp.success) {
            toast.success('PIN updated successfully!', { duration: 4000 });
            if (onSuccess) {
                onSuccess();
            } else {
                navigate(variant === 'admin' ? '/admin/security' : '/profile');
            }
        }
    }

    const form = new Form('user/change-pin', fields, setFields, success, null, 'PATCH');

    const handleSubmit = (e) => {
        if (fields.new_pin.value !== fields.confirm_pin.value) {
            setFields(prev => ({
                ...prev,
                confirm_pin: { ...prev.confirm_pin, isInvalid: true, msg: 'PINs do not match' }
            }));
            return;
        }

        if (fields.new_pin.value.length !== 4 || isNaN(fields.new_pin.value)) {
            setFields(prev => ({
                ...prev,
                new_pin: { ...prev.new_pin, isInvalid: true, msg: 'PIN must be a 4-digit number' }
            }));
            return;
        }

        form.submitForm(e);
    }

    const isMinimal = variant === 'admin';

    return (
        <div className="animate-fade-in">
            {!isMinimal && (
                <>
                    <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>
                    <div className="p-3 border-0 border-bottom d-flex align-items-center sticky-top bg-white glass">
                        <button className="btn btn-light rounded-circle p-2 shadow-sm me-3" onClick={() => navigate(-1)}>
                            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                        </button>
                        <h6 className="m-0 fw-bold">Change Transaction PIN</h6>
                    </div>
                </>
            )}

            <div className={isMinimal ? 'p-0' : 'p-4'}>
                {!isMinimal && (
                    <div className="mb-4">
                        <h5 className="fw-bold mb-1">Transaction Security</h5>
                        <p className="text-muted small">Update your a 4-digit PIN for securing your transactions.</p>
                    </div>
                )}

                <div className={`${isMinimal ? 'bg-transparent border-0 shadow-none p-0' : 'bg-white rounded-4 border shadow-sm p-4'} mb-4`}>
                    <div className="mb-3">
                        <FieldBlock
                            id="current_pin"
                            name="current_pin"
                            label="Current PIN"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            isInvalid={fields.current_pin.isInvalid}
                            value={fields.current_pin.value}
                            onChange={form.handleInputChanges}
                            feedback={fields.current_pin.msg}
                            placeholder="Enter current 4-digit PIN"
                        />
                    </div>
                    <div className="mb-3">
                        <FieldBlock
                            id="new_pin"
                            name="new_pin"
                            label="New PIN"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            isInvalid={fields.new_pin.isInvalid}
                            value={fields.new_pin.value}
                            onChange={form.handleInputChanges}
                            feedback={fields.new_pin.msg}
                            placeholder="Enter new 4-digit PIN"
                        />
                    </div>
                    <div className="mb-0">
                        <FieldBlock
                            id="confirm_pin"
                            name="confirm_pin"
                            label="Confirm New PIN"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            isInvalid={fields.confirm_pin.isInvalid}
                            value={fields.confirm_pin.value}
                            onChange={form.handleInputChanges}
                            feedback={fields.confirm_pin.msg}
                            placeholder="Confirm new 4-digit PIN"
                        />
                    </div>
                </div>

                <div className="d-grid gap-3">
                    <button
                        className={`btn btn-primary ${isMinimal ? 'admin-btn-primary' : 'rounded-pill py-3 fw-bold shadow-sm'} d-flex align-items-center justify-content-center`}
                        onClick={handleSubmit}
                    >
                        <span className="material-symbols-outlined me-2">pin</span>
                        Update PIN
                    </button>
                    {!isMinimal && (
                        <button
                            className="btn btn-light rounded-pill py-3 fw-bold border mb-5"
                            onClick={() => onCancel ? onCancel() : navigate('/profile')}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChangePIN;
