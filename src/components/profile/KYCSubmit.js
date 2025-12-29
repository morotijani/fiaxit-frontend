import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { jsonPost } from '../../helpers/Ajax';
import toast from 'react-hot-toast';

const KYCSubmit = () => {
    const navigate = useNavigate();
    const [authStore, authDispatch] = React.useContext(AuthContext);
    const [loading, setLoading] = React.useState(false);

    const [formData, setFormData] = useState({
        kyc_id_type: 'national_id',
        kyc_id_number: '',
        address: {
            kyc_address: '',
            kyc_street: '',
            kyc_city: '',
            kyc_state: '',
            kyc_postal_code: '',
            kyc_country: ''
        }
    });

    const [files, setFiles] = useState({
        document_front: null,
        document_back: null,
        selfie: null
    });

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newAddress = { ...prev.address, [name]: value };
            // If updating kyc_address, also update kyc_street to be safe
            if (name === 'kyc_address') {
                newAddress.kyc_street = value;
            }
            return {
                ...prev,
                address: newAddress
            };
        });
    };

    const handleFileChange = (e) => {
        const { name, files: fileList } = e.target;
        setFiles(prev => ({
            ...prev,
            [name]: fileList[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!files.document_front || !files.selfie) {
            toast.error('Please upload required documents (ID Front and Selfie)');
            return;
        }

        const data = new FormData();
        data.append('kyc_id_type', formData.kyc_id_type);
        data.append('kyc_id_number', formData.kyc_id_number);
        data.append('address', JSON.stringify(formData.address));

        if (files.document_front) data.append('document_front', files.document_front);
        if (files.document_back) data.append('document_back', files.document_back);
        if (files.selfie) data.append('selfie', files.selfie);

        setLoading(true);
        try {
            const result = await jsonPost('user/kyc/submit', data);

            if (result && result.success) {
                toast.success('KYC submitted successfully!');
                // Update local user state
                authDispatch({
                    type: 'updateUser',
                    payload: { ...authStore.user, kyc_status: 'pending' }
                });
                navigate('/profile');
            } else {
                toast.error(result?.message || 'Submission failed');
            }
        } catch (error) {
            console.error('KYC submission error:', error);
            toast.error('An error occurred during submission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in pb-5">

            <div className="mb-3 mx-auto" style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px" }}></div>

            <div className="p-3 border-0 border-bottom d-flex align-items-center sticky-top bg-white glass">
                <button className="btn btn-light rounded-circle p-2 shadow-sm me-3" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                <h6 className="m-0 fw-bold">KYC Verification</h6>
            </div>

            <div className="p-4">
                <div className="alert bg-primary-subtle border-0 rounded-4 p-3 mb-4">
                    <div className="d-flex">
                        <span className="material-symbols-outlined text-primary me-3">info</span>
                        <div className="small">
                            <span className="fw-bold d-block text-primary">Why verify?</span>
                            <span className="text-muted">Verified accounts enjoy higher transaction limits and enhanced security features.</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* ID Information */}
                    <div className="mb-4">
                        <label className="form-label fw-bold small text-uppercase text-muted">ID Information</label>
                        <select
                            className="form-select rounded-3 mb-3"
                            value={formData.kyc_id_type}
                            onChange={(e) => setFormData({ ...formData, kyc_id_type: e.target.value })}
                        >
                            <option value="national_id">National ID Card</option>
                            <option value="passport">Passport</option>
                            <option value="drivers_license">Driver's License</option>
                        </select>
                        <input
                            type="text"
                            className="form-control rounded-3"
                            placeholder="ID Document Number"
                            value={formData.kyc_id_number}
                            onChange={(e) => setFormData({ ...formData, kyc_id_number: e.target.value })}
                            required
                        />
                    </div>

                    {/* Address Information */}
                    <div className="mb-4">
                        <label className="form-label fw-bold small text-uppercase text-muted">Residential Address</label>
                        <input
                            type="text"
                            name="kyc_address"
                            className="form-control rounded-3 mb-2"
                            placeholder="Street Address"
                            value={formData.address.kyc_address}
                            onChange={handleAddressChange}
                            required
                        />
                        <div className="row g-2">
                            <div className="col-6">
                                <input
                                    type="text"
                                    name="kyc_city"
                                    className="form-control rounded-3"
                                    placeholder="City"
                                    value={formData.address.kyc_city}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>
                            <div className="col-6">
                                <input
                                    type="text"
                                    name="kyc_country"
                                    className="form-control rounded-3"
                                    placeholder="Country"
                                    value={formData.address.kyc_country}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Document Uploads */}
                    <div className="mb-4">
                        <label className="form-label fw-bold small text-uppercase text-muted">Upload Documents</label>

                        <div className="upload-box border rounded-4 p-3 mb-3 text-center position-relative">
                            <input
                                type="file"
                                name="document_front"
                                className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept="image/*,application/pdf"
                                required
                            />
                            <span className="material-symbols-outlined text-primary mb-2">badge</span>
                            <p className="small m-0 fw-bold">{files.document_front ? files.document_front.name : 'ID Document (Front)'}</p>
                            <small className="text-muted">Click to upload photo or PDF</small>
                        </div>

                        <div className="upload-box border rounded-4 p-3 mb-3 text-center position-relative">
                            <input
                                type="file"
                                name="document_back"
                                className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept="image/*,application/pdf"
                            />
                            <span className="material-symbols-outlined text-primary mb-2">credit_card</span>
                            <p className="small m-0 fw-bold">{files.document_back ? files.document_back.name : 'ID Document (Back) - Optional'}</p>
                            <small className="text-muted">Click to upload photo or PDF</small>
                        </div>

                        <div className="upload-box border rounded-4 p-3 mb-4 text-center position-relative">
                            <input
                                type="file"
                                name="selfie"
                                className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                            />
                            <span className="material-symbols-outlined text-primary mb-2">face</span>
                            <p className="small m-0 fw-bold">{files.selfie ? files.selfie.name : 'Take a Selfie'}</p>
                            <small className="text-muted">Ensure your face is clearly visible</small>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : 'Submit for Verification'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default KYCSubmit;
