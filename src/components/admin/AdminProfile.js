import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { jsonPost, jsonPatch } from '../../helpers/Ajax';
import toast from 'react-hot-toast';
import FieldBlock from '../elements/FieldBlock';

function AdminProfile() {
    const [authStore, authDispatch] = useContext(AuthContext);
    const [uploading, setUploading] = useState(false);
    const [editingField, setEditingField] = useState(null); // 'name', 'dob', 'gender', 'email', 'phone'
    const [saving, setSaving] = useState(false);

    const user = authStore.user || {};

    // Local form state for editing
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        dob: '',
        gender: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (authStore.user) {
            setFormData({
                fname: authStore.user.user_fname || '',
                lname: authStore.user.user_lname || '',
                dob: authStore.user.user_dob || '',
                gender: authStore.user.user_gender || '',
                email: authStore.user.user_email || '',
                phone: authStore.user.user_phone || ''
            });
        }
    }, [authStore.user]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('profile_image', file);

        setUploading(true);
        try {
            const result = await jsonPost('user/profile-image', data);
            if (result.success) {
                toast.success('Admin profile picture updated!');
                authDispatch({
                    type: 'updateUser',
                    payload: result.data.user
                });
            } else {
                toast.error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('An error occurred during upload');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const result = await jsonPatch(`user/update/${user.user_id}`, formData);
            if (result.success) {
                toast.success('Profile updated successfully');
                authDispatch({
                    type: 'updateUser',
                    payload: result.data.user
                });
                setEditingField(null);
            } else {
                toast.error(result.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (editingField) {
        return (
            <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="mb-4">
                    <button className="btn btn-link text-decoration-none p-0 d-flex align-items-center text-primary fw-medium" onClick={() => setEditingField(null)}>
                        <span className="material-symbols-outlined me-2">arrow_back</span>
                        Back to Personal info
                    </button>
                </div>

                <div className="admin-card p-4">
                    <h4 className="fw-normal mb-1" style={{ color: '#202124' }}>
                        {editingField === 'name' && 'Change Name'}
                        {editingField === 'dob' && 'Birthday'}
                        {editingField === 'gender' && 'Gender'}
                        {editingField === 'email' && 'Email'}
                        {editingField === 'phone' && 'Phone number'}
                    </h4>
                    <p className="text-muted small mb-4">
                        Changes to your {editingField === 'dob' ? 'birthday' : editingField} will be reflected across your Fiaxit account.
                    </p>

                    <div className="mt-4">
                        {editingField === 'name' && (
                            <>
                                <div className="mb-3">
                                    <FieldBlock
                                        label="First name"
                                        value={formData.fname}
                                        onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                                    />
                                </div>
                                <div className="mb-4">
                                    <FieldBlock
                                        label="Last name"
                                        value={formData.lname}
                                        onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        {editingField === 'dob' && (
                            <div className="mb-4">
                                <FieldBlock
                                    label="Date of birth"
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                />
                            </div>
                        )}

                        {editingField === 'gender' && (
                            <div className="mb-4">
                                <label className="form-label small text-muted">Gender</label>
                                <select
                                    className="form-select admin-input"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Prefer not to say</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        )}

                        {editingField === 'email' && (
                            <div className="mb-4">
                                <FieldBlock
                                    label="Email address"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <div className="alert alert-info border-0 bg-light mt-3 small">
                                    <span className="material-symbols-outlined me-2 align-middle">info</span>
                                    Changing your email may require re-verification.
                                </div>
                            </div>
                        )}

                        {editingField === 'phone' && (
                            <div className="mb-4">
                                <FieldBlock
                                    label="Phone number"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="d-flex justify-content-end gap-2 mt-5">
                            <button className="btn btn-link text-decoration-none text-muted" onClick={() => setEditingField(null)}>Cancel</button>
                            <button className="btn btn-primary admin-btn-primary px-4" onClick={handleUpdate} disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Saving...
                                    </>
                                ) : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const fullName = `${user.user_fname || ''} ${user.user_lname || ''}`.trim();

    return (
        <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto' }}>
            <div className="text-center mb-5">
                <h2 className="fw-normal mt-4" style={{ color: '#202124' }}>Personal info</h2>
                <p className="text-muted">Info about you and your preferences across Fiaxit services</p>
            </div>

            <div className="admin-card p-0 overflow-hidden mb-4">
                <div className="p-4 border-bottom">
                    <h5 className="admin-card-title mb-0">Basic info</h5>
                    <p className="admin-card-text">Some info may be visible to other people using Fiaxit services.</p>
                </div>

                <div className="list-group list-group-flush">
                    {/* PHOTO */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between admin-list-item" onClick={() => document.getElementById('adminPhotoUpload').click()}>
                        <div className="flex-grow-1">
                            <div className="fw-medium text-uppercase text-muted" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>PHOTO</div>
                            <div className="text-muted small">A photo helps personalize your account</div>
                        </div>
                        <div className="position-relative">
                            <div className="bg-light rounded-circle border overflow-hidden d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
                                {user.user_image ? (
                                    <img src={user.user_image} className="w-100 h-100 object-fit-cover" alt="Profile" />
                                ) : (
                                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '32px' }}>account_circle</span>
                                )}
                            </div>
                            <div className="position-absolute bottom-0 end-0 bg-white border rounded-circle d-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px' }}>
                                <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>photo_camera</span>
                            </div>
                            {uploading && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center">
                                    <div className="spinner-border spinner-border-sm text-primary"></div>
                                </div>
                            )}
                        </div>
                        <input type="file" id="adminPhotoUpload" className="d-none" accept="image/*" onChange={handleImageUpload} />
                    </div>

                    {/* NAME */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between admin-list-item" onClick={() => setEditingField('name')}>
                        <div className="flex-grow-1">
                            <div className="fw-medium text-uppercase text-muted" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>NAME</div>
                            <div className="text-dark fw-medium">{fullName || 'Add name'}</div>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>

                    {/* BIRTHDAY */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between admin-list-item" onClick={() => setEditingField('dob')}>
                        <div className="flex-grow-1">
                            <div className="fw-medium text-uppercase text-muted" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>BIRTHDAY</div>
                            <div className="text-dark fw-medium">{user.user_dob || 'Add birthday'}</div>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>

                    {/* GENDER */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between admin-list-item" onClick={() => setEditingField('gender')}>
                        <div className="flex-grow-1">
                            <div className="fw-medium text-uppercase text-muted" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>GENDER</div>
                            <div className="text-dark fw-medium">{user.user_gender || 'Add gender'}</div>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>
                </div>
            </div>

            <div className="admin-card p-0 overflow-hidden mb-4">
                <div className="p-4 border-bottom">
                    <h5 className="admin-card-title mb-0">Contact info</h5>
                    <p className="admin-card-text">Details about how to reach you or recover your account.</p>
                </div>

                <div className="list-group list-group-flush">
                    {/* EMAIL */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between admin-list-item" onClick={() => setEditingField('email')}>
                        <div className="flex-grow-1">
                            <div className="fw-medium text-uppercase text-muted" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>EMAIL</div>
                            <div className="text-dark fw-medium">{user.user_email}</div>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>

                    {/* PHONE */}
                    <div className="list-group-item p-4 d-flex align-items-center justify-content-between admin-list-item" onClick={() => setEditingField('phone')}>
                        <div className="flex-grow-1">
                            <div className="fw-medium text-uppercase text-muted" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>PHONE</div>
                            <div className="text-dark fw-medium">{user.user_phone || 'Add a phone number'}</div>
                        </div>
                        <span className="material-symbols-outlined text-muted">chevron_right</span>
                    </div>
                </div>
            </div>

            <div className="text-center py-4">
                <p className="small text-muted mb-0">Your data is handled securely according to Fiaxit's privacy policy.</p>
            </div>
        </div>
    );
}

export default AdminProfile;
